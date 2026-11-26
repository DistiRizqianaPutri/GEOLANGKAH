import { formatLabel } from '../../../lib/geometry.js'
import MeasureLabel from './MeasureLabel.jsx'

/** Label panjang (p, di bawah) dan lebar (l, di kanan) persegi panjang. */
export default function RectSideLabels({ m, toPx, unit }) {
  const [x0, y0] = toPx([0, 0])
  const [x1, y1] = toPx([m.p, m.l])
  return (
    <g>
      <MeasureLabel x={(x0 + x1) / 2} y={y0 + 22} text={formatLabel('p', m.p, unit)} />
      <MeasureLabel x={x1 + 10} y={(y0 + y1) / 2} anchor="start" text={formatLabel('l', m.l, unit)} />
    </g>
  )
}
