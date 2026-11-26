// Aturan petunjuk bertingkat (KONTEN.md §7).

/**
 * Bolehkah petunjuk tingkat `level` dibuka?
 * L1 kapan saja · L2 setelah L1 · L3 setelah L2 dan minimal 1 percobaan.
 * @param {number} level  1–3
 * @param {{opened:number, attempts:number}} state  level tertinggi yang sudah dibuka, banyak percobaan
 */
export function canOpenHint(level, { opened, attempts }) {
  if (level === 1) return true
  if (level === 2) return opened >= 1
  if (level === 3) return opened >= 2 && attempts >= 1
  return false
}

/** Setelah 2× salah, petunjuk L1 ditawarkan (tidak dipaksakan) bila belum ada yang dibuka. */
export function shouldOfferHint({ wrong, opened }) {
  return wrong >= 2 && opened === 0
}
