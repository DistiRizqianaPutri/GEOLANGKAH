import { doubleRotateParts, formatMeasure } from '../../../lib/geometry.js'
import svgPoints from '../svgPoints.js'
import useAnimation from '../useAnimation.js'
import MeasureLabel from './MeasureLabel.jsx'

/**
 * Lapisan `doubleRotate`: salinan trapesium diputar 180° pada titik tengah BC
 * sampai keduanya membentuk jajargenjang (alas a + b). Mulai saat `run` bertambah.
 */
export default function DoubleRotateLayer({ shape, m, toPx, unit, labels, run }) {
  const { progress, started } = useAnimation(run, 1200)
  if (!started) return null

  const { pivot, parallelogram } = doubleRotateParts(shape)
  const { A, B, C, D } = m.points
  const [px, py] = toPx(pivot)
  const [bx0, by] = toPx([0, 0])
  const [bx1] = toPx([parallelogram.base, 0])

  return (
    <g>
      <polygon
        points={svgPoints([A, B, C, D], toPx)}
        transform={`rotate(${180 * progress} ${px} ${py})`}
        className="fill-inactive/40 stroke-leg"
        strokeWidth={2}
        strokeDasharray="6 4"
        strokeLinejoin="round"
      />
      {labels && progress === 1 && (
        <MeasureLabel
          x={(bx0 + bx1) / 2}
          y={by + 44}
          text={`a + b = ${formatMeasure(parallelogram.base)} ${unit}`}
          className="fill-parallel"
        />
      )}
    </g>
  )
}
