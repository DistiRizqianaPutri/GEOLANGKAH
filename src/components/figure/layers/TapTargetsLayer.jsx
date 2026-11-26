/**
 * Lapisan ketuk unsur (langkah identify). Unsur yang dipilih ditandai garis
 * tebal biru tua; ketukan diproses FigureCanvas (segmen terdekat).
 * Setiap unsur juga bisa dipilih dengan papan ketik (Tab + Enter/Spasi).
 */
export default function TapTargetsLayer({ segments, selected, onToggle, disabled }) {
  const handleKey = (key) => (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    if (!disabled) onToggle(key)
  }
  return (
    <g>
      {segments.map(({ key, from, to, label }) => {
        const on = selected.includes(key)
        return (
          <g key={key}>
            {on && (
              <line
                x1={from[0]}
                y1={from[1]}
                x2={to[0]}
                y2={to[1]}
                className="stroke-heading"
                strokeWidth={8}
                strokeLinecap="round"
                opacity={0.55}
                aria-hidden="true"
              />
            )}
            <line
              x1={from[0]}
              y1={from[1]}
              x2={to[0]}
              y2={to[1]}
              stroke="transparent"
              strokeWidth={16}
              pointerEvents="none"
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={label}
              aria-pressed={on}
              className="outline-none focus-visible:stroke-parallel/40"
              onKeyDown={handleKey(key)}
            />
          </g>
        )
      })}
    </g>
  )
}
