# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 기술 스택

- **프레임워크**: React 19
- **번들러**: Vite 8
- **언어**: TypeScript 6 (strict 모드)
- **린터**: ESLint 10 (typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh)

## 주요 명령어

```bash
npm run dev       # 개발 서버 실행 (http://localhost:5173)
npm run build     # 프로덕션 빌드 (tsc -b && vite build)
npm run lint      # ESLint 검사
npm run preview   # 빌드 결과물 미리보기
```

> Node.js가 nvm으로 관리되는 경우 `C:\Users\User\AppData\Local\nvm\v24.14.0`을 PATH에 추가해야 명령어가 동작함.

## 테스트 방법

현재 테스트 프레임워크가 설정되어 있지 않음. 테스트를 추가하려면 Vitest 사용을 권장:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

`vite.config.ts`에 test 설정 추가 후 `npm run test`로 실행.

## 아키텍처

진입점은 `src/main.tsx` → `src/App.tsx` 순으로 렌더링됨. `StrictMode`가 적용되어 있음.

TypeScript 설정(`tsconfig.app.json`)에서 `noUnusedLocals`, `noUnusedParameters`가 활성화되어 있어 미사용 변수/파라미터가 있으면 빌드 실패함.

---

## 개발 설계 결정사항

### 폰트
- `Press Start 2P` (Google Fonts) 사용 — 레트로 픽셀 폰트
- `index.html`에 `<link>` 태그로 로드

### 스타일
- CSS 파일로 관리 (외부 UI 라이브러리 미사용)
- 배경색: `#0a0a2e` (어두운 남색)
- 주요 강조색: `#FFD700` (골드)
- 버튼 hover: 색상 전환 + `scale(1.05)`

### 컴포넌트 구조 규칙
- 화면 단위: `src/screens/`
- 재사용 UI: `src/components/`
- 화면별 스타일: `src/styles/`

### 배경 애니메이션
- 메인 화면 배경에 풍선 6~8개가 CSS `@keyframes float`로 떠다님
- `BalloonBackground` 컴포넌트로 분리, 장식용이므로 충돌 판정 없음

### Phase별 화면 전환
- `App.tsx`에서 `screen` 상태로 화면 분기 (`'main' | 'game'` 등)
- 각 Phase에서 해당 상태값 추가 — Phase 1은 전환 없음, Phase 2부터 추가

### 설계 문서 위치
- `docs/design/phase{N}.md` — 각 Phase 구현 전 설계 초안
- `docs/FEATURES/` — 기능별 명세
- `docs/PLAN.md` — 전체 Phase 목표 및 고객 체크포인트
