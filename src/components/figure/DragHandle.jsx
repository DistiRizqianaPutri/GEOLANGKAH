import { useRef } from 'react'

const KEY_STEP = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
}

/**
 * Titik yang bisa diseret (DESIGN.md §3): lingkaran 20 px terlihat,
 * area sentuh 48 px. Memakai Pointer Events + pointer capture supaya
 * jari boleh keluar dari titik tanpa seretan terputus.
 *
 * @param {{cx:number, cy:number, label:string,
 *          onDrag:(clientX:number, clientY:number)=>void,
 *          onStep:(dx:number, dy:number)=>void}} props
 */
export default function DragHandle({ cx, cy, label, onDrag, onStep }) {
  const dragging = useRef(false)

  const handleDown = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
    navigator.vibrate?.(10)
  }
  const handleMove = (e) => {
    if (dragging.current) onDrag(e.clientX, e.clientY)
  }
  const handleUp = (e) => {
    dragging.current = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  // Papan ketik: panah menggeser satu petak (aksesibilitas, DESIGN.md §7).
  const handleKey = (e) => {
    const step = KEY_STEP[e.key]
    if (!step) return
    e.preventDefault()
    onStep(...step)
  }

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      className="cursor-grab outline-none focus-visible:[&>circle:last-child]:stroke-parallel"
      style={{ touchAction: 'none' }}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onKeyDown={handleKey}
    >
      <circle cx={cx} cy={cy} r={24} fill="transparent" />
      <circle cx={cx} cy={cy} r={10} className="fill-surface stroke-heading" strokeWidth={3} />
    </g>
  )
}
