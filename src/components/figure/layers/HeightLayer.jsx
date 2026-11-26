import { formatLabel } from '../../../lib/geometry.js'
import MeasureLabel from './MeasureLabel.jsx'

/**
 * Tinggi t: oranye putus-putus 3 px, ditarik dari D tegak lurus ke alas.
 * `labelAt` = letak label sepanjang garis dari alas (0,5 = tengah; 0,75 bila label kaki turun).
 */
export default function HeightLayer({ m, toPx, unit, labels, labelAt = 0.5 }) {
  const [x1, y1] = toPx(m.points.D)
  const [x2, y2] = toPx(m.foot)
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-height" strokeWidth={3} strokeDasharray="8 6" />
      {labels && (
        <MeasureLabel x={x1 + 8} y={y2 + (y1 - y2) * labelAt} anchor="start" text={formatLabel('t', m.t, unit)} className="fill-height" />
      )}
    </g>
  )
}
