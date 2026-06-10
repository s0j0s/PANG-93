import { useState } from 'react'
import MainScreen from './screens/MainScreen'
import GameScreen from './screens/GameScreen'

export default function App() {
  const [screen, setScreen] = useState<'main' | 'game'>('main')

  return screen === 'main'
    ? <MainScreen onStart={() => setScreen('game')} />
    : <GameScreen onExit={() => setScreen('main')} />
}
