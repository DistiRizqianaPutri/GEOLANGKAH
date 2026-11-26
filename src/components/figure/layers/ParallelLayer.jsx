import { measureText } from '../../../lib/figureSpec.js'
import MeasureLabel from './MeasureLabel.jsx'

// Tanda panah sejajar ">" di tengah sisi.
function Chevron({ x, y }) {
  return <path d={`M${x - 4} ${y - 6} L${x + 4} ${y} L${x - 4} ${y + 6}`} className="fill-none stroke-parallel" strokeWidth={2.5} />
}

/** Sisi sejajar a (alas AB) dan b (sisi atas DC): biru, tebal 4 px, tanda ">". */
export default function ParallelLayer({ m, toPx, unit, labels, hidden }) {
  const { A, B, C, D } = m.points
  const sides = [
    { key: 'a', from: toPx(A), to: toPx(B), text: measureText('a', m.a, unit, hidden), dy: 22 },
    { key: 'b', from: toPx(D), to: toPx(C), text: measureText('b', m.b, unit, hidden), dy: -22 },
  ]
  return (
    <g>
      {sides.map(({ key, from, to, text, dy }) => {
        const mx = (from[0] + to[0]) / 2
        return (
          <g key={key}>
            <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} className="stroke-parallel" strokeWidth={4} strokeLinecap="round" />
            <Chevron x={mx} y={from[1]} />
            {labels && <MeasureLabel x={mx} y={from[1] + dy} text={text} className="fill-parallel" />}
          </g>
        )
      })}
    </g>
  )
}
