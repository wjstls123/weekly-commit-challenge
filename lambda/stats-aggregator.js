const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'weekly-commit-challenge';

exports.handler = async (event) => {
    try {
        console.log('Starting stats aggregation...');
        
        // 현재 주차 계산 (KST)
        const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
        const year = kstNow.getFullYear();
        const weekNumber = getWeekNumber(kstNow);
        const currentYearWeek = `${year}#${weekNumber}`;
        
        // 1. 현재 주 통계 집계
        await aggregateWeeklyStats(currentYearWeek);
        
        // 2. 사용자별 통계 업데이트
        await updateAllUserStats();
        
        // 3. 전역 통계 업데이트
        await updateGlobalStats();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Stats aggregation completed',
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('Error in stats aggregation:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// 주간 통계 집계
async function aggregateWeeklyStats(yearWeek) {
    console.log(`Aggregating stats for week: ${yearWeek}`);
    
    // 해당 주의 모든 사용자 기록 조회
    const params = {
        TableName: TABLE_NAME,
        IndexName: 'GSI1', // SK가 PK인 역인덱스
        KeyConditionExpression: 'SK = :sk',
        ExpressionAttributeValues: {
            ':sk': `WEEK#${yearWeek}`
        }
    };
    
    const result = await dynamoDB.query(params).promise();
    const records = result.Items || [];
    
    // 통계 계산
    const stats = {
        totalParticipants: records.length,
        successCount: records.filter(r => r.success).length,
        totalCommits: records.reduce((sum, r) => sum + r.commitCount, 0),
        averageCommits: records.length > 0 ? 
            (records.reduce((sum, r) => sum + r.commitCount, 0) / records.length).toFixed(1) : 0,
        successRate: records.length > 0 ? 
            ((records.filter(r => r.success).length / records.length) * 100).toFixed(1) : 0
    };
    
    // 주간 통계 저장
    await dynamoDB.put({
        TableName: TABLE_NAME,
        Item: {
            PK: `WEEK#${yearWeek}`,
            SK: 'SUMMARY',
            ...stats,
            lastUpdated: new Date().toISOString(),
            participants: records.map(r => ({
                username: r.username,
                commitCount: r.commitCount,
                success: r.success
            }))
        }
    }).promise();
    
    console.log(`Week ${yearWeek} stats:`, stats);
}

// 모든 사용자 통계 업데이트
async function updateAllUserStats() {
    console.log('Updating all user stats...');
    
    // 모든 사용자 목록 가져오기
    const usersResult = await dynamoDB.scan({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
        ExpressionAttributeValues: {
            ':pk': 'USER#',
            ':sk': 'STATS'
        }
    }).promise();
    
    const existingUsers = new Set(usersResult.Items?.map(item => item.PK.replace('USER#', '')) || []);
    
    // 주간 기록에서 모든 사용자 찾기
    const weeklyRecords = await dynamoDB.scan({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pk) AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
            ':pk': 'USER#',
            ':sk': 'WEEK#'
        }
    }).promise();
    
    const allUsers = new Set(weeklyRecords.Items?.map(item => item.username) || []);
    
    // 각 사용자별로 통계 업데이트
    for (const username of allUsers) {
        await updateUserStats(username);
    }
    
    console.log(`Updated stats for ${allUsers.size} users`);
}

// 개별 사용자 통계 업데이트
async function updateUserStats(username) {
    // 사용자의 모든 주간 기록 조회
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
            ':pk': `USER#${username}`,
            ':sk': 'WEEK#'
        },
        ScanIndexForward: false // 최신순 정렬
    };
    
    const result = await dynamoDB.query(params).promise();
    const weeks = result.Items || [];
    
    if (weeks.length === 0) return;
    
    // 통계 계산
    const stats = {
        totalWeeks: weeks.length,
        successWeeks: weeks.filter(w => w.success).length,
        totalCommits: weeks.reduce((sum, w) => sum + w.commitCount, 0),
        averageCommitsPerWeek: (weeks.reduce((sum, w) => sum + w.commitCount, 0) / weeks.length).toFixed(1),
        successRate: ((weeks.filter(w => w.success).length / weeks.length) * 100).toFixed(1),
        currentStreak: calculateCurrentStreak(weeks),
        longestStreak: calculateLongestStreak(weeks),
        lastActiveWeek: weeks[0].yearWeek,
        firstWeek: weeks[weeks.length - 1].yearWeek
    };
    
    // 사용자 통계 저장
    await dynamoDB.put({
        TableName: TABLE_NAME,
        Item: {
            PK: `USER#${username}`,
            SK: 'STATS',
            username,
            ...stats,
            lastUpdated: new Date().toISOString()
        }
    }).promise();
}

// 현재 연속 기록 계산
function calculateCurrentStreak(weeks) {
    let streak = 0;
    for (const week of weeks) {
        if (week.success) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

// 최장 연속 기록 계산
function calculateLongestStreak(weeks) {
    let longest = 0;
    let current = 0;
    
    for (const week of weeks.reverse()) {
        if (week.success) {
            current++;
            longest = Math.max(longest, current);
        } else {
            current = 0;
        }
    }
    
    return longest;
}

// 전역 통계 업데이트
async function updateGlobalStats() {
    console.log('Updating global stats...');
    
    // 모든 사용자 통계 조회
    const userStats = await dynamoDB.scan({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
        ExpressionAttributeValues: {
            ':pk': 'USER#',
            ':sk': 'STATS'
        }
    }).promise();
    
    const users = userStats.Items || [];
    
    // 최근 활동 사용자 (최근 4주 이내)
    const fourWeeksAgo = getYearWeek(new Date(Date.now() - 28 * 24 * 60 * 60 * 1000));
    const activeUsers = users.filter(u => u.lastActiveWeek >= fourWeeksAgo);
    
    // Top 10 연속 기록
    const topStreaks = users
        .sort((a, b) => b.longestStreak - a.longestStreak)
        .slice(0, 10)
        .map(u => ({ username: u.username, streak: u.longestStreak }));
    
    // 전역 통계 저장
    await dynamoDB.put({
        TableName: TABLE_NAME,
        Item: {
            PK: 'GLOBAL',
            SK: 'STATS',
            totalUsers: users.length,
            activeUsers: activeUsers.length,
            totalCommits: users.reduce((sum, u) => sum + u.totalCommits, 0),
            averageSuccessRate: (users.reduce((sum, u) => sum + parseFloat(u.successRate), 0) / users.length).toFixed(1),
            topStreaks,
            lastUpdated: new Date().toISOString()
        }
    }).promise();
    
    console.log(`Global stats updated: ${users.length} total users, ${activeUsers.length} active`);
}

// 주차 계산 함수들
function getWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (target.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const jan4 = new Date(target.getFullYear(), 0, 4);
    const dayDiff = (target - jan4) / 86400000;
    return Math.ceil(dayDiff / 7);
}

function getYearWeek(date) {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}#${week}`;
}