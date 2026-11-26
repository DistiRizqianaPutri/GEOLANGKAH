/** Petak satuan (1 petak = 1 satuan panjang pada label). */
export default function GridLayer({ bounds, toPx }) {
  const lines = []
  for (let x = Math.ceil(bounds.minX); x <= bounds.maxX; x++) {
    const [x1, y1] = toPx([x, 0])
    const [, y2] = toPx([x, bounds.maxY])
    lines.push(<line key={`v${x}`} x1={x1} y1={y1} x2={x1} y2={y2} />)
  }
  for (let y = 0; y <= bounds.maxY; y++) {
    const [x1, y1] = toPx([bounds.minX, y])
    const [x2] = toPx([bounds.maxX, y])
    lines.push(<line key={`h${y}`} x1={x1} y1={y1} x2={x2} y2={y1} />)
  }
  return (
    <g className="stroke-grid" strokeWidth={1} aria-hidden="true">
      {lines}
    </g>
  )
}
