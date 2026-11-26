// Penempatan label ukuran agar tidak pernah terpotong di tepi gambar (perbaikan M3).
// Murni: menerima toPx & lebar viewBox, tidak menyentuh DOM.
import { measureText } from '../../lib/figureSpec.js'

const FONT_PX = 15 // DESIGN.md §2.3: angka di gambar 15 px tebal
const CHAR_EM = 0.62 // perkiraan lebar rata-rata huruf Nunito 800 (sedikit dilebihkan)
const HALO = 4 // garis "halo" di sekeliling teks
export const LABEL_MARGIN = 4

/** Perkiraan lebar label (px). Sengaja sedikit lebih lebar agar aman. */
export function estimateLabelWidth(text, fontPx = FONT_PX) {
  return Math.ceil(text.length * CHAR_EM * fontPx + HALO)
}

/** Rentang [kiri, kanan] label untuk x dan text-anchor tertentu. */
export function labelSpan(x, anchor, width) {
  if (anchor === 'start') return [x, x + width]
  if (anchor === 'end') return [x - width, x]
  return [x - width / 2, x + width / 2]
}

/** Geser x seperlunya agar seluruh label berada di dalam [margin, viewWidth − margin]. */
export function fitLabelX(x, anchor, width, viewWidth, margin = LABEL_MARGIN) {
  const [left, right] = labelSpan(x, anchor, width)
  if (left < margin) return x + (margin - left)
  if (right > viewWidth - margin) return x - (right - (viewWidth - margin))
  return x
}

/** Apakah label sudah muat tanpa digeser? */
export function labelFits(x, anchor, width, viewWidth, margin = LABEL_MARGIN) {
  return fitLabelX(x, anchor, width, viewWidth, margin) === x
}

const LEG_DX = 10

/**
 * Posisi label kaki AD (kiri) dan BC (kanan).
 * Normal: di tengah kaki, di sisi luar. Bila salah satu tidak muat di luar
 * (`cramped`), kedua label turun ke ¼ tinggi kaki dari alas; label t lalu
 * dipasang di ¾ tinggi (HeightLayer) agar tidak bertumpuk.
 */
export function legLabelLayout(m, toPx, unit, viewWidth, hidden = []) {
  const { A, B, C, D } = m.points
  const legs = [
    { key: 's1', from: toPx(A), to: toPx(D), value: m.s1, dx: -LEG_DX, anchor: 'end' },
    { key: 's2', from: toPx(B), to: toPx(C), value: m.s2, dx: LEG_DX, anchor: 'start' },
  ]
  const at = (leg, f) => [leg.from[0] + (leg.to[0] - leg.from[0]) * f + leg.dx, leg.from[1] + (leg.to[1] - leg.from[1]) * f]
  const texts = legs.map((leg) => measureText('s', leg.value, unit, hidden, leg.key))
  const cramped = legs.some((leg, i) => !labelFits(at(leg, 0.5)[0], leg.anchor, estimateLabelWidth(texts[i]), viewWidth))
  const f = cramped ? 0.25 : 0.5
  return {
    cramped,
    labels: legs.map((leg, i) => {
      const [x, y] = at(leg, f)
      return { key: leg.key, x, y, anchor: leg.anchor, text: texts[i] }
    }),
  }
}
