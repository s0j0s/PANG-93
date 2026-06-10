export const CANVAS_W = 480
export const CANVAS_H = 640

export const FLOOR_H = 40
export const FLOOR_Y = CANVAS_H - FLOOR_H

export const PLAYER_SPEED = 3
export const HARPOON_SPEED = 10

export const GRAVITY = 0.2

export const BALLOON_CONFIG = {
  LARGE:  { radius: 40, vx: 1.5, bounceVy: 14, color: '#e74c3c' },
  MEDIUM: { radius: 28, vx: 2.0, bounceVy: 11, color: '#e67e22' },
  SMALL:  { radius: 18, vx: 2.8, bounceVy: 8,  color: '#3498db' },
  TINY:   { radius: 10, vx: 3.5, bounceVy: 6,  color: '#2ecc71' },
} as const
