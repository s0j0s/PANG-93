import { useEffect, useRef } from 'react'
import {
  CANVAS_W, CANVAS_H, FLOOR_Y, PLAYER_SPEED,
  INITIAL_LIVES, INVINCIBLE_FRAMES,
  STAGE_CLEAR_FRAMES, STAGE_BALLOONS,
  HUD_H, BALLOON_SCORE,
  ITEM_DROP_CHANCE, EFFECT_DURATION, TWIN_HARPOON_DURATION, ITEM_CONFIG,
} from '../game/constants'
import { drawBackground } from '../game/drawBackground'
import { drawPlayer, PLAYER_H, PLAYER_W } from '../game/drawPlayer'
import { drawBalloon } from '../game/drawBalloon'
import { drawHarpoon } from '../game/drawHarpoon'
import { createBalloon, updateBalloon, isHit, splitBalloon } from '../game/balloon'
import { createHarpoon, updateHarpoon } from '../game/harpoon'
import { isPlayerHit } from '../game/player'
import { createItem, updateItem, isPickedUp, drawItem } from '../game/item'
import { useKeys } from '../game/useKeys'
import type { Player, Balloon, Harpoon, Item, ItemType } from '../game/types'
import '../styles/game.css'

interface Props {
  onExit: () => void
}

type GameState = 'playing' | 'stageclear' | 'gameover' | 'missioncomplete'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function drawGameOver(ctx: CanvasRenderingContext2D, score: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.fillStyle = '#e74c3c'
  ctx.font = '28px "Press Start 2P"'
  ctx.textAlign = 'center'
  ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 70)

  ctx.fillStyle = '#ffffff'
  ctx.font = '12px "Press Start 2P"'
  ctx.fillText(`SCORE  ${String(score).padStart(7, '0')}`, CANVAS_W / 2, CANVAS_H / 2 - 20)

  const btnX = CANVAS_W / 2 - 130
  const btnY = CANVAS_H / 2 + 20
  const btnW = 260
  const btnH = 50

  ctx.fillStyle = '#FFD700'
  ctx.fillRect(btnX, btnY, btnW, btnH)

  ctx.fillStyle = '#0a0a2e'
  ctx.font = '12px "Press Start 2P"'
  ctx.textAlign = 'center'
  ctx.fillText('MAIN MENU', CANVAS_W / 2, btnY + 32)
}

function drawStageClear(ctx: CanvasRenderingContext2D, nextStage: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.fillStyle = '#FFD700'
  ctx.font = '24px "Press Start 2P"'
  ctx.textAlign = 'center'
  ctx.fillText('STAGE CLEAR', CANVAS_W / 2, CANVAS_H / 2 - 30)

  ctx.fillStyle = '#ffffff'
  ctx.font = '12px "Press Start 2P"'
  ctx.fillText(`STAGE ${nextStage} START...`, CANVAS_W / 2, CANVAS_H / 2 + 20)
}

function drawMissionComplete(ctx: CanvasRenderingContext2D, score: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.fillStyle = '#FFD700'
  ctx.font = '20px "Press Start 2P"'
  ctx.textAlign = 'center'
  ctx.fillText('MISSION', CANVAS_W / 2, CANVAS_H / 2 - 80)
  ctx.fillText('COMPLETE', CANVAS_W / 2, CANVAS_H / 2 - 40)

  ctx.fillStyle = '#ffffff'
  ctx.font = '12px "Press Start 2P"'
  ctx.fillText(`SCORE  ${String(score).padStart(7, '0')}`, CANVAS_W / 2, CANVAS_H / 2 + 10)

  const btnX = CANVAS_W / 2 - 130
  const btnY = CANVAS_H / 2 + 40
  const btnW = 260
  const btnH = 50

  ctx.fillStyle = '#FFD700'
  ctx.fillRect(btnX, btnY, btnW, btnH)

  ctx.fillStyle = '#0a0a2e'
  ctx.font = '12px "Press Start 2P"'
  ctx.fillText('MAIN MENU', CANVAS_W / 2, btnY + 32)
}

const GAME_OVER_BTN        = { x: CANVAS_W / 2 - 130, y: CANVAS_H / 2 + 20, w: 260, h: 50 }
const MISSION_COMPLETE_BTN = { x: CANVAS_W / 2 - 130, y: CANVAS_H / 2 + 40, w: 260, h: 50 }

const ALL_ITEM_TYPES: ItemType[] = ['HOURGLASS', 'CLOCK', 'DYNAMITE', 'FORCEFIELD', 'TWIN_HARPOON']

export default function GameScreen({ onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useKeys()
  const playerRef = useRef<Player>({ x: CANVAS_W / 2, y: FLOOR_Y - PLAYER_H })
  const balloonsRef = useRef<Balloon[]>(
    STAGE_BALLOONS[0].map(c => createBalloon(c.size, c.startX))
  )
  const harpoonsRef = useRef<Harpoon[]>([])
  const itemsRef = useRef<Item[]>([])
  const effectRef = useRef<{ type: ItemType; timer: number } | null>(null)
  const livesRef = useRef(INITIAL_LIVES)
  const invincibleRef = useRef(0)
  const gameStateRef = useRef<GameState>('playing')
  const stageRef = useRef(1)
  const stageClearTimerRef = useRef(0)
  const scoreRef = useRef(0)

  // ESC → 메인 복귀 / Space → 작살 발사 / Enter → 오버레이 복귀
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit()
      } else if (e.key === ' ') {
        e.preventDefault()
        if (gameStateRef.current === 'playing') {
          const isTwin = effectRef.current?.type === 'TWIN_HARPOON'
          const maxHarpoons = isTwin ? 2 : 1
          if (harpoonsRef.current.length < maxHarpoons) {
            harpoonsRef.current.push(createHarpoon(playerRef.current))
          }
        }
      } else if (e.key === 'Enter') {
        if (gameStateRef.current === 'gameover' || gameStateRef.current === 'missioncomplete') {
          onExit()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onExit])

  // 오버레이 버튼 클릭 처리
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleClick = (e: MouseEvent) => {
      const state = gameStateRef.current
      if (state !== 'gameover' && state !== 'missioncomplete') return

      const rect = canvas.getBoundingClientRect()
      const scaleX = CANVAS_W / rect.width
      const scaleY = CANVAS_H / rect.height
      const cx = (e.clientX - rect.left) * scaleX
      const cy = (e.clientY - rect.top) * scaleY

      const btn = state === 'gameover' ? GAME_OVER_BTN : MISSION_COMPLETE_BTN
      if (cx >= btn.x && cx <= btn.x + btn.w && cy >= btn.y && cy <= btn.y + btn.h) {
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

    const loadStage = (stage: number) => {
      const configs = STAGE_BALLOONS[stage - 1]
      balloonsRef.current = configs.map(c => createBalloon(c.size, c.startX))
      harpoonsRef.current = []
      itemsRef.current = []
      invincibleRef.current = 0
      playerRef.current = { x: CANVAS_W / 2, y: FLOOR_Y - PLAYER_H }
    }

    const getSpeedMult = (): number => {
      const e = effectRef.current
      if (!e) return 1.0
      if (e.type === 'CLOCK')     return 0.0
      if (e.type === 'HOURGLASS') return 0.3
      return 1.0
    }

    const applyEffect = (type: ItemType) => {
      if (type === 'DYNAMITE') {
        balloonsRef.current = balloonsRef.current.map(b => {
          const tiny = createBalloon('TINY', b.x, b.y)
          tiny.vx = b.vx > 0 ? Math.abs(tiny.vx) : -Math.abs(tiny.vx)
          tiny.vy = b.vy
          return tiny
        })
        return
      }
      if (type === 'FORCEFIELD') {
        invincibleRef.current = EFFECT_DURATION
        return
      }
      if (type === 'TWIN_HARPOON') {
        effectRef.current = { type, timer: TWIN_HARPOON_DURATION }
        return
      }
      effectRef.current = { type, timer: EFFECT_DURATION }
    }

    const update = () => {
      const state = gameStateRef.current

      if (state === 'stageclear') {
        stageClearTimerRef.current--
        if (stageClearTimerRef.current <= 0) {
          stageRef.current++
          if (stageRef.current > 3) {
            gameStateRef.current = 'missioncomplete'
          } else {
            loadStage(stageRef.current)
            gameStateRef.current = 'playing'
          }
        }
        return
      }

      if (state !== 'playing') return

      const p = playerRef.current
      const { left, right } = keys.current

      if (left && !right) p.x -= PLAYER_SPEED
      if (right && !left) p.x += PLAYER_SPEED
      p.x = clamp(p.x, PLAYER_W / 2, CANVAS_W - PLAYER_W / 2)

      const speedMult = getSpeedMult()
      balloonsRef.current.forEach(b => updateBalloon(b, speedMult))

      // 작살 업데이트 (배열)
      harpoonsRef.current = harpoonsRef.current.filter(h => {
        const done = updateHarpoon(h)
        if (done) return false

        const balloons = balloonsRef.current
        const hitIdx = balloons.findIndex(b => isHit(h, b))
        if (hitIdx !== -1) {
          scoreRef.current += BALLOON_SCORE[balloons[hitIdx].size]
          // 아이템 드롭
          if (Math.random() < ITEM_DROP_CHANCE) {
            const type = ALL_ITEM_TYPES[Math.floor(Math.random() * ALL_ITEM_TYPES.length)]
            itemsRef.current.push(createItem(type, balloons[hitIdx].x, balloons[hitIdx].y))
          }
          const children = splitBalloon(balloons[hitIdx])
          balloons.splice(hitIdx, 1, ...children)
          return false
        }
        return true
      })

      // 아이템 업데이트 및 획득 판정
      itemsRef.current = itemsRef.current.filter(item => {
        if (updateItem(item)) return false   // 바닥 도달
        if (isPickedUp(item, p)) {
          applyEffect(item.type)
          return false
        }
        return true
      })

      // 효과 타이머 감소
      if (effectRef.current) {
        effectRef.current.timer--
        if (effectRef.current.timer <= 0) {
          effectRef.current = null
        }
      }

      // 스테이지 클리어 판정
      if (balloonsRef.current.length === 0) {
        if (stageRef.current >= 3) {
          gameStateRef.current = 'missioncomplete'
        } else {
          gameStateRef.current = 'stageclear'
          stageClearTimerRef.current = STAGE_CLEAR_FRAMES
        }
        return
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

    const drawHUD = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.fillRect(0, 0, CANVAS_W, HUD_H)

      ctx.font = '12px "Press Start 2P"'
      ctx.textBaseline = 'middle'
      const cy = HUD_H / 2

      ctx.fillStyle = '#e74c3c'
      ctx.textAlign = 'left'
      ctx.fillText('♥ '.repeat(Math.max(0, livesRef.current)).trim(), 10, cy)

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText(`STAGE ${stageRef.current}`, CANVAS_W / 2, cy)

      const e = effectRef.current
      if (e) {
        const secs = Math.ceil(e.timer / 60)
        const timeStr = e.type === 'DYNAMITE' ? '' : ` ${secs}s`
        ctx.fillStyle = ITEM_CONFIG[e.type].color
        ctx.textAlign = 'right'
        ctx.fillText(`[${ITEM_CONFIG[e.type].label}${timeStr}]`, CANVAS_W - 10, cy)
      } else {
        ctx.fillStyle = '#FFD700'
        ctx.textAlign = 'right'
        ctx.fillText(String(scoreRef.current).padStart(7, '0'), CANVAS_W - 10, cy)
      }

      ctx.textBaseline = 'alphabetic'
    }

    const draw = () => {
      const p = playerRef.current
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      drawBackground(ctx)
      balloonsRef.current.forEach(b => drawBalloon(ctx, b))
      harpoonsRef.current.forEach(h => drawHarpoon(ctx, h))
      itemsRef.current.forEach(item => drawItem(ctx, item))

      // 무적 중 깜빡임
      const inv = invincibleRef.current
      const playerVisible = inv === 0 || Math.floor(inv / 6) % 2 === 0
      if (playerVisible) drawPlayer(ctx, p.x, p.y)

      drawHUD()

      const state = gameStateRef.current
      if (state === 'gameover') {
        drawGameOver(ctx, scoreRef.current)
      } else if (state === 'stageclear') {
        drawStageClear(ctx, stageRef.current + 1)
      } else if (state === 'missioncomplete') {
        drawMissionComplete(ctx, scoreRef.current)
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
