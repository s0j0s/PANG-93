import { FLOOR_Y, ITEM_SIZE, ITEM_GRAVITY, ITEM_CONFIG } from './constants'
import { PLAYER_W, PLAYER_H } from './drawPlayer'
import type { Item, ItemType, Player } from './types'

export function createItem(type: ItemType, x: number, y: number): Item {
  return { x, y, vy: 0, type }
}

export function updateItem(item: Item): boolean {
  item.vy += ITEM_GRAVITY
  item.y  += item.vy
  return item.y - ITEM_SIZE / 2 >= FLOOR_Y
}

export function isPickedUp(item: Item, player: Player): boolean {
  const half = ITEM_SIZE / 2
  const px = player.x - PLAYER_W / 2
  const py = player.y
  return (
    item.x + half > px &&
    item.x - half < px + PLAYER_W &&
    item.y + half > py &&
    item.y - half < py + PLAYER_H
  )
}

export function drawItem(ctx: CanvasRenderingContext2D, item: Item): void {
  const half = ITEM_SIZE / 2
  const cfg = ITEM_CONFIG[item.type]

  ctx.fillStyle = cfg.color
  ctx.fillRect(item.x - half, item.y - half, ITEM_SIZE, ITEM_SIZE)

  ctx.fillStyle = '#ffffff'
  ctx.font = '6px "Press Start 2P"'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(cfg.label, item.x, item.y)
  ctx.textBaseline = 'alphabetic'
}
