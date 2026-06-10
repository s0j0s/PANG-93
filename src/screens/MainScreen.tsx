import { useState, useEffect, useCallback } from 'react'
import BalloonBackground from '../components/BalloonBackground'
import MenuButton from '../components/MenuButton'
import HowToPlayModal from '../components/HowToPlayModal'
import '../styles/main.css'

const MENU_ITEMS = ['GAME START', 'HOW TO PLAY', 'QUIT'] as const

interface Props {
  onStart: () => void
}

export default function MainScreen({ onStart }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  const executeItem = useCallback((index: number) => {
    if (index === 0) {
      onStart()
    } else if (index === 1) {
      setShowHowToPlay(true)
    } else if (index === 2) {
      if (window.confirm('게임을 종료하시겠습니까?')) {
        window.close()
      }
    }
  }, [onStart])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showHowToPlay) return

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => (i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => (i + 1) % MENU_ITEMS.length)
      } else if (e.key === 'Enter') {
        setSelectedIndex(i => { executeItem(i); return i })
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showHowToPlay, executeItem])

  return (
    <div className="main-screen">
      <BalloonBackground />

      <div className="main-content">
        <div className="main-title">PANG</div>

        {MENU_ITEMS.map((label, i) => (
          <MenuButton
            key={label}
            label={label}
            selected={selectedIndex === i}
            onClick={() => executeItem(i)}
            onMouseEnter={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  )
}
