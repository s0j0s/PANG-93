# Phase 1 설계 — 메인 화면

## 목표

브라우저에서 실행했을 때 가장 먼저 보이는 메인 화면을 구현한다.  
게임 로직은 없고, **화면 구성 · 버튼 UI · 팝업 인터랙션**만 포함한다.

---

## 화면 구성

```
┌──────────────────────────────────────┐
│  🎈      🎈           🎈            │  ← 풍선 애니메이션 배경 (떠다님)
│                                      │
│              P  A  N  G              │  ← 타이틀
│                                      │
│          ┌─────────────────┐         │
│          │   GAME START    │         │
│          └─────────────────┘         │
│                                      │
│          ┌─────────────────┐         │
│          │   HOW TO PLAY   │         │
│          └─────────────────┘         │
│                                      │
│          ┌─────────────────┐         │
│          │      QUIT       │         │
│          └─────────────────┘         │
│                                      │
│  🎈           🎈       🎈           │
└──────────────────────────────────────┘
```

- 전체 화면 중앙 정렬
- 배경: `#0a0a2e` (어두운 남색) 위에 풍선들이 떠다니는 애니메이션
- 타이틀 폰트: `Press Start 2P` (Google Fonts) — 레트로 픽셀 폰트

---

## 폰트

**`Press Start 2P`** (Google Fonts) 사용

```html
<!-- index.html에 추가 -->
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
```

- 타이틀: `Press Start 2P`, 4~5rem
- 버튼: `Press Start 2P`, 0.9rem
- 모달 본문: `Press Start 2P`, 0.7rem (픽셀 폰트 특성상 작은 크기도 가독성 유지)

---

## 배경 풍선 애니메이션

메인 화면 배경에 여러 개의 풍선이 천천히 떠다니는 CSS 애니메이션을 적용한다.

### 풍선 사양
| 항목 | 내용 |
|------|------|
| 개수 | 6~8개 |
| 크기 | 30px ~ 60px (랜덤 배치) |
| 색상 | 빨강·파랑·초록·노랑 등 원색 계열 |
| 움직임 | 위아래로 천천히 떠오르는 `@keyframes` CSS 애니메이션 |
| 속도 | 풍선마다 다른 `animation-duration` (3s ~ 7s) |
| 구현 방식 | React 컴포넌트로 풍선 배열을 렌더링, 각 풍선에 다른 `animation-delay` 적용 |

### 애니메이션 방식 (CSS)
```css
@keyframes float {
  0%   { transform: translateY(0px) rotate(-5deg); }
  50%  { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(-5deg); }
}
```

풍선은 게임 풍선과 달리 **장식용**이므로 충돌 판정 없음.

---

## 컴포넌트 구조

```
App
└── MainScreen
    ├── BalloonBackground      ← 배경 풍선 애니메이션
    ├── Title                  ← "PANG" 타이틀
    ├── MenuButton ("GAME START", selected, onClick)
    ├── MenuButton ("HOW TO PLAY", onClick, onMouseEnter)
    ├── MenuButton ("QUIT", onClick, onMouseEnter)
    └── HowToPlayModal         ← 조건부 렌더링
```

### 각 컴포넌트 역할

| 컴포넌트 | 역할 |
|----------|------|
| `MainScreen` | 화면 전체 레이아웃, 키보드 이벤트, 선택 인덱스·모달 상태 관리 |
| `BalloonBackground` | 배경 풍선 여러 개를 절대 위치로 배치하고 float 애니메이션 적용 |
| `Title` | "PANG" 텍스트 렌더링 |
| `MenuButton` | `selected` prop으로 `▶` 커서·골드 하이라이트 표시, `onMouseEnter`로 선택 전환 |
| `HowToPlayModal` | 조작 방법 안내 팝업, ESC·닫기·바깥클릭으로 닫기 |

---

## 상태 관리

`MainScreen` 내부에서 `useState`로 관리:

```ts
const [selectedIndex, setSelectedIndex] = useState(0)       // 현재 선택된 메뉴 인덱스 (0: GAME START)
const [showHowToPlay, setShowHowToPlay] = useState(false)
```

- Phase 1에서는 화면 전환 상태 없음 (`screen` 상태는 Phase 2에서 추가)
- `selectedIndex`: 현재 하이라이트된 메뉴 항목 (0~2)
- `showHowToPlay`: HOW TO PLAY 모달 표시 여부

---

## 인터랙션 흐름

### 키보드 내비게이션

```
↑ 키 → selectedIndex 감소 (0에서 누르면 마지막 항목으로 순환)
↓ 키 → selectedIndex 증가 (마지막에서 누르면 0으로 순환)
Enter → 현재 selectedIndex 항목 실행
```

- `useEffect`로 `keydown` 이벤트 등록 / 언마운트 시 해제
- 모달이 열려 있을 때는 메뉴 키 입력 무시, ESC로 모달 닫기

### 마우스 인터랙션

```
hover → 해당 항목으로 selectedIndex 변경
클릭  → 해당 항목 실행
```

### 항목별 실행 동작

| 항목 | 동작 |
|------|------|
| GAME START (index 0) | 아무 동작 없음 (Phase 2에서 구현) |
| HOW TO PLAY (index 1) | showHowToPlay = true |
| QUIT (index 2) | window.confirm → window.close() |

### 모달 닫기
```
[닫기] 버튼 클릭  → showHowToPlay = false
ESC 키           → showHowToPlay = false
모달 바깥 클릭   → showHowToPlay = false
```

---

## HOW TO PLAY 모달 내용

```
┌──────────────────────────────────────┐
│           HOW TO PLAY                │
│                                      │
│  이동    ←  →  방향키               │
│  발사    SPACE                       │
│                                      │
│  풍선을 모두 터뜨리면 스테이지 클리어  │
│  풍선에 닿으면 라이프 1 감소          │
│  라이프 0 → 게임 오버                 │
│                                      │
│              [ 닫기 ]                │
└──────────────────────────────────────┘
```

- 모달 뒤 배경: 반투명 어두운 딤 처리 (backdrop)
- 모달은 화면 정중앙 오버레이

---

## 파일 구조 (예상)

```
src/
├── App.tsx
├── screens/
│   └── MainScreen.tsx
├── components/
│   ├── BalloonBackground.tsx
│   ├── MenuButton.tsx
│   └── HowToPlayModal.tsx
└── styles/
    └── main.css
```

---

## 스타일 방향

| 요소 | 스타일 |
|------|--------|
| 배경색 | `#0a0a2e` |
| 타이틀 색상 | `#FFD700` (골드), 텍스트 섀도우로 글로우 효과 |
| 버튼 기본 | 흰색 테두리 + 흰색 텍스트, 투명 배경 |
| 버튼 hover | 테두리·텍스트 `#FFD700`으로 전환 + `scale(1.05)` |
| 모달 배경 | `rgba(0,0,0,0.75)` 딤 |
| 모달 박스 | `#1a1a4e` 배경, 흰색 테두리 |
