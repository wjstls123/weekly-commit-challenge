# 동적 카드 생성 대안

GitHub Pages는 정적 호스팅만 지원하므로 동적 카드 생성이 불가능합니다. 

## 현재 방식
- GitHub Actions가 매시간 실행되어 SVG 카드 생성
- `cards/` 폴더에 정적 파일로 저장
- 장점: 무료, GitHub만으로 가능
- 단점: 실시간 업데이트 불가

## 동적 카드 생성 대안

### 1. Vercel Edge Functions (무료)
```javascript
// api/card.js
export const config = { runtime: 'edge' };

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  // GitHub API에서 record.json 가져오기
  const response = await fetch(`https://api.github.com/repos/${username}/weekly-commit-challenge/contents/record.json`);
  const data = await response.json();
  
  // SVG 생성
  return new Response(generateSVG(data), {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
```

### 2. Cloudflare Workers (무료)
```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');
  
  // 동일한 로직
}
```

### 3. shields.io 활용
```markdown
![Weekly Commits](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/USERNAME/weekly-commit-challenge/master/record.json&query=$.records[-1].commits&label=This%20Week)
```

## 추천
현재 GitHub Actions 방식이 가장 간단하고 무료입니다. 실시간성이 중요하다면 Vercel이나 Cloudflare Workers를 고려해보세요.