import feedback from '../content/feedback.json'

/**
 * Teks umpan balik untuk kode kesalahan (KONTEN.md §7), dengan varian
 * sesuai yang ditanya (`ask`) dan satuan soal.
 * @param {string|null} code  null = benar
 * @param {{ask?:string, unit?:string}} context
 */
export function feedbackText(code, { ask, unit = 'cm' } = {}) {
  const entry = feedback[code ?? 'CORRECT'] ?? feedback.E_LAIN
  const text = (ask && entry[ask]) || entry.default
  return text.replaceAll('{unit}', unit)
}
