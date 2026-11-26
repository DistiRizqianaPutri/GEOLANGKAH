import { formatLabel, trapezoidFromSides } from './geometry.js'

/**
 * Ubah `figure` di konten JSON menjadi model gambar FigureCanvas.
 * Persegi panjang: { shape:'rect', p, l } · trapesium: { shape:'trapezoid', kind, a, b, t, x1? } ·
 * segitiga siku-siku (P4): { shape:'triangle', x, t }.
 */
export function figureModel(figure) {
  if (figure.shape === 'rect') return { shape: 'rect', p: figure.p, l: figure.l }
  if (figure.shape === 'triangle') {
    if (!(figure.x > 0 && figure.t > 0)) throw new Error('figureModel: segitiga butuh x dan t positif')
    return { shape: 'triangle', x: figure.x, t: figure.t }
  }
  return trapezoidFromSides(figure)
}

/**
 * Label ukuran, atau "t = ?" bila unsurnya sedang dicari (`figure.hideLabels`, M5).
 * @param {string} name   nama di label (a, b, t, s, x)
 * @param {Set<string>|string[]} hidden  kunci unsur yang disembunyikan (a, b, t, s1, s2, x, s)
 * @param {string} key    kunci unsur ini
 */
export function measureText(name, value, unit, hidden, key = name) {
  const set = hidden instanceof Set ? hidden : new Set(hidden ?? [])
  return set.has(key) ? `${name} = ?` : formatLabel(name, value, unit)
}
