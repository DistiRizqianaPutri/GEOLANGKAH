/** Ubah daftar titik (satuan petak) jadi atribut `points` SVG memakai toPx. */
export default function svgPoints(points, toPx) {
  return points.map((p) => toPx(p).join(',')).join(' ')
}
