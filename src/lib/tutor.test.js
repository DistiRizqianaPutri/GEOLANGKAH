import { describe, expect, it } from 'vitest'
import { askTutor, canAskTutor, MAX_QUESTIONS, readTutorCount, tutorPayload, writeTutorCount } from './tutor.js'

const step = {
  id: 'm3-latih-02',
  phase: 'latih',
  title: 'Lengkapi langkahnya',
  text: ['Isi kotak yang kosong.'],
  problem: { shape: 'trapezoid', a: 10, b: 6, t: 4, unit: 'cm' },
  answer: { value: 32, unit: 'cm²' },
}

describe('canAskTutor', () => {
  it('hanya setelah L2 dan soal belum selesai', () => {
    expect(canAskTutor({ max_hint_level: 1 })).toBe(false)
    expect(canAskTutor({ max_hint_level: 2 })).toBe(true)
    expect(canAskTutor({ max_hint_level: 3, done: true })).toBe(false)
    expect(canAskTutor(undefined)).toBe(false)
  })
})

describe('tutorPayload', () => {
  it('hanya data soal, tanpa kode/nama siswa', () => {
    const p = tutorPayload(step, { max_hint_level: 2, answer: '64' }, '  kenapa?  ', 1)
    expect(Object.keys(p).sort()).toEqual(
      ['answer', 'asked', 'hint_level', 'phase', 'problem', 'prompt', 'question', 'step_id', 'student_answer', 'title'].sort(),
    )
    expect(p).toMatchObject({ answer: 32, question: 'kenapa?', hint_level: 2, asked: 1, phase: 'latih' })
    expect(JSON.stringify(p)).not.toMatch(/S0\d|T01|nickname/)
  })
  it('jawaban identify (larik) tidak dikirim sebagai angka', () => {
    expect(tutorPayload({ ...step, answer: ['a', 'b'] }, {}, 'x', 0).answer).toBeNull()
  })
})

describe('hitungan pertanyaan per soal', () => {
  it('tersimpan per step id', () => {
    const mem = new Map()
    const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) }
    expect(readTutorCount(storage, 'a')).toBe(0)
    writeTutorCount(storage, 'a', MAX_QUESTIONS)
    expect(readTutorCount(storage, 'a')).toBe(5)
    expect(readTutorCount(storage, 'b')).toBe(0)
  })
})

describe('askTutor', () => {
  it('balasan sukses', async () => {
    const fetcher = async () => ({ ok: true, json: async () => ({ reply: 'Sisi mana yang sejajar?' }) })
    expect(await askTutor({}, fetcher)).toEqual({ reply: 'Sisi mana yang sejajar?' })
  })
  it('API gagal / jaringan putus → fallback', async () => {
    expect(await askTutor({}, async () => ({ ok: false, json: async () => ({}) }))).toEqual({ fallback: true })
    expect(await askTutor({}, async () => ({ ok: true, json: async () => ({ fallback: true }) }))).toEqual({ fallback: true })
    expect(
      await askTutor({}, async () => {
        throw new Error('offline')
      }),
    ).toEqual({ fallback: true })
  })
})
