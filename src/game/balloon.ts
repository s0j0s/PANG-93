import { CANVAS_W, FLOOR_Y, GRAVITY, BALLOON_CONFIG } from './constants'
import type { Balloon, BalloonSize, Harpoon } from './types'

const NEXT_SIZE: Record<BalloonSize, BalloonSize | null> = {
  LARGE:  'MEDIUM',
  MEDIUM: 'SMALL',
  SMALL:  'TINY',
  TINY:   null,
}

export function createBalloon(size: BalloonSize, x?: number, y?: number): Balloon {
  const cfg = BALLOON_CONFIG[size]
  return {
    x: x ?? CANVAS_W / 2,
    y: y ?? -cfg.radius,
    vx: cfg.vx,
    vy: 0,
    size,
    radius: cfg.radius,
    color: cfg.color,
  }
}

export function updateBalloon(b: Balloon, speedMult = 1.0): void {
  if (speedMult === 0) return

  b.vy += GRAVITY
  b.x  += b.vx * speedMult
  b.y  += b.vy * speedMult

  if (b.y + b.radius >= FLOOR_Y) {
    b.y  = FLOOR_Y - b.radius
    b.vy = -BALLOON_CONFIG[b.size].bounceVy
  }

  if (b.x - b.radius <= 0) {
    b.x  = b.radius
    b.vx = Math.abs(b.vx)
  }

  if (b.x + b.radius >= CANVAS_W) {
    b.x  = CANVAS_W - b.radius
    b.vx = -Math.abs(b.vx)
  }
}

export function isHit(h: Harpoon, b: Balloon): boolean {
  const dx = Math.abs(h.x - b.x)
  const inRange = b.y >= h.y - b.radius && b.y <= h.baseY + b.radius
  return dx <= b.radius && inRange
}

export function splitBalloon(b: Balloon): Balloon[] {
  const nextSize = NEXT_SIZE[b.size]
  if (!nextSize) return []

  const cfg = BALLOON_CONFIG[nextSize]
  const left  = createBalloon(nextSize, b.x, b.y)
  const right = createBalloon(nextSize, b.x, b.y)

  left.vx  = -cfg.vx
  left.vy  = -cfg.bounceVy
  right.vx = +cfg.vx
  right.vy = -cfg.bounceVy

  return [left, right]
}
