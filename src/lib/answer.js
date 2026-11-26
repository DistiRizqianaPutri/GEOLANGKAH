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

/**
 * Rupiah format Indonesia: "4950000", "4.950.000", "Rp4.950.000", "Rp 4.950.000".
 * Titik = pemisah ribuan (kelompok 3 angka), koma = desimal. Selain itu → null.
 * @param {string|null|undefined} raw
 * @returns {number|null}
 */
export function parseRupiah(raw) {
  if (typeof raw !== 'string') return null
  const text = raw.trim().replace(/^rp\s*/i, '')
  if (!/^(\d+|\d{1,3}(\.\d{3})+)(,\d+)?$/.test(text)) return null
  return Number(text.replaceAll('.', '').replace(',', '.'))
}

/** Isian yang diawali "Rp" (boleh ada spasi di depan). */
const looksLikeRupiah = (raw) => typeof raw === 'string' && /^\s*rp/i.test(raw)

/**
 * Baca isian jawaban sesuai satuannya. Satuan Rp (atau isian berawalan "Rp") → parseRupiah;
 * satuan lain → parseNumber (koma maupun titik = desimal).
 * @param {string|null|undefined} raw
 * @param {string|null|undefined} unit
 * @returns {number|null}
 */
export function parseAnswer(raw, unit) {
  return unit === 'Rp' || looksLikeRupiah(raw) ? parseRupiah(raw) : parseNumber(raw)
}
