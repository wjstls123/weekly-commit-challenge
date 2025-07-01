# GitHub GraphQL API 요청 상세 분석

## 1. 쿼리 문자열 생성

```bash
GRAPHQL_QUERY=$(cat <<EOF
{
  "query": "query(\$username: String!, \$from: DateTime!, \$to: DateTime!) {
    user(login: \$username) {
      contributionsCollection(from: \$from, to: \$to) {
        totalCommitContributions
        commitContributionsByRepository {
          repository {
            name
            owner { login }
          }
          contributions {
            totalCount
          }
        }
      }
    }
  }",
  "variables": {
    "username": "$USERNAME",
    "from": "$SINCE_DATE",
    "to": "$UNTIL_DATE"
  }
}
EOF
)
```

### 단계별 설명:

#### `cat <<EOF ... EOF`
- **heredoc 문법**: 여러 줄 문자열을 변수에 저장
- `EOF`는 구분자 (End Of File)
- JSON 형태의 GraphQL 요청 본문 생성

#### Query 부분
```graphql
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      commitContributionsByRepository {
        repository { name owner { login } }
        contributions { totalCount }
      }
    }
  }
}
```

**파라미터 정의:**
- `$username: String!` - 사용자명 (필수)
- `$from: DateTime!` - 시작 날짜 (필수)  
- `$to: DateTime!` - 종료 날짜 (필수)

**데이터 요청:**
- `user(login: $username)` - 특정 사용자 조회
- `contributionsCollection(from: $from, to: $to)` - 지정 기간의 기여도 데이터
- `totalCommitContributions` - 총 커밋 수
- `commitContributionsByRepository` - 저장소별 커밋 기여도

#### Variables 부분
```json
"variables": {
  "username": "john-doe",           // bash 변수 $USERNAME 값
  "from": "2025-07-07T00:00:00+09:00",  // bash 변수 $SINCE_DATE 값
  "to": "2025-07-13T23:59:59+09:00"     // bash 변수 $UNTIL_DATE 값
}
```

## 2. HTTP 요청 전송

```bash
GRAPHQL_RESPONSE=$(curl -s -X POST \
  -H "Authorization: bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$GRAPHQL_QUERY" \
  "https://api.github.com/graphql")
```

### 단계별 설명:

#### `curl` 옵션들
- `-s` : silent mode (진행률 숨김)
- `-X POST` : HTTP POST 메서드 사용
- `-H "Authorization: bearer $GITHUB_TOKEN"` : GitHub 토큰 인증
- `-H "Content-Type: application/json"` : JSON 형태 데이터 전송
- `-d "$GRAPHQL_QUERY"` : 요청 본문에 GraphQL 쿼리 포함

#### 엔드포인트
- `https://api.github.com/graphql` : GitHub GraphQL API 엔드포인트

## 3. 응답 처리

```bash
COMMIT_COUNT=$(echo "$GRAPHQL_RESPONSE" | jq --arg excluded "$EXCLUDED_REPOS" '
  .data.user.contributionsCollection.commitContributionsByRepository
  | map(select(.repository.name as $repo_name | ($excluded | split(",") | index($repo_name) | not)))
  | map(.contributions.totalCount)
  | add // 0
')
```

### 응답 JSON 구조:
```json
{
  "data": {
    "user": {
      "contributionsCollection": {
        "totalCommitContributions": 25,
        "commitContributionsByRepository": [
          {
            "repository": {
              "name": "my-project",
              "owner": { "login": "john-doe" }
            },
            "contributions": { "totalCount": 15 }
          },
          {
            "repository": {
              "name": "weekly-commit-challange",
              "owner": { "login": "john-doe" }
            },
            "contributions": { "totalCount": 10 }
          }
        ]
      }
    }
  }
}
```

### jq 필터링 과정:

#### 1. 저장소별 기여도 배열 추출
```bash
.data.user.contributionsCollection.commitContributionsByRepository
```

#### 2. 제외 저장소 필터링
```bash
map(select(.repository.name as $repo_name | ($excluded | split(",") | index($repo_name) | not)))
```
- `$excluded = "weekly-commit-challange"`
- `split(",")` → `["weekly-commit-challange"]`
- `index($repo_name)` → 제외 목록에 있으면 인덱스 반환, 없으면 null
- `| not` → null이면 true (포함), 인덱스가 있으면 false (제외)

#### 3. 커밋 수만 추출
```bash
map(.contributions.totalCount)
```
결과: `[15]` (weekly-commit-challange 제외됨)

#### 4. 총합 계산
```bash
add // 0
```
- `add` : 배열의 모든 수를 더함
- `// 0` : null인 경우 0으로 기본값 설정

## 4. 실제 요청/응답 예시

### 전송되는 실제 HTTP 요청:
```http
POST https://api.github.com/graphql
Authorization: bearer ghp_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "query": "query($username: String!, $from: DateTime!, $to: DateTime!) { user(login: $username) { contributionsCollection(from: $from, to: $to) { totalCommitContributions commitContributionsByRepository { repository { name owner { login } } contributions { totalCount } } } } }",
  "variables": {
    "username": "john-doe",
    "from": "2025-07-07T00:00:00+09:00",
    "to": "2025-07-13T23:59:59+09:00"
  }
}
```

### GitHub에서 반환하는 응답:
```json
{
  "data": {
    "user": {
      "contributionsCollection": {
        "totalCommitContributions": 25,
        "commitContributionsByRepository": [
          {
            "repository": { "name": "my-project", "owner": { "login": "john-doe" } },
            "contributions": { "totalCount": 15 }
          },
          {
            "repository": { "name": "another-repo", "owner": { "login": "john-doe" } },
            "contributions": { "totalCount": 10 }
          }
        ]
      }
    }
  }
}
```

### 최종 처리 결과:
```bash
COMMIT_COUNT=25  # 모든 저장소의 커밋 수 합계
```

## 5. 오류 처리

### GraphQL 오류 응답 예시:
```json
{
  "errors": [
    {
      "type": "NOT_FOUND",
      "path": ["user"],
      "message": "Could not resolve to a User with the login of 'invalid-user'."
    }
  ]
}
```

### 처리 방법:
```bash
if [ -z "$COMMIT_COUNT" ] || [ "$COMMIT_COUNT" = "null" ]; then
  echo "⚠️ GraphQL API 실패, Events API로 대체..."
  # 백업 API 사용
fi
```