# 🔥 위클리 커밋 챌린지

꾸준히 커밋하는 습관을 기록하고 추적해보세요!

🤔 **생각보다 쉽지 않을 걸요? 매주 커밋할 자신 있나요?**

## 🎯 챌린지 소개

매주 GitHub Actions가 자동으로 실행되어 지난 일주일간 커밋을 확인하고 기록하는 챌린지 시스템입니다.

### ✨ 주요 특징

🚀 **빠른 시작**  
Fork 후 Actions 활성화만 하면 완료

📝 **자동 기록**  
매주 커밋 내역이 테이블로 자동 누적

🔍 **지속적인 추적**  
주차별 성공/실패 기록을 한눈에 확인

## 🚀 참여 방법

### 1. 이 레포지토리 Fork 하기

GitHub에서 이 레포지토리를 Fork하여 본인 계정으로 복사하세요.

[![Fork Repository](https://img.shields.io/badge/Fork-Repository-brightgreen?style=for-the-badge&logo=github)](https://github.com/tlqhrm/weekly-commit-challenge/fork)

### 2. GitHub Actions 활성화

Fork한 레포지토리의 Actions 탭에서 워크플로우를 활성화하세요.

**단계별 가이드:**

1. **Actions 활성화 허용**  
   "I understand my workflows, go ahead and enable them" 버튼 클릭

2. **워크플로우 활성화**  
   "Weekly Commit Tracker" 워크플로우의 "Enable workflow" 버튼 클릭

3. **수동 실행 (선택사항)**  
   즉시 기록을 시작하려면 "Run workflow" 버튼으로 수동 실행

### 3. 일주일에 한 번 커밋하기!

성공 조건: **일주일에 한 번만 커밋해도 성공!**  
매시간 정각마다 자동으로 체크하여 record.md에 기록됩니다.

## ⚙️ 워크플로우 작동 방식

- **실행 주기**: 매시간 정각 자동 실행 (수동 실행도 가능)
- **Fork 사용자 초기화**: 첫 실행시 자동으로 개인 기록으로 초기화
- **커밋 집계 대상**: 
  - ✅ 본인 계정의 **공개 레포지토리**
  - ❌ weekly-commit-challenge 레포지토리는 제외
  - ❌ 봇이 작성한 커밋은 제외 (dependabot, renovate 등)

## 📊 대시보드 확인

[**🔗 챌린지 대시보드**](https://tlqhrm.github.io/weekly-commit-challenge/)에서 실시간 현황을 확인하세요!

**대시보드 주요 기능:**
- 📈 실시간 통계 (총 참여자, 이번 주 성공, 평균 성공률)
- 🏅 참여자 랭킹 (연속 도전 중, 성공률, 최고 연속 기록, 이번 주 커밋 수)
- 👤 개인 참여 현황 검색
- 📱 모바일 완벽 지원

## 📝 참여 기록 예시

참여하면 record.md에 다음과 같은 테이블이 자동으로 생성됩니다:

| ID | 기간 | 주차 | 커밋 수 | 성공 여부 |
|---|---|---|---|---|
| 1 | 06/23 ~ 06/29 | 2025년 25주차 | 5 | ✅ 성공 |
| 2 | 06/30 ~ 07/06 | 2025년 26주차 | 3 | ✅ 성공 |
| 3 | 07/07 ~ 07/13 | 2025년 27주차 | 0 | ❌ 실패 |
| 4 | 07/14 ~ 07/20 | 2025년 28주차 | 7 | ✅ 성공 |

## 🎨 README에 카드 추가하기

GitHub README에 다음 코드를 추가하면 **실시간으로 업데이트되는 카드**가 표시됩니다:

```markdown
![Weekly Commit Challenge](https://weekly-commit-card.wjstls123.workers.dev/?username=YOUR_USERNAME)
```

### 📋 예시:
```markdown
![Weekly Commit Challenge](https://weekly-commit-card.wjstls123.workers.dev/?username=tlqhrm)
```

![Weekly Commit Challenge](https://weekly-commit-card.wjstls123.workers.dev/?username=tlqhrm)

**카드 특징:**
- 🚀 **진짜 실시간**: record.json 업데이트 즉시 반영
- 📱 **GitHub README 완벽 지원**: 실제 이미지로 렌더링
- ⚡ **초고속**: 전 세계 CDN으로 빠른 로딩
- 🎨 **성과별 색상 변화**: 연속 주차에 따른 동적 색상
- 💰 **무료**: Cloudflare Workers 무료 플랜

> `YOUR_USERNAME`을 본인의 GitHub 사용자명으로 바꿔주세요.

## 🏆 챌린지 규칙

- **성공 조건**: 일주일에 1개 이상의 커밋
- **기록 방식**: record.md에 ID, 기간, 주차, 커밋 수, 성공 여부가 테이블로 기록
- **연속 기록**: 주차별로 연속 성공/실패 기록을 추적
- **자동 업데이트**: GitHub Actions가 자동으로 실행되어 record.md 업데이트
- **공정성**: 봇 커밋은 제외, 공개 레포지토리만 집계

## 🏅 랭킹 시스템

대시보드에서 다음 카테고리별 랭킹을 확인할 수 있습니다:

- **연속 도전 중**: 현재 연속으로 성공하고 있는 주차 수
- **성공률**: 전체 참여 주차 대비 성공률
- **최고 연속 기록**: 역대 최장 연속 성공 주차 수  
- **이번 주 커밋 수**: 현재 주차의 커밋 수

### 🎖️ 연속 주차별 아이콘
- 🔥 **5주 이상**: 열정적인 개발자
- ⚡ **3-4주**: 꾸준한 개발자
- 💪 **1-2주**: 도전하는 개발자
- 🌱 **시작 단계**: 새로운 도전자

## 👥 참여 현황 확인

**개인 참여 현황 조회:**
- GitHub 사용자명 입력으로 누구나 조회 가능
- 개인 통계 및 최근 기록 확인
- 프로필 카드 미리보기 및 복사 기능

**전체 통계:**
- 총 참여자 수
- 이번 주 성공자 수  
- 평균 성공률
- 평균 연속 성공 주차

## 🔧 기술 스택

- **자동화**: GitHub Actions
- **데이터 저장**: JSON + Markdown
- **실시간 카드**: Cloudflare Workers
- **프론트엔드**: Vanilla JS + CSS
- **배포**: GitHub Pages

## 💡 팁

- **꾸준함이 핵심**: 매일 큰 커밋보다 주 1회 작은 커밋이 더 중요
- **습관 만들기**: 특정 요일을 정해서 꾸준히 커밋하기
- **진짜 개발자라면**: 꾸준함을 증명해보세요!

## 🤝 기여하기

버그 리포트나 기능 제안은 Issues에 남겨주세요.  
Pull Request도 언제나 환영합니다!

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 공개되어 있습니다.

---

**🔥 지금 시작해보세요!** Fork하고 Actions만 활성화하면 끝!
