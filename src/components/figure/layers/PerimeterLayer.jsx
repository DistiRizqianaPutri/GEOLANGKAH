import { useLayoutEffect, useRef, useState } from 'react'
import { formatMeasure } from '../../../lib/geometry.js'
import svgPoints from '../svgPoints.js'
import useAnimation from '../useAnimation.js'
import MeasureLabel from './MeasureLabel.jsx'

/**
 * Keliling: tepi ungu tebal 4 px. Titik ungu menelusuri tepi SEKALI
 * setiap kali `run` bertambah (tombol "Telusuri tepi").
 */
export default function PerimeterLayer({ points, perimeter, toPx, unit, labels, run }) {
  const pathRef = useRef(null)
  const { progress, started } = useAnimation(run, 1200)
  const [dot, setDot] = useState(null)

  useLayoutEffect(() => {
    const path = pathRef.current
    if (!started || !path) return
    const total = path.getTotalLength()
    const p = path.getPointAtLength(progress * total)
    setDot(progress < 1 ? [p.x, p.y] : null)
  }, [progress, started])

  const px = points.map(toPx)
  const cx = px.reduce((s, p) => s + p[0], 0) / px.length
  const cy = px.reduce((s, p) => s + p[1], 0) / px.length

  return (
    <g>
      <polygon
        ref={pathRef}
        points={svgPoints(points, toPx)}
        className="fill-none stroke-perimeter"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {dot && <circle cx={dot[0]} cy={dot[1]} r={7} className="fill-perimeter" aria-hidden="true" />}
      {labels && <MeasureLabel x={cx} y={cy} text={`K = ${formatMeasure(perimeter)} ${unit}`} className="fill-perimeter" />}
    </g>
  )
}
