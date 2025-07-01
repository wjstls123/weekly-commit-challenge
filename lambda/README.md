# Weekly Commit Challenge - Lambda Functions

## 함수 구성

### 1. weekly-commit-simple.js
- **역할**: GitHub Actions 워크플로우에서 호출되는 메인 핸들러
- **트리거**: API Gateway (GitHub Actions OIDC 인증)
- **기능**: 
  - OIDC 토큰 검증
  - 사용자 주간 커밋 기록 DynamoDB 저장
  - 중복 업데이트 방지 (하루 1회)
- **메모리**: 512MB
- **타임아웃**: 30초

### 2. stats-aggregator.js  
- **역할**: 통계 집계 및 계산
- **트리거**: EventBridge 크론 (30분~1시간마다)
- **기능**:
  - 주간 통계 집계
  - 사용자별 통계 계산 (연속 기록, 성공률 등)
  - 전역 통계 업데이트
- **메모리**: 1024MB
- **타임아웃**: 5분

## 환경 변수

```bash
TABLE_NAME=weekly-commit-challenge
```

## DynamoDB 테이블 구조

Single Table Design 사용:

```
PK (Partition Key): String
SK (Sort Key): String
GSI1: SK, PK (역인덱스)
```

### 데이터 패턴

1. **사용자 주간 기록**: `USER#username` / `WEEK#2025#26`
2. **사용자 통계**: `USER#username` / `STATS`  
3. **주간 통계**: `WEEK#2025#26` / `SUMMARY`
4. **전역 통계**: `GLOBAL` / `STATS`

## 배포 설정

### API Gateway
- 엔드포인트: `/weekly-commit-record`
- 메서드: PUT
- 인증: GitHub OIDC Bearer Token

### EventBridge Rule
- 이름: `weekly-commit-stats-aggregation`
- 스케줄: `rate(30 minutes)` 또는 `cron(0 * * * ? *)`
- 타겟: `stats-aggregator` Lambda

## 의존성

```json
{
  "aws-sdk": "^2.1.0",
  "jsonwebtoken": "^9.0.0", 
  "jwks-rsa": "^3.0.0"
}
```

## 권한 (IAM Role)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem", 
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/weekly-commit-challenge*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream", 
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```