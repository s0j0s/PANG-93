import { useEffect, useRef } from 'react'

interface Keys {
  left: boolean
  right: boolean
}

export function useKeys() {
  const keys = useRef<Keys>({ left: false, right: false })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  keys.current.left  = true
      if (e.key === 'ArrowRight') keys.current.right = true
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  keys.current.left  = false
      if (e.key === 'ArrowRight') keys.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup',   up)
    }
  }, [])

  return keys
}
