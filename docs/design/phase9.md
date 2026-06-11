# Phase 9 설계 — HUD (게임 내 정보 표시)

## 목표

플레이 중 라이프·스테이지·점수를 캔버스 상단에 항상 표시한다.  
풍선 처치 시 점수가 즉시 갱신된다.

---

## HUD 레이아웃

캔버스 상단 영역(높이 36px)에 세 요소를 배치한다.

```
┌─────────────────────────────────────────────┐
│ ♥ ♥ ♥          STAGE 1          0000000    │  ← HUD 바 (y: 0~36)
├─────────────────────────────────────────────┤
│                                             │
│              (게임 영역)                     │
│                                             │
└─────────────────────────────────────────────┘
```

| 요소 | 위치 | 내용 |
|------|------|------|
| 라이프 | 좌측 (x: 10) | ♥ 아이콘 × 라이프 수 |
| 스테이지 | 중앙 | `STAGE N` |
| 점수 | 우측 (x: CANVAS_W - 10) | 7자리 0-패딩 숫자 |

HUD 바 배경: `rgba(0,0,0,0.4)` 반투명 띠

---

## 점수 시스템

| 풍선 크기 | 점수 |
|-----------|------|
| LARGE     | 10pt |
| MEDIUM    | 30pt |
| SMALL     | 50pt |
| TINY      | 100pt |

```ts
export const BALLOON_SCORE: Record<BalloonSize, number> = {
  LARGE:  10,
  MEDIUM: 30,
  SMALL:  50,
  TINY:   100,
}
```

점수는 **처치된 풍선 크기** 기준 — 분열 전 크기가 아니라 작살에 맞은 풍선의 크기.

---

## 점수 부여 시점

작살-풍선 충돌 처리(`hitIdx !== -1`) 직후:

```ts
if (hitIdx !== -1) {
  const hit = balloons[hitIdx]
  scoreRef.current += BALLOON_SCORE[hit.size]   // 점수 추가
  const children = splitBalloon(hit)
  balloons.splice(hitIdx, 1, ...children)
  harpoonRef.current = null
}
```

---

## HUD 렌더링 함수

```ts
function drawHUD(
  ctx: CanvasRenderingContext2D,
  lives: number,
  stage: number,
  score: number,
) {
  // 배경 띠
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillRect(0, 0, CANVAS_W, HUD_H)

  ctx.font = '12px "Press Start 2P"'
  ctx.textBaseline = 'middle'
  const cy = HUD_H / 2

  // 라이프 (♥ 반복)
  ctx.fillStyle = '#e74c3c'
  ctx.textAlign = 'left'
  ctx.fillText('♥ '.repeat(lives).trim(), 10, cy)

  // 스테이지
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.fillText(`STAGE ${stage}`, CANVAS_W / 2, cy)

  // 점수 (7자리 0-패딩)
  ctx.fillStyle = '#FFD700'
  ctx.textAlign = 'right'
  ctx.fillText(String(score).padStart(7, '0'), CANVAS_W - 10, cy)
}
```

---

## 상수 추가

```ts
// constants.ts
export const HUD_H = 36

export const BALLOON_SCORE: Record<BalloonSize, number> = {
  LARGE:  10,
  MEDIUM: 30,
  SMALL:  50,
  TINY:   100,
}
```

---

## 상태 관리

```ts
const scoreRef = useRef(0)
```

- 스테이지 전환(`loadStage`) 시 점수 **유지** — 누적 점수
- 게임 오버·미션 완료 시에도 유지 (오버레이에서 최종 점수 표시 가능)

---

## draw() 내 호출 순서

```ts
const draw = () => {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
  drawBackground(ctx)
  balloonsRef.current.forEach(b => drawBalloon(ctx, b))
  if (harpoonRef.current) drawHarpoon(ctx, harpoonRef.current)
  // 플레이어 (깜빡임 처리)
  ...
  drawHUD(ctx, livesRef.current, stageRef.current, scoreRef.current)  // 최상단에 그림
  // 오버레이 (gameover / stageclear / missioncomplete)
  ...
}
```

HUD는 게임 요소 위, 오버레이 아래 순서로 그린다.

---

## 오버레이에 최종 점수 표시

GAME OVER / MISSION COMPLETE 오버레이에 최종 점수를 함께 표시한다.

```
GAME OVER

SCORE  0001240

[ MAIN MENU ]
```

```
MISSION
COMPLETE

SCORE  0009870

[ MAIN MENU ]
```

`drawGameOver` / `drawMissionComplete` 함수에 `score: number` 파라미터 추가:

```ts
function drawGameOver(ctx: CanvasRenderingContext2D, score: number) { ... }
function drawMissionComplete(ctx: CanvasRenderingContext2D, score: number) { ... }
```

점수 텍스트 위치: 제목과 버튼 사이 중앙.

---

## 파일 변경 요약

```
src/
└── game/
│   └── constants.ts     ← HUD_H, BALLOON_SCORE 추가
└── screens/
    └── GameScreen.tsx   ← scoreRef 추가
                            충돌 처리부에 점수 부여 로직
                            drawHUD() 함수 추가 및 draw() 호출
```

---

## 확정 사항

- **HUD 위치**: 캔버스 상단 36px 고정 띠
- **라이프 표시**: ♥ 아이콘 반복 (최대 3개)
- **점수**: 7자리 0-패딩, 누적 (스테이지 초기화 없음)
- **점수 기준**: 맞은 풍선 크기 (TINY 100 / SMALL 50 / MEDIUM 30 / LARGE 10)
- **오버레이 점수 표시**: GAME OVER / MISSION COMPLETE 둘 다 최종 점수 표시
