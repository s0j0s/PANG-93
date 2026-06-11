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

export interface Harpoon {
  x: number
  y: number
  baseY: number
}

export type ItemType = 'HOURGLASS' | 'CLOCK' | 'DYNAMITE' | 'FORCEFIELD' | 'TWIN_HARPOON'

export interface Item {
  x: number
  y: number
  vy: number
  type: ItemType
}
