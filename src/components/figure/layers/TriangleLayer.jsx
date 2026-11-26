import MeasureLabel from './MeasureLabel.jsx'

const SIZE = 12

/**
 * Segitiga siku-siku penyegaran Pythagoras (KONTEN §5, F-07).
 * Sisi tegak t = oranye putus-putus (nanti menjadi tinggi trapesium), sisi tegak x = garis teks,
 * sisi miring s = abu tebal (nanti menjadi kaki). `legs` menebalkan sisi miring.
 * Label sudah diformat oleh FigureCanvas (formatLabel / tersembunyi "= ?").
 */
export default function TriangleLayer({ m, toPx, labels, texts, rightAngle, emphasis }) {
  const P = toPx(m.points.P)
  const Q = toPx(m.points.Q)
  const R = toPx(m.points.R)
  const mid = (u, v) => [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2]
  const hyp = mid(Q, R)
  return (
    <g>
      <line x1={P[0]} y1={P[1]} x2={Q[0]} y2={Q[1]} className="stroke-text" strokeWidth={3} strokeLinecap="round" />
      <line x1={P[0]} y1={P[1]} x2={R[0]} y2={R[1]} className="stroke-height" strokeWidth={3} strokeDasharray="8 6" />
      <line x1={Q[0]} y1={Q[1]} x2={R[0]} y2={R[1]} className="stroke-leg" strokeWidth={emphasis ? 5 : 3} strokeLinecap="round" />
      {rightAngle && (
        <path
          d={`M${P[0]} ${P[1] - SIZE} L${P[0] + SIZE} ${P[1] - SIZE} L${P[0] + SIZE} ${P[1]}`}
          className="fill-none stroke-height"
          strokeWidth={2}
          aria-hidden="true"
        />
      )}
      {labels && (
        <>
          <MeasureLabel x={(P[0] + Q[0]) / 2} y={P[1] + 22} text={texts.x} className="fill-text" />
          <MeasureLabel x={P[0] - 10} y={(P[1] + R[1]) / 2} anchor="end" text={texts.t} className="fill-height" />
          <MeasureLabel x={hyp[0] + 10} y={hyp[1] - 10} anchor="start" text={texts.s} className="fill-leg" />
        </>
      )}
    </g>
  )
}
