/**
 * Ubah isian siswa menjadi angka. Koma dan titik sama-sama tanda desimal
 * (DESIGN.md §3). Isian kosong atau bukan angka → null.
 * @param {string|null|undefined} raw
 * @returns {number|null}
 */
export function parseNumber(raw) {
  if (typeof raw !== 'string') return null
  const text = raw.trim().replace(',', '.')
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(text)) return null
  return Number(text)
}
