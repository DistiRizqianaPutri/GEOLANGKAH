// Arah geser huruf titik sudut supaya berada di luar bangun.
const OFFSET = { A: [-12, 16], B: [12, 16], C: [12, -14], D: [-12, -14] }

/** Nama titik sudut A, B, C, D. */
export default function VertexLabels({ points, toPx }) {
  return (
    <g aria-hidden="true">
      {Object.entries(points).map(([name, p]) => {
        const [x, y] = toPx(p)
        const [dx, dy] = OFFSET[name]
        return (
          <text key={name} x={x + dx} y={y + dy} textAnchor="middle" dominantBaseline="middle" className="fill-text-muted text-figure">
            {name}
          </text>
        )
      })}
    </g>
  )
}
