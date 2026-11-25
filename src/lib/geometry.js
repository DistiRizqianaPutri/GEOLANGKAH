// Semua hitungan GeoLangkah ada di sini sebagai fungsi murni (ARSITEKTUR.md §3).
// Komponen UI tidak boleh menghitung sendiri — panggil fungsi dari file ini.

/** Toleransi pembandingan jawaban (KONTEN.md §7). */
export const TOLERANCE = 0.01

// Sedikit kelonggaran agar 52,01 vs 52 tidak ditolak karena galat pecahan biner.
const EPS = 1e-9

const near = (x, y) => Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) <= TOLERANCE + EPS

// --- Persegi panjang --------------------------------------------------------

/** K = 2 × (p + l) */
export function rectPerimeter(p, l) {
  return 2 * (p + l)
}

/** L = p × l */
export function rectArea(p, l) {
  return p * l
}

// --- Trapesium --------------------------------------------------------------

/** K = jumlah keempat sisi */
export function trapezoidPerimeter(a, b, s1, s2) {
  return a + b + s1 + s2
}

/** L = ½ × (a + b) × t */
export function trapezoidArea(a, b, t) {
  return 0.5 * (a + b) * t
}

/**
 * Selisih proyeksi x (alas segitiga siku-siku di tepi trapesium).
 * Sama kaki: (a − b) ÷ 2 · siku-siku: a − b. Jenis lain tidak punya rumus tunggal.
 */
export function offsetX(a, b, kind) {
  if (kind === 'isosceles') return (a - b) / 2
  if (kind === 'right') return a - b
  throw new Error(`offsetX: jenis trapesium "${kind}" tidak didukung`)
}

/** t = √(s² − x²); tidak wajar bila kaki tidak lebih panjang dari x. */
export function heightFromLeg(s, x) {
  if (s <= x) throw new Error(`heightFromLeg: kaki (${s}) harus lebih panjang dari x (${x})`)
  return Math.sqrt(s * s - x * x)
}

/** s = √(t² + x²) */
export function legFromHeight(t, x) {
  return Math.sqrt(t * t + x * x)
}

// --- Pemeriksaan jawaban ----------------------------------------------------

/**
 * Bandingkan jawaban siswa dengan kunci.
 * @param {number} value  angka jawaban siswa
 * @param {string} unit   satuan pilihan siswa (mis. 'cm²')
 * @param {{value:number, unit:string}} expected
 * @returns {{correct:boolean, valueOk:boolean, unitOk:boolean}}
 */
export function checkAnswer(value, unit, expected) {
  const valueOk = near(value, expected.value)
  const unitOk = unit === expected.unit
  return { correct: valueOk && unitOk, valueOk, unitOk }
}

// --- Diagnosis kesalahan ----------------------------------------------------

/**
 * Lengkapi data trapesium yang tidak tertulis di soal.
 * Siku-siku: s1 = sisi tegak (= t), s2 = kaki miring. Sama kaki: s1 = s2.
 * Nilai yang tidak bisa diturunkan dibiarkan undefined.
 */
function resolveTrapezoid(problem) {
  const { a, b, kind } = problem
  let { t, s1, s2 } = problem

  if (kind === 'isosceles') {
    s1 ??= s2
    s2 ??= s1
  }
  if (kind === 'right') {
    s1 ??= t
    t ??= s1
  }

  const x = kind === 'isosceles' || kind === 'right' ? offsetX(a, b, kind) : undefined
  // kaki yang miring (dipakai untuk cari tinggi)
  const slant = kind === 'right' ? s2 : s1

  if (t === undefined && slant !== undefined && x !== undefined && slant > x) {
    t = heightFromLeg(slant, x)
    if (kind === 'right') s1 ??= t
  }
  if (slant === undefined && t !== undefined && x !== undefined) {
    const leg = legFromHeight(t, x)
    if (kind === 'right') s2 = leg
    else s1 = s2 = leg
  }

  const sides = [a, b, s1, s2].every(Number.isFinite) ? [a, b, s1, s2] : undefined
  return { a, b, t, x, kind, slant: kind === 'right' ? s2 : s1, sides }
}

/** Kunci jawaban (angka) dan satuannya untuk satu soal. */
function solve(problem) {
  const unit = problem.unit ?? 'cm'
  const areaUnit = `${unit}²`

  if (problem.shape === 'rect') {
    const { p, l } = problem
    return {
      perimeter: rectPerimeter(p, l),
      area: rectArea(p, l),
      unit: problem.ask === 'area' ? areaUnit : unit,
    }
  }

  const tz = resolveTrapezoid(problem)
  return {
    ...tz,
    perimeter: tz.sides ? trapezoidPerimeter(...tz.sides) : undefined,
    area: tz.t !== undefined ? trapezoidArea(tz.a, tz.b, tz.t) : undefined,
    height: tz.t,
    offset: tz.x,
    unit: problem.ask === 'area' ? areaUnit : unit,
  }
}

/**
 * Daftar pola "cara salah" sesuai yang ditanya, berurutan dari yang paling spesifik.
 * Setiap pola: [kode, nilai hasil cara salah]. Nilai undefined/NaN dilewati.
 */
function wrongPatterns(problem, s) {
  const { ask } = problem

  if (problem.shape === 'rect') {
    const { p, l } = problem
    if (ask === 'area') return [['E_KL_TERTUKAR', s.perimeter]]
    if (ask === 'perimeter')
      return [
        ['E_SETENGAH_KELILING', p + l],
        ['E_KL_TERTUKAR', s.area],
      ]
    return []
  }

  const { a, b, t, kind, slant, sides } = s
  const half = (base) => (t === undefined ? undefined : 0.5 * base * t)

  if (ask === 'area') {
    const legs = kind === 'scalene' && sides ? [sides[2], sides[3]] : [slant]
    return [
      ['E_LUPA_SETENGAH', t === undefined ? undefined : (a + b) * t],
      ...legs.map((leg) => ['E_KAKI_SBG_TINGGI', leg === undefined ? undefined : trapezoidArea(a, b, leg)]),
      ['E_SATU_SISI', half(a)],
      ['E_SATU_SISI', half(b)],
      ['E_KL_TERTUKAR', s.perimeter],
    ]
  }

  if (ask === 'perimeter') {
    const patterns = []
    if (kind !== 'right' && t !== undefined && s.perimeter !== undefined) {
      patterns.push(['E_TINGGI_DI_KELILING', s.perimeter + t])
    }
    if (sides) {
      for (let i = 0; i < 4; i++) patterns.push(['E_SISI_KURANG', s.perimeter - sides[i]])
    }
    patterns.push(['E_KL_TERTUKAR', s.area])
    return patterns
  }

  if (ask === 'height') {
    const patterns = []
    if (kind === 'isosceles' && slant !== undefined && slant > a - b) {
      patterns.push(['E_X_TIDAK_DIBAGI', heightFromLeg(slant, a - b)])
    }
    if (slant !== undefined && s.x !== undefined) {
      patterns.push(['E_PYTHA_TAMBAH', legFromHeight(slant, s.x)]) // √(s² + x²)
    }
    return patterns
  }

  if (ask === 'offset' && kind === 'isosceles') {
    return [['E_X_TIDAK_DIBAGI', a - b]]
  }

  return []
}

/**
 * Tentukan kode kesalahan (KONTEN.md §7). Urutan prioritas (diputuskan 26-11-2026):
 * 1) benar → null · 2) angka benar, satuan salah → E_SATUAN ·
 * 3) pola cara salah (satuan diabaikan) · 4) E_TIDAK_WAJAR · 5) E_LAIN.
 *
 * @param {object} problem  { shape, kind?, ask, unit, p, l, a, b, t, s1, s2 }
 * @param {number} value    angka jawaban siswa
 * @param {string} unit     satuan pilihan siswa
 * @returns {string|null}
 */
export function diagnose(problem, value, unit) {
  const s = solve(problem)
  const expected = s[problem.ask]

  const { correct, valueOk } = checkAnswer(value, unit, { value: expected, unit: s.unit })
  if (correct) return null
  if (valueOk) return 'E_SATUAN'

  for (const [code, wrong] of wrongPatterns(problem, s)) {
    if (near(value, wrong)) return code
  }

  const tooTall = problem.ask === 'height' && s.slant !== undefined && value >= s.slant
  if (!(value > 0) || tooTall) return 'E_TIDAK_WAJAR'

  return 'E_LAIN'
}
