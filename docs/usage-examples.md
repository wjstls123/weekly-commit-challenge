# Weekly Commit Challenge - API 사용 예시

## 🎯 개요

GitHub Pages를 활용하여 실시간 커밋 배지와 데이터를 제공하는 API 시스템입니다.

## 📊 API 엔드포인트 구조

```
https://{username}.github.io/weekly-commit-challange/
├── api/
│   ├── data.json      # JSON 데이터 API
│   ├── badge.svg      # 실시간 배지 이미지
│   └── widget.html    # 임베드 위젯
├── record.md          # 원본 데이터 (워크플로우가 생성)
└── api.html           # API 문서 및 테스트 페이지
```

## 🚀 사용 방법

### 1. README.md에 배지 추가

```markdown
![Weekly Commit Challenge](https://YOUR_USERNAME.github.io/weekly-commit-challange/api/badge.svg)
```

**실제 예시:**
```markdown
![Weekly Commit Challenge](https://john-doe.github.io/weekly-commit-challange/api/badge.svg)
```

### 2. HTML에서 배지 사용

```html
<img src="https://YOUR_USERNAME.github.io/weekly-commit-challange/api/badge.svg" 
     alt="Weekly Commit Badge">
```

### 3. JavaScript로 데이터 가져오기

```javascript
async function getCommitData(username) {
    try {
        const response = await fetch(`https://${username}.github.io/weekly-commit-challange/api/data.json`);
        const data = await response.json();
        
        console.log('주간 커밋:', data.commitCount);
        console.log('성공 여부:', data.success);
        console.log('현재 주차:', data.weekNumber);
        
        return data;
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
}

// 사용 예시
getCommitData('john-doe').then(data => {
    document.getElementById('commit-count').textContent = data.commitCount;
});
```

### 4. React에서 사용

```jsx
import React, { useState, useEffect } from 'react';

function WeeklyCommitBadge({ username }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`https://${username}.github.io/weekly-commit-challange/api/data.json`)
            .then(res => res.json())
            .then(setData);
    }, [username]);

    if (!data) return <div>로딩중...</div>;

    return (
        <div className="weekly-commit-widget">
            <h3>{data.period}</h3>
            <p>커밋 수: {data.commitCount}</p>
            <p>상태: {data.status}</p>
            <img src={`https://${username}.github.io/weekly-commit-challange/api/badge.svg`} 
                 alt="Weekly Commit Badge" />
        </div>
    );
}
```

### 5. 위젯 임베드

```html
<iframe src="https://YOUR_USERNAME.github.io/weekly-commit-challange/api/widget.html" 
        width="300" 
        height="200" 
        frameborder="0">
</iframe>
```

## 📋 API 응답 형식

### data.json 응답 예시

```json
{
  "period": "6/23 ~ 6/29",
  "year": 2025,
  "weekNumber": 26,
  "commitCount": 15,
  "success": true,
  "status": "✅ 성공",
  "lastUpdated": "2025-07-01T09:00:00+09:00",
  "apiVersion": "1.0",
  "generatedAt": "2025-07-01T12:00:00Z",
  "endpoints": {
    "badge": "./badge.svg",
    "widget": "./widget.html", 
    "data": "./data.json"
  }
}
```

## 🎨 배지 커스터마이징

### 배지 색상 규칙

- **성공 (success: true)**: 🟢 녹색 (`#4c1`)
- **진행중 (success: false)**: 🟠 주황색 (`#fe7d37`)

### 배지 텍스트 형식

- 왼쪽: `{weekNumber}주차` (예: "26주차")
- 오른쪽: `성공` 또는 `진행중`

## 🔄 자동 업데이트

- **워크플로우**: 매일 2회 (오전 9시, 오후 9시 KST) record.md 업데이트
- **API**: 1분마다 record.md 변경사항 체크
- **위젯**: 5분마다 자동 새로고침

## 🛠️ 고급 사용법

### 1. 다중 사용자 모니터링

```javascript
const users = ['john-doe', 'jane-smith', 'alex-kim'];

Promise.all(
    users.map(user => 
        fetch(`https://${user}.github.io/weekly-commit-challange/api/data.json`)
            .then(res => res.json())
    )
).then(results => {
    results.forEach((data, index) => {
        console.log(`${users[index]}: ${data.commitCount} 커밋`);
    });
});
```

### 2. 통계 대시보드

```javascript
class WeeklyCommitDashboard {
    constructor(users) {
        this.users = users;
        this.data = new Map();
        this.init();
    }

    async loadAllData() {
        for (const user of this.users) {
            try {
                const response = await fetch(`https://${user}.github.io/weekly-commit-challange/api/data.json`);
                const data = await response.json();
                this.data.set(user, data);
            } catch (error) {
                console.error(`${user} 데이터 로드 실패:`, error);
            }
        }
    }

    getTopPerformers() {
        return Array.from(this.data.entries())
            .sort(([,a], [,b]) => b.commitCount - a.commitCount)
            .slice(0, 10);
    }

    getSuccessRate() {
        const total = this.data.size;
        const successful = Array.from(this.data.values()).filter(d => d.success).length;
        return ((successful / total) * 100).toFixed(1);
    }
}
```

### 3. 알림 시스템

```javascript
async function checkCommitGoals(username, threshold = 1) {
    const data = await fetch(`https://${username}.github.io/weekly-commit-challange/api/data.json`)
        .then(res => res.json());
    
    if (data.commitCount < threshold) {
        // 슬랙, 디스코드 등 알림
        sendNotification(`${username}님, 이번 주 커밋이 부족합니다! (${data.commitCount}/${threshold})`);
    }
}
```

## 🔧 트러블슈팅

### CORS 이슈
GitHub Pages는 CORS를 허용하므로 모든 도메인에서 접근 가능합니다.

### 캐시 문제
배지나 데이터가 업데이트되지 않으면 브라우저 캐시를 확인하세요.

```javascript
// 캐시 방지
const url = `https://${username}.github.io/weekly-commit-challange/api/data.json?t=${Date.now()}`;
```

### API 지연
record.md 업데이트 후 최대 1분까지 API 반영 지연이 있을 수 있습니다.