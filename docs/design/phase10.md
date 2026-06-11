# Phase 10 설계 — 파워업 아이템

## 목표

풍선 처치 시 확률적으로 아이템이 드롭된다.  
플레이어가 아이템을 주우면 즉시 효과가 발동되고, 지속 시간 동안 유지된다.

---

## 아이템 종류

| 타입 | 이름 | 효과 | 지속 |
|------|------|------|------|
| `HOURGLASS` | 모래시계 | 풍선 이동 속도 30%로 감소 | 5초 |
| `CLOCK` | 시계 | 풍선 완전 동결 (속도 0) | 5초 |
| `DYNAMITE` | 다이너마이트 | 화면 모든 풍선 즉시 TINY로 축소 | 즉시 |
| `FORCEFIELD` | 포스 필드 | 플레이어 무적 | 5초 |
| `TWIN_HARPOON` | 트윈 작살 | 작살 2개 동시 유지 가능 | 10초 |

---

## 타입 정의

`types.ts`에 추가:

```ts
export type ItemType = 'HOURGLASS' | 'CLOCK' | 'DYNAMITE' | 'FORCEFIELD'

export interface Item {
  x: number
  y: number
  vy: number
  type: ItemType
}
```

---

## 상수

`constants.ts`에 추가:

```ts
export const ITEM_DROP_CHANCE = 0.35        // 35% 확률
export const ITEM_SIZE = 28                 // 아이템 렌더링 크기(px)
export const ITEM_GRAVITY = 0.3
export const EFFECT_DURATION = 300          // 5초 (60fps 기준)
export const TWIN_HARPOON_DURATION = 600    // 10초

export const ITEM_CONFIG: Record<ItemType, { color: string; label: string }> = {
  HOURGLASS:    { color: '#e67e22', label: 'SLW' },
  CLOCK:        { color: '#3498db', label: 'FRZ' },
  DYNAMITE:     { color: '#e74c3c', label: 'DYN' },
  FORCEFIELD:   { color: '#2ecc71', label: 'SHD' },
  TWIN_HARPOON: { color: '#9b59b6', label: 'x2W' },
}
```

---

## 아이템 물리 및 렌더링 — `src/game/item.ts` (신규)

```ts
export function createItem(type: ItemType, x: number, y: number): Item
export function updateItem(item: Item): boolean  // true = 바닥 닿아 소멸
export function isPickedUp(item: Item, player: Player): boolean
export function drawItem(ctx, item: Item): void
```

### updateItem

```ts
item.vy += ITEM_GRAVITY
item.y  += item.vy
return item.y >= FLOOR_Y  // 바닥 도달 시 소멸
```

### isPickedUp

아이템 중심과 플레이어 히트박스 AABB 충돌:

```ts
const half = ITEM_SIZE / 2
return (
  item.x + half > px &&
  item.x - half < px + PLAYER_W &&
  item.y + half > py &&
  item.y - half < py + PLAYER_H
)
```

### drawItem

```ts
// 배경 사각형
ctx.fillStyle = config.color
ctx.fillRect(item.x - half, item.y - half, ITEM_SIZE, ITEM_SIZE)
// 라벨 텍스트
ctx.fillStyle = '#ffffff'
ctx.font = '6px "Press Start 2P"'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText(config.label, item.x, item.y)
```

---

## 드롭 로직

작살-풍선 충돌 처리 직후:

```ts
if (hitIdx !== -1) {
  scoreRef.current += BALLOON_SCORE[balloons[hitIdx].size]
  const { x, y } = balloons[hitIdx]
  const children = splitBalloon(balloons[hitIdx])
  balloons.splice(hitIdx, 1, ...children)
  harpoonRef.current = null

  // 아이템 드롭
  if (Math.random() < ITEM_DROP_CHANCE) {
    const types: ItemType[] = ['HOURGLASS', 'CLOCK', 'DYNAMITE', 'FORCEFIELD']
    const type = types[Math.floor(Math.random() * types.length)]
    itemsRef.current.push(createItem(type, x, y))
  }
}
```

---

## 효과 시스템

### 상태 ref

```ts
const itemsRef       = useRef<Item[]>([])
const effectRef      = useRef<{ type: ItemType; timer: number } | null>(null)
```

효과는 하나만 유지 — 새 아이템 획득 시 기존 효과 덮어씀.

### 속도 배율

HOURGLASS / CLOCK 효과는 `balloonSpeedMultiplier`로 제어:

```ts
function getBalloonSpeedMultiplier(): number {
  const e = effectRef.current
  if (!e) return 1.0
  if (e.type === 'CLOCK')     return 0.0
  if (e.type === 'HOURGLASS') return 0.3
  return 1.0
}
```

`updateBalloon` 직접 수정 없이 vx/vy에 배율 적용:

```ts
// update() 내
const mult = getBalloonSpeedMultiplier()
balloonsRef.current.forEach(b => updateBalloon(b, mult))
```

`updateBalloon` 시그니처: `updateBalloon(b: Balloon, speedMult = 1.0)`

### 효과 타이머 감소

```ts
if (effectRef.current) {
  effectRef.current.timer--
  if (effectRef.current.timer <= 0) {
    effectRef.current = null
  }
}
```

### 아이템 획득 처리

```ts
itemsRef.current = itemsRef.current.filter(item => {
  const done = updateItem(item)
  if (done) return false  // 바닥 도달 → 제거

  if (isPickedUp(item, p)) {
    applyEffect(item.type)
    return false  // 획득 → 제거
  }
  return true
})
```

### applyEffect

```ts
function applyEffect(type: ItemType) {
  if (type === 'DYNAMITE') {
    balloonsRef.current = balloonsRef.current.map(b => {
      const tiny = createBalloon('TINY', b.x, b.y)
      tiny.vx = b.vx > 0 ? BALLOON_CONFIG.TINY.vx : -BALLOON_CONFIG.TINY.vx
      tiny.vy = b.vy
      return tiny
    })
    return
  }
  if (type === 'FORCEFIELD') {
    invincibleRef.current = EFFECT_DURATION
    return
  }
  if (type === 'TWIN_HARPOON') {
    effectRef.current = { type, timer: TWIN_HARPOON_DURATION }
    return
  }
  // HOURGLASS / CLOCK
  effectRef.current = { type, timer: EFFECT_DURATION }
}
```

---

## TWIN_HARPOON 구현

현재 `harpoonRef: useRef<Harpoon | null>` 단일 슬롯 → **배열**로 교체.

```ts
// 변경 전
const harpoonRef = useRef<Harpoon | null>(null)

// 변경 후
const harpoonsRef = useRef<Harpoon[]>([])
```

### 발사 로직

```ts
// Space 키 핸들러
const isTwin = effectRef.current?.type === 'TWIN_HARPOON'
const maxHarpoons = isTwin ? 2 : 1

if (harpoonsRef.current.length < maxHarpoons) {
  harpoonsRef.current.push(createHarpoon(playerRef.current))
}
```

### update 내 작살 처리

```ts
harpoonsRef.current = harpoonsRef.current.filter(h => {
  const done = updateHarpoon(h)
  if (done) return false

  const hitIdx = balloonsRef.current.findIndex(b => isHit(h, b))
  if (hitIdx !== -1) {
    scoreRef.current += BALLOON_SCORE[balloonsRef.current[hitIdx].size]
    // 아이템 드롭
    if (Math.random() < ITEM_DROP_CHANCE) { ... }
    const children = splitBalloon(balloonsRef.current[hitIdx])
    balloonsRef.current.splice(hitIdx, 1, ...children)
    return false  // 작살 제거
  }
  return true
})
```

기존 `harpoonRef` 사용처 전체를 `harpoonsRef` 배열 방식으로 교체.  
`drawHarpoon`은 `harpoonsRef.current.forEach(h => drawHarpoon(ctx, h))`로 변경.

---

## 시각적 피드백

### HUD 효과 표시

활성 효과가 있을 때 HUD 우측에 아이콘과 남은 시간 표시:

```
♥ ♥ ♥       STAGE 1      0000000   [FRZ 3s]
```

```ts
if (effectRef.current) {
  const { type, timer } = effectRef.current
  const secs = Math.ceil(timer / 60)
  ctx.fillStyle = ITEM_CONFIG[type].color
  ctx.textAlign = 'right'
  ctx.fillText(`[${ITEM_CONFIG[type].label} ${secs}s]`, CANVAS_W - 10, cy)
}
```

### 포스 필드 플레이어 강조

무적(`invincibleRef > INVINCIBLE_FRAMES`) 상태에서 포스 필드 활성 판정은 별도로 두지 않고, 기존 깜빡임 대신 항상 표시 + 청록 색조 적용:

실제로 FORCEFIELD는 `invincibleRef`를 300으로 설정하므로 기존 깜빡임 로직이 그대로 동작. 별도 처리 불필요.

---

## 스테이지 전환 시 처리

`loadStage()` 내에 아이템 초기화 추가:

```ts
itemsRef.current = []
// effectRef는 유지 (스테이지 간에도 효과 지속)
```

---

## 파일 변경 요약

```
src/
├── game/
│   ├── types.ts       ← ItemType, Item 추가
│   ├── constants.ts   ← ITEM_DROP_CHANCE, ITEM_SIZE, ITEM_GRAVITY,
│   │                     EFFECT_DURATION, TWIN_HARPOON_DURATION, ITEM_CONFIG 추가
│   ├── item.ts        ← 신규: createItem, updateItem, isPickedUp, drawItem
│   └── balloon.ts     ← updateBalloon에 speedMult 파라미터 추가
└── screens/
    └── GameScreen.tsx ← harpoonRef → harpoonsRef (배열) 교체
                          itemsRef, effectRef 추가
                          드롭·획득·효과 적용 로직
                          drawItem 호출
                          HUD 효과 표시
```

---

## 확정 사항

- **드롭 확률**: 35%
- **아이템 종류**: 5종 균등 랜덤
- **동시 효과**: 1개 (새 획득 시 덮어씀)
- **효과 지속**: 5초 (DYNAMITE 즉시)
- **FORCEFIELD**: 기존 invincibleRef 재사용 (300프레임)
- **TWIN_HARPOON**: harpoonRef → harpoonsRef 배열 교체, 최대 2발 동시 (600프레임)
- **아이템 렌더링**: 28px 컬러 사각형 + 3자리 라벨 (SLW/FRZ/DYN/SHD/x2W)
- **바닥 도달 시 소멸**: 줍지 않으면 사라짐
