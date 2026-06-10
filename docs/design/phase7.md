# Phase 7 설계 — 라이프 시스템

## 목표

플레이어가 풍선에 닿으면 라이프가 감소하고, 0이 되면 게임 오버 화면으로 전환된다.  
게임 오버 화면에서 메인 화면으로 돌아갈 수 있다.

---

## 플레이어 ↔ 풍선 충돌 감지

플레이어 히트박스(사각형)와 풍선(원)의 충돌을 AABB-원 방식으로 판정한다.

```ts
function isPlayerHit(player: Player, b: Balloon): boolean {
  // 플레이어 히트박스: 중심 x, 상단 y 기준 PLAYER_W × PLAYER_H
  const px = player.x - PLAYER_W / 2
  const py = player.y
  // 히트박스에서 풍선 중심까지 가장 가까운 점
  const nearX = Math.max(px, Math.min(b.x, px + PLAYER_W))
  const nearY = Math.max(py, Math.min(b.y, py + PLAYER_H))
  const dx = b.x - nearX
  const dy = b.y - nearY
  return dx * dx + dy * dy <= b.radius * b.radius
}
```

---

## 라이프 시스템

| 항목 | 값 |
|------|----|
| 시작 라이프 | 3 |
| 감소 조건 | 풍선과 충돌 |
| 무적 시간 | 충돌 후 **2초** — 연속 감소 방지 |
| 라이프 0 | 게임 오버 화면 전환 |

### 무적 시간

충돌 직후 연속으로 라이프가 줄어드는 것을 막기 위해 무적 프레임을 적용한다.

```ts
// 충돌 시
invincibleFrames = 120  // 2초 (60fps 기준)

// 매 프레임
if (invincibleFrames > 0) invincibleFrames--

// 충돌 판정
if (invincibleFrames === 0 && isPlayerHit(player, balloon)) {
  lives--
  invincibleFrames = 120
}
```

### 깜빡임 연출

무적 시간 동안 플레이어를 깜빡여 피격 상태를 시각적으로 표현한다.

```ts
// draw 시
const visible = invincibleFrames === 0 || Math.floor(invincibleFrames / 6) % 2 === 0
if (visible) drawPlayer(ctx, player.x, player.y)
```

---

## 게임 오버 화면

Canvas 위에 오버레이로 렌더링한다. 별도 React 컴포넌트 없이 Canvas 내에서 직접 그린다.

```
┌──────────────────────────────────────┐
│                                      │
│          G A M E  O V E R            │  ← 빨간 텍스트
│                                      │
│        [ 메인으로 돌아가기 ]          │  ← 클릭 또는 Enter
│                                      │
└──────────────────────────────────────┘
```

- 배경: 반투명 검정 오버레이 (`rgba(0,0,0,0.6)`)
- 텍스트: `Press Start 2P` 폰트, Canvas `fillText` 사용
- 버튼: Canvas 사각형 + 텍스트로 그리기
- 클릭 이벤트: `canvas.addEventListener('click', ...)` 로 버튼 영역 감지
- `Enter` 키로도 메인 복귀 가능

---

## 상태 흐름

```
게임 중 (playing)
    ↓ 라이프 0
게임 오버 (gameover)
    ↓ 클릭 or Enter
메인 화면 (onExit 호출)
```

`GameScreen` 내부에 `gameState: 'playing' | 'gameover'` 상태를 추가한다.

---

## 상태 관리

`GameScreen` 내부 `useRef`로 관리 (리렌더링 불필요):

```ts
const livesRef        = useRef(3)
const invincibleRef   = useRef(0)
const gameStateRef    = useRef<'playing' | 'gameover'>('playing')
```

게임 오버 시 `gameStateRef.current = 'gameover'` 로 전환.  
게임 루프는 계속 돌지만 `update()`는 `playing` 상태일 때만 실행한다.

---

## 파일 변경

```
src/
├── game/
│   ├── constants.ts     ← INITIAL_LIVES(3), INVINCIBLE_FRAMES(120) 추가
│   └── player.ts        ← 신규: isPlayerHit() 함수
└── screens/
    └── GameScreen.tsx   ← livesRef, invincibleRef, gameStateRef 추가
                            게임 오버 오버레이 렌더링
                            Enter/클릭으로 메인 복귀
```

---

## 확정 사항

- **시작 라이프**: 3개
- **무적 시간**: 충돌 후 2초 (120프레임)
- **깜빡임**: 6프레임 간격 토글
- **게임 오버 UI**: Canvas 오버레이 (별도 React 컴포넌트 없음)
- **복귀 방법**: 버튼 클릭 또는 Enter 키
