import type { Balloon } from './types'

export function drawBalloon(ctx: CanvasRenderingContext2D, b: Balloon): void {
  const { x, y, radius, color } = b

  // 풍선 본체
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()

  // 하이라이트 (좌상단 작은 원)
  ctx.beginPath()
  ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
  ctx.fill()

  // 매듭 (하단 작은 삼각형)
  const kx = x
  const ky = y + radius
  ctx.beginPath()
  ctx.moveTo(kx, ky)
  ctx.lineTo(kx - 4, ky + 7)
  ctx.lineTo(kx + 4, ky + 7)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}
