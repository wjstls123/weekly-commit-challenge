# 🔥 위클리 커밋 챌린지

꾸준히 커밋하는 습관을 기록하고 추적해보세요!

🤔 **생각보다 쉽지 않을 걸요? 매주 커밋할 자신 있나요?**

## 🎯 챌린지 소개

매주 GitHub Actions가 자동으로 실행되어 지난 일주일간 커밋을 확인하고 기록하는 챌린지 시스템입니다.

**지금 참여하면 이번 주부터 기록이 시작됩니다**

## 📊 실시간 통계

[**🔗 챌린지 대시보드**](https://tlqhrm.github.io/weekly-commit-challenge/)에서 실시간 현황을 확인하세요!

- **총 참여자**: 현재 챌린지에 참여하는 총 인원
- **이번 주 성공**: 이번 주 성공적으로 커밋한 참여자 수
- **평균 성공률**: 전체 참여자의 평균 성공률
- **평균 연속 성공**: 참여자들의 평균 연속 성공 주차

## 🏅 참여자 랭킹

4가지 카테고리별 랭킹을 확인할 수 있습니다:

- **연속 도전 중**: 현재 연속으로 성공하고 있는 주차 수
- **성공률**: 전체 참여 주차 대비 성공률
- **최고 연속 기록**: 역대 최장 연속 성공 주차 수
- **이번 주 커밋 수**: 현재 주차의 커밋 수

## 👤 내 참여 현황

GitHub 사용자명 또는 프로필 URL을 입력하여 개인 현황을 조회할 수 있습니다.

**예시**: `tlqhrm` 또는 `https://github.com/tlqhrm`

## 📝 참여 방법

### 1. 이 레포지토리 Fork 하기

GitHub에서 이 레포지토리를 Fork하여 본인 계정으로 복사하세요.

[![Fork Repository](https://img.shields.io/badge/Fork-Repository-brightgreen?style=for-the-badge&logo=github)](https://github.com/tlqhrm/weekly-commit-challenge/fork)

### 2. GitHub Actions 활성화

Fork한 레포지토리의 Actions 탭에서 워크플로우를 활성화하세요.

**워크플로우 활성화 가이드:**

1. **Actions 활성화 허용**  
   "I understand my workflows, go ahead and enable them" 버튼을 클릭하여 Actions를 허용하세요.

2. **워크플로우 활성화**  
   "Weekly Commit Tracker" 워크플로우의 "Enable workflow" 버튼을 클릭하여 활성화하세요.

3. **수동 실행 (선택사항)**  
   즉시 기록을 시작하려면 "Run workflow" 버튼을 클릭하여 수동으로 실행하세요.

### 3. 일주일에 한 번 커밋하기!

매시간 정각에 자동으로 실행되어 지난 일주일간의 커밋을 체크하고 기록합니다.

**✅ 일주일에 한 번만 커밋해도 성공 기록!**  
**📋 record.md에 참여 내역이 테이블로 누적됩니다**

### 💪 동기부여 메시지

- "매주 한 번쯤은 커밋할 수 있지 뭐" 라고 생각하시나요?
- ⏰ 실제로는 2주만 지나도 깜빡하기 쉬워요!
- 🎯 진짜 개발자라면 꾸준함을 증명해보세요!

### 📝 참여 기록 예시

| ID | 기간 | 주차 | 커밋 수 | 성공 여부 |
|---|---|---|---|---|
| 1 | 06/23 ~ 06/29 | 2025년 25주차 | 5 | ✅ 성공 |
| 2 | 06/30 ~ 07/06 | 2025년 26주차 | 3 | ✅ 성공 |
| 3 | 07/07 ~ 07/13 | 2025년 27주차 | 0 | ❌ 실패 |

## ⚙️ 워크플로우 작동 방식

### 1. 실행 주기
**매시간 정각** 자동 실행  
수동 실행 가능: GitHub Actions → "Run workflow"

### 2. Fork 사용자 초기화
Fork 후 첫 실행시 자동으로 개인 기록 초기화됩니다.  
원본 사용자 데이터는 자동으로 삭제되고 깨끗한 새 테이블로 시작합니다.

### 3. 커밋 집계 및 기록

**집계 규칙:**
- ✅ 본인 계정의 **공개 레포지토리**
- ❌ weekly-commit-challenge 레포지토리는 제외
- ❌ 봇이 작성한 커밋은 제외 (dependabot, renovate 등)

## 🎨 README에 카드 추가하기

### 1. 코드 복사하기

GitHub README에 다음 코드를 추가하면 **실시간으로 업데이트되는 카드**가 표시됩니다:

```markdown
![Weekly Commit Challenge](https://weekly-commit-card.wjstls123.workers.dev/?username=YOUR_USERNAME)
```

`YOUR_USERNAME`을 본인의 GitHub 사용자명으로 바꿔주세요.

### 2. 결과 확인

**예시:**
```markdown
![Weekly Commit Challenge](https://weekly-commit-card.wjstls123.workers.dev/?username=tlqhrm)
```

![Weekly Commit Challenge](https://weekly-commit-card.wjstls123.workers.dev/?username=tlqhrm)

## 💡 팁

- **꾸준함이 핵심**: 매일 큰 커밋보다 주 1회 작은 커밋이 더 중요
- **습관 만들기**: 특정 요일을 정해서 꾸준히 커밋하기
- **모바일 지원**: 대시보드는 모바일에서도 완벽하게 작동

## 🔧 기술 스택

- **자동화**: GitHub Actions (매시간 정각 실행)
- **데이터 저장**: JSON + Markdown
- **실시간 카드**: Cloudflare Workers
- **프론트엔드**: Vanilla JS + CSS
- **배포**: GitHub Pages

## 🤝 기여하기

버그 리포트나 기능 제안은 Issues에 남겨주세요.  
Pull Request도 언제나 환영합니다!

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 공개되어 있습니다.

---

**🔥 지금 시작해보세요!** Fork하고 Actions만 활성화하면 끝!