import { describe, expect, it } from 'vitest'
import {
  askedKey,
  askedText,
  knownText,
  missingKnown,
  moveToKnown,
  rejectResult,
  splitSegment,
  storyComplete,
  storyResult,
} from './story.js'

const step = {
  id: 'mX-cerita',
  segments: [
    {
      text: 'Sawah Pak Darto berbentuk trapesium siku-siku.',
      chips: [{ id: 'nama', text: 'Pak Darto', feedback: 'Nama pemilik tidak dipakai untuk menghitung.' }],
    },
    {
      text: 'Sisi yang sejajar panjangnya 20 m dan 12 m.',
      chips: [
        { id: 'b', text: '12 m', known: { key: 'b', label: 'b', value: 12, unit: 'm' } },
        { id: 'a', text: '20 m', known: { key: 'a', label: 'a', value: 20, unit: 'm' } },
      ],
    },
    {
      text: 'Setiap 10 m² butuh 1 kg pupuk.',
      chips: [{ id: 'pupuk', text: '10 m²', known: { key: 'convert', label: 'pupuk', value: 10, unit: 'm²', text: '1 kg tiap 10 m²' } }],
    },
  ],
  asked: [
    {
      label: 'Pagar',
      question: {
        prompt: 'Pagar: keliling atau luas?',
        options: [
          { text: 'Keliling', correct: true, feedback: 'Tepat!' },
          { text: 'Luas', correct: false, feedback: 'Belum tepat.' },
        ],
      },
    },
  ],
}

describe('splitSegment', () => {
  it('chip dipotong sesuai urutan di teks', () => {
    expect(splitSegment(step.segments[1])).toEqual([
      { text: 'Sisi yang sejajar panjangnya ' },
      { chip: step.segments[1].chips[1] },
      { text: ' dan ' },
      { chip: step.segments[1].chips[0] },
      { text: '.' },
    ])
  })
  it('tanpa chip → satu teks', () => {
    expect(splitSegment({ text: 'Halo.' })).toEqual([{ text: 'Halo.' }])
  })
  it('chip yang tidak ada di teks diabaikan', () => {
    expect(splitSegment({ text: 'Halo.', chips: [{ id: 'x', text: 'tidak ada' }] })).toEqual([{ text: 'Halo.' }])
  })
})

describe('knownText', () => {
  it('angka + satuan', () => expect(knownText({ label: 'a', value: 20, unit: 'm' })).toBe('a = 20 m'))
  it('rupiah', () => expect(knownText({ label: 'biaya', value: 15000, unit: 'Rp' })).toBe('biaya = Rp15.000'))
  it('teks bebas', () => expect(knownText(step.segments[2].chips[0].known)).toBe('pupuk: 1 kg tiap 10 m²'))
})

describe('moveToKnown', () => {
  it('info penting masuk tabel, urutan mengikuti cerita, tanpa dobel', () => {
    const r1 = moveToKnown(step, [], ['b'])
    const r2 = moveToKnown(step, r1.marked, ['a', 'b'])
    expect(r2.marked).toEqual(['b', 'a'])
    expect(r2.rejected).toEqual([])
  })
  it('pengecoh ditolak dengan umpan baliknya', () => {
    const r = moveToKnown(step, [], ['nama', 'a'])
    expect(r.marked).toEqual(['a'])
    expect(r.rejected.map((c) => c.id)).toEqual(['nama'])
    expect(rejectResult(r.rejected[0])).toEqual({
      correct: false,
      errorCode: 'E_LAIN',
      answer: 'Pak Darto',
      feedback: 'Nama pemilik tidak dipakai untuk menghitung.',
    })
  })
})

describe('storyComplete (gerbang Lanjut)', () => {
  const all = ['b', 'a', 'pupuk']
  it('belum lengkap bila ada info penting yang belum dipindah', () => {
    expect(missingKnown(step, ['a']).map((c) => c.id)).toEqual(['b', 'pupuk'])
    expect(storyComplete(step, ['a'], { [askedKey(step, 0)]: { done: true } })).toBe(false)
  })
  it('belum lengkap bila Ditanya belum dijawab benar', () => {
    expect(storyComplete(step, all, {})).toBe(false)
  })
  it('lengkap: semua info + semua Ditanya', () => {
    expect(storyComplete(step, all, { 'mX-cerita#ditanya-1': { done: true } })).toBe(true)
  })
  it('baris yang dihapus (dikoreksi) membuat belum lengkap lagi', () => {
    expect(storyComplete(step, all.filter((id) => id !== 'a'), { 'mX-cerita#ditanya-1': { done: true } })).toBe(false)
  })
})

describe('askedText & storyResult', () => {
  it('Ditanya terisi dari opsi benar', () => expect(askedText(step.asked[0])).toBe('Pagar: keliling'))
  it('jawaban tercatat = isi Diketahui', () => {
    expect(storyResult(step, ['a', 'b'])).toEqual({ correct: true, errorCode: null, answer: 'a = 20 m; b = 12 m' })
  })
})
