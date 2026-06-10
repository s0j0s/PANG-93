# Phase 2 설계 — 게임 캔버스 & 플레이어 등장

## 목표

`GAME START`를 누르면 게임 화면으로 전환되고, 플레이어 캐릭터가 화면에 정지해 있다.  
이동·풍선·충돌 등 게임 로직은 없고, **화면 전환 + 캔버스 렌더링 + 플레이어 표시 + ESC 복귀**만 구현한다.

---

## 화면 구성

```
┌──────────────────────────────────────────┐
│                                          │
│   [후지산 배경 — Canvas 도형으로 표현]    │  ← 하늘 그라데이션 + 산 실루엣
│                                          │
│                                          │
│                                          │
│              [ 플레이어 ]                │  ← 픽셀 스프라이트, 바닥 위 중앙
├──────────────────────────────────────────┤
│  /////////// 바닥 ///////////////////////│
└──────────────────────────────────────────┘

  ESC → 메인 화면으로 복귀
```

---

## 캔버스 방식

| 방식 | 설명 | 채택 |
|------|------|------|
| HTML Canvas (`<canvas>`) | 픽셀 단위 렌더링, requestAnimationFrame 루프 | **채택** |
| CSS/DOM 렌더링 | React 컴포넌트로 위치 제어 | 미채택 |

**Canvas 채택 이유**: Phase 4~6에서 풍선 물리·작살 궤적·충돌 판정이 필요하므로  
게임 루프(requestAnimationFrame) 기반이 장기적으로 적합하다.

---

## 캔버스 해상도

| 항목 | 값 |
|------|----|
| 방향 | 세로형 |
| 논리 해상도 | 480 × 640 |
| 표시 방식 | CSS로 브라우저 창 높이에 맞게 스케일, 비율(3:4) 유지 |
| 배경색 | `#87CEEB` (하늘색, 배경 그라데이션으로 덮임) |

---

## 화면 전환

`App.tsx`에 `screen` 상태를 추가하여 메인 ↔ 게임 화면을 분기한다.

```ts
// App.tsx
const [screen, setScreen] = useState<'main' | 'game'>('main')

return screen === 'main'
  ? <MainScreen onStart={() => setScreen('game')} />
  : <GameScreen onExit={() => setScreen('main')} />
```

- `MainScreen`: `onStart` prop 추가 → GAME START 실행 시 호출
- `GameScreen`: `onExit` prop 추가 → ESC 입력 시 호출

---

## ESC 복귀

게임 화면에서 ESC를 누르면 메인 화면으로 돌아간다.

```ts
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onExit()
  }
  window.addEventListener('keydown', handleKey)
  return () => window.removeEventListener('keydown', handleKey)
}, [onExit])
```

---

## 게임 루프 구조

```ts
useEffect(() => {
  const canvas = canvasRef.current!
  const ctx = canvas.getContext('2d')!
  let animId: number

  const loop = () => {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    drawBackground(ctx)
    drawPlayer(ctx, player)
    animId = requestAnimationFrame(loop)
  }

  animId = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(animId)
}, [])
```

Phase 2에서는 `update()` 없이 `draw()`만 존재. Phase 3부터 update 로직 추가.

---

## 배경 렌더링

이미지 에셋 없이 Canvas 도형으로 후지산 배경을 표현한다.

| 레이어 | 표현 |
|--------|------|
| 하늘 | 상단 `#87CEEB` → 하단 `#c9e8f5` 선형 그라데이션 |
| 후지산 | 흰 삼각형 (`fillStyle: '#fff'`) — 중앙 상단 |
| 산 몸통 | 어두운 회색 삼각형 (`#4a4a4a`) — 흰 삼각형 아래 |
| 바닥 | 캔버스 하단 40px, 갈색 직사각형 (`#8B4513`) |

---

## 플레이어 픽셀 스프라이트

이미지 파일 없이 **Canvas의 `fillRect`로 픽셀 단위 스프라이트**를 직접 그린다.

```
픽셀 그리드 (1픽셀 = 3px 실제 크기)

  . X X X .
  X X X X X    ← 머리
  . X X X .
  . X O X .    ← 몸통 (O: 버튼)
X X X X X X X  ← 팔 벌린 몸
  . X X X .
  X X . X X    ← 다리
  X . . . X
```

| 항목 | 값 |
|------|----|
| 픽셀 크기 | 1픽셀 = 3px (총 높이 약 40px) |
| 색상 | 피부 `#FFCC99`, 옷 `#3355BB`, 머리카락 `#4a2800` |
| 초기 위치 | x: 캔버스 중앙, y: 바닥 상단에 맞닿는 위치 |

`drawPlayer.ts`에 픽셀 배열을 정의하고 `fillRect`으로 반복 렌더링한다.

---

## 컴포넌트 구조

```
App (screen 상태)
├── MainScreen  (screen === 'main') — onStart prop 추가
└── GameScreen  (screen === 'game') — onExit prop 추가
    └── <canvas ref={canvasRef} width={480} height={640} />
```

---

## 파일 구조 (추가/변경)

```
src/
├── App.tsx                     ← screen 상태 추가, GameScreen 분기
├── screens/
│   ├── MainScreen.tsx          ← onStart prop 추가
│   └── GameScreen.tsx          ← 신규: 캔버스 + 게임 루프 + ESC 처리
├── game/
│   ├── constants.ts            ← CANVAS_W, CANVAS_H 등 상수
│   ├── drawBackground.ts       ← 후지산 배경 그리기
│   └── drawPlayer.ts           ← 픽셀 스프라이트 그리기
└── styles/
    └── game.css                ← 캔버스 중앙 정렬 + 스케일 스타일
```
