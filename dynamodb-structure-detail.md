# DynamoDB 테이블 구조 상세 설명

## 테이블: weekly-commit-challenge

### 키 구조
```
Partition Key: username (String)
Sort Key: yearWeek (String)
```

### 전체 속성 목록

| 속성명 | 타입 | 필수 | 설명 | 예시 값 |
|--------|------|------|------|---------|
| `username` | String | ✅ | GitHub 사용자명 (PK) | "john-doe" |
| `yearWeek` | String | ✅ | 연도#주차 (SK) | "2025#26" |
| `year` | Number | ✅ | 연도 | 2025 |
| `weekNumber` | Number | ✅ | 주차 번호 | 26 |
| `commitCount` | Number | ✅ | 해당 주의 커밋 수 | 15 |
| `success` | Boolean | ✅ | 성공 여부 (1개 이상 커밋) | true |
| `periodStart` | String | ✅ | 주차 시작일 | "2025-06-23" |
| `periodEnd` | String | ✅ | 주차 종료일 | "2025-06-29" |
| `lastUpdated` | String | ✅ | 마지막 업데이트 시간 (KST) | "2025-07-01T12:00:00+09:00" |
| `updatedAt` | String | ✅ | 레코드 생성/수정 시간 (UTC) | "2025-07-01T03:00:00Z" |

## 실제 데이터 예시

### 레코드 1: 성공한 주차
```json
{
  "username": "john-doe",
  "yearWeek": "2025#26",
  "year": 2025,
  "weekNumber": 26,
  "commitCount": 15,
  "success": true,
  "periodStart": "2025-06-23",
  "periodEnd": "2025-06-29", 
  "lastUpdated": "2025-07-01T12:00:00+09:00",
  "updatedAt": "2025-07-01T03:00:00Z"
}
```

### 레코드 2: 실패한 주차
```json
{
  "username": "john-doe",
  "yearWeek": "2025#25",
  "year": 2025,
  "weekNumber": 25,
  "commitCount": 0,
  "success": false,
  "periodStart": "2025-06-16",
  "periodEnd": "2025-06-22",
  "lastUpdated": "2025-06-23T09:30:00+09:00",
  "updatedAt": "2025-06-23T00:30:00Z"
}
```

### 레코드 3: 다른 사용자
```json
{
  "username": "jane-smith",
  "yearWeek": "2025#26", 
  "year": 2025,
  "weekNumber": 26,
  "commitCount": 8,
  "success": true,
  "periodStart": "2025-06-23",
  "periodEnd": "2025-06-29",
  "lastUpdated": "2025-07-01T21:15:00+09:00",
  "updatedAt": "2025-07-01T12:15:00Z"
}
```

## 인덱스 설계 (선택사항)

### GSI1: 주차별 조회용
```
Partition Key: yearWeek
Sort Key: username
Index Name: YearWeekIndex
```

**용도**: 특정 주차의 모든 참여자 조회
```javascript
// 2025년 26주차에 참여한 모든 사용자 조회
const params = {
  TableName: 'weekly-commit-challenge',
  IndexName: 'YearWeekIndex',
  KeyConditionExpression: 'yearWeek = :yearWeek',
  ExpressionAttributeValues: {
    ':yearWeek': '2025#26'
  }
};
```

### GSI2: 연도별 조회용  
```
Partition Key: year
Sort Key: weekNumber
Index Name: YearIndex
```

**용도**: 연도별 통계 및 트렌드 분석
```javascript
// 2025년 모든 주차 데이터 조회
const params = {
  TableName: 'weekly-commit-challenge',
  IndexName: 'YearIndex', 
  KeyConditionExpression: '#year = :year',
  ExpressionAttributeNames: {
    '#year': 'year'
  },
  ExpressionAttributeValues: {
    ':year': 2025
  }
};
```

## 쿼리 패턴 예시

### 1. 특정 사용자의 모든 기록 조회
```javascript
const params = {
  TableName: 'weekly-commit-challenge',
  KeyConditionExpression: 'username = :username',
  ExpressionAttributeValues: {
    ':username': 'john-doe'
  },
  ScanIndexForward: false  // 최신 순으로 정렬
};

// 결과: john-doe의 모든 주차 기록 (최신 순)
```

### 2. 특정 사용자의 특정 주차 조회
```javascript
const params = {
  TableName: 'weekly-commit-challenge',
  Key: {
    username: 'john-doe',
    yearWeek: '2025#26'
  }
};

// 결과: john-doe의 2025년 26주차 기록만
```

### 3. 특정 사용자의 최근 N주 기록
```javascript
const params = {
  TableName: 'weekly-commit-challenge',
  KeyConditionExpression: 'username = :username AND yearWeek >= :startWeek',
  ExpressionAttributeValues: {
    ':username': 'john-doe',
    ':startWeek': '2025#20'  // 20주차부터
  },
  ScanIndexForward: false,
  Limit: 10  // 최근 10주
};
```

### 4. 특정 주차의 성공자만 조회 (GSI 사용)
```javascript
const params = {
  TableName: 'weekly-commit-challenge',
  IndexName: 'YearWeekIndex',
  KeyConditionExpression: 'yearWeek = :yearWeek',
  FilterExpression: 'success = :success',
  ExpressionAttributeValues: {
    ':yearWeek': '2025#26',
    ':success': true
  }
};

// 결과: 2025년 26주차 성공자들만
```

## 데이터 업데이트 패턴

### 1. 주간 기록 업데이트 (UPSERT)
```javascript
const params = {
  TableName: 'weekly-commit-challenge',
  Key: {
    username: 'john-doe',
    yearWeek: '2025#26'
  },
  UpdateExpression: `
    SET 
      commitCount = :commitCount,
      success = :success,
      periodStart = :periodStart,
      periodEnd = :periodEnd,
      lastUpdated = :lastUpdated,
      #year = :year,
      weekNumber = :weekNumber,
      updatedAt = :updatedAt
  `,
  ExpressionAttributeNames: {
    '#year': 'year'  // 예약어 처리
  },
  ExpressionAttributeValues: {
    ':commitCount': 15,
    ':success': true,
    ':periodStart': '2025-06-23',
    ':periodEnd': '2025-06-29', 
    ':lastUpdated': '2025-07-01T12:00:00+09:00',
    ':year': 2025,
    ':weekNumber': 26,
    ':updatedAt': new Date().toISOString()
  },
  ReturnValues: 'ALL_NEW'
};
```

### 2. 조건부 업데이트 (하루 한 번 제한)
```javascript
const params = {
  TableName: 'weekly-commit-challenge',
  Key: {
    username: 'john-doe', 
    yearWeek: '2025#26'
  },
  UpdateExpression: 'SET commitCount = :newCount, updatedAt = :now',
  ConditionExpression: 'attribute_not_exists(updatedAt) OR updatedAt < :today',
  ExpressionAttributeValues: {
    ':newCount': 20,
    ':now': new Date().toISOString(),
    ':today': getTodayStart()  // 오늘 00:00:00
  }
};
```

## 성능 및 비용 최적화

### 1. 쿼리 최적화
- **Hot Key 방지**: 사용자별 파티션으로 부하 분산
- **정렬된 액세스**: yearWeek SK로 시간순 정렬
- **필터링**: GSI 활용으로 효율적 조회

### 2. 비용 최적화
- **온디맨드 결제**: 예측 불가능한 트래픽에 적합
- **최소 속성**: 필요한 데이터만 저장
- **TTL 설정**: 오래된 데이터 자동 삭제 (선택사항)

### 3. 확장성
- **사용자 증가**: PK 기반 수평 확장 자동 지원
- **데이터 증가**: 연도별 분할 가능 (필요시)
- **쿼리 패턴**: GSI로 다양한 조회 패턴 지원

## 데이터 보존 정책 (선택사항)

### TTL 설정으로 자동 정리
```javascript
// 2년 후 자동 삭제
const ttlValue = Math.floor(Date.now() / 1000) + (2 * 365 * 24 * 60 * 60);

const params = {
  TableName: 'weekly-commit-challenge',
  Item: {
    username: 'john-doe',
    yearWeek: '2025#26',
    // ... 다른 속성들
    ttl: ttlValue  // TTL 속성 추가
  }
};
```

## 모니터링 포인트

### 1. 성능 지표
- Read/Write Capacity Units 사용량
- 쿼리 응답 시간
- Hot Partition 발생 여부

### 2. 비즈니스 지표  
- 주간 활성 사용자 수
- 평균 성공률
- 연속 성공 주차 분포

### 3. 오류 지표
- Throttling 발생 횟수
- 조건부 업데이트 실패율
- GSI 지연 시간