import { describe, expect, it } from 'vitest'
import feedback from '../content/feedback.json'
import { feedbackText } from './feedback.js'

// Semua kode KONTEN.md §7 harus punya teks.
const CODES = [
  'E_LUPA_SETENGAH',
  'E_KAKI_SBG_TINGGI',
  'E_SATU_SISI',
  'E_KL_TERTUKAR',
  'E_SATUAN',
  'E_TINGGI_DI_KELILING',
  'E_SISI_KURANG',
  'E_SETENGAH_KELILING',
  'E_PYTHA_TAMBAH',
  'E_X_TIDAK_DIBAGI',
  'E_TIDAK_WAJAR',
  'E_LAIN',
  'E_KOTAK',
]

describe('feedbackText', () => {
  it.each(CODES)('%s punya teks ≤ 2 kalimat', (code) => {
    const text = feedbackText(code, { ask: 'area', unit: 'cm' })
    expect(text.length).toBeGreaterThan(0)
    expect(text.split(/[.!?](?:\s|$)/).filter((s) => s.trim()).length).toBeLessThanOrEqual(2)
    expect(text).not.toMatch(/\{unit\}/)
  })

  it('E_SATUAN mengikuti yang ditanya dan satuannya', () => {
    expect(feedbackText('E_SATUAN', { ask: 'area', unit: 'cm' })).toBe('Angkanya tepat! Luas memakai satuan persegi (cm²).')
    expect(feedbackText('E_SATUAN', { ask: 'area', unit: 'm' })).toBe('Angkanya tepat! Luas memakai satuan persegi (m²).')
    expect(feedbackText('E_SATUAN', { ask: 'perimeter', unit: 'cm' })).toBe(
      'Angkanya tepat! Keliling memakai satuan panjang (cm).',
    )
  })

  it('E_KL_TERTUKAR dua arah', () => {
    expect(feedbackText('E_KL_TERTUKAR', { ask: 'area' })).toMatch(/^Itu nilai keliling/)
    expect(feedbackText('E_KL_TERTUKAR', { ask: 'perimeter' })).toMatch(/^Itu nilai luas/)
  })

  it('teks §7 tidak diubah', () => {
    expect(feedbackText('E_TINGGI_DI_KELILING', {})).toBe('Tinggi bukan sisi trapesium, jadi tidak ikut dijumlahkan.')
    expect(feedbackText('E_LAIN', {})).toBe('Belum tepat. Mau lihat petunjuk?')
  })

  it('kode tak dikenal → teks E_LAIN', () => {
    expect(feedbackText('E_TIDAK_ADA', {})).toBe(feedback.E_LAIN.default)
  })
})
