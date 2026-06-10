import { HARPOON_SPEED } from './constants'
import type { Harpoon, Player } from './types'

export function createHarpoon(player: Player): Harpoon {
  return {
    x: player.x,
    y: player.y,
    baseY: player.y,
  }
}

// 반환값: true = 천장 도달 → 제거 필요
export function updateHarpoon(h: Harpoon): boolean {
  h.y -= HARPOON_SPEED
  return h.y <= 0
}
