import { useEffect, useRef } from 'react'
import { CANVAS_W, CANVAS_H, FLOOR_Y, PLAYER_SPEED, INITIAL_LIVES, INVINCIBLE_FRAMES } from '../game/constants'
import { drawBackground } from '../game/drawBackground'
import { drawPlayer, PLAYER_H, PLAYER_W } from '../game/drawPlayer'
import { drawBalloon } from '../game/drawBalloon'
import { drawHarpoon } from '../game/drawHarpoon'
import { createBalloon, updateBalloon, isHit, splitBalloon } from '../game/balloon'
import { createHarpoon, updateHarpoon } from '../game/harpoon'
import { isPlayerHit } from '../game/player'
import { useKeys } from '../game/useKeys'
import type { Player, Balloon, Harpoon } from '../game/types'
import '../styles/game.css'

interface Props {
  onExit: () => void
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function drawGameOver(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.fillStyle = '#e74c3c'
  ctx.font = '28px "Press Start 2P"'
  ctx.textAlign = 'center'
  ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 50)

  const btnX = CANVAS_W / 2 - 130
  const btnY = CANVAS_H / 2
  const btnW = 260
  const btnH = 50

  ctx.fillStyle = '#FFD700'
  ctx.fillRect(btnX, btnY, btnW, btnH)

  ctx.fillStyle = '#0a0a2e'
  ctx.font = '12px "Press Start 2P"'
  ctx.textAlign = 'center'
  ctx.fillText('MAIN MENU', CANVAS_W / 2, btnY + 32)
}

const GAME_OVER_BTN = { x: CANVAS_W / 2 - 130, y: CANVAS_H / 2, w: 260, h: 50 }

export default function GameScreen({ onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useKeys()
  const playerRef = useRef<Player>({ x: CANVAS_W / 2, y: FLOOR_Y - PLAYER_H })
  const balloonsRef = useRef<Balloon[]>([createBalloon('LARGE')])
  const harpoonRef = useRef<Harpoon | null>(null)
  const livesRef = useRef(INITIAL_LIVES)
  const invincibleRef = useRef(0)
  const gameStateRef = useRef<'playing' | 'gameover'>('playing')

  // ESC → 메인 복귀 / Space → 작살 발사 / Enter → 게임오버 시 메인 복귀
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit()
      } else if (e.key === ' ') {
        e.preventDefault()
        if (gameStateRef.current === 'playing') {
          harpoonRef.current = createHarpoon(playerRef.current)
        }
      } else if (e.key === 'Enter') {
        if (gameStateRef.current === 'gameover') {
          onExit()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onExit])

  // 게임 오버 화면 클릭 처리
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleClick = (e: MouseEvent) => {
      if (gameStateRef.current !== 'gameover') return
      const rect = canvas.getBoundingClientRect()
      const scaleX = CANVAS_W / rect.width
      const scaleY = CANVAS_H / rect.height
      const cx = (e.clientX - rect.left) * scaleX
      const cy = (e.clientY - rect.top) * scaleY
      const b = GAME_OVER_BTN
      if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) {
        onExit()
      }
    }
    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [onExit])

  // 게임 루프
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const update = () => {
      if (gameStateRef.current !== 'playing') return

      const p = playerRef.current
      const { left, right } = keys.current

      if (left && !right) p.x -= PLAYER_SPEED
      if (right && !left) p.x += PLAYER_SPEED
      p.x = clamp(p.x, PLAYER_W / 2, CANVAS_W - PLAYER_W / 2)

      balloonsRef.current.forEach(updateBalloon)

      if (harpoonRef.current) {
        const done = updateHarpoon(harpoonRef.current)
        if (done) {
          harpoonRef.current = null
        } else {
          const h = harpoonRef.current
          const balloons = balloonsRef.current
          const hitIdx = balloons.findIndex(b => isHit(h, b))
          if (hitIdx !== -1) {
            const children = splitBalloon(balloons[hitIdx])
            balloons.splice(hitIdx, 1, ...children)
            harpoonRef.current = null
          }
        }
      }

      // 무적 프레임 감소
      if (invincibleRef.current > 0) {
        invincibleRef.current--
      }

      // 플레이어-풍선 충돌 (무적 아닐 때만)
      if (invincibleRef.current === 0) {
        const hit = balloonsRef.current.some(b => isPlayerHit(p, b))
        if (hit) {
          livesRef.current--
          if (livesRef.current <= 0) {
            gameStateRef.current = 'gameover'
          } else {
            invincibleRef.current = INVINCIBLE_FRAMES
          }
        }
      }
    }

    const draw = () => {
      const p = playerRef.current
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      drawBackground(ctx)
      balloonsRef.current.forEach(b => drawBalloon(ctx, b))
      if (harpoonRef.current) drawHarpoon(ctx, harpoonRef.current)

      // 무적 중 깜빡임
      const inv = invincibleRef.current
      const playerVisible = inv === 0 || Math.floor(inv / 6) % 2 === 0
      if (playerVisible) drawPlayer(ctx, p.x, p.y)

      if (gameStateRef.current === 'gameover') {
        drawGameOver(ctx)
      }
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
