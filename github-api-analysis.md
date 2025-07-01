# GitHub API 커밋 수 계산 분석

## 현재 사용 중인 jq 필터링 로직

```bash
jq --arg since_date "$SINCE_DATE" --arg until_date "$UNTIL_DATE" --arg excluded "$EXCLUDED_REPOS" '
  [
    .[]                    # 모든 이벤트 순회
    | select(.type == "PushEvent")                           # 1. Push 이벤트만 필터링
    | select((.created_at | fromdateiso8601) >= ($since_date | fromdateiso8601))  # 2. 시작일 이후
    | select((.created_at | fromdateiso8601) <= ($until_date | fromdateiso8601))  # 3. 종료일 이전
    | select(.repo.name | split("/")[1] as $repo_name | ($excluded | split(",") | index($repo_name) | not))  # 4. 제외 저장소 필터링
    | .payload.commits[]?                                    # 5. 각 Push의 모든 커밋 추출
    | select(.author.name != "GitHub" and .author.name != "github-actions[bot]")  # 6. 봇 커밋 제외
  ] 
  | length                # 7. 최종 커밋 개수 계산
'
```

## 단계별 상세 분석

### 1단계: Push 이벤트 필터링
```json
// 입력: 모든 이벤트
[
  {"type": "PushEvent", ...},
  {"type": "IssuesEvent", ...},  // ❌ 제외
  {"type": "PullRequestEvent", ...},  // ❌ 제외
  {"type": "PushEvent", ...}
]

// 출력: Push 이벤트만
[
  {"type": "PushEvent", ...},
  {"type": "PushEvent", ...}
]
```

### 2-3단계: 날짜 범위 필터링
```json
// 예시: 2025-07-07 ~ 2025-07-13 범위
[
  {"created_at": "2025-07-06T10:00:00Z", ...},  // ❌ 범위 밖
  {"created_at": "2025-07-08T14:30:00Z", ...},  // ✅ 범위 안
  {"created_at": "2025-07-14T09:00:00Z", ...}   // ❌ 범위 밖
]
```

### 4단계: 저장소 필터링
```bash
# 제외 저장소: "weekly-commit-challange"
[
  {"repo": {"name": "user/my-project"}},           // ✅ 포함
  {"repo": {"name": "user/weekly-commit-challange"}}, // ❌ 제외
  {"repo": {"name": "user/another-repo"}}         // ✅ 포함
]
```

### 5단계: 커밋 추출 (핵심!)
```json
// 하나의 Push 이벤트에 여러 커밋이 있을 수 있음
{
  "type": "PushEvent",
  "payload": {
    "commits": [
      {"sha": "abc123", "author": {"name": "John"}},  // 커밋 1
      {"sha": "def456", "author": {"name": "John"}},  // 커밋 2  
      {"sha": "ghi789", "author": {"name": "John"}}   // 커밋 3
    ]
  }
}

// .payload.commits[]? 로 각 커밋을 개별적으로 추출
// 결과: 3개의 별도 커밋으로 분리됨
```

### 6단계: 봇 커밋 제외
```json
[
  {"author": {"name": "John Doe"}},        // ✅ 사용자 커밋
  {"author": {"name": "GitHub"}},          // ❌ GitHub 자동 커밋
  {"author": {"name": "github-actions[bot]"}}, // ❌ Actions 봇
  {"author": {"name": "Jane Smith"}}       // ✅ 사용자 커밋
]
```

### 7단계: 최종 카운트
```bash
# 최종 결과: 실제 사용자가 만든 커밋의 개수
length  # 예: 15
```

## 실제 예시 시나리오

### 시나리오: 사용자가 한 주 동안 활동한 경우

```json
// GitHub Events API 응답 (일부)
[
  {
    "type": "PushEvent",
    "created_at": "2025-07-08T09:30:00Z",
    "repo": {"name": "john/my-app"},
    "payload": {
      "commits": [
        {"author": {"name": "John Doe"}, "message": "Fix login bug"},
        {"author": {"name": "John Doe"}, "message": "Update README"}
      ]
    }
  },
  {
    "type": "PushEvent", 
    "created_at": "2025-07-09T14:15:00Z",
    "repo": {"name": "john/another-project"},
    "payload": {
      "commits": [
        {"author": {"name": "John Doe"}, "message": "Add new feature"},
        {"author": {"name": "github-actions[bot]"}, "message": "Auto-update dependencies"},
        {"author": {"name": "John Doe"}, "message": "Fix tests"}
      ]
    }
  }
]

// 필터링 후 최종 커밋 수: 4개
// (봇 커밋 1개 제외, 사용자 커밋 4개만 카운트)
```

## API 제한사항 및 주의점

### 1. 이벤트 제한
- **최대 300개 이벤트**: GitHub는 최근 90일간 최대 300개 이벤트만 반환
- **per_page=100**: 한 번에 최대 100개까지만 가져올 수 있음

### 2. 누락 가능성
```bash
# 매우 활발한 사용자의 경우
일일 이벤트: 10개 (Push, Issues, PR 등)
90일 총 이벤트: 900개
API 반환: 최근 300개만 → 600개 누락 가능성!
```

### 3. Private Repository
- **제한**: Private 저장소는 해당 사용자의 토큰으로만 접근 가능
- **현재 설정**: 다른 사용자의 Private 저장소 커밋은 카운트 안됨

## 대안 API 고려사항

### Option 1: Search API (더 정확)
```bash
# 장점: 정확한 날짜 범위, 저장소별 검색 가능
# 단점: Rate limit 엄격 (인증 시 30req/min)
GET /search/commits?q=author:username+committer-date:2025-07-07..2025-07-13

# 예시 응답
{
  "total_count": 15,
  "items": [
    {"sha": "abc123", "commit": {"author": {"date": "2025-07-08T..."}}},
    ...
  ]
}
```

### Option 2: GraphQL API (최적)
```graphql
# 장점: 한 번의 요청으로 정확한 데이터
# 단점: 복잡한 쿼리 필요
query {
  user(login: "username") {
    contributionsCollection(from: "2025-07-07T00:00:00Z", to: "2025-07-13T23:59:59Z") {
      totalCommitContributions
      commitContributionsByRepository {
        repository {
          name
        }
        contributions {
          totalCount
        }
      }
    }
  }
}
```

## 현재 방식의 한계점

1. **✅ 장점**
   - 구현 간단
   - 공개 저장소 커밋 잘 수집
   - 봇 커밋 제외 가능

2. **❌ 단점**  
   - 매우 활발한 사용자의 경우 일부 커밋 누락 가능성
   - Private 저장소 커밋 누락
   - Events API 특성상 정확도 제한

3. **🔧 개선 방안**
   - Search API 또는 GraphQL API 병행 사용
   - 페이지네이션으로 더 많은 이벤트 수집
   - 사용자별 GitHub Token 활용 (Private 저장소 포함)