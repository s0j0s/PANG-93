# Phase 5 설계 — 작살 발사

## 목표

`Space` 키로 작살을 발사한다. 작살은 플레이어 위로 뻗어 천장에 닿으면 사라지며,  
기존 작살이 있어도 Space를 누르면 즉시 교체 발사된다. 풍선과의 충돌은 Phase 6에서 구현한다.

---

## 작살 동작 방식

```
[발사]
  Space 입력 → 기존 작살 제거(있으면) → 새 작살 생성
  매 프레임 → y -= HARPOON_SPEED (위로 이동)

[천장 도달]
  y <= 0 → 작살 제거
```

원작 팡의 Wire는 천장에 닿는 순간 고정되어 잠시 유지 후 사라지는 연출이 있으나,  
Phase 5에서는 **천장 도달 즉시 제거**로 단순하게 구현한다.

---

## 작살 상태 구조

```ts
// src/game/types.ts 에 추가
export interface Harpoon {
  x: number    // 플레이어 중심 x (고정)
  y: number    // 현재 끝점 y (위로 이동)
  baseY: number // 발사 시작 y (플레이어 상단)
}
```

- `x`: 발사 시점의 플레이어 x 좌표로 고정 (이동 불가)
- `y`: 매 프레임 위로 이동하는 끝점
- `baseY`: 플레이어 상단 위치 (선의 시작점)

---

## 상수

```ts
// src/game/constants.ts 에 추가
export const HARPOON_SPEED = 10   // px/frame
```

---

## 렌더링

작살을 **선(line)**으로 표현한다.

```
플레이어 머리 위 ──────────── 끝점(y)
     (baseY)                   ↑ 매 프레임 위로 이동
```

```ts
// drawHarpoon.ts
ctx.beginPath()
ctx.moveTo(h.x, h.baseY)
ctx.lineTo(h.x, h.y)
ctx.strokeStyle = '#FFD700'
ctx.lineWidth = 3
ctx.stroke()

// 끝점 삼각형 (화살촉)
ctx.beginPath()
ctx.moveTo(h.x, h.y)
ctx.lineTo(h.x - 4, h.y + 8)
ctx.lineTo(h.x + 4, h.y + 8)
ctx.closePath()
ctx.fillStyle = '#FFD700'
ctx.fill()
```

---

## 키 입력 처리

`useKeys` 훅에 `space` 상태를 추가한다.  
단, 작살은 **누르는 순간 1회 발사**여야 하므로 keydown 이벤트로 처리한다.

```ts
// useKeys.ts 수정
// space는 pressed 상태가 아닌 keydown 이벤트로 GameScreen에서 직접 처리
```

`GameScreen`에서 `keydown` 이벤트로 Space를 감지하고, 기존 작살 여부와 관계없이 항상 새 작살로 교체한다.

---

## 파일 변경

```
src/
├── game/
│   ├── constants.ts     ← HARPOON_SPEED 추가
│   ├── types.ts         ← Harpoon 타입 추가
│   ├── harpoon.ts       ← 신규: createHarpoon(), updateHarpoon()
│   └── drawHarpoon.ts   ← 신규: 작살 렌더링
└── screens/
    └── GameScreen.tsx   ← harpoonRef 추가, Space keydown 처리
```

### harpoon.ts 역할
- `createHarpoon(player)` — 플레이어 위치 기반 Harpoon 객체 생성
- `updateHarpoon(h)` — 매 프레임 y 감소, 천장 도달 여부 반환

---

## 확정 사항

- **작살 속도**: `HARPOON_SPEED = 10px/frame`
- **천장 도달 처리**: 즉시 제거 (고정 대기 연출 없음)
- **재발사 동작**: Space 입력 시 기존 작살 즉시 교체 (제한 없음)
- **발사 트리거**: keydown (누르는 순간 1회, 홀드 불가)
