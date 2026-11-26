import { formatMeasure } from '../../../lib/geometry.js'
import MeasureLabel from './MeasureLabel.jsx'

/** Kaki trapesium AD dan BC: abu, tebal 3 px. Label di sisi luar. */
export default function LegsLayer({ m, toPx, unit, labels }) {
  const { A, B, C, D } = m.points
  const legs = [
    { key: 's1', from: toPx(A), to: toPx(D), value: m.s1, dx: -10, anchor: 'end' },
    { key: 's2', from: toPx(B), to: toPx(C), value: m.s2, dx: 10, anchor: 'start' },
  ]
  return (
    <g>
      {legs.map(({ key, from, to, value, dx, anchor }) => (
        <g key={key}>
          <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} className="stroke-leg" strokeWidth={3} strokeLinecap="round" />
          {labels && (
            <MeasureLabel
              x={(from[0] + to[0]) / 2 + dx}
              y={(from[1] + to[1]) / 2}
              anchor={anchor}
              text={`s = ${formatMeasure(value)} ${unit}`}
              className="fill-leg"
            />
          )}
        </g>
      ))}
    </g>
  )
}
