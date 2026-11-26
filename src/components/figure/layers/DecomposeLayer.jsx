import { decomposeParts } from '../../../lib/geometry.js'
import svgPoints from '../svgPoints.js'
import useAnimation from '../useAnimation.js'

/** Jarak (satuan petak) segitiga bergeser keluar saat dipecah. */
export const DECOMPOSE_GAP = 0.8

/**
 * Lapisan `decompose`: trapesium dipecah jadi persegi panjang + segitiga
 * siku-siku di tepi. Segitiga bergeser keluar setiap kali `run` bertambah.
 */
export default function DecomposeLayer({ shape, toPx, run }) {
  const { progress } = useAnimation(run, 1000)
  const { rect, left, right } = decomposeParts(shape)
  const gap = DECOMPOSE_GAP * progress
  const shift = (points, dx) => points.map(([x, y]) => [x + dx, y])

  const pieces = [
    { key: 'rect', points: rect.points },
    left && { key: 'left', points: shift(left.points, -gap) },
    right && { key: 'right', points: shift(right.points, gap) },
  ].filter(Boolean)

  return (
    <g>
      {pieces.map(({ key, points }) => (
        <polygon
          key={key}
          points={svgPoints(points, toPx)}
          className="fill-area/20 stroke-leg"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ))}
      {[shape.d, shape.c].map((x) => {
        const [x1, y1] = toPx([x, 0])
        const [, y2] = toPx([x, shape.t])
        return <line key={x} x1={x1} y1={y1} x2={x1} y2={y2} className="stroke-height" strokeWidth={3} strokeDasharray="8 6" />
      })}
    </g>
  )
}
