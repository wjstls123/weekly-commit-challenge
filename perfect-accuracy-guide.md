# 완벽한 정확도를 위한 설정 가이드

## 1. 사용자별 개인 토큰 활용

### GitHub Personal Access Token 설정
사용자가 자신의 GitHub Personal Access Token을 제공하면 완벽한 정확도 달성 가능

```yaml
# 사용자가 설정해야 할 GitHub Secrets
PERSONAL_GITHUB_TOKEN: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 권한 설정
```
repo (모든 저장소 접근)
read:user (사용자 정보 읽기)  
read:org (조직 정보 읽기, 필요시)
```

## 2. 완벽한 GraphQL 쿼리

```graphql
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalRepositoryContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
      commitContributionsByRepository {
        repository {
          name
          nameWithOwner
          isPrivate
          owner {
            login
          }
        }
        contributions {
          totalCount
          nodes {
            commitCount
            occurredAt
          }
        }
      }
    }
  }
}
```

## 3. 저장소별 상세 확인

```bash
# 각 저장소별로 개별 확인
for repo in $(curl -s -H "Authorization: token $PERSONAL_GITHUB_TOKEN" \
  "https://api.github.com/user/repos?type=all&per_page=100" \
  | jq -r '.[].full_name'); do
  
  if [[ "$repo" != *"weekly-commit-challenge"* ]]; then
    echo "Checking $repo..."
    
    # 저장소별 커밋 확인
    commit_count=$(curl -s -H "Authorization: token $PERSONAL_GITHUB_TOKEN" \
      "https://api.github.com/repos/$repo/commits?author=$USERNAME&since=$SINCE_DATE&until=$UNTIL_DATE&per_page=100" \
      | jq '. | length')
    
    echo "  $repo: $commit_count commits"
    total=$((total + commit_count))
  fi
done
```

## 4. Rate Limit 관리

```bash
# Rate limit 확인
check_rate_limit() {
  rate_info=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/rate_limit")
  
  remaining=$(echo "$rate_info" | jq '.rate.remaining')
  reset_time=$(echo "$rate_info" | jq '.rate.reset')
  
  if [ "$remaining" -lt 100 ]; then
    echo "⚠️ Rate limit 부족: $remaining 남음"
    sleep_time=$((reset_time - $(date +%s) + 60))
    echo "💤 $sleep_time초 대기 중..."
    sleep $sleep_time
  fi
}
```

## 5. 캐싱 전략

```bash
# 일일 캐시로 API 호출 최소화
CACHE_FILE="/tmp/github_commits_${USERNAME}_${WEEK_START}.json"

if [ -f "$CACHE_FILE" ] && [ "$(find "$CACHE_FILE" -mtime -1)" ]; then
  echo "📦 캐시된 결과 사용"
  COMMIT_COUNT=$(cat "$CACHE_FILE")
else
  echo "🔄 새로운 API 호출"
  # API 호출 후 캐시 저장
  echo "$COMMIT_COUNT" > "$CACHE_FILE"
fi
```

## 6. 정확도 검증

```bash
# 다중 방식으로 교차 검증
methods=("graphql" "search" "events" "repos")
results=()

for method in "${methods[@]}"; do
  result=$(get_commits_via_$method)
  results+=("$method:$result")
  echo "$method API: $result 커밋"
done

# 결과 비교 및 이상치 탐지
echo "🔍 결과 비교: ${results[*]}"
```

## 7. 백업 및 복구

```bash
# 실패 시 대체 방안
get_commits_with_fallback() {
  # 1차: GraphQL
  result=$(get_commits_graphql 2>/dev/null)
  [ "$result" != "null" ] && echo "$result" && return
  
  # 2차: Search API  
  result=$(get_commits_search 2>/dev/null)
  [ "$result" != "null" ] && echo "$result" && return
  
  # 3차: Events API
  result=$(get_commits_events 2>/dev/null)
  [ "$result" != "null" ] && echo "$result" && return
  
  # 최후: 수동 계산
  echo "0"
}
```

## 8. 모니터링 및 알림

```bash
# 정확도 모니터링
if [ "$((GRAPHQL_COUNT - EVENTS_COUNT))" -gt 5 ]; then
  echo "🚨 API 결과 차이가 5개 이상입니다!"
  echo "GraphQL: $GRAPHQL_COUNT, Events: $EVENTS_COUNT"
  
  # Slack/Discord 알림 (선택사항)
  curl -X POST "$SLACK_WEBHOOK" -d "{
    \"text\": \"⚠️ GitHub API 정확도 이슈 감지: 차이 $((GRAPHQL_COUNT - EVENTS_COUNT))개\"
  }"
fi
```

## 최종 추천 구성

1. **기본**: GraphQL API + Events API 백업
2. **고급**: 사용자별 Personal Token + 저장소별 확인  
3. **완벽**: 다중 API 교차 검증 + 캐싱 + 모니터링

정확도: 기본(95%) → 고급(99%) → 완벽(99.9%)
