// Tes konten pertemuan: kunci jawaban = geometry.js, aturan teks DESIGN.md §9, format KONTEN.md §9.
import { describe, expect, it } from 'vitest'
import { templateKeys } from '../lib/checkStep.js'
import { figureModel } from '../lib/figureSpec.js'
import { diagnose, trapezoidMeasures } from '../lib/geometry.js'
import { flattenSteps } from '../lib/stepEngine.js'
import feedback from './feedback.json'
import formulas from './formulas.json'
import MEETINGS from './meetings.js'
import stations from './stations.json'

const TYPES = ['explain', 'explore', 'identify', 'faded', 'solve', 'why', 'challenge']
const LAYERS = ['grid', 'parallel', 'height', 'rightAngle', 'legs', 'labels', 'area', 'perimeter', 'decompose', 'doubleRotate']
const TARGETS = ['a', 'b', 's1', 's2', 't']
const ANSWERED = ['faded', 'solve']

/** Semua langkah mentah (termasuk semua soal identifikasi, bukan hanya yang terpilih). */
function rawSteps(meeting) {
  return meeting.phases.flatMap(({ phase, steps }) =>
    steps.flatMap((s) => (s.items ? s.items.map((item) => ({ ...s, ...item, items: undefined, phase })) : [{ ...s, phase }])),
  )
}

const sentences = (text) => text.split(/(?<=[.!?])\s+/).filter((s) => s.trim())
const words = (sentence) => sentence.trim().split(/\s+/)
const isSolve = (s) => ANSWERED.includes(s.type) || (s.type === 'challenge' && s.task !== 'identify')
const isIdentify = (s) => s.type === 'identify' || (s.type === 'challenge' && s.task === 'identify')

/** Semua string di sebuah objek (untuk cek emoji). */
const allStrings = (v) =>
  typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(allStrings) : []

describe.each(Object.entries(MEETINGS))('Pertemuan %s', (n, meeting) => {
  const steps = rawSteps(meeting)

  it('nomor pertemuan dan pos cocok', () => {
    expect(meeting.meeting).toBe(Number(n))
    expect(stations.find((s) => s.meeting === meeting.meeting)).toBeTruthy()
    expect(meeting.summary.length).toBeGreaterThan(0)
  })

  it('urutan fase Kenali → Bangun → Latih → Tantangan', () => {
    expect(meeting.phases.map((p) => p.phase)).toEqual(['kenali', 'bangun', 'latih', 'tantangan'])
  })

  it('id unik, berawalan mN-, tipe dikenal', () => {
    const ids = steps.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of steps) {
      expect(s.id.startsWith(`m${n}-`)).toBe(true)
      expect(TYPES).toContain(s.type)
    }
  })

  it('tepat 3 soal Tantangan Pos, semuanya bertipe challenge dengan id mN-tantangan-', () => {
    const challenge = meeting.phases.find((p) => p.phase === 'tantangan').steps
    expect(challenge).toHaveLength(3)
    for (const s of challenge) {
      expect(s.type).toBe('challenge')
      expect(s.id.startsWith(`m${n}-tantangan-`)).toBe(true)
    }
  })

  it('DESIGN §9: teks ≤ 3 kalimat, tiap kalimat ≤ 15 kata', () => {
    for (const s of steps) {
      const variantText = s.variants ? [s.variants.map((v) => v.text).sort((x, y) => y.length - x.length)[0]] : []
      const text = [...(s.text ?? []), ...variantText].join(' ')
      expect(sentences(text).length, s.id).toBeLessThanOrEqual(3)
      for (const sentence of sentences(text)) expect(words(sentence).length, `${s.id}: ${sentence}`).toBeLessThanOrEqual(15)
    }
  })

  it('DESIGN §8: layar belajar tanpa emoji', () => {
    for (const str of allStrings(meeting)) expect(str).not.toMatch(/\p{Extended_Pictographic}/u)
  })

  it('gambar sah: lapisan dikenal, ukuran bisa dibangun geometry.js', () => {
    for (const s of steps.filter((x) => x.figure)) {
      for (const layer of s.figure.layers) expect(LAYERS, s.id).toContain(layer)
      expect(() => figureModel(s.figure), s.id).not.toThrow()
      for (const v of s.variants ?? []) expect(() => figureModel({ ...s.figure, ...v })).not.toThrow()
    }
  })

  it('setiap soal hitung: kunci = geometry.js (diagnose → null), satuan tersedia', () => {
    for (const s of steps.filter(isSolve)) {
      expect(diagnose(s.problem, s.answer.value, s.answer.unit), s.id).toBeNull()
      expect(s.units, s.id).toContain(s.answer.unit)
      expect(s.answerLabel, s.id).toBeTruthy()
    }
  })

  it('angka gambar = angka soal (a, b, t, kaki)', () => {
    for (const s of steps.filter((x) => isSolve(x) && x.figure)) {
      const { problem, figure } = s
      if (problem.shape === 'rect') {
        expect([figure.p, figure.l], s.id).toEqual([problem.p, problem.l])
        continue
      }
      const m = trapezoidMeasures(figureModel(figure))
      expect([m.a, m.b, m.t], s.id).toEqual([problem.a, problem.b, problem.t])
      expect(m.s1, s.id).toBeCloseTo(problem.s1, 9)
      expect(m.s2, s.id).toBeCloseTo(problem.s2, 9)
    }
  })

  it('templat memudar: setiap kotak punya nilai di problem', () => {
    for (const s of steps.filter((x) => x.type === 'faded')) {
      const keys = templateKeys(s.template)
      expect(keys.length, s.id).toBeGreaterThan(0)
      for (const k of keys) expect(Number.isFinite(s.problem[k]), `${s.id}: ${k}`).toBe(true)
    }
  })

  it('petunjuk 3 tingkat di setiap soal', () => {
    for (const s of steps.filter((x) => isSolve(x) || isIdentify(x))) {
      expect(s.hints, s.id).toHaveLength(3)
    }
  })

  it('pilihan ganda: tepat satu benar, setiap opsi punya umpan balik', () => {
    for (const s of steps.filter((x) => x.question)) {
      expect(s.question.options.filter((o) => o.correct === true), s.id).toHaveLength(1)
      for (const o of s.question.options) expect(o.feedback, s.id).toBeTruthy()
    }
    for (const s of steps.filter((x) => x.type === 'why' || (x.type === 'explore' && x.question))) {
      expect(s.question.prompt).toBeTruthy()
    }
  })

  it('identifikasi: jawaban memakai unsur yang ada di gambar', () => {
    for (const s of steps.filter(isIdentify)) {
      expect(['parallel', 'height']).toContain(s.ask)
      for (const k of s.answer) expect(TARGETS).toContain(k)
      if (s.answer.includes('t')) expect(s.figure.layers, s.id).toContain('height')
      if (s.answer.includes('t')) expect(s.figure.kind, s.id).not.toBe('right')
    }
  })

  it('KONTEN §10: pengecoh Tantangan terdeteksi dengan kode yang benar', () => {
    for (const s of steps.filter((x) => x.distractors)) {
      for (const d of s.distractors) {
        expect(diagnose(s.problem, d.value, d.unit), `${s.id}: ${d.value}`).toBe(d.code)
        expect(feedback[d.code]).toBeTruthy()
      }
    }
  })

  it('soal identifikasi acak: 3 soal, sama untuk seed yang sama', () => {
    const pick = (seed) => flattenSteps(meeting, seed).map((s) => s.id)
    expect(pick('S01-m' + n)).toEqual(pick('S01-m' + n))
    for (const s of meeting.phases.flatMap((p) => p.steps).filter((x) => x.items)) {
      expect(s.items.length).toBeGreaterThanOrEqual(s.pick)
    }
  })
})

describe('KONTEN §10 Tantangan ① dan ② (angka)', () => {
  const answers = (n) =>
    MEETINGS[n].phases
      .find((p) => p.phase === 'tantangan')
      .steps.map((s) => (s.task === 'identify' ? s.answer.join() : `${s.answer.value} ${s.answer.unit}`))
  it('①: 30 cm · 120 cm² · 48 m²', () => expect(answers(1)).toEqual(['30 cm', '120 cm²', '48 m²']))
  it('②: sisi tegak (AD) · 42 cm · 48 cm', () => expect(answers(2)).toEqual(['s1', '42 cm', '48 cm']))
})

describe('stations & formulas', () => {
  it('5 pos sesuai KONTEN §1', () => {
    expect(stations.map((s) => s.name)).toEqual([
      'Kebun Persegi Panjang',
      'Jembatan Trapesium',
      'Sawah Trapesium',
      'Bukit Pythagoras',
      'Pasar Desa',
    ])
  })
  it('rumus baku KONTEN §1', () => {
    expect(formulas.map((f) => f.formula)).toContain('K = 2 × (p + l)')
    expect(formulas.map((f) => f.formula)).toContain('L = p × l')
    expect(formulas.map((f) => f.formula)).toContain('L = ½ × (a + b) × t')
  })
})
