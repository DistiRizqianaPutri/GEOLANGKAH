import { describe, expect, it } from 'vitest'
import { parseAnswer, parseNumber, parseRupiah } from './answer.js'

describe('parseNumber (AnswerInput menerima koma maupun titik, DESIGN §3)', () => {
  it.each([
    ['26', 26],
    ['6,1', 6.1],
    ['6.1', 6.1],
    [' 52 ', 52],
    ['0,5', 0.5],
    [',5', 0.5],
    ['-3', -3],
    ['1.000', 1], // titik = desimal, bukan pemisah ribuan
  ])('"%s" → %f', (raw, value) => {
    expect(parseNumber(raw)).toBe(value)
  })

  it.each(['', '   ', 'abc', '6,1,2', '5 cm', '1e3', undefined, null])('"%s" → null', (raw) => {
    expect(parseNumber(raw)).toBeNull()
  })
})

describe('parseRupiah (format Indonesia: titik = ribuan, koma = desimal)', () => {
  it.each([
    ['4950000', 4950000],
    ['4.950.000', 4950000],
    ['Rp4.950.000', 4950000],
    ['Rp 4.950.000', 4950000],
    ['rp4950000', 4950000],
    [' Rp  15.000 ', 15000],
    ['500', 500],
    ['4.950.000,50', 4950000.5],
  ])('"%s" → %f', (raw, value) => {
    expect(parseRupiah(raw)).toBe(value)
  })

  it.each(['', 'Rp', '4.95', '4.9500.000', '49.50.000', '4,950,000', 'Rp-5', '4.950.000 Rp', 'abc', undefined, null])(
    '"%s" → null',
    (raw) => {
      expect(parseRupiah(raw)).toBeNull()
    },
  )
})

describe('parseAnswer (sesuai satuan)', () => {
  it('satuan Rp: titik = pemisah ribuan', () => {
    expect(parseAnswer('4.950.000', 'Rp')).toBe(4950000)
    expect(parseAnswer('4.950', 'Rp')).toBe(4950)
  })
  it('isian berawalan "Rp" dibaca sebagai rupiah walau satuan belum/bukan Rp', () => {
    expect(parseAnswer('Rp 4.950.000', null)).toBe(4950000)
    expect(parseAnswer('Rp4.950.000', 'm²')).toBe(4950000)
  })
  it('satuan lain: koma dan titik tetap desimal', () => {
    expect(parseAnswer('6,4', 'kg')).toBe(6.4)
    expect(parseAnswer('8.3', 'cm')).toBe(8.3)
    expect(parseAnswer('1.000', 'cm')).toBe(1)
    expect(parseAnswer('4.950.000', 'm²')).toBeNull()
    expect(parseAnswer('4.950.000', null)).toBeNull()
  })
})
