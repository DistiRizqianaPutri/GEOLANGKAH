import { trapezoidFromSides } from './geometry.js'

/**
 * Ubah `figure` di konten JSON menjadi model gambar FigureCanvas.
 * Persegi panjang: { shape:'rect', p, l } · trapesium: { shape:'trapezoid', kind, a, b, t, x1? }.
 */
export function figureModel(figure) {
  if (figure.shape === 'rect') return { shape: 'rect', p: figure.p, l: figure.l }
  return trapezoidFromSides(figure)
}
