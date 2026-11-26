import { describe, expect, it } from 'vitest'
import { parseNumber } from './answer.js'

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
