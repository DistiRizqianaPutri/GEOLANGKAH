// Tes konten pertemuan: kunci jawaban = geometry.js, aturan teks DESIGN.md §9, format KONTEN.md §9.
import { describe, expect, it } from 'vitest'
import { templateKeys, templateValue } from '../lib/checkStep.js'
import { figureModel } from '../lib/figureSpec.js'
import { diagnose, formatAnswer, solveProblem, trapezoidMeasures } from '../lib/geometry.js'
import { flattenSteps } from '../lib/stepEngine.js'
import { allChips, knownChips } from '../lib/story.js'
import feedback from './feedback.json'
import formulas from './formulas.json'
import MEETINGS from './meetings.js'
import stations from './stations.json'

const TYPES = ['explain', 'explore', 'identify', 'faded', 'solve', 'why', 'challenge', 'story']
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
      // Soal cerita: setiap potongan dibaca sendiri-sendiri (mode baca ringkas).
      for (const block of [text, ...(s.segments ?? []).map((seg) => seg.text)]) {
        expect(sentences(block).length, s.id).toBeLessThanOrEqual(3)
        for (const sentence of sentences(block)) expect(words(sentence).length, `${s.id}: ${sentence}`).toBeLessThanOrEqual(15)
      }
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

  it('label tersembunyi (hideLabels) hanya untuk unsur yang tampil di gambar', () => {
    for (const s of steps.filter((x) => x.figure?.hideLabels)) {
      const { shape, layers, hideLabels } = s.figure
      expect(layers, s.id).toContain('labels')
      for (const key of hideLabels) {
        if (shape === 'triangle') expect(['x', 't', 's'], s.id).toContain(key)
        else if (key === 't') expect(layers, s.id).toContain('height')
        else if (key === 's1' || key === 's2') expect(layers, s.id).toContain('legs')
        else expect(['a', 'b'], s.id).toContain(key)
      }
    }
  })

  it('setiap answer di JSON = hasil geometry.js (nilai dan satuan), satuan tersedia', () => {
    const solved = steps.filter(isSolve)
    expect(solved.length).toBeGreaterThan(0)
    for (const s of solved) {
      const key = solveProblem(s.problem)
      expect(Number.isFinite(key.answer), s.id).toBe(true)
      expect(s.answer.value, s.id).toBeCloseTo(key.answer, 9)
      expect(s.answer.unit, s.id).toBe(key.unit)
      expect(diagnose(s.problem, s.answer.value, s.answer.unit), s.id).toBeNull()
      expect(s.units, s.id).toContain(s.answer.unit)
      expect(s.answerLabel, s.id).toBeTruthy()
    }
  })

  it('angka gambar = angka soal yang dihitung geometry.js (a, b, t, kaki)', () => {
    for (const s of steps.filter((x) => isSolve(x) && x.figure)) {
      const { problem, figure } = s
      const key = solveProblem(problem)
      if (problem.shape === 'rect') {
        expect([figure.p, figure.l], s.id).toEqual([key.p, key.l])
        continue
      }
      expect(figure.kind, s.id).toBe(problem.kind)
      const m = trapezoidMeasures(figureModel(figure))
      expect([m.a, m.b], s.id).toEqual([key.a, key.b])
      expect(m.t, s.id).toBeCloseTo(key.t, 9)
      expect(m.s1, s.id).toBeCloseTo(key.s1, 9)
      expect(m.s2, s.id).toBeCloseTo(key.s2, 9)
    }
  })

  it('templat memudar: setiap kotak bernilai dari geometry.js', () => {
    for (const s of steps.filter((x) => x.type === 'faded')) {
      const keys = templateKeys(s.template)
      expect(keys.length, s.id).toBeGreaterThan(0)
      for (const k of keys) {
        const v = templateValue(s, k)
        expect(Number.isFinite(v), `${s.id}: ${k}`).toBe(true)
        if (Number.isFinite(s.problem[k])) expect(v, `${s.id}: ${k}`).toBe(s.problem[k])
      }
    }
  })

  it('petunjuk 3 tingkat di setiap soal', () => {
    for (const s of steps.filter((x) => isSolve(x) || isIdentify(x))) {
      expect(s.hints, s.id).toHaveLength(3)
    }
  })

  it('pembahasan (L3) diakhiri kunci yang sama dengan answer', () => {
    for (const s of steps.filter(isSolve)) {
      expect(s.hints[2].endsWith(formatAnswer(s.answer.value, s.answer.unit)), `${s.id}: ${s.hints[2]}`).toBe(true)
    }
  })

  it('soal cerita: chip ada di teks, info penting cocok dengan soal Hitung, ada pengecoh', () => {
    for (const s of steps.filter((x) => x.type === 'story')) {
      expect(s.stage, s.id).toBe('rumuskan')
      const ids = allChips(s).map((c) => c.id)
      expect(new Set(ids).size, s.id).toBe(ids.length)
      for (const seg of s.segments) for (const c of seg.chips ?? []) expect(seg.text, `${s.id}: ${c.id}`).toContain(c.text)
      expect(allChips(s).some((c) => !c.known && c.feedback), s.id).toBe(true)
      expect(knownChips(s).length, s.id).toBeGreaterThan(0)
      expect(s.asked.length, s.id).toBeGreaterThan(0)
      for (const a of s.asked) expect(a.question.options.filter((o) => o.correct === true), s.id).toHaveLength(1)

      const linked = steps.filter((x) => x.story === s.id)
      expect(linked.length, s.id).toBeGreaterThan(0)
      for (const x of linked) expect(x.stage, x.id).toBe('hitung')
      for (const { known } of knownChips(s)) {
        if (known.key === 'kind') {
          for (const x of linked) expect(known.text, x.id).toBe(x.problem.kind === 'right' ? 'trapesium siku-siku' : 'trapesium sama kaki')
        } else if (known.key === 'convert') {
          expect(linked.some((x) => x.problem.convert?.by === known.value), `${s.id}: ${known.label}`).toBe(true)
        } else {
          for (const x of linked) expect(x.problem[known.key], `${x.id}: ${known.key}`).toBe(known.value)
          for (const x of linked) expect(x.problem.unit, `${x.id}: ${known.key}`).toBe(known.unit)
        }
      }
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
      expect(['parallel', 'height', 'hypotenuse']).toContain(s.ask)
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

describe('KONTEN §10 Tantangan Pos ①–⑤ (angka)', () => {
  const answers = (n) =>
    MEETINGS[n].phases
      .find((p) => p.phase === 'tantangan')
      .steps.map((s) => (s.task === 'identify' ? s.answer.join() : `${s.answer.value} ${s.answer.unit}`))
  it('①: 30 cm · 120 cm² · 48 m²', () => expect(answers(1)).toEqual(['30 cm', '120 cm²', '48 m²']))
  it('②: sisi tegak (AD) · 42 cm · 48 cm', () => expect(answers(2)).toEqual(['s1', '42 cm', '48 cm']))
  it('③: 50 cm² · 112 cm² · 96 cm²', () => expect(answers(3)).toEqual(['50 cm²', '112 cm²', '96 cm²']))
  it('④: 12 cm · 252 cm² · 144 cm²', () => expect(answers(4)).toEqual(['12 cm', '252 cm²', '144 cm²']))
  it('⑤: 68 cm · 255 cm² · 22 m', () => expect(answers(5)).toEqual(['68 cm', '255 cm²', '22 m']))
})

describe('KONTEN §4–6 kunci Latih & soal cerita (angka)', () => {
  const keys = (n) =>
    MEETINGS[n].phases
      .flatMap((p) => p.steps)
      .filter(isSolve)
      .filter((s) => s.type !== 'challenge')
      .map((s) => formatAnswer(s.answer.value, s.answer.unit))
  it('P3: 32 · 120 · 128 · 114', () => expect(keys(3)).toEqual(['32 cm²', '120 cm²', '128 cm²', '114 cm²']))
  it('P4: t 8 · L 128 · L 114 · L 330 · K 78 · L 240 · K 64', () =>
    expect(keys(4)).toEqual(['8 cm', '128 cm²', '114 cm²', '330 cm²', '78 cm', '240 cm²', '64 cm']))
  it('P5: 64 m · 240 m² · 24 kg · 330 m² · Rp4.950.000 · 52 cm · 128 cm²', () =>
    expect(keys(5)).toEqual(['64 m', '240 m²', '24 kg', '330 m²', 'Rp4.950.000', '52 cm', '128 cm²']))
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
