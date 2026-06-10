import { CANVAS_W, CANVAS_H, FLOOR_Y, FLOOR_H } from './constants'

export function drawBackground(ctx: CanvasRenderingContext2D) {
  // 하늘 그라데이션
  const sky = ctx.createLinearGradient(0, 0, 0, FLOOR_Y)
  sky.addColorStop(0, '#87CEEB')
  sky.addColorStop(1, '#c9e8f5')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, CANVAS_W, FLOOR_Y)

  // 후지산 몸통 (회색 삼각형)
  ctx.beginPath()
  ctx.moveTo(CANVAS_W * 0.5, CANVAS_H * 0.08)
  ctx.lineTo(CANVAS_W * 0.05, FLOOR_Y)
  ctx.lineTo(CANVAS_W * 0.95, FLOOR_Y)
  ctx.closePath()
  ctx.fillStyle = '#5a5a6a'
  ctx.fill()

  // 후지산 설정 (흰 삼각형)
  ctx.beginPath()
  ctx.moveTo(CANVAS_W * 0.5, CANVAS_H * 0.08)
  ctx.lineTo(CANVAS_W * 0.32, CANVAS_H * 0.26)
  ctx.lineTo(CANVAS_W * 0.68, CANVAS_H * 0.26)
  ctx.closePath()
  ctx.fillStyle = '#f0f4f8'
  ctx.fill()

  // 바닥
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(0, FLOOR_Y, CANVAS_W, FLOOR_H)

  // 바닥 상단 테두리 라인
  ctx.fillStyle = '#6b3410'
  ctx.fillRect(0, FLOOR_Y, CANVAS_W, 4)
}
