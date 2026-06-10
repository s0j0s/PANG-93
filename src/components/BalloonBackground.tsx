const BALLOONS = [
  { id: 1, x: 8,  y: 15, size: 52, color: '#e74c3c', duration: 4.2, delay: 0 },
  { id: 2, x: 20, y: 65, size: 38, color: '#3498db', duration: 5.8, delay: 1.2 },
  { id: 3, x: 35, y: 30, size: 44, color: '#2ecc71', duration: 3.9, delay: 0.5 },
  { id: 4, x: 55, y: 72, size: 60, color: '#e67e22', duration: 6.5, delay: 2.1 },
  { id: 5, x: 68, y: 20, size: 34, color: '#9b59b6', duration: 4.7, delay: 0.8 },
  { id: 6, x: 78, y: 55, size: 48, color: '#f1c40f', duration: 5.2, delay: 1.7 },
  { id: 7, x: 88, y: 38, size: 40, color: '#e74c3c', duration: 3.6, delay: 0.3 },
  { id: 8, x: 47, y: 10, size: 56, color: '#3498db', duration: 6.1, delay: 2.5 },
]

export default function BalloonBackground() {
  return (
    <div className="balloon-background">
      {BALLOONS.map(b => (
        <div
          key={b.id}
          className="balloon"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            backgroundColor: b.color,
            color: b.color,
            animation: `float ${b.duration}s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
