# GitHub Pages 설정 가이드

GitHub Pages가 index.html을 표시하도록 설정하는 방법입니다.

## 설정 방법

1. **GitHub 저장소로 이동**
   - https://github.com/tlqhrm/weekly-commit-challenge 접속

2. **Settings 탭 클릭**
   - 저장소 상단 메뉴에서 Settings 선택

3. **Pages 섹션으로 이동**
   - 왼쪽 사이드바에서 "Pages" 클릭

4. **Source 설정**
   - Source: Deploy from a branch
   - Branch: main (또는 master)
   - Folder: `/docs` 선택
   - Save 버튼 클릭

5. **배포 대기**
   - 몇 분 후 https://tlqhrm.github.io/weekly-commit-challenge/ 에서 확인

## 현재 파일 구조

```
weekly-commit-challenge/
├── index.html          # 루트 리다이렉트 파일
├── README.md           # 프로젝트 설명
├── docs/
│   ├── index.html      # 메인 대시보드
│   ├── card-generator.js
│   ├── generate-api.js
│   └── api/            # 생성된 SVG 파일들
└── ...
```

## 작동 방식

- GitHub Pages를 `/docs` 폴더로 설정하면 docs/index.html이 메인 페이지가 됩니다
- 루트의 index.html은 혹시나 루트로 접근하는 경우를 위한 리다이렉트입니다
- README.md는 GitHub 저장소 페이지에서만 표시됩니다
