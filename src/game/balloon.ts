import { CANVAS_W, FLOOR_Y, GRAVITY, BALLOON_CONFIG } from './constants'
import type { Balloon, BalloonSize } from './types'

export function createBalloon(size: BalloonSize, x?: number): Balloon {
  const cfg = BALLOON_CONFIG[size]
  return {
    x: x ?? CANVAS_W / 2,
    y: -cfg.radius,        // 화면 상단 바깥에서 낙하 시작
    vx: cfg.vx,
    vy: 0,
    size,
    radius: cfg.radius,
    color: cfg.color,
  }
}

export function updateBalloon(b: Balloon): void {
  b.vy += GRAVITY
  b.x  += b.vx
  b.y  += b.vy

  // 바닥 충돌 → 반발
  if (b.y + b.radius >= FLOOR_Y) {
    b.y  = FLOOR_Y - b.radius
    b.vy = -BALLOON_CONFIG[b.size].bounceVy
  }

  // 좌벽 충돌
  if (b.x - b.radius <= 0) {
    b.x  = b.radius
    b.vx = Math.abs(b.vx)
  }

  // 우벽 충돌
  if (b.x + b.radius >= CANVAS_W) {
    b.x  = CANVAS_W - b.radius
    b.vx = -Math.abs(b.vx)
  }
}
