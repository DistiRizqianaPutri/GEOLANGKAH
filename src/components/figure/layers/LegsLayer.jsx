import MeasureLabel from './MeasureLabel.jsx'

/**
 * Kaki trapesium AD dan BC: abu, tebal 3 px.
 * Posisi label dihitung legLabelLayout (labelFit.js) agar tidak terpotong.
 */
export default function LegsLayer({ m, toPx, labels, legLabels }) {
  const { A, B, C, D } = m.points
  const legs = [
    [toPx(A), toPx(D)],
    [toPx(B), toPx(C)],
  ]
  return (
    <g>
      {legs.map(([from, to], i) => (
        <line key={i} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} className="stroke-leg" strokeWidth={3} strokeLinecap="round" />
      ))}
      {labels &&
        legLabels.map(({ key, x, y, anchor, text }) => (
          <MeasureLabel key={key} x={x} y={y} anchor={anchor} text={text} className="fill-leg" />
        ))}
    </g>
  )
}
