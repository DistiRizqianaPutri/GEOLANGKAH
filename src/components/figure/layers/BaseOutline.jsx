import svgPoints from '../svgPoints.js'

/** Garis tepi unsur yang tidak sedang dibahas: abu muda, tipis 1,5 px. */
export default function BaseOutline({ points, toPx }) {
  return (
    <polygon
      points={svgPoints(points, toPx)}
      className="fill-none stroke-inactive"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden="true"
    />
  )
}
