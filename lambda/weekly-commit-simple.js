const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'weekly-commit-challenge';

// JWKS client for GitHub OIDC
const client = jwksClient({
    jwksUri: 'https://token.actions.githubusercontent.com/.well-known/jwks',
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000 // 10 minutes
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        } else {
            const signingKey = key.publicKey || key.rsaPublicKey;
            callback(null, signingKey);
        }
    });
}

exports.handler = async (event) => {
    try {
        // 1. OIDC 토큰 검증
        const token = event.headers.Authorization?.replace('Bearer ', '');
        if (!token) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'No authorization token provided' })
            };
        }

        // Verify token
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, getKey, {
                audience: 'weekly-commit-challenge',
                issuer: 'https://token.actions.githubusercontent.com'
            }, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        // Verify it's from GitHub Actions
        if (!decoded.repository || !decoded.repository.includes('weekly-commit-challange')) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Invalid repository' })
            };
        }

        // 2. 요청 데이터 파싱
        const body = JSON.parse(event.body);
        const {
            username,
            year,
            weekNumber,
            commitCount,
            success,
            periodStart,
            periodEnd
        } = body;

        const yearWeek = `${year}#${weekNumber}`;
        
        // 3. 현재 시간 (KST)
        const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
        const todayDateString = kstNow.toISOString().split('T')[0];
        const lastUpdated = kstNow.toISOString().replace('Z', '+09:00');

        // 4. 기존 레코드 확인 (오늘 이미 업데이트했는지)
        const existingRecord = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${username}`,
                SK: `WEEK#${yearWeek}`
            }
        }).promise();

        if (existingRecord.Item) {
            const existingDateString = existingRecord.Item.lastUpdated.split('T')[0];
            if (existingDateString === todayDateString) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'Already updated today',
                        skipped: true
                    })
                };
            }
        }

        // 5. DynamoDB에 저장 (사용자 주간 기록만)
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: {
                PK: `USER#${username}`,
                SK: `WEEK#${yearWeek}`,
                commitCount,
                success,
                periodStart,
                periodEnd,
                lastUpdated,
                yearWeek,  // 쿼리 편의를 위해 추가
                username   // 쿼리 편의를 위해 추가
            }
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Weekly commit record updated successfully',
                data: {
                    username,
                    yearWeek,
                    commitCount,
                    success
                }
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message
            })
        };
    }
};