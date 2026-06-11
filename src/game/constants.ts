import type { BalloonSize } from './types'

export const CANVAS_W = 480
export const CANVAS_H = 640

export const FLOOR_H = 40
export const FLOOR_Y = CANVAS_H - FLOOR_H

export const PLAYER_SPEED = 3
export const HARPOON_SPEED = 10

export const GRAVITY = 0.2

export const INITIAL_LIVES = 3
export const INVINCIBLE_FRAMES = 120
export const STAGE_CLEAR_FRAMES = 120

export const BALLOON_CONFIG = {
  LARGE:  { radius: 40, vx: 0.8, bounceVy: 14, color: '#e74c3c' },
  MEDIUM: { radius: 28, vx: 1.1, bounceVy: 11, color: '#e67e22' },
  SMALL:  { radius: 18, vx: 1.5, bounceVy: 8,  color: '#3498db' },
  TINY:   { radius: 10, vx: 1.8, bounceVy: 9,  color: '#2ecc71' },
} as const

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
