const SIZE = 12

/** Simbol siku-siku ∟ di kaki garis tinggi, menghadap ke dalam bangun. */
export default function RightAngleLayer({ m, toPx }) {
  const [x, y] = toPx(m.foot)
  return (
    <path
      d={`M${x} ${y - SIZE} L${x + SIZE} ${y - SIZE} L${x + SIZE} ${y}`}
      className="fill-none stroke-height"
      strokeWidth={2}
      aria-hidden="true"
    />
  )
}
