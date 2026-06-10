import { useEffect, useRef } from 'react'
import { CANVAS_W, CANVAS_H, FLOOR_Y } from '../game/constants'
import { drawBackground } from '../game/drawBackground'
import { drawPlayer, PLAYER_H } from '../game/drawPlayer'
import '../styles/game.css'

interface Props {
  onExit: () => void
}

export default function GameScreen({ onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ESC → 메인 복귀
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit()
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

    const playerX = CANVAS_W / 2
    const playerY = FLOOR_Y - PLAYER_H

    let animId: number
    const loop = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      drawBackground(ctx)
      drawPlayer(ctx, playerX, playerY)
      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [])

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
