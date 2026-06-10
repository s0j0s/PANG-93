import type { Harpoon } from './types'

export function drawHarpoon(ctx: CanvasRenderingContext2D, h: Harpoon): void {
  // 작살 선
  ctx.beginPath()
  ctx.moveTo(h.x, h.baseY)
  ctx.lineTo(h.x, h.y)
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 3
  ctx.stroke()

  // 화살촉
  ctx.beginPath()
  ctx.moveTo(h.x, h.y)
  ctx.lineTo(h.x - 4, h.y + 8)
  ctx.lineTo(h.x + 4, h.y + 8)
  ctx.closePath()
  ctx.fillStyle = '#FFD700'
  ctx.fill()
}
