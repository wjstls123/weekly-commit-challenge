/**
 * 위클리 커밋 챌린지 로직 테스트
 * 월요일 처리 로직과 주차 계산 등을 검증
 */

const fs = require('fs');
const path = require('path');

/**
 * ISO 주차 계산 (ISO 8601 기준)
 * 월요일을 주의 시작으로 하는 ISO 표준 주차
 */
function getISOWeek(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const jan4 = new Date(target.getFullYear(), 0, 4);
    const dayDiff = (target - jan4) / 86400000;
    return 1 + Math.floor(dayDiff / 7);
}

/**
 * 주차 범위 계산 (월요일 ~ 일요일)
 */
function getWeekRange(date) {
    const target = new Date(date);
    const dayOfWeek = target.getDay();
    const monday = new Date(target);
    
    // 월요일로 이동 (일요일=0, 월요일=1)
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(target.getDate() + daysToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
        start: monday,
        end: sunday,
        startStr: formatDate(monday),
        endStr: formatDate(sunday)
    };
}

/**
 * 날짜 포맷팅 (MM/DD)
 */
function formatDate(date) {
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 랜덤 커밋 수 생성 (가중치 적용)
 */
function generateRandomCommits() {
    const rand = Math.random();
    if (rand < 0.15) return 0;      // 15% 확률로 0개 (실패)
    if (rand < 0.35) return 1;      // 20% 확률로 1개
    if (rand < 0.55) return 2;      // 20% 확률로 2개
    if (rand < 0.75) return 3;      // 20% 확률로 3개
    if (rand < 0.85) return 4;      // 10% 확률로 4개
    if (rand < 0.92) return 5;      // 7% 확률로 5개
    if (rand < 0.97) return 6 + Math.floor(Math.random() * 5); // 5% 확률로 6-10개
    return 11 + Math.floor(Math.random() * 10); // 3% 확률로 11-20개
}

/**
 * 3개월간 더미 데이터 생성 (과거 데이터)
 */
function generateDummyData(username, endDate = new Date()) {
    const records = [];
    
    // 13주 전부터 시작 (3개월 전)
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (13 * 7));
    
    // 13주간 데이터 생성
    for (let weekOffset = 0; weekOffset < 13; weekOffset++) {
        const weekDate = new Date(startDate);
        weekDate.setDate(startDate.getDate() + (weekOffset * 7));
        
        const weekRange = getWeekRange(weekDate);
        const commits = generateRandomCommits();
        const status = commits > 0 ? '✅ 성공' : '❌ 실패';
        
        records.push({
            id: weekOffset + 1,
            period: `${weekRange.startStr} ~ ${weekRange.endStr}`,
            week: `${weekDate.getFullYear()}년 ${getISOWeek(weekDate)}주차`,
            commits: commits,
            status: status,
            weekStart: weekRange.start.toISOString().split('T')[0],
            weekEnd: weekRange.end.toISOString().split('T')[0]
        });
    }
    
    return {
        username: username,
        lastUpdated: new Date().toISOString(),
        records: records
    };
}

/**
 * 월요일인지 확인
 */
function isMonday(date) {
    return date.getDay() === 1;
}

/**
 * 현재 주에 새로운 기록을 추가해야 하는지 확인 (수정된 로직)
 */
function shouldAddNewRecord(records, currentDate) {
    // 1. 첫 번째 기록이면 무조건 추가
    if (records.length === 0) return true;
    
    const lastRecord = records[records.length - 1];
    const lastWeekEnd = new Date(lastRecord.weekEnd);
    const currentWeekRange = getWeekRange(currentDate);
    
    console.log(`\n=== 새 기록 추가 검사 ===`);
    console.log(`현재 날짜: ${currentDate.toISOString().split('T')[0]} (${['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()]}요일)`);
    console.log(`마지막 기록 주 종료: ${lastRecord.weekEnd}`);
    console.log(`현재 주 시작: ${currentWeekRange.start.toISOString().split('T')[0]}`);
    console.log(`현재 주 종료: ${currentWeekRange.end.toISOString().split('T')[0]}`);
    
    // 2. 새로운 주인지 확인 (마지막 기록의 주와 다른 주인지)
    const isNewWeek = currentDate > lastWeekEnd;
    console.log(`새로운 주인가: ${isNewWeek}`);
    
    // 3. 같은 주 내에서 이미 기록이 있는지 확인
    const currentWeekStart = currentWeekRange.start.toISOString().split('T')[0];
    const lastWeekStart = lastRecord.weekStart;
    const isSameWeek = currentWeekStart === lastWeekStart;
    console.log(`같은 주 기록 존재: ${isSameWeek}`);
    
    // 4. 새로운 주이고 같은 주 기록이 없을 때만 추가
    const shouldAdd = isNewWeek && !isSameWeek;
    console.log(`새 기록 추가 필요: ${shouldAdd} (새 주: ${isNewWeek}, 같은 주 기록 없음: ${!isSameWeek})`);
    
    return shouldAdd;
}

/**
 * 월요일 시나리오 테스트
 */
function testMondayScenario() {
    console.log('\n🔴 ======= 월요일 시나리오 테스트 =======');
    
    // 2025년 7월 7일 월요일로 설정
    const monday = new Date('2025-07-07');
    console.log(`테스트 날짜: ${monday.toISOString().split('T')[0]} (월요일)`);
    
    // 기존 데이터 (월요일 이전까지)
    const existingData = generateDummyData('test-user', new Date('2025-07-06')); // 일요일까지
    console.log(`\n기존 기록 수: ${existingData.records.length}`);
    console.log(`마지막 기록: ${existingData.records[existingData.records.length - 1].period}`);
    
    // 월요일에 새 기록 추가 여부 확인
    const shouldAdd = shouldAddNewRecord(existingData.records, monday);
    
    if (shouldAdd) {
        const newWeekRange = getWeekRange(monday);
        const newRecord = {
            id: existingData.records.length + 1,
            period: `${newWeekRange.startStr} ~ ${newWeekRange.endStr}`,
            week: `${monday.getFullYear()}년 ${getISOWeek(monday)}주차`,
            commits: generateRandomCommits(),
            status: '처리 중...',
            weekStart: newWeekRange.start.toISOString().split('T')[0],
            weekEnd: newWeekRange.end.toISOString().split('T')[0]
        };
        
        existingData.records.push(newRecord);
        console.log(`\n✅ 새 기록 추가됨: ${newRecord.period} (${newRecord.week})`);
    } else {
        console.log(`\n❌ 새 기록 추가되지 않음`);
    }
    
    return existingData;
}

/**
 * 첫 시작 시나리오 테스트 (다양한 요일에 시작)
 */
function testFirstStartScenario() {
    console.log('\n🔵 ======= 첫 시작 시나리오 테스트 =======');
    
    const startDays = [
        { date: '2025-07-07', day: '월요일' },
        { date: '2025-07-08', day: '화요일' },
        { date: '2025-07-09', day: '수요일' },
        { date: '2025-07-10', day: '목요일' },
        { date: '2025-07-11', day: '금요일' },
        { date: '2025-07-12', day: '토요일' },
        { date: '2025-07-13', day: '일요일' }
    ];
    
    startDays.forEach(({ date, day }) => {
        console.log(`\n--- ${date} (${day}) 첫 시작 테스트 ---`);
        const testDate = new Date(date);
        const emptyRecords = [];
        const shouldAdd = shouldAddNewRecord(emptyRecords, testDate);
        console.log(`새 기록 추가 필요: ${shouldAdd} (예상: true)`);
        
        if (shouldAdd) {
            console.log(`✅ 정상: ${day} 첫 시작 시 새 기록 추가됨`);
        } else {
            console.log(`❌ 오류: ${day} 첫 시작인데 새 기록이 추가되지 않음!`);
        }
    });
}

/**
 * 같은 주 내 중복 방지 테스트
 */
function testSameWeekPreventionScenario() {
    console.log('\n🔵 ======= 같은 주 내 중복 방지 테스트 =======');
    
    // 월요일에 기록 추가 후, 같은 주 다른 날들 테스트
    const monday = new Date('2025-07-07');
    const baseData = generateDummyData('test-user', new Date('2025-07-06')); // 일요일까지
    
    // 월요일 기록 추가
    const mondayWeekRange = getWeekRange(monday);
    const mondayRecord = {
        id: baseData.records.length + 1,
        period: `${mondayWeekRange.startStr} ~ ${mondayWeekRange.endStr}`,
        week: `${monday.getFullYear()}년 ${getISOWeek(monday)}주차`,
        commits: 3,
        status: '✅ 성공',
        weekStart: mondayWeekRange.start.toISOString().split('T')[0],
        weekEnd: mondayWeekRange.end.toISOString().split('T')[0]
    };
    baseData.records.push(mondayRecord);
    
    console.log(`월요일 기록 추가: ${mondayRecord.period}`);
    
    const sameWeekDays = [
        { date: '2025-07-08', day: '화요일' },
        { date: '2025-07-09', day: '수요일' },
        { date: '2025-07-10', day: '목요일' },
        { date: '2025-07-11', day: '금요일' },
        { date: '2025-07-12', day: '토요일' },
        { date: '2025-07-13', day: '일요일' }
    ];
    
    sameWeekDays.forEach(({ date, day }) => {
        console.log(`\n--- ${date} (${day}) 같은 주 테스트 ---`);
        const testDate = new Date(date);
        const shouldAdd = shouldAddNewRecord(baseData.records, testDate);
        console.log(`새 기록 추가 필요: ${shouldAdd} (예상: false)`);
        
        if (shouldAdd) {
            console.log(`❌ 오류: ${day}에 같은 주 기록이 중복 추가되려 함!`);
        } else {
            console.log(`✅ 정상: ${day}에는 같은 주 기록이 중복 추가되지 않음`);
        }
    });
}

/**
 * 다음 주 새 기록 추가 테스트
 */
function testNextWeekScenario() {
    console.log('\n🟡 ======= 다음 주 새 기록 추가 테스트 =======');
    
    // 기존 데이터 (6월 30일까지)
    const baseData = generateDummyData('test-user', new Date('2025-06-29')); // 일요일
    console.log(`기존 마지막 기록: ${baseData.records[baseData.records.length - 1].period}`);
    
    const nextWeekDays = [
        { date: '2025-06-30', day: '월요일' },
        { date: '2025-07-01', day: '화요일' },
        { date: '2025-07-02', day: '수요일' },
        { date: '2025-07-03', day: '목요일' },
        { date: '2025-07-04', day: '금요일' },
        { date: '2025-07-05', day: '토요일' },
        { date: '2025-07-06', day: '일요일' }
    ];
    
    nextWeekDays.forEach(({ date, day }) => {
        console.log(`\n--- ${date} (${day}) 다음 주 테스트 ---`);
        const testDate = new Date(date);
        const shouldAdd = shouldAddNewRecord(baseData.records, testDate);
        console.log(`새 기록 추가 필요: ${shouldAdd} (예상: true)`);
        
        if (shouldAdd) {
            console.log(`✅ 정상: ${day}에 다음 주 새 기록 추가됨`);
        } else {
            console.log(`❌ 오류: ${day}에 다음 주 새 기록이 추가되지 않음!`);
        }
    });
}

/**
 * 주 가운데 시작 테스트 (수요일 시작)
 */
function testMidWeekStartScenario() {
    console.log('\n🟣 ======= 주 가운데 시작 테스트 =======');
    
    // 수요일부터 시작하는 시나리오
    const wednesday = new Date('2025-07-09'); // 수요일
    console.log(`수요일 첫 시작: ${wednesday.toISOString().split('T')[0]}`);
    
    const emptyRecords = [];
    const shouldAdd = shouldAddNewRecord(emptyRecords, wednesday);
    console.log(`새 기록 추가 필요: ${shouldAdd} (예상: true)`);
    
    if (shouldAdd) {
        const weekRange = getWeekRange(wednesday);
        const newRecord = {
            id: 1,
            period: `${weekRange.startStr} ~ ${weekRange.endStr}`,
            week: `${wednesday.getFullYear()}년 ${getISOWeek(wednesday)}주차`,
            commits: 5,
            status: '✅ 성공',
            weekStart: weekRange.start.toISOString().split('T')[0],
            weekEnd: weekRange.end.toISOString().split('T')[0]
        };
        
        console.log(`✅ 수요일 시작 기록 추가: ${newRecord.period}`);
        
        // 같은 주 내 다른 날들 테스트
        const sameWeekDays = [
            { date: '2025-07-10', day: '목요일' },
            { date: '2025-07-11', day: '금요일' },
            { date: '2025-07-12', day: '토요일' },
            { date: '2025-07-13', day: '일요일' }
        ];
        
        sameWeekDays.forEach(({ date, day }) => {
            console.log(`\n--- ${date} (${day}) 같은 주 테스트 ---`);
            const testDate = new Date(date);
            const shouldAddSame = shouldAddNewRecord([newRecord], testDate);
            console.log(`새 기록 추가 필요: ${shouldAddSame} (예상: false)`);
            
            if (!shouldAddSame) {
                console.log(`✅ 정상: ${day}에는 중복 기록 추가되지 않음`);
            } else {
                console.log(`❌ 오류: ${day}에 중복 기록이 추가되려 함!`);
            }
        });
    }
}

/**
 * 건너뛴 주 테스트 (비연속 주차)
 */
function testSkippedWeekScenario() {
    console.log('\n🟤 ======= 건너뛴 주 테스트 =======');
    
    // 기존 데이터 (6월 22일까지)
    const baseData = generateDummyData('test-user', new Date('2025-06-22')); // 일요일
    console.log(`기존 마지막 기록: ${baseData.records[baseData.records.length - 1].period}`);
    
    // 1주 건너뛰고 7월 7일부터 시작
    const skippedWeekStart = new Date('2025-07-07'); // 월요일
    console.log(`\n1주 건너뛰고 시작: ${skippedWeekStart.toISOString().split('T')[0]} (월요일)`);
    
    const shouldAdd = shouldAddNewRecord(baseData.records, skippedWeekStart);
    console.log(`새 기록 추가 필요: ${shouldAdd} (예상: true - 건너뛴 주라도 새 주이므로)`);
    
    if (shouldAdd) {
        console.log(`✅ 정상: 건너뛴 주여도 새 기록 추가됨`);
    } else {
        console.log(`❌ 오류: 건너뛴 주에서 새 기록이 추가되지 않음!`);
    }
}

/**
 * 경계값 정밀 테스트 (일요일 23:59 vs 월요일 00:00)
 */
function testPreciseBoundaryScenario() {
    console.log('\n⚫ ======= 경계값 정밀 테스트 =======');
    
    const baseData = generateDummyData('test-user', new Date('2025-06-29')); // 일요일까지
    console.log(`기존 마지막 기록: ${baseData.records[baseData.records.length - 1].period}`);
    
    const boundaryTests = [
        { date: '2025-06-29T23:59:59', desc: '일요일 23:59:59', expected: true },
        { date: '2025-06-30T00:00:00', desc: '월요일 00:00:00', expected: true },
        { date: '2025-06-30T00:00:01', desc: '월요일 00:00:01', expected: true },
        { date: '2025-06-30T12:00:00', desc: '월요일 정오', expected: true }
    ];
    
    boundaryTests.forEach(({ date, desc, expected }) => {
        console.log(`\n--- ${desc} 테스트 ---`);
        const testDate = new Date(date);
        const shouldAdd = shouldAddNewRecord(baseData.records, testDate);
        console.log(`새 기록 추가 필요: ${shouldAdd} (예상: ${expected})`);
        
        if (shouldAdd === expected) {
            console.log(`✅ 정상: ${desc} 결과가 예상과 일치`);
        } else {
            console.log(`❌ 오류: ${desc} 결과가 예상과 다름!`);
        }
    });
}

/**
 * 연속 월요일 테스트
 */
function testConsecutiveMondays() {
    console.log('\n🟣 ======= 연속 월요일 테스트 =======');
    
    let data = generateDummyData('test-user', new Date('2025-07-06'));
    const initialRecordCount = data.records.length;
    
    console.log(`초기 기록 수: ${initialRecordCount}`);
    
    // 연속 4주 월요일 테스트
    const mondays = [
        '2025-07-07', // 1주차
        '2025-07-14', // 2주차  
        '2025-07-21', // 3주차
        '2025-07-28'  // 4주차
    ];
    
    mondays.forEach((mondayStr, index) => {
        const monday = new Date(mondayStr);
        console.log(`\n--- ${mondayStr} (${index + 1}주차 월요일) ---`);
        
        const shouldAdd = shouldAddNewRecord(data.records, monday);
        console.log(`새 기록 추가 필요: ${shouldAdd}`);
        
        if (shouldAdd) {
            const newWeekRange = getWeekRange(monday);
            const newRecord = {
                id: data.records.length + 1,
                period: `${newWeekRange.startStr} ~ ${newWeekRange.endStr}`,
                week: `${monday.getFullYear()}년 ${getISOWeek(monday)}주차`,
                commits: generateRandomCommits(),
                status: '✅ 성공',
                weekStart: newWeekRange.start.toISOString().split('T')[0],
                weekEnd: newWeekRange.end.toISOString().split('T')[0]
            };
            
            data.records.push(newRecord);
            console.log(`✅ 기록 추가: ${newRecord.period}`);
        }
        
        console.log(`현재 총 기록 수: ${data.records.length}`);
    });
    
    console.log(`\n최종 기록 수: ${data.records.length} (초기: ${initialRecordCount}, 증가: ${data.records.length - initialRecordCount})`);
}

/**
 * 메인 테스트 실행
 */
function runAllTests() {
    console.log('🧪 위클리 커밋 챌린지 로직 테스트 시작\n');
    
    // 테스트 디렉토리 생성
    const testDir = path.join(__dirname, 'results');
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }
    
    // 1. 월요일 시나리오
    const mondayResult = testMondayScenario();
    fs.writeFileSync(
        path.join(testDir, 'monday-test-result.json'),
        JSON.stringify(mondayResult, null, 2)
    );
    
    // 2. 첫 시작 시나리오
    testFirstStartScenario();
    
    // 3. 같은 주 내 중복 방지 테스트
    testSameWeekPreventionScenario();
    
    // 4. 다음 주 새 기록 추가 테스트
    testNextWeekScenario();
    
    // 5. 주 가운데 시작 테스트
    testMidWeekStartScenario();
    
    // 6. 건너뛴 주 테스트
    testSkippedWeekScenario();
    
    // 7. 경계값 정밀 테스트
    testPreciseBoundaryScenario();
    
    // 8. 연속 월요일 테스트
    testConsecutiveMondays();
    
    // 5. 더미 데이터 생성 (3개월)
    console.log('\n📊 ======= 3개월 더미 데이터 생성 =======');
    const dummyData = generateDummyData('dummy-user', new Date('2025-07-01'));
    
    fs.writeFileSync(
        path.join(testDir, 'dummy-data-3months.json'),
        JSON.stringify(dummyData, null, 2)
    );
    
    console.log(`더미 데이터 생성 완료: ${dummyData.records.length}주간 기록`);
    console.log(`기간: ${dummyData.records[0].period} ~ ${dummyData.records[dummyData.records.length - 1].period}`);
    
    // 통계 출력
    const successCount = dummyData.records.filter(r => r.status === '✅ 성공').length;
    const successRate = Math.round((successCount / dummyData.records.length) * 100);
    console.log(`성공률: ${successRate}% (${successCount}/${dummyData.records.length})`);
    
    console.log('\n✅ 모든 테스트 완료! 결과는 test/results/ 폴더에 저장되었습니다.');
}

// 테스트 실행
if (require.main === module) {
    runAllTests();
}

module.exports = {
    getISOWeek,
    getWeekRange,
    generateDummyData,
    shouldAddNewRecord,
    isMonday
};