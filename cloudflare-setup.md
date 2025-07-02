# Cloudflare Workers로 동적 SVG 카드 만들기

## 1. Cloudflare 계정 생성
1. [cloudflare.com](https://cloudflare.com) 접속
2. 계정 생성 (무료)

## 2. Worker 생성
1. Cloudflare 대시보드 → Workers & Pages
2. "Create application" 클릭
3. "Create Worker" 선택
4. 이름 입력 (예: `weekly-commit-card`)
5. "Deploy" 클릭

## 3. 코드 배포
1. Worker 편집기에서 기본 코드 삭제
2. `cloudflare-worker.js` 파일의 코드 전체 복사 후 붙여넣기
3. "Deploy" 클릭

## 4. 사용법
배포 완료 후 다음 URL로 접근 가능:
```
https://weekly-commit-card.YOUR_SUBDOMAIN.workers.dev?username=USERNAME
```

### GitHub README에 추가:
```markdown
![Weekly Commit Challenge](https://weekly-commit-card.YOUR_SUBDOMAIN.workers.dev?username=YOUR_USERNAME)
```

## 5. 장점
- ✅ **진짜 실시간**: record.json 업데이트 즉시 반영
- ✅ **GitHub README 지원**: 실제 이미지로 렌더링
- ✅ **무료**: Cloudflare Workers 무료 플랜 (10만 요청/일)
- ✅ **빠른 응답**: 전 세계 CDN
- ✅ **캐시 최적화**: 5분 캐시로 성능 향상

## 6. 커스텀 도메인 (선택사항)
1. Workers → Custom domains
2. 본인 도메인 연결 가능
3. 예: `https://card.yourdomain.com?username=USERNAME`

## 7. 예시
실제 사용 예시:
```markdown
![My Weekly Commit Challenge](https://weekly-commit-card.your-subdomain.workers.dev?username=tlqhrm)
```

이제 GitHub README에서 실시간으로 업데이트되는 아름다운 카드를 볼 수 있습니다! 🎉