// Ketuk unsur (langkah identify): pilih segmen terdekat dari titik sentuh.

/** Jarak titik p ke ruas garis ab (px). */
export function distanceToSegment([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  const f = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2))
  return Math.hypot(px - (ax + f * dx), py - (ay + f * dy))
}

/**
 * Segmen terdekat dalam radius `maxDist` (px), atau null.
 * Radius 24 px = setengah target sentuh 48 px (DESIGN.md §7).
 * @param {[number, number]} point
 * @param {{key:string, from:[number,number], to:[number,number]}[]} segments
 */
export function nearestSegment(point, segments, maxDist = 24) {
  let best = null
  let bestDist = maxDist
  for (const s of segments) {
    const d = distanceToSegment(point, s.from, s.to)
    if (d <= bestDist) {
      best = s.key
      bestDist = d
    }
  }
  return best
}
