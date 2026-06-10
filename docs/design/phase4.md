# Phase 4 설계 — 풍선 등장 및 바운스

## 목표

대형 풍선 1개가 화면에 등장하여 중력과 반사를 통해 자연스럽게 튀어다닌다.  
충돌 판정은 없고, **풍선 물리 시스템**만 구현한다.

---

## 물리 모델

원작 팡의 풍선은 좌우 등속 이동 + 수직 중력/반사의 조합으로 포물선 궤적을 그린다.

```
매 프레임:
  vy += GRAVITY          // 중력 적용
  x  += vx               // 수평 이동
  y  += vy               // 수직 이동

바닥 충돌 시:
  y   = FLOOR_Y - radius
  vy  = -BOUNCE_VY       // 크기별 고정 반발속도 (에너지 손실 없음)

벽 충돌 시:
  vx  = -vx              // 수평 반사
  x   = clamp(...)       // 경계 보정
```

- 수직은 **고정 반발속도**로 처리 (계수 감쇠 없음) → 원작처럼 항상 같은 높이로 튐
- 수평은 등속 유지, 벽에서 방향만 반전

---

## 풍선 크기 체계

Phase 4에서는 `LARGE`만 등장. Phase 6(분열) 구현 시 나머지 크기를 사용한다.

| 크기 | 반지름 | 수평 속도(`vx`) | 반발속도(`BOUNCE_VY`) | 튀는 높이(참고) |
|------|--------|----------------|----------------------|-----------------|
| LARGE  | 40px | ±1.5 | 14 | 높음 |
| MEDIUM | 28px | ±2.0 | 11 | 중간 |
| SMALL  | 18px | ±2.8 | 8  | 낮음 |
| TINY   | 10px | ±3.5 | 6  | 매우 낮음 |

---

## 풍선 상태 구조

```ts
// src/game/types.ts 에 추가
export type BalloonSize = 'LARGE' | 'MEDIUM' | 'SMALL' | 'TINY'

export interface Balloon {
  x: number
  y: number
  vx: number
  vy: number
  size: BalloonSize
  radius: number
  color: string
}
```

---

## 초기 등장 위치

```
x: CANVAS_W / 2   (중앙)
y: -radius        (화면 상단 바깥)
vx: +1.5          (오른쪽으로 출발)
vy: 0             (자유낙하로 시작)
```

화면 위에서 자유낙하로 등장, 바닥에 첫 충돌 후 반복 바운스.

---

## 상수

```ts
// src/game/constants.ts 에 추가
export const GRAVITY = 0.2

export const BALLOON_CONFIG = {
  LARGE:  { radius: 40, vx: 1.5, bounceVy: 14, color: '#e74c3c' },
  MEDIUM: { radius: 28, vx: 2.0, bounceVy: 11, color: '#e67e22' },
  SMALL:  { radius: 18, vx: 2.8, bounceVy: 8,  color: '#3498db' },
  TINY:   { radius: 10, vx: 3.5, bounceVy: 6,  color: '#2ecc71' },
} as const
```

---

## 풍선 렌더링

Canvas 원(`arc`)으로 그린다. 이미지 에셋 없이 색상 + 하이라이트로 풍선 느낌을 표현한다.

```
fillStyle = balloon.color        → 풍선 본체
fillStyle = rgba(255,255,255,0.3) → 좌상단 하이라이트 (작은 원)
fillStyle = #333                  → 하단 매듭 (작은 삼각형)
```

---

## 파일 변경

```
src/
├── game/
│   ├── constants.ts       ← GRAVITY, BALLOON_CONFIG 추가
│   ├── types.ts           ← Balloon, BalloonSize 타입 추가
│   ├── balloon.ts         ← 신규: createBalloon(), updateBalloon()
│   └── drawBalloon.ts     ← 신규: 풍선 Canvas 렌더링
└── screens/
    └── GameScreen.tsx     ← balloonRef 추가, update/draw에 풍선 포함
```

### balloon.ts 역할
- `createBalloon(size, x, y)` — 초기 Balloon 객체 생성
- `updateBalloon(b)` — 매 프레임 물리 계산 (중력, 이동, 반사)

---

## 확정 사항

1. **중력값**: `GRAVITY = 0.2` 확정
2. **풍선 색상**: 크기별 다른 색 확정 (LARGE 빨강, MEDIUM 주황, SMALL 파랑, TINY 초록)
3. **첫 등장 연출**: 화면 상단에서 자유낙하로 등장 확정
