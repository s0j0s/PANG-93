# Phase 8 설계 — 스테이지 클리어 및 Mission 1 구성

## 목표

모든 풍선 소멸 시 스테이지가 클리어되고, Stage 1→2→3을 순서대로 진행하여  
Stage 3 클리어 후 Mission 1 완료 화면을 표시한다.

---

## 상태 머신 확장

Phase 7의 `gameStateRef`에 두 가지 상태를 추가한다.

```
playing
  ↓ 풍선 0개
stageclear  ──(2초 대기)──→  playing (다음 스테이지)
                             ※ stage === 3이면 missioncomplete
gameover  ──Enter/클릭──→  메인 화면 (기존 동작 유지)
missioncomplete  ──Enter/클릭──→  메인 화면 또는 처음부터 재시작
```

```ts
type GameState = 'playing' | 'stageclear' | 'gameover' | 'missioncomplete'
```

---

## 스테이지 풍선 초기 배치

### Stage별 구성

| Stage | 풍선 |
|-------|------|
| 1 | LARGE × 1 (중앙) |
| 2 | LARGE × 1 (왼쪽 1/4) + MEDIUM × 1 (오른쪽 3/4) |
| 3 | LARGE × 1 (왼쪽 1/3) + LARGE × 1 (오른쪽 2/3) |

### 초기 위치 정의

`constants.ts`에 추가:

```ts
export const STAGE_CLEAR_FRAMES = 120  // 2초

export const STAGE_BALLOONS: { size: BalloonSize; startX: number }[][] = [
  // Stage 1
  [{ size: 'LARGE', startX: CANVAS_W / 2 }],
  // Stage 2
  [
    { size: 'LARGE',  startX: CANVAS_W * 0.25 },
    { size: 'MEDIUM', startX: CANVAS_W * 0.75 },
  ],
  // Stage 3
  [
    { size: 'LARGE', startX: CANVAS_W * 0.33 },
    { size: 'LARGE', startX: CANVAS_W * 0.67 },
  ],
]
```

`createBalloon`이 현재 x를 받지 않으므로 `startX` 파라미터를 추가한다.

---

## 스테이지 클리어 감지

`update()` 내부, 풍선-충돌 처리 다음에 삽입:

```ts
if (gameStateRef.current === 'playing' && balloonsRef.current.length === 0) {
  gameStateRef.current = 'stageclear'
  stageClearTimerRef.current = STAGE_CLEAR_FRAMES
}
```

`stageclear` 상태에서는 `update()`의 이동·충돌 로직을 건너뛰고  
타이머만 감소시킨다:

```ts
if (gameStateRef.current === 'stageclear') {
  stageClearTimerRef.current--
  if (stageClearTimerRef.current <= 0) {
    stageRef.current++
    if (stageRef.current > 3) {
      gameStateRef.current = 'missioncomplete'
    } else {
      loadStage(stageRef.current)
      gameStateRef.current = 'playing'
    }
  }
  return  // 나머지 update 스킵
}
```

### loadStage 헬퍼

```ts
function loadStage(stage: number) {
  const configs = STAGE_BALLOONS[stage - 1]
  balloonsRef.current = configs.map(c => createBalloon(c.size, c.startX))
  harpoonRef.current = null
  invincibleRef.current = 0
  playerRef.current = { x: CANVAS_W / 2, y: FLOOR_Y - PLAYER_H }
}
```

스테이지 전환 시 작살 제거, 무적 해제, 플레이어 위치 초기화를 함께 수행한다.

---

## 오버레이 UI

### STAGE CLEAR 오버레이

```
┌──────────────────────────────────────┐
│                                      │
│         S T A G E  C L E A R        │  ← 골드 텍스트
│                                      │
│           STAGE 2 START...           │  ← 흰색 서브텍스트
│                                      │
└──────────────────────────────────────┘
```

- 배경: `rgba(0,0,0,0.5)`
- 타이머 자동 진행 — 별도 버튼 없음

```ts
function drawStageClear(ctx: CanvasRenderingContext2D, nextStage: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.fillStyle = '#FFD700'
  ctx.font = '24px "Press Start 2P"'
  ctx.textAlign = 'center'
  ctx.fillText('STAGE CLEAR', CANVAS_W / 2, CANVAS_H / 2 - 30)

  ctx.fillStyle = '#ffffff'
  ctx.font = '12px "Press Start 2P"'
  ctx.fillText(`STAGE ${nextStage} START...`, CANVAS_W / 2, CANVAS_H / 2 + 20)
}
```

Stage 3 클리어 직후는 `missioncomplete`로 즉시 전환되므로 "STAGE 4 START..."는 표시되지 않는다.

### MISSION COMPLETE 오버레이

```
┌──────────────────────────────────────┐
│                                      │
│       M I S S I O N  C O M P L E T E│  ← 골드 텍스트
│                                      │
│        [ MAIN MENU  ]                │  ← 메인 화면
│                                      │
└──────────────────────────────────────┘
```

버튼 1개: 클릭 또는 키보드 지원

| 입력 | 동작 |
|------|------|
| `Enter` 키 또는 MAIN MENU 클릭 | `onExit()` |

```ts
function drawMissionComplete(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.fillStyle = '#FFD700'
  ctx.font = '20px "Press Start 2P"'
  ctx.textAlign = 'center'
  ctx.fillText('MISSION COMPLETE', CANVAS_W / 2, CANVAS_H / 2 - 40)

  // MAIN MENU 버튼
  ctx.fillStyle = '#FFD700'
  ctx.fillRect(CANVAS_W / 2 - 130, CANVAS_H / 2 + 10, 260, 45)
  ctx.fillStyle = '#0a0a2e'
  ctx.font = '12px "Press Start 2P"'
  ctx.fillText('MAIN MENU', CANVAS_W / 2, CANVAS_H / 2 + 40)
}
```

---

## createBalloon 시그니처 변경

현재: `createBalloon(size: BalloonSize): Balloon`  
변경: `createBalloon(size: BalloonSize, startX?: number): Balloon`

`startX`가 없으면 기존처럼 `CANVAS_W / 4` 위치를 기본값으로 유지.  
`splitBalloon` 호출 시에는 `startX`를 명시하므로 기존 분열 로직 영향 없음.

---

## 상태별 ref 목록

```ts
const stageRef            = useRef(1)
const stageClearTimerRef  = useRef(0)
// gameStateRef 타입: 'playing' | 'stageclear' | 'gameover' | 'missioncomplete'
```

기존 `livesRef`, `invincibleRef`, `gameStateRef` 유지.

---

## 파일 변경 요약

```
src/
├── game/
│   ├── constants.ts      ← STAGE_CLEAR_FRAMES, STAGE_BALLOONS 추가
│   │                        BalloonSize import 필요 (types.ts에서)
│   └── balloon.ts        ← createBalloon(size, startX?) 시그니처 확장
└── screens/
    └── GameScreen.tsx    ← stageRef, stageClearTimerRef 추가
                             gameStateRef 타입 확장
                             loadStage(), restartGame() 헬퍼
                             drawStageClear(), drawMissionComplete()
                             클릭/키보드 핸들러에 missioncomplete 처리 추가
```

---

## 확정 사항

- **스테이지 수**: 3 (Mission 1 고정)
- **클리어 대기**: 2초 후 자동 전환 (버튼 없음)
- **미션 완료**: MAIN MENU(Enter/클릭) 버튼 하나 — 메인 화면 복귀만
- **스테이지 전환 시 초기화**: 작살 제거, 플레이어 중앙, 무적 해제
- **`createBalloon` 하위 호환**: `startX` 옵셔널, 기존 호출부 수정 불필요
