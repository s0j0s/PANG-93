// 픽셀 스프라이트 정의 (1 = 피부, 2 = 옷, 3 = 머리카락, 4 = 눈/단추, 0 = 투명)
const SPRITE: number[][] = [
  [0, 0, 3, 3, 3, 0, 0],
  [0, 3, 3, 3, 3, 3, 0],
  [0, 1, 4, 1, 4, 1, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 4, 1, 0, 0],
  [2, 2, 2, 2, 2, 2, 2],
  [0, 0, 2, 2, 2, 0, 0],
  [0, 0, 2, 2, 2, 0, 0],
  [0, 2, 2, 0, 2, 2, 0],
  [0, 2, 2, 0, 2, 2, 0],
  [0, 2, 0, 0, 0, 2, 0],
]

const COLORS: Record<number, string> = {
  1: '#FFCC99', // 피부
  2: '#3355BB', // 옷
  3: '#4a2800', // 머리카락
  4: '#222222', // 눈/단추
}

const PIXEL = 4 // 1픽셀 = 4px

export const PLAYER_W = 7 * PIXEL   // 28px
export const PLAYER_H = 11 * PIXEL  // 44px

export function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  SPRITE.forEach((row, ry) => {
    row.forEach((col, rx) => {
      if (col === 0) return
      ctx.fillStyle = COLORS[col]
      ctx.fillRect(
        Math.round(x - PLAYER_W / 2 + rx * PIXEL),
        Math.round(y + ry * PIXEL),
        PIXEL,
        PIXEL,
      )
    })
  })
}
