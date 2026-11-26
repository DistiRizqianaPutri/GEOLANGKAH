import { formatLabel, rectFillProgress } from '../../../lib/geometry.js'
import svgPoints from '../svgPoints.js'
import useAnimation from '../useAnimation.js'
import MeasureLabel from './MeasureLabel.jsx'

/**
 * Daerah luas: hijau muda, opasitas 20%, arsiran rata.
 * Persegi panjang dengan `counting`: petak terisi baris demi baris setelah
 * tombol "Isi petak" ditekan, dan label L menghitung naik sampai p × l.
 * `label` (persegi panjang): tampilkan "L = … <areaUnit>" di tengah bangun.
 */
export default function AreaLayer({ points, toPx, rect, area, areaUnit, label = false, run = 0, counting = false, dy = 0 }) {
  const { progress, started } = useAnimation(run, 1200)
  const fill = counting && rect ? rectFillProgress(rect, started ? progress : 0) : null
  const shown = fill ? [[0, 0], [rect.p, 0], [rect.p, fill.rows], [0, fill.rows]] : points

  const px = points.map(toPx)
  const cx = px.reduce((s, p) => s + p[0], 0) / px.length
  const cy = px.reduce((s, p) => s + p[1], 0) / px.length
  const showLabel = label && (!counting || started)

  return (
    <g>
      {(!fill || fill.rows > 0) && <polygon points={svgPoints(shown, toPx)} className="fill-area/20 stroke-none" aria-hidden="true" />}
      {showLabel && <MeasureLabel x={cx} y={cy + dy} text={formatLabel('L', fill ? fill.count : area, areaUnit)} className="fill-success" />}
    </g>
  )
}
