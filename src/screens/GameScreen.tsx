import { useEffect, useRef } from 'react'
import { CANVAS_W, CANVAS_H, FLOOR_Y, PLAYER_SPEED } from '../game/constants'
import { drawBackground } from '../game/drawBackground'
import { drawPlayer, PLAYER_H, PLAYER_W } from '../game/drawPlayer'
import { drawBalloon } from '../game/drawBalloon'
import { drawHarpoon } from '../game/drawHarpoon'
import { createBalloon, updateBalloon } from '../game/balloon'
import { createHarpoon, updateHarpoon } from '../game/harpoon'
import { useKeys } from '../game/useKeys'
import type { Player, Balloon, Harpoon } from '../game/types'
import '../styles/game.css'

interface Props {
  onExit: () => void
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export default function GameScreen({ onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useKeys()
  const playerRef = useRef<Player>({
    x: CANVAS_W / 2,
    y: FLOOR_Y - PLAYER_H,
  })
  const balloonsRef = useRef<Balloon[]>([createBalloon('LARGE')])
  const harpoonRef = useRef<Harpoon | null>(null)

  // ESC → 메인 복귀 / Space → 작살 발사
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit()
      } else if (e.key === ' ') {
        e.preventDefault()
        harpoonRef.current = createHarpoon(playerRef.current)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onExit])

  // 게임 루프
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const update = () => {
      const p = playerRef.current
      const { left, right } = keys.current

      if (left && !right) p.x -= PLAYER_SPEED
      if (right && !left) p.x += PLAYER_SPEED
      p.x = clamp(p.x, PLAYER_W / 2, CANVAS_W - PLAYER_W / 2)

      balloonsRef.current.forEach(updateBalloon)

      if (harpoonRef.current) {
        const done = updateHarpoon(harpoonRef.current)
        if (done) harpoonRef.current = null
      }
    }

    const draw = () => {
      const p = playerRef.current
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      drawBackground(ctx)
      balloonsRef.current.forEach(b => drawBalloon(ctx, b))
      if (harpoonRef.current) drawHarpoon(ctx, harpoonRef.current)
      drawPlayer(ctx, p.x, p.y)
    }

    const loop = () => {
      update()
      draw()
      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [keys])

  return (
    <div className="game-screen">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={CANVAS_W}
        height={CANVAS_H}
      />
    </div>
  )
}
