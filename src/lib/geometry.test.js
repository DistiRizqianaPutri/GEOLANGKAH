// Tes geometry.js — semua kunci jawaban KONTEN.md dan semua kode kesalahan §7.
// Jika angka di KONTEN.md berubah, tabel di file ini wajib ikut diperbarui.
import { describe, expect, it } from 'vitest'
import {
  checkAnswer,
  diagnose,
  heightFromLeg,
  legFromHeight,
  offsetX,
  rectArea,
  rectPerimeter,
  trapezoidArea,
  trapezoidPerimeter,
} from './geometry.js'

// ---------------------------------------------------------------------------
// 1. Fungsi dasar — kunci Latih per pertemuan
// ---------------------------------------------------------------------------

describe('Pertemuan 1 — persegi panjang (KONTEN §2)', () => {
  it.each([
    // p, l, K, L
    [8, 5, 26, 40], // contoh lengkap
    [10, 5, 30, 50], // memudar 1 kosong
    [12, 7, 38, 84], // memudar 2 kosong
    [9, 6, 30, 54], // mandiri
    [6, 4, 20, 24], // Kenali: 6 × 4 petak
  ])('p = %i, l = %i → K = %i, L = %i', (p, l, K, L) => {
    expect(rectPerimeter(p, l)).toBe(K)
    expect(rectArea(p, l)).toBe(L)
  })
})

describe('Pertemuan 2 — keliling trapesium (KONTEN §3)', () => {
  it.each([
    // a, b, s1, s2, K
    [16, 10, 5, 5, 36], // sama kaki
    [12, 7, 12, 13, 44], // siku-siku: sisi tegak 12, kaki miring 13
    [24, 10, 13, 15, 62], // sembarang
  ])('a = %i, b = %i, kaki %i & %i → K = %i', (a, b, s1, s2, K) => {
    expect(trapezoidPerimeter(a, b, s1, s2)).toBe(K)
  })
})

describe('Pertemuan 3 — luas trapesium (KONTEN §4)', () => {
  it.each([
    // a, b, t, L
    [16, 10, 4, 52], // contoh lengkap
    [10, 6, 4, 32], // memudar 1 kosong
    [18, 12, 8, 120], // memudar 2 kosong
    [22, 10, 8, 128], // mandiri + pengecoh (bukan 160)
    [12, 7, 12, 114], // siku-siku
  ])('a = %i, b = %i, t = %i → L = %i', (a, b, t, L) => {
    expect(trapezoidArea(a, b, t)).toBe(L)
  })

  it('Bangun: jajargenjang 26 × 4 = 104, satu trapesium = 52', () => {
    expect(rectArea(16 + 10, 4)).toBe(104)
    expect(trapezoidArea(16, 10, 4)).toBe(104 / 2)
  })

  it('Cara kedua: persegi panjang 10 × 4 + dua segitiga ½ × 3 × 4 = 52', () => {
    const x = offsetX(16, 10, 'isosceles')
    expect(x).toBe(3)
    const segitiga = trapezoidArea(x, 0, 4) // ½ × 3 × 4
    expect(segitiga).toBe(6)
    expect(rectArea(10, 4) + 2 * segitiga).toBe(trapezoidArea(16, 10, 4))
  })
})

describe('Pertemuan 4 — mencari tinggi (KONTEN §5)', () => {
  it.each([
    // kind, a, b, s, x, t, L, K (null = tidak diminta)
    ['isosceles', 16, 10, 5, 3, 4, 52, null],
    ['isosceles', 22, 10, 10, 6, 8, 128, null],
    ['right', 12, 7, 13, 5, 12, 114, null],
    ['isosceles', 30, 14, 17, 8, 15, 330, 78],
    ['right', 20, 12, 17, 8, 15, 240, 64],
  ])('%s a = %i, b = %i, s = %i → x = %i, t = %i, L = %i', (kind, a, b, s, x, t, L, K) => {
    expect(offsetX(a, b, kind)).toBe(x)
    expect(heightFromLeg(s, x)).toBe(t)
    expect(legFromHeight(t, x)).toBe(s)
    expect(trapezoidArea(a, b, t)).toBe(L)
    if (K !== null) {
      // siku-siku: sisi tegak = tinggi; sama kaki: dua kaki sama
      const s1 = kind === 'right' ? t : s
      expect(trapezoidPerimeter(a, b, s1, s)).toBe(K)
    }
  })

  it.each([
    [5, 3, 4],
    [10, 6, 8],
    [13, 5, 12],
    [17, 8, 15],
  ])('tripel Pythagoras: s = %i, x = %i → t = %i', (s, x, t) => {
    expect(heightFromLeg(s, x)).toBe(t)
  })
})

describe('Pertemuan 5 — soal cerita (KONTEN §6)', () => {
  it('Soal 1 sawah: pagar 64 m, pupuk 24 kg', () => {
    expect(trapezoidPerimeter(20, 12, 15, 17)).toBe(64)
    expect(trapezoidArea(20, 12, 15)).toBe(240)
    expect(trapezoidArea(20, 12, 15) / 10).toBe(24)
  })

  it('Soal 2 taman: x = 8, t = 15, L = 330 m², biaya Rp4.950.000', () => {
    const x = offsetX(30, 14, 'isosceles')
    const t = heightFromLeg(17, x)
    expect(x).toBe(8)
    expect(t).toBe(15)
    expect(trapezoidArea(30, 14, t)).toBe(330)
    expect(trapezoidArea(30, 14, t) * 15000).toBe(4950000)
  })

  it('Soal 3 karton: pita 52 cm, t = 8, L = 128 cm²', () => {
    expect(trapezoidPerimeter(22, 10, 10, 10)).toBe(52)
    const t = heightFromLeg(10, offsetX(22, 10, 'isosceles'))
    expect(t).toBe(8)
    expect(trapezoidArea(22, 10, t)).toBe(128)
  })
})

// ---------------------------------------------------------------------------
// 2. Kasus tidak wajar
// ---------------------------------------------------------------------------

describe('kasus tidak wajar', () => {
  it('heightFromLeg melempar error bila s = x', () => {
    expect(() => heightFromLeg(5, 5)).toThrow()
  })

  it('heightFromLeg melempar error bila s < x', () => {
    expect(() => heightFromLeg(3, 4)).toThrow()
  })

  it('offsetX melempar error untuk trapesium sembarang', () => {
    expect(() => offsetX(24, 10, 'scalene')).toThrow()
  })
})

// ---------------------------------------------------------------------------
// 3. checkAnswer — toleransi ±0,01 + satuan
// ---------------------------------------------------------------------------

describe('checkAnswer', () => {
  it('benar bila angka dan satuan tepat', () => {
    expect(checkAnswer(52, 'cm²', { value: 52, unit: 'cm²' })).toEqual({
      correct: true,
      valueOk: true,
      unitOk: true,
    })
  })

  it('menerima selisih ≤ 0,01', () => {
    expect(checkAnswer(8.3, 'cm', { value: Math.sqrt(69), unit: 'cm' }).valueOk).toBe(true)
    expect(checkAnswer(52.01, 'cm²', { value: 52, unit: 'cm²' }).correct).toBe(true)
  })

  it('menolak selisih > 0,01', () => {
    expect(checkAnswer(52.02, 'cm²', { value: 52, unit: 'cm²' }).valueOk).toBe(false)
  })

  it('angka benar tetapi satuan salah', () => {
    expect(checkAnswer(52, 'cm', { value: 52, unit: 'cm²' })).toEqual({
      correct: false,
      valueOk: true,
      unitOk: false,
    })
  })

  it('satuan kosong dianggap salah', () => {
    expect(checkAnswer(52, '', { value: 52, unit: 'cm²' }).unitOk).toBe(false)
    expect(checkAnswer(52, undefined, { value: 52, unit: 'cm²' }).correct).toBe(false)
  })

  it('angka tidak valid (NaN) tidak pernah benar', () => {
    expect(checkAnswer(NaN, 'cm²', { value: 52, unit: 'cm²' }).valueOk).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 4. Tantangan Pos (KONTEN §10) — kunci → null, pengecoh → kode
// ---------------------------------------------------------------------------

const pos = {
  p1Keliling: { shape: 'rect', ask: 'perimeter', unit: 'cm', p: 11, l: 4 },
  p1Luas: { shape: 'rect', ask: 'area', unit: 'cm', p: 15, l: 8 },
  p1Karpet: { shape: 'rect', ask: 'area', unit: 'm', p: 8, l: 6 },
  p2SikuSiku: { shape: 'trapezoid', kind: 'right', ask: 'perimeter', unit: 'cm', a: 15, b: 9, t: 8, s1: 8, s2: 10 },
  p2SamaKaki: { shape: 'trapezoid', kind: 'isosceles', ask: 'perimeter', unit: 'cm', a: 20, b: 8, t: 8, s1: 10, s2: 10 },
  p3Luas: { shape: 'trapezoid', ask: 'area', unit: 'cm', a: 14, b: 6, t: 5 },
  p3SamaKaki: { shape: 'trapezoid', kind: 'isosceles', ask: 'area', unit: 'cm', a: 20, b: 8, t: 8, s1: 10, s2: 10 },
  p3SikuSiku: { shape: 'trapezoid', kind: 'right', ask: 'area', unit: 'cm', a: 15, b: 9, t: 8 },
  p4Tinggi: { shape: 'trapezoid', kind: 'isosceles', ask: 'height', unit: 'cm', a: 26, b: 16, s1: 13, s2: 13 },
  p4Luas: { shape: 'trapezoid', kind: 'isosceles', ask: 'area', unit: 'cm', a: 26, b: 16, s1: 13, s2: 13 },
  p4SikuSiku: { shape: 'trapezoid', kind: 'right', ask: 'area', unit: 'cm', a: 21, b: 15, s2: 10 },
  p5Kolam: { shape: 'trapezoid', kind: 'right', ask: 'perimeter', unit: 'm', a: 9, b: 5, s2: 5 },
  p5TaplakKeliling: { shape: 'trapezoid', kind: 'isosceles', ask: 'perimeter', unit: 'cm', a: 25, b: 9, s1: 17, s2: 17 },
  p5TaplakLuas: { shape: 'trapezoid', kind: 'isosceles', ask: 'area', unit: 'cm', a: 25, b: 9, s1: 17, s2: 17 },
}

describe('Tantangan Pos ⑤ — taplak meja (KONTEN §10)', () => {
  it('25/9/17: K = 68 cm, x = 8, t = 15, L = 255 cm²', () => {
    expect(trapezoidPerimeter(25, 9, 17, 17)).toBe(68)
    const x = offsetX(25, 9, 'isosceles')
    expect(x).toBe(8)
    const t = heightFromLeg(17, x)
    expect(t).toBe(15)
    expect(trapezoidArea(25, 9, t)).toBe(255)
  })
})

describe('Tantangan Pos — kunci dinilai benar', () => {
  it.each([
    ['① keliling 11 × 4', pos.p1Keliling, 30, 'cm'],
    ['① luas 15 × 8', pos.p1Luas, 120, 'cm²'],
    ['① karpet 8 × 6', pos.p1Karpet, 48, 'm²'],
    ['② siku-siku 15/9/8/10', pos.p2SikuSiku, 42, 'cm'],
    ['② sama kaki 20/8/10', pos.p2SamaKaki, 48, 'cm'],
    ['③ 14/6/5', pos.p3Luas, 50, 'cm²'],
    ['③ sama kaki 20/8/10, t = 8', pos.p3SamaKaki, 112, 'cm²'],
    ['③ siku-siku 15/9/8', pos.p3SikuSiku, 96, 'cm²'],
    ['④ tinggi 26/16/13', pos.p4Tinggi, 12, 'cm'],
    ['④ luas 26/16/13', pos.p4Luas, 252, 'cm²'],
    ['④ siku-siku 21/15/10', pos.p4SikuSiku, 144, 'cm²'],
    ['⑤ kolam 9/5/5', pos.p5Kolam, 22, 'm'],
    ['⑤ taplak keliling 25/9/17', pos.p5TaplakKeliling, 68, 'cm'],
    ['⑤ taplak luas 25/9/17', pos.p5TaplakLuas, 255, 'cm²'],
  ])('%s → %s %s', (_label, problem, value, unit) => {
    expect(diagnose(problem, value, unit)).toBeNull()
  })
})

describe('Tantangan Pos — pengecoh terdeteksi', () => {
  it.each([
    ['① 44 (luas)', pos.p1Keliling, 44, 'cm', 'E_KL_TERTUKAR'],
    ['① 15 (setengah keliling)', pos.p1Keliling, 15, 'cm', 'E_SETENGAH_KELILING'],
    ['① 46 (keliling)', pos.p1Luas, 46, 'cm²', 'E_KL_TERTUKAR'],
    ['① 28 m (keliling)', pos.p1Karpet, 28, 'm', 'E_KL_TERTUKAR'],
    ['② 34 (3 sisi)', pos.p2SikuSiku, 34, 'cm', 'E_SISI_KURANG'],
    ['② 56 (+ tinggi)', pos.p2SamaKaki, 56, 'cm', 'E_TINGGI_DI_KELILING'],
    ['③ 100 (lupa ½)', pos.p3Luas, 100, 'cm²', 'E_LUPA_SETENGAH'],
    ['③ 140 (kaki sbg tinggi)', pos.p3SamaKaki, 140, 'cm²', 'E_KAKI_SBG_TINGGI'],
    ['③ 192 (lupa ½)', pos.p3SikuSiku, 192, 'cm²', 'E_LUPA_SETENGAH'],
    ['④ ≈ 8,3 (x tidak dibagi)', pos.p4Tinggi, 8.3, 'cm', 'E_X_TIDAK_DIBAGI'],
    ['④ 273 (kaki sbg tinggi)', pos.p4Luas, 273, 'cm²', 'E_KAKI_SBG_TINGGI'],
    ['④ 180 (kaki sbg tinggi)', pos.p4SikuSiku, 180, 'cm²', 'E_KAKI_SBG_TINGGI'],
    ['⑤ 19 (3 sisi)', pos.p5Kolam, 19, 'm', 'E_SISI_KURANG'],
    ['⑤ 83 (+ tinggi)', pos.p5TaplakKeliling, 83, 'cm', 'E_TINGGI_DI_KELILING'],
    ['⑤ 289 (kaki sbg tinggi)', pos.p5TaplakLuas, 289, 'cm²', 'E_KAKI_SBG_TINGGI'],
    ['⑤ 510 (lupa ½)', pos.p5TaplakLuas, 510, 'cm²', 'E_LUPA_SETENGAH'],
  ])('%s → %s', (_label, problem, value, unit, code) => {
    expect(diagnose(problem, value, unit)).toBe(code)
  })
})

// ---------------------------------------------------------------------------
// 5. Setiap kode kesalahan §7 (yang belum muncul di §10 dibuat dari soal Latih)
// ---------------------------------------------------------------------------

const latih = {
  // P3 contoh lengkap: sama kaki a = 16, b = 10, kaki 5, t = 4
  luas16: { shape: 'trapezoid', kind: 'isosceles', ask: 'area', unit: 'cm', a: 16, b: 10, t: 4, s1: 5, s2: 5 },
  // P1 contoh lengkap: 8 × 5
  keliling8x5: { shape: 'rect', ask: 'perimeter', unit: 'cm', p: 8, l: 5 },
  // P2 sembarang: 24/10, kaki 13 & 15, t = 12
  sembarang: { shape: 'trapezoid', kind: 'scalene', ask: 'perimeter', unit: 'cm', a: 24, b: 10, t: 12, s1: 13, s2: 15 },
  // P4 memudar: sama kaki 22/10/10
  tinggi22: { shape: 'trapezoid', kind: 'isosceles', ask: 'height', unit: 'cm', a: 22, b: 10, s1: 10, s2: 10 },
  // P4 mandiri: sama kaki 30/14/17
  tinggi30: { shape: 'trapezoid', kind: 'isosceles', ask: 'height', unit: 'cm', a: 30, b: 14, s1: 17, s2: 17 },
  x30: { shape: 'trapezoid', kind: 'isosceles', ask: 'offset', unit: 'cm', a: 30, b: 14, s1: 17, s2: 17 },
  // P4 mandiri: siku-siku 20/12/17
  tinggiSiku20: { shape: 'trapezoid', kind: 'right', ask: 'height', unit: 'cm', a: 20, b: 12, s2: 17 },
}

describe('kode kesalahan KONTEN §7', () => {
  it('E_LUPA_SETENGAH: (a + b) × t', () => {
    expect(diagnose(latih.luas16, 104, 'cm²')).toBe('E_LUPA_SETENGAH')
  })

  it('E_KAKI_SBG_TINGGI: ½ × (a + b) × s', () => {
    expect(diagnose(latih.luas16, 65, 'cm²')).toBe('E_KAKI_SBG_TINGGI')
  })

  it('E_SATU_SISI: ½ × a × t atau ½ × b × t', () => {
    expect(diagnose(latih.luas16, 32, 'cm²')).toBe('E_SATU_SISI')
    expect(diagnose(latih.luas16, 20, 'cm²')).toBe('E_SATU_SISI')
  })

  it('E_KL_TERTUKAR: keliling saat ditanya luas (trapesium)', () => {
    expect(diagnose(latih.luas16, 36, 'cm')).toBe('E_KL_TERTUKAR')
  })

  it('E_KL_TERTUKAR: luas saat ditanya keliling (persegi panjang)', () => {
    expect(diagnose(latih.keliling8x5, 40, 'cm²')).toBe('E_KL_TERTUKAR')
  })

  it('E_SATUAN: angka benar, satuan salah', () => {
    expect(diagnose(latih.luas16, 52, 'cm')).toBe('E_SATUAN')
    expect(diagnose(latih.keliling8x5, 26, 'cm²')).toBe('E_SATUAN')
    expect(diagnose(latih.luas16, 52, '')).toBe('E_SATUAN')
  })

  it('E_TINGGI_DI_KELILING: K + t pada trapesium sembarang', () => {
    expect(diagnose(latih.sembarang, 74, 'cm')).toBe('E_TINGGI_DI_KELILING')
  })

  it('E_SISI_KURANG: setiap kombinasi 3 sisi', () => {
    // 24 + 10 + 13 + 15 = 62; tanpa satu sisi: 38, 52, 47, 49
    for (const value of [38, 52, 47, 49]) {
      expect(diagnose(latih.sembarang, value, 'cm')).toBe('E_SISI_KURANG')
    }
  })

  it('E_SETENGAH_KELILING: p + l', () => {
    expect(diagnose(latih.keliling8x5, 13, 'cm')).toBe('E_SETENGAH_KELILING')
  })

  it('E_PYTHA_TAMBAH: t = √(s² + x²)', () => {
    expect(diagnose(latih.tinggi22, Math.sqrt(136), 'cm')).toBe('E_PYTHA_TAMBAH')
    expect(diagnose(latih.tinggiSiku20, Math.sqrt(289 + 64), 'cm')).toBe('E_PYTHA_TAMBAH')
  })

  it('E_X_TIDAK_DIBAGI: x = a − b pada sama kaki (tinggi dan x)', () => {
    expect(diagnose(latih.tinggi30, Math.sqrt(289 - 256), 'cm')).toBe('E_X_TIDAK_DIBAGI')
    expect(diagnose(latih.x30, 16, 'cm')).toBe('E_X_TIDAK_DIBAGI')
  })

  it('E_X_TIDAK_DIBAGI tidak berlaku pada siku-siku (x = a − b memang benar)', () => {
    const xSiku = { ...latih.tinggiSiku20, ask: 'offset' }
    expect(diagnose(xSiku, 8, 'cm')).toBeNull()
  })

  it('E_TIDAK_WAJAR: t ≥ s', () => {
    expect(diagnose(latih.tinggi30, 20, 'cm')).toBe('E_TIDAK_WAJAR')
    expect(diagnose(latih.tinggi30, 17, 'cm')).toBe('E_TIDAK_WAJAR')
  })

  it('E_TIDAK_WAJAR: hasil nol atau negatif', () => {
    expect(diagnose(latih.luas16, 0, 'cm²')).toBe('E_TIDAK_WAJAR')
    expect(diagnose(latih.keliling8x5, -5, 'cm')).toBe('E_TIDAK_WAJAR')
  })

  it('E_LAIN: tidak cocok pola apa pun', () => {
    expect(diagnose(latih.luas16, 47, 'cm²')).toBe('E_LAIN')
    expect(diagnose(latih.keliling8x5, 99, 'cm')).toBe('E_LAIN')
  })
})

describe('urutan prioritas diagnose()', () => {
  it('jawaban benar → null', () => {
    expect(diagnose(latih.luas16, 52, 'cm²')).toBeNull()
    expect(diagnose(latih.tinggi30, 15, 'cm')).toBeNull()
    expect(diagnose(latih.x30, 8, 'cm')).toBeNull()
  })

  it('pola spesifik menang atas E_TIDAK_WAJAR (√(s² + x²) > s)', () => {
    const t = Math.sqrt(136)
    expect(t).toBeGreaterThan(10)
    expect(diagnose(latih.tinggi22, t, 'cm')).toBe('E_PYTHA_TAMBAH')
  })

  it('satuan diabaikan saat mencocokkan pola', () => {
    expect(diagnose(latih.luas16, 104, 'cm')).toBe('E_LUPA_SETENGAH')
  })
})
