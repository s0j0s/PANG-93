# Phase 6 설계 — 풍선 분열

## 목표

작살이 풍선에 닿으면 풍선이 터지며 두 개의 작은 풍선으로 분열된다.  
팡 게임의 핵심 메커니즘이 완성되는 단계다.

---

## 분열 체계

```
LARGE  → MEDIUM + MEDIUM
MEDIUM → SMALL  + SMALL
SMALL  → TINY   + TINY
TINY   → 소멸 (풍선 제거)
```

---

## 충돌 감지

작살이 존재하는 동안 **선(line) 전체**와 풍선의 충돌을 판정한다.  
작살의 x는 고정이므로, 풍선 중심에서 작살 선까지의 거리를 기준으로 계산한다.

```ts
function isHit(h: Harpoon, b: Balloon): boolean {
  // 작살 x와 풍선 중심 x의 수평 거리가 radius 이내이고
  // 풍선 중심 y가 작살 선의 범위(h.y ~ h.baseY) 안에 있으면 충돌
  const dx = Math.abs(h.x - b.x)
  const inRange = b.y >= h.y - b.radius && b.y <= h.baseY + b.radius
  return dx <= b.radius && inRange
}
```

- 작살 선의 수직 범위(`h.y` ~ `h.baseY`) 안에 풍선 중심이 들어오면 히트
- 수평 거리가 `radius` 이내일 때 충돌 → 작살 라인 전체가 풍선 감지 영역
- 충돌 시 → **작살 즉시 제거** + 풍선 제거 + 분열 풍선 생성

---

## 분열 시 자식 풍선 초기값

```ts
function splitBalloon(b: Balloon): Balloon[] {
  const nextSize = NEXT_SIZE[b.size]  // TINY면 null → 소멸
  if (!nextSize) return []

  const cfg = BALLOON_CONFIG[nextSize]
  return [
    { ...createBalloon(nextSize, b.x), vx: -cfg.vx, vy: -cfg.bounceVy },  // 왼쪽
    { ...createBalloon(nextSize, b.x), vx: +cfg.vx, vy: -cfg.bounceVy },  // 오른쪽
  ]
}
```

| 항목 | 값 |
|------|----|
| 위치 | 부모 풍선 중심 x, y |
| 수평 속도 | 크기별 `vx` — 왼쪽 자식은 음수, 오른쪽은 양수 |
| 수직 속도 | `-bounceVy` — 위로 솟구치며 분열 |

---

## 크기별 다음 단계 맵

```ts
const NEXT_SIZE: Record<BalloonSize, BalloonSize | null> = {
  LARGE:  'MEDIUM',
  MEDIUM: 'SMALL',
  SMALL:  'TINY',
  TINY:   null,     // 소멸
}
```

---

## 게임 루프 내 처리 순서

```
update() 내부:
  1. 풍선 물리 업데이트
  2. 작살 물리 업데이트
  3. 충돌 검사 (작살이 존재할 때만)
     - 작살 선과 충돌한 풍선 탐색
     - 충돌한 풍선 → 배열에서 제거, 자식 풍선 추가
     - 작살 → 유지 (제거하지 않음)
```

배열을 순회하며 수정하는 문제를 피하기 위해 **충돌한 인덱스를 먼저 수집 후 일괄 처리**한다.

```ts
const hitIdx = balloons.findIndex(b => harpoon && isHit(harpoon, b))
if (hitIdx !== -1) {
  const children = splitBalloon(balloons[hitIdx])
  balloons.splice(hitIdx, 1, ...children)
  harpoon = null  // 충돌 즉시 작살 제거
}
```

---

## 파일 변경

```
src/
├── game/
│   ├── balloon.ts       ← splitBalloon(), NEXT_SIZE, isHit() 추가
└── screens/
    └── GameScreen.tsx   ← 충돌 검사 로직 추가
```

`isHit`과 `splitBalloon`은 `balloon.ts`에 함께 위치시켜 풍선 관련 로직을 한 곳에 모은다.

---

## 풍선 속도 및 바운스 조정

| 크기 | 기존 vx | 변경 vx | 기존 bounceVy | 변경 bounceVy |
|------|---------|---------|--------------|--------------|
| LARGE  | 1.5 | **0.8** | 14 | 14 |
| MEDIUM | 2.0 | **1.1** | 11 | 11 |
| SMALL  | 2.8 | **1.5** | 8  | 8  |
| TINY   | 3.5 | **1.8** | 6  | **9** |

- 전 크기 속도 추가 감속
- TINY `bounceVy` 6 → 9 : 너무 낮게 튀는 문제 개선

`constants.ts`의 `BALLOON_CONFIG` 값을 위 표 기준으로 수정한다.

---

## 확정 사항

- **충돌 판정**: 작살 선(수직 범위 전체) ↔ 풍선 중심, 수평 거리 `radius` 이내 — 끝점뿐 아니라 작살대 전체에서 히트
- **작살 제거**: 충돌 즉시 제거
- **분열 방향**: 왼쪽 자식은 `-vx`, 오른쪽 자식은 `+vx`로 퍼짐
- **분열 초기 vy**: `-bounceVy` (위로 솟구침)
- **TINY 충돌**: 자식 없이 소멸
- **풍선 속도**: 전 크기 추가 감속
- **TINY 바운스**: `bounceVy` 6 → 9으로 증가
