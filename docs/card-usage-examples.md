# 📊 GitHub README Stats 스타일 카드 사용법

## 🎯 개요

github-readme-stats처럼 아름다운 카드 형태로 Weekly Commit Challenge 정보를 표시할 수 있습니다.

## 🎨 카드 스타일 종류

### 1. 기본 카드 (Default Card)
```markdown
![Weekly Commit Card](https://YOUR_USERNAME.github.io/weekly-commit-challange/api/card.svg)
```

**실제 모습:**
- 400x200 크기의 카드
- 주차 정보, 커밋 수, 성공 상태 표시
- 우측에 주차 번호 표시
- 마지막 업데이트 시간 포함

### 2. 컴팩트 카드 (Compact Card)
```markdown
![Weekly Commit Compact](https://YOUR_USERNAME.github.io/weekly-commit-challange/api/card-compact.svg)
```

**실제 모습:**
- 300x120 크기의 작은 카드
- 핵심 정보만 간단히 표시
- 사이드바나 작은 공간에 적합

### 3. 통계 카드 (Stats Card)
```markdown
![Weekly Commit Stats](https://YOUR_USERNAME.github.io/weekly-commit-challange/api/card-stats.svg)
```

**실제 모습:**
- 450x200 크기의 상세 통계 카드
- 총 참여 주차, 성공률, 최장 연속 기록 표시
- 현재 주차 상태 하이라이트

### 4. 다크 테마 카드
```markdown
![Weekly Commit Dark](https://YOUR_USERNAME.github.io/weekly-commit-challange/api/card-dark.svg)
```

**실제 모습:**
- 어두운 배경의 카드
- 다크 모드 README에 적합

## 🌈 테마 옵션

### 사용 가능한 테마들
- `default` - 기본 밝은 테마
- `dark` - 어두운 테마  
- `radical` - 핑크/청록 테마
- `merko` - 초록 터미널 테마
- `gruvbox` - 노란/베이지 테마
- `tokyonight` - 보라/파랑 테마

### URL 파라미터로 테마 변경
```markdown
![Weekly Commit Card](https://YOUR_USERNAME.github.io/weekly-commit-challange/api/card.svg?theme=dark)
![Weekly Commit Card](https://YOUR_USERNAME.github.io/weekly-commit-challange/api/card.svg?theme=radical)
```

## 📱 실제 사용 예시

### GitHub 프로필 README
```markdown
# Hi there 👋 I'm John Doe

## 💻 About Me
- 🔭 I'm currently working on awesome projects
- 🌱 I'm learning React and Node.js

## 📊 GitHub Stats

<a href="https://github.com/anuraghazra/github-readme-stats">
  <img align="center" src="https://github-readme-stats.vercel.app/api?username=john-doe&show_icons=true&theme=radical" />
</a>
<a href="https://john-doe.github.io/weekly-commit-challange/">
  <img align="center" src="https://john-doe.github.io/weekly-commit-challange/api/card.svg?theme=radical" />
</a>
```

### 프로젝트 README 헤더
```markdown
# 🚀 My Awesome Project

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stars](https://img.shields.io/github/stars/username/repo.svg)

![Weekly Commit Card](https://john-doe.github.io/weekly-commit-challange/api/card-compact.svg)

</div>

프로젝트 설명...
```

### 나란히 배치
```markdown
<div align="center">
  <img height="200" src="https://github-readme-stats.vercel.app/api?username=john-doe&show_icons=true&theme=dark" />
  <img height="200" src="https://john-doe.github.io/weekly-commit-challange/api/card.svg?theme=dark" />
</div>
```

### 세로 배치
```markdown
<div align="center">

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=john-doe&show_icons=true&theme=tokyonight)

![Weekly Commit Stats](https://john-doe.github.io/weekly-commit-challange/api/card-stats.svg?theme=tokyonight)

![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=john-doe&theme=tokyonight)

</div>
```

## 🔗 링크와 함께 사용

### 클릭 가능한 카드
```markdown
<a href="https://john-doe.github.io/weekly-commit-challange/">
  <img src="https://john-doe.github.io/weekly-commit-challange/api/card.svg" alt="Weekly Commit Challenge" />
</a>
```

### 새 탭에서 열기
```markdown
<a href="https://john-doe.github.io/weekly-commit-challange/" target="_blank">
  <img src="https://john-doe.github.io/weekly-commit-challange/api/card.svg" alt="Weekly Commit Challenge" />
</a>
```

## 🎨 커스터마이징

### HTML로 크기 조정
```html
<!-- 작게 -->
<img src="https://YOUR_USERNAME.github.io/weekly-commit-challange/api/card.svg" 
     width="300" height="150" alt="Weekly Commit Card">

<!-- 크게 -->
<img src="https://YOUR_USERNAME.github.io/weekly-commit-challange/api/card.svg" 
     width="500" height="250" alt="Weekly Commit Card">
```

### 정렬 옵션
```html
<!-- 중앙 정렬 -->
<div align="center">
  <img src="https://YOUR_USERNAME.github.io/weekly-commit-challange/api/card.svg">
</div>

<!-- 오른쪽 정렬 -->
<div align="right">
  <img src="https://YOUR_USERNAME.github.io/weekly-commit-challange/api/card.svg">
</div>
```

## 📊 팀 대시보드 예시

```markdown
# 🏢 Team Development Dashboard

## 👥 Team Members

| 멤버 | Weekly Commit Stats |
|------|---------------------|
| **John Doe** | ![John's Card](https://john-doe.github.io/weekly-commit-challange/api/card-compact.svg) |
| **Jane Smith** | ![Jane's Card](https://jane-smith.github.io/weekly-commit-challange/api/card-compact.svg) |
| **Alex Kim** | ![Alex's Card](https://alex-kim.github.io/weekly-commit-challange/api/card-compact.svg) |

## 📈 Team Overview

<div align="center">
  <img src="https://john-doe.github.io/weekly-commit-challange/api/card-stats.svg" />
  <img src="https://jane-smith.github.io/weekly-commit-challange/api/card-stats.svg" />
</div>
```

## 🔥 고급 사용법

### 조건부 표시
```markdown
<!-- 성공 시에만 표시 -->
![Weekly Commit Success](https://john-doe.github.io/weekly-commit-challange/api/card.svg?show_only_success=true)

<!-- 특정 주차만 표시 -->
![Week 26](https://john-doe.github.io/weekly-commit-challange/api/card.svg?week=26)
```

### 배지와 카드 조합
```markdown
# 📊 Development Activity

[![Weekly Commit Badge](https://john-doe.github.io/weekly-commit-challange/api/badge.svg)](https://john-doe.github.io/weekly-commit-challange/)

<details>
<summary>📈 상세 통계</summary>

![Weekly Commit Stats](https://john-doe.github.io/weekly-commit-challange/api/card-stats.svg)

</details>
```

## ✨ 추천 조합

### 개인 프로필용
```markdown
<div align="center">
  <img height="180em" src="https://github-readme-stats.vercel.app/api?username=john-doe&show_icons=true&theme=dark" />
  <img height="180em" src="https://john-doe.github.io/weekly-commit-challange/api/card.svg?theme=dark" />
</div>
```

### 프로젝트용 (미니멀)
```markdown
![Weekly Commit](https://john-doe.github.io/weekly-commit-challange/api/card-compact.svg)
```

### 프로젝트용 (상세)
```markdown
![Weekly Commit Stats](https://john-doe.github.io/weekly-commit-challange/api/card-stats.svg)
```

이제 github-readme-stats와 똑같은 스타일로 사용할 수 있습니다! 🎉