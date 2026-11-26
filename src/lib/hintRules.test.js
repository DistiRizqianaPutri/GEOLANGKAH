import { describe, expect, it } from 'vitest'
import { canOpenHint, shouldOfferHint } from './hintRules.js'

// Aturan petunjuk KONTEN.md §7.
describe('canOpenHint', () => {
  it('L1 bisa dibuka kapan saja', () => {
    expect(canOpenHint(1, { opened: 0, attempts: 0 })).toBe(true)
  })
  it('L2 hanya setelah L1', () => {
    expect(canOpenHint(2, { opened: 0, attempts: 3 })).toBe(false)
    expect(canOpenHint(2, { opened: 1, attempts: 0 })).toBe(true)
  })
  it('L3 setelah L2 DAN minimal 1 percobaan', () => {
    expect(canOpenHint(3, { opened: 1, attempts: 5 })).toBe(false)
    expect(canOpenHint(3, { opened: 2, attempts: 0 })).toBe(false)
    expect(canOpenHint(3, { opened: 2, attempts: 1 })).toBe(true)
  })
  it('tingkat di luar 1–3 ditolak', () => {
    expect(canOpenHint(0, { opened: 0, attempts: 0 })).toBe(false)
    expect(canOpenHint(4, { opened: 3, attempts: 9 })).toBe(false)
  })
})

describe('shouldOfferHint (setelah 2× salah, L1 ditawarkan, tidak dipaksakan)', () => {
  it.each([
    [0, 0, false],
    [1, 0, false],
    [2, 0, true],
    [3, 0, true],
    [2, 1, false], // sudah membuka petunjuk
  ])('salah %i×, petunjuk dibuka %i → %s', (wrong, opened, offer) => {
    expect(shouldOfferHint({ wrong, opened })).toBe(offer)
  })
})
