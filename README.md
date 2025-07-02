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

## 🎨 README 카드

본인의 GitHub README에 위클리 커밋 챌린지 진행 상황을 카드로 표시할 수 있습니다:

```markdown
![Weekly Commit Challenge](https://weekly-commit-challenge.vercel.app/api/card?username=YOUR_USERNAME)
```

### 테마 옵션

다양한 테마를 선택할 수 있습니다:

```markdown
<!-- 기본 다크 테마 -->
![Weekly Commit Challenge](https://weekly-commit-challenge.vercel.app/api/card?username=YOUR_USERNAME&theme=default)

<!-- 라이트 테마 -->
![Weekly Commit Challenge](https://weekly-commit-challenge.vercel.app/api/card?username=YOUR_USERNAME&theme=light)

<!-- GitHub 다크 테마 -->
![Weekly Commit Challenge](https://weekly-commit-challenge.vercel.app/api/card?username=YOUR_USERNAME&theme=github_dark)
```

### 카드 예시

![Weekly Commit Challenge](https://weekly-commit-challenge.vercel.app/api/card?username=tlqhrm)

카드에는 다음 정보가 표시됩니다:
- 현재 연속 주차
- 최장 연속 주차  
- 총 참여 주차
- 성공률
- 현재 진행 상태

### 다른 테마 예시

**라이트 테마:**
![Weekly Commit Challenge Light](https://weekly-commit-challenge.vercel.app/api/card?username=tlqhrm&theme=light)

**GitHub 다크 테마:**
![Weekly Commit Challenge GitHub Dark](https://weekly-commit-challenge.vercel.app/api/card?username=tlqhrm&theme=github_dark)


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
