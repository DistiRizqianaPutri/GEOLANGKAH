import svgPoints from '../svgPoints.js'

/** Daerah luas: hijau muda, opasitas 20%, arsiran rata. */
export default function AreaLayer({ points, toPx }) {
  return <polygon points={svgPoints(points, toPx)} className="fill-area/20 stroke-none" aria-hidden="true" />
}
