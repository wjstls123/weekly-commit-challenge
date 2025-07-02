# 🔥 위클리 커밋 챌린지 (Weekly Commit Challenge)

일주일에 한 번은 꼭 커밋하는 습관을 만들어주는 GitHub Actions 기반 챌린지 시스템입니다.

## 🎯 챌린지 소개

- 매주 월요일에 GitHub Actions가 자동으로 실행되어 지난 일주일간 커밋을 확인하고 기록합니다
- 커밋 수와 성공/실패 여부가 record.md에 테이블 형태로 누적됩니다
- 일주일에 한 번이라도 커밋하면 성공으로 기록됩니다

## 🚀 참여 방법

### 1. 이 레포지토리 Fork 하기
GitHub에서 이 레포지토리를 Fork하여 본인 계정으로 복사하세요.

[![Fork Repository](https://img.shields.io/badge/Fork-Repository-brightgreen?style=for-the-badge&logo=github)](https://github.com/tlqhrm/weekly-commit-challenge/fork)

### 2. GitHub Actions 활성화
Fork한 레포지토리의 Actions 탭에서 워크플로우를 활성화하세요.
> Repository → Actions → "I understand my workflows, go ahead and enable them"

### 3. 일주일에 한 번 커밋하기!
매주 월요일에 지난 일주일간의 커밋을 자동으로 체크합니다. 

## 📊 대시보드 확인
[챌린지 대시보드](https://tlqhrm.github.io/weekly-commit-challenge/)에서 챌린지 현황을 확인할 수 있습니다.

## 🎨 통계 카드

### 전체 통계 카드
![Weekly Commit Challenge Stats](https://raw.githubusercontent.com/tlqhrm/weekly-commit-challenge/master/cards/overall-stats.svg)

### 개인 프로필 카드
참여자 중 연속 주차 상위 10명의 카드가 자동으로 생성됩니다:

![User Profile Example](https://raw.githubusercontent.com/tlqhrm/weekly-commit-challenge/master/cards/user-tlqhrm.svg)

> 💡 카드는 GitHub Actions가 매시간 자동으로 업데이트합니다.

## 📝 README에 카드 추가하기

본인의 GitHub 프로필 README에 다음 코드를 추가하여 챌린지 현황을 표시할 수 있습니다:

### 방법 1: 동적 배지 (GitHub README용) ⭐ 추천
클릭하면 실시간 카드를 볼 수 있는 배지를 README에 추가할 수 있습니다:

```markdown
[![Weekly Commit Challenge](https://img.shields.io/badge/Weekly%20Commit%20Challenge-Click%20to%20View-blue)](https://tlqhrm.github.io/weekly-commit-challenge/card-proxy.html?username=YOUR_USERNAME)
```

**특징:**
- 🖱️ 클릭 시 실시간 카드 페이지로 이동
- ⚡ 실시간 데이터 업데이트 
- 🎨 성과에 따른 색상 변화
- 📱 GitHub README에서 완벽 지원

### 방법 2: 정적 카드 (매시간 업데이트)
```markdown
<!-- 전체 통계 -->
![Weekly Commit Challenge Stats](https://raw.githubusercontent.com/tlqhrm/weekly-commit-challenge/master/cards/overall-stats.svg)

<!-- 내 프로필 -->
![My Profile](https://raw.githubusercontent.com/tlqhrm/weekly-commit-challenge/master/cards/user-YOUR_USERNAME.svg)
```

위에서 `YOUR_USERNAME`을 본인의 GitHub 사용자명으로 바꿔주세요.
- 현재 진행 상태


## 🏆 챌린지 규칙

- **성공 조건**: 일주일에 1개 이상의 커밋
- **기록 방식**: record.md에 기간, 주차, 커밋 수, 성공 여부가 테이블로 기록됩니다
- **연속 기록**: 주차별로 연속 성공/실패 기록을 추적할 수 있습니다
- **자동 업데이트**: GitHub Actions가 자동으로 실행되어 record.md 업데이트 (이 커밋은 다음 주 성공 여부에 영향 없음)

## 📈 기록 예시

참여하면 record.md에 다음과 같은 테이블이 자동으로 생성됩니다:

| 기간 | 주차 | 커밋 수 | 성공 여부 |
| --- | --- | --- | --- |
| 2025-01-01 ~ 2025-01-07 | 1주차 | 5 | ✅ 성공 |
| 2025-01-08 ~ 2025-01-14 | 2주차 | 3 | ✅ 성공 |
| 2025-01-15 ~ 2025-01-21 | 3주차 | 0 | ❌ 실패 |
| 2025-01-22 ~ 2025-01-28 | 4주차 | 7 | ✅ 성공 |

## ⚙️ 워크플로우 작동 방식

- **실행 주기**: 매일 오전 9시, 오후 9시 (KST) 자동 실행
- **수동 실행**: GitHub Actions 탭에서 "Run workflow" 버튼으로 즉시 실행 가능
- **집계 대상**: 본인 계정의 **공개 레포지토리만** 수집 (weekly-commit-challenge 제외)
- **집계 반영**: 오늘 커밋한 내용은 **내일부터** 집계에 반영


## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 공개되어 있습니다.
