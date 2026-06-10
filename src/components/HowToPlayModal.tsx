import { useEffect } from 'react'

interface Props {
  onClose: () => void
}

export default function HowToPlayModal({ onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">HOW TO PLAY</div>

        <div className="modal-content">
          <div>이동 &nbsp;&nbsp; <span className="key">← →</span> 방향키</div>
          <div>발사 &nbsp;&nbsp; <span className="key">SPACE</span></div>
        </div>

        <hr className="modal-divider" />

        <div className="modal-content">
          <div>풍선을 모두 터뜨리면 스테이지 클리어</div>
          <div>풍선에 닿으면 라이프 1 감소</div>
          <div>라이프 0 &rarr; 게임 오버</div>
        </div>

        <button className="modal-close-btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}
