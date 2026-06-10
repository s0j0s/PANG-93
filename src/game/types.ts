export interface Player {
  x: number
  y: number
}

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
