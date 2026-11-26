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

// --- Model gambar (FigureCanvas, DESIGN.md §5) -----------------------------
// Koordinat dalam satuan petak, sumbu y ke atas.
// Trapesium: A = (0,0), B = (a,0), D = (d,t), C = (c,t) → { shape, kind, a, t, d, c }.
// Persegi panjang: { shape: 'rect', p, l }.

/** Batas seret (DESIGN.md §5). */
export const DRAG_LIMITS = { minHeight: 2, maxHeight: 10, minTop: 1, rectMin: 1, rectMaxP: 12, rectMaxL: 8 }

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/**
 * Bangun model gambar dari ukuran soal.
 * Sama kaki: d = x = (a − b) ÷ 2 · siku-siku: d = 0 (sisi tegak AD) · sembarang: d = x1 (wajib).
 */
export function trapezoidFromSides({ kind, a, b, t, x1 }) {
  let d
  if (kind === 'isosceles') d = offsetX(a, b, kind)
  else if (kind === 'right') d = 0
  else if (kind === 'scalene' && Number.isFinite(x1)) d = x1
  else throw new Error(`trapezoidFromSides: jenis "${kind}" butuh x1`)
  return { shape: 'trapezoid', kind, a, t, d, c: d + b }
}

/** Ukuran, titik sudut, dan kaki garis tinggi untuk satu trapesium. */
export function trapezoidMeasures({ a, t, d, c }) {
  const b = c - d
  const x1 = d
  const x2 = a - c
  const s1 = legFromHeight(t, x1) // kaki kiri AD
  const s2 = legFromHeight(t, x2) // kaki kanan BC
  return {
    a,
    b,
    t,
    x1,
    x2,
    s1,
    s2,
    perimeter: trapezoidPerimeter(a, b, s1, s2),
    area: trapezoidArea(a, b, t),
    points: { A: [0, 0], B: [a, 0], C: [c, t], D: [d, t] },
    foot: [d, 0], // garis tinggi dari D tegak lurus ke alas
  }
}

/** Ukuran persegi panjang. */
export function rectMeasures({ p, l }) {
  return { p, l, perimeter: rectPerimeter(p, l), area: rectArea(p, l) }
}

/**
 * Label ukuran: bilangan dengan ≤ 1 desimal ditulis tepat ("16", "22,5");
 * selain itu dibulatkan 1 desimal dengan tanda ≈ ("≈ 4,5").
 */
export function formatMeasure(value) {
  const r = Math.round(value * 10) / 10
  const text = String(r).replace('.', ',')
  return Math.abs(value - r) < 1e-9 ? text : `≈ ${text}`
}

/**
 * Label ukuran lengkap: "s = 5 cm", atau "s ≈ 6,1 cm" bila dibulatkan
 * (bukan "s = ≈ 6,1 cm"; temuan M3).
 */
export function formatLabel(name, value, unit) {
  const text = formatMeasure(value)
  const approx = text.startsWith('≈ ')
  return `${name} ${approx ? '≈' : '='} ${approx ? text.slice(2) : text} ${unit}`
}

/** Penghitung "Telusuri tepi": satuan yang sudah dilewati titik (0 → K). */
export function perimeterTraceCount(perimeter, progress) {
  return Math.min(perimeter, Math.floor(progress * perimeter + EPS))
}

/** "Isi petak" baris demi baris: banyak baris terisi dan banyak petak (0 → p × l). */
export function rectFillProgress({ p, l }, progress) {
  const rows = Math.min(l, Math.floor(progress * l + EPS))
  return { rows, count: rectArea(p, rows) }
}

/**
 * Seret titik atas ('D' atau 'C') ke `point` (satuan petak, boleh pecahan).
 * Hasil di-snap ke petak; aturan per jenis dan batas dari DESIGN.md §5.
 * `lockHeight`: tinggi tidak ikut berubah (langkah "geser C → tinggi tetap").
 */
export function dragTopVertex(shape, handle, point, { lockHeight = false } = {}) {
  const { kind, a } = shape
  const { minHeight, maxHeight, minTop } = DRAG_LIMITS
  const t = lockHeight ? shape.t : clamp(Math.round(point.y), minHeight, maxHeight)
  const x = Math.round(point.x)
  let { d, c } = shape

  if (kind === 'isosceles') {
    // Simetris terhadap x = a/2, dengan 0 ≤ d dan c − d ≥ minTop.
    const maxD = Math.floor((a - minTop) / 2)
    d = handle === 'D' ? clamp(x, 0, maxD) : clamp(a - x, 0, maxD)
    c = a - d
  } else if (kind === 'right') {
    d = 0
    if (handle === 'C') c = clamp(x, minTop, a)
  } else if (handle === 'D') {
    d = clamp(x, 0, c - minTop)
  } else {
    c = clamp(x, d + minTop, a)
  }

  return { ...shape, t, d, c }
}

/** Seret sudut kanan atas persegi panjang; snap + batas p 1–12, l 1–8. */
export function dragRectCorner(shape, point) {
  const { rectMin, rectMaxP, rectMaxL } = DRAG_LIMITS
  return {
    ...shape,
    p: clamp(Math.round(point.x), rectMin, rectMaxP),
    l: clamp(Math.round(point.y), rectMin, rectMaxL),
  }
}

/**
 * Lapisan `decompose`: persegi panjang di tengah + segitiga siku-siku di tepi.
 * Segitiga bernilai null bila x-nya 0 (mis. sisi tegak trapesium siku-siku).
 */
export function decomposeParts(shape) {
  const { a, t, d, c } = shape
  const triangle = (points, x) => (x > 0 ? { points, base: x, area: 0.5 * x * t } : null)
  return {
    rect: { points: [[d, 0], [c, 0], [c, t], [d, t]], area: rectArea(c - d, t) },
    left: triangle([[0, 0], [d, 0], [d, t]], d),
    right: triangle([[c, 0], [a, 0], [c, t]], a - c),
  }
}

/**
 * Lapisan `doubleRotate`: salinan trapesium diputar 180° pada titik tengah BC,
 * sehingga keduanya membentuk jajargenjang dengan alas a + b dan tinggi t.
 */
export function doubleRotateParts(shape) {
  const { a, t, d, c } = shape
  const pivot = [(a + c) / 2, t / 2]
  const turn = ([px, py]) => [2 * pivot[0] - px, 2 * pivot[1] - py]
  const { A, B, C, D } = trapezoidMeasures(shape).points
  const base = a + (c - d)
  return {
    pivot,
    copy: { A: turn(A), B: turn(B), C: turn(C), D: turn(D) },
    parallelogram: { points: [A, [base, 0], [base + d, t], D], base, area: rectArea(base, t) },
  }
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
