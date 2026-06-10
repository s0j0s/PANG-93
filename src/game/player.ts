import { PLAYER_W, PLAYER_H } from './drawPlayer'
import type { Player, Balloon } from './types'

export function isPlayerHit(player: Player, b: Balloon): boolean {
  const px = player.x - PLAYER_W / 2
  const py = player.y
  const nearX = Math.max(px, Math.min(b.x, px + PLAYER_W))
  const nearY = Math.max(py, Math.min(b.y, py + PLAYER_H))
  const dx = b.x - nearX
  const dy = b.y - nearY
  return dx * dx + dy * dy <= b.radius * b.radius
}
