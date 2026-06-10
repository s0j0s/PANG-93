interface Props {
  label: string
  selected: boolean
  onClick: () => void
  onMouseEnter: () => void
}

export default function MenuButton({ label, selected, onClick, onMouseEnter }: Props) {
  return (
    <button
      className={`menu-button${selected ? ' menu-button--selected' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <span className="menu-button__cursor">{selected ? '▶' : ' '}</span>
      {label}
    </button>
  )
}
