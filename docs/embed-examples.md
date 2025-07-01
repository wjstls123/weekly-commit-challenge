# 📝 다른 프로젝트에서 Weekly Commit Challenge 사용하기

## 🎯 개요

Weekly Commit Challenge의 배지와 데이터를 다른 프로젝트 README나 개인 프로필에 임베드해서 사용할 수 있습니다.

## 📱 메인 페이지 예시

### 예시 1: 개인 GitHub 프로필 (README.md)

```markdown
# Hi there 👋 I'm John Doe

## 💻 About Me
- 🔭 I'm currently working on awesome projects
- 🌱 I'm learning React and Node.js
- 💬 Ask me about JavaScript, Python

## 📊 Weekly Commit Challenge
![Weekly Commit Challenge](https://john-doe.github.io/weekly-commit-challange/api/badge.svg)

현재 **26주차**에 **15개 커밋**으로 **성공** 중입니다! 🎉

### 최근 활동
- ✅ 2025년 26주차: 15 커밋 (성공)
- ✅ 2025년 25주차: 8 커밋 (성공) 
- ❌ 2025년 24주차: 0 커밋 (실패)
- ✅ 2025년 23주차: 12 커밋 (성공)

[🔗 전체 기록 보기](https://john-doe.github.io/weekly-commit-challange/)

## 🛠️ Tech Stack
...
```

**실제 화면 모습:**

```
# Hi there 👋 I'm John Doe

## 💻 About Me
- 🔭 I'm currently working on awesome projects
- 🌱 I'm learning React and Node.js
- 💬 Ask me about JavaScript, Python

## 📊 Weekly Commit Challenge
```
![Weekly Commit Badge](https://img.shields.io/badge/26주차-성공-4c1)
```

현재 **26주차**에 **15개 커밋**으로 **성공** 중입니다! 🎉

### 최근 활동
- ✅ 2025년 26주차: 15 커밋 (성공)
- ✅ 2025년 25주차: 8 커밋 (성공) 
- ❌ 2025년 24주차: 0 커밋 (실패)
- ✅ 2025년 23주차: 12 커밋 (성공)

[🔗 전체 기록 보기](https://john-doe.github.io/weekly-commit-challange/)
```

---

### 예시 2: 프로젝트 README.md

```markdown
# 🚀 My Awesome Project

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Weekly Commit Challenge](https://john-doe.github.io/weekly-commit-challange/api/badge.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)

## 📖 Description
This is an awesome project that does amazing things...

## 📊 Development Activity
이 프로젝트는 **Weekly Commit Challenge**와 함께 꾸준히 개발되고 있습니다.

현재 진행 상황: **26주차 진행 중** (15개 커밋 완료)

## 🛠️ Installation
...
```

**실제 화면 모습:**

```
# 🚀 My Awesome Project
```
![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Weekly Commit Challenge](https://img.shields.io/badge/26주차-성공-4c1) ![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
```

## 📖 Description
This is an awesome project that does amazing things...

## 📊 Development Activity
이 프로젝트는 **Weekly Commit Challenge**와 함께 꾸준히 개발되고 있습니다.

현재 진행 상황: **26주차 진행 중** (15개 커밋 완료)
```

---

### 예시 3: 팀 프로젝트 대시보드

```markdown
# 🏢 Team Dashboard

## 👥 Team Members' Weekly Commit Status

| 멤버 | 상태 | 현재 주차 | 커밋 수 |
|------|------|-----------|---------|
| John Doe | ![John's Status](https://john-doe.github.io/weekly-commit-challange/api/badge.svg) | 26주차 | 15개 |
| Jane Smith | ![Jane's Status](https://jane-smith.github.io/weekly-commit-challange/api/badge.svg) | 26주차 | 8개 |
| Alex Kim | ![Alex's Status](https://alex-kim.github.io/weekly-commit-challange/api/badge.svg) | 26주차 | 22개 |

## 📈 Team Statistics
- 🏆 이번 주 최고 커밋: Alex Kim (22개)
- 💪 팀 평균 커밋: 15개
- ✅ 성공률: 100%
```

**실제 화면 모습:**

| 멤버 | 상태 | 현재 주차 | 커밋 수 |
|------|------|-----------|---------|
| John Doe | ![Success Badge](https://img.shields.io/badge/26주차-성공-4c1) | 26주차 | 15개 |
| Jane Smith | ![Success Badge](https://img.shields.io/badge/26주차-성공-4c1) | 26주차 | 8개 |
| Alex Kim | ![Success Badge](https://img.shields.io/badge/26주차-성공-4c1) | 26주차 | 22개 |

---

## 🎨 스타일링 옵션

### 1. 기본 배지
```markdown
![Weekly Commit Challenge](https://username.github.io/weekly-commit-challange/api/badge.svg)
```

### 2. 배지에 링크 추가
```markdown
[![Weekly Commit Challenge](https://username.github.io/weekly-commit-challange/api/badge.svg)](https://username.github.io/weekly-commit-challange/)
```

### 3. HTML 스타일링
```html
<p align="center">
  <a href="https://username.github.io/weekly-commit-challange/">
    <img src="https://username.github.io/weekly-commit-challange/api/badge.svg" alt="Weekly Commit Challenge">
  </a>
</p>
```

### 4. 배지 크기 조정 (HTML)
```html
<img src="https://username.github.io/weekly-commit-challange/api/badge.svg" 
     alt="Weekly Commit Challenge" 
     width="200" 
     height="20">
```

## 📊 동적 데이터 표시

### JavaScript로 실시간 데이터 표시
```html
<div id="commit-status">로딩 중...</div>

<script>
fetch('https://username.github.io/weekly-commit-challange/api/data.json')
  .then(res => res.json())
  .then(data => {
    document.getElementById('commit-status').innerHTML = `
      <strong>${data.period}</strong><br>
      ${data.year}년 ${data.weekNumber}주차<br>
      커밋 수: ${data.commitCount}개<br>
      상태: ${data.status}
    `;
  });
</script>
```

## 🔗 유용한 링크들

- [🎯 Weekly Commit Challenge 참여하기](https://github.com/your-username/weekly-commit-challenge/fork)
- [📖 API 문서](https://your-username.github.io/weekly-commit-challange/api.html)
- [📊 실시간 대시보드](https://your-username.github.io/weekly-commit-challange/)
- [💡 사용 예시 더보기](https://your-username.github.io/weekly-commit-challange/usage-examples.html)

## ❓ FAQ

### Q: 배지가 업데이트되지 않아요
A: 워크플로우는 매일 2회 (오전 9시, 오후 9시 KST) 실행됩니다. 최대 12시간 지연이 있을 수 있습니다.

### Q: 다른 사람의 배지를 내 프로젝트에서 사용할 수 있나요?
A: 네! 공개된 GitHub Pages이므로 누구나 사용할 수 있습니다.

### Q: 배지 디자인을 커스터마이징할 수 있나요?
A: 현재는 기본 디자인만 제공되지만, API에서 JSON 데이터를 가져와서 직접 배지를 만들 수 있습니다.

### Q: 팀 단위로 사용하려면 어떻게 하나요?
A: 각 팀원이 개별적으로 Fork하고, 팀 대시보드에서 모든 멤버의 배지를 모아서 표시하면 됩니다.