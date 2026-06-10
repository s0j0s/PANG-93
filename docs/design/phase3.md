# Phase 3 설계 — 플레이어 이동

## 목표

키보드 `←` `→`로 플레이어를 좌우로 부드럽게 이동시킨다.  
화면 경계에서 멈추며, 이동 속도는 게임성에 맞게 조정한다.

---

## 이동 방식

### 키 입력 처리 방식 비교

| 방식 | 설명 | 채택 |
|------|------|------|
| `keydown` 이벤트 직접 이동 | 키를 누를 때마다 위치 변경 | 미채택 — 걸림 현상 발생 |
| 키 상태(pressed) + 게임 루프 | 매 프레임마다 눌린 키 확인 후 이동 | **채택** |

**키 상태 방식 채택 이유**: `keydown` 방식은 OS 키 반복 딜레이로 인해 첫 입력 후 잠깐 멈추는 걸림 현상이 생긴다. 매 프레임 키 상태를 확인하는 방식이 부드러운 이동을 보장한다.

---

## 이동 로직

```ts
// 키 상태 관리
const keys = { left: false, right: false }

// keydown / keyup 이벤트로 상태 갱신
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  keys.left  = true
  if (e.key === 'ArrowRight') keys.right = true
})
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft')  keys.left  = false
  if (e.key === 'ArrowRight') keys.right = false
})

// 게임 루프 내 update()
function update() {
  if (keys.left)  player.x -= PLAYER_SPEED
  if (keys.right) player.x += PLAYER_SPEED
  // 경계 클램프
  player.x = clamp(player.x, PLAYER_W / 2, CANVAS_W - PLAYER_W / 2)
}
```

---

## 플레이어 상태 구조

```ts
// src/game/types.ts
interface Player {
  x: number   // 중심 x 좌표
  y: number   // 고정 (바닥 위)
}
```

- `y`는 Phase 2에서 고정된 값 그대로 유지 (이동 없음)
- `x`만 변경

---

## 상수

```ts
// src/game/constants.ts 에 추가
export const PLAYER_SPEED = 3  // px/frame (60fps 기준 초당 180px)
```

---

## 경계 처리

```
┌─────────────────────────────┐
│  |                       |  │
│  ↑ 좌측 한계              ↑ 우측 한계
│  PLAYER_W/2         CANVAS_W - PLAYER_W/2
└─────────────────────────────┘
```

- 플레이어 x는 스프라이트 **중심 좌표** 기준
- 좌측 한계: `PLAYER_W / 2` (14px)
- 우측 한계: `CANVAS_W - PLAYER_W / 2` (466px)

---

## 파일 변경

```
src/
├── game/
│   ├── constants.ts     ← PLAYER_SPEED 추가
│   ├── types.ts         ← 신규: Player 타입 정의
│   └── useKeys.ts       ← 신규: 키 상태 훅
└── screens/
    └── GameScreen.tsx   ← update() 추가, player.x 갱신
```

### useKeys 훅

키 상태를 컴포넌트 외부에서 깔끔하게 관리하기 위해 커스텀 훅으로 분리한다.

```ts
// src/game/useKeys.ts
export function useKeys() {
  const keys = useRef({ left: false, right: false })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  keys.current.left  = true
      if (e.key === 'ArrowRight') keys.current.right = true
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  keys.current.left  = false
      if (e.key === 'ArrowRight') keys.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup',   up)
    }
  }, [])

  return keys
}
```

---

## 확정 사항

1. **이동 속도**: `PLAYER_SPEED = 3px/frame` 확정
2. **좌우 동시 입력**: `←` `→` 동시 입력 시 이동 없음 (정지)
