// "Cek selesai" M4 di tingkat logika: Pertemuan 1 & 2 dimainkan dari awal sampai akhir
// memakai konten asli, reducer, dan pemeriksa jawaban yang sama dengan UI.
import { describe, expect, it } from 'vitest'
import MEETINGS from '../content/meetings.js'
import { checkChoice, checkFaded, checkIdentify, checkSolve, templateKeys } from './checkStep.js'
import { canOpenHint, shouldOfferHint } from './hintRules.js'
import { canAdvance, challengeSummary, createStepReducer, flattenSteps, initialState } from './stepEngine.js'

const decimal = (v) => String(v).replace('.', ',')
const correctIndex = (q) => q.options.findIndex((o) => o.correct)

/** Jawaban benar untuk satu langkah, dalam bentuk hasil pemeriksa (seperti yang dikirim UI). */
function rightAnswer(step) {
  if (step.type === 'identify' || step.task === 'identify') return checkIdentify(step, step.answer)
  if (step.type === 'faded') {
    const blanks = Object.fromEntries(templateKeys(step.template).map((k) => [k, decimal(step.problem[k])]))
    return checkFaded(step, blanks, decimal(step.answer.value), step.answer.unit)
  }
  if (step.problem) return checkSolve(step, decimal(step.answer.value), step.answer.unit)
  return checkChoice(step.question, correctIndex(step.question))
}

const attempt = (stepId, r) => ({ type: 'ATTEMPT', stepId, correct: r.correct, errorCode: r.errorCode, answer: r.answer })

function play(n, seed, onStep = () => []) {
  const steps = flattenSteps(MEETINGS[n], seed)
  const reduce = createStepReducer(steps)
  let s = initialState()
  let guard = 0
  while (!s.finished && guard++ < 200) {
    const step = steps[s.index]
    for (const a of onStep(step, s)) s = reduce(s, a)
    if (step.type === 'challenge' && step.question) {
      s = reduce(s, attempt(`${step.id}#pilih`, checkChoice(step.question, correctIndex(step.question))))
    }
    if (!canAdvance(step, s.records[step.id])) {
      const r = rightAnswer(step)
      expect(r.correct, step.id).toBe(true)
      s = reduce(s, attempt(step.id, r))
    }
    expect(canAdvance(step, s.records[step.id]), step.id).toBe(true)
    s = reduce(s, { type: 'NEXT' })
  }
  return { steps, s }
}

describe.each([1, 2])('Pertemuan %i dimainkan sampai Hasil Pos', (n) => {
  it.each(['T01', 'S01', 'S02'])('kode %s: selesai, Tantangan 3 dari 3, petunjuk 0', (code) => {
    const { steps, s } = play(n, `${code}-m${n}`)
    expect(s.finished).toBe(true)
    expect(challengeSummary(steps, s.records)).toEqual({ correct: 3, total: 3, hintsUsed: 0 })
  })

  it('Tantangan salah 2× → jawaban tampil, skor berkurang, tetap bisa lanjut', () => {
    const { steps, s } = play(n, `T01-m${n}`, (step) =>
      step.id === `m${n}-tantangan-02`
        ? [
            { type: 'OPEN_HINT', stepId: step.id, level: 1 },
            attempt(step.id, checkSolve(step, '1', step.answer.unit)),
            attempt(step.id, checkSolve(step, '2', step.answer.unit)),
          ]
        : [],
    )
    expect(s.finished).toBe(true)
    expect(s.records[`m${n}-tantangan-02`]).toMatchObject({ attempts: 2, is_correct: false, revealed: true })
    expect(challengeSummary(steps, s.records)).toEqual({ correct: 2, total: 3, hintsUsed: 1 })
  })
})

describe('jalur salah dengan konten asli', () => {
  const steps1 = flattenSteps(MEETINGS[1], 'T01-m1')
  const byId = (id, steps = steps1) => steps.find((s) => s.id === id)

  it('P1 luas: satuan cm → E_SATUAN; nilai keliling → E_KL_TERTUKAR', () => {
    const step = byId('m1-latih-06')
    expect(checkSolve(step, '84', 'cm').errorCode).toBe('E_SATUAN')
    expect(checkSolve(step, '38', 'cm²').errorCode).toBe('E_KL_TERTUKAR')
  })

  it('P1 memudar: kotak salah → E_KOTAK', () => {
    expect(checkFaded(byId('m1-latih-05'), { p: '12', l: '5' }, '38', 'cm').errorCode).toBe('E_KOTAK')
  })

  it('P1 Tantangan 1: 44 → E_KL_TERTUKAR, 15 → E_SETENGAH_KELILING', () => {
    const step = byId('m1-tantangan-01')
    expect(checkSolve(step, '44', 'cm').errorCode).toBe('E_KL_TERTUKAR')
    expect(checkSolve(step, '15', 'cm').errorCode).toBe('E_SETENGAH_KELILING')
  })

  it('P2 Tantangan: kaki miring diketuk sebagai tinggi; tinggi ikut dijumlah', () => {
    const steps2 = flattenSteps(MEETINGS[2], 'T01-m2')
    expect(checkIdentify(byId('m2-tantangan-01', steps2), ['s2']).errorCode).toBe('E_KAKI_SBG_TINGGI')
    expect(checkSolve(byId('m2-tantangan-03', steps2), '56', 'cm').errorCode).toBe('E_TINGGI_DI_KELILING')
    expect(checkSolve(byId('m2-tantangan-02', steps2), '34', 'cm').errorCode).toBe('E_SISI_KURANG')
  })

  it('setelah 2× salah, petunjuk ditawarkan; L3 terkunci sebelum mencoba', () => {
    const reduce = createStepReducer(steps1)
    const step = byId('m1-latih-06')
    let s = { ...initialState(), index: steps1.indexOf(step) }
    expect(canOpenHint(3, { opened: 2, attempts: 0 })).toBe(false)
    s = reduce(s, attempt(step.id, checkSolve(step, '19', 'cm²')))
    s = reduce(s, attempt(step.id, checkSolve(step, '38', 'cm²')))
    const rec = s.records[step.id]
    expect(shouldOfferHint({ wrong: rec.attempts, opened: rec.max_hint_level })).toBe(true)
    expect(canAdvance(step, rec)).toBe(false)
  })

  it('Kembali ke langkah yang sudah benar: terkunci, tanpa percobaan baru', () => {
    const reduce = createStepReducer(steps1)
    const step = byId('m1-latih-04')
    let s = { ...initialState(), index: steps1.indexOf(step) }
    s = reduce(s, attempt(step.id, rightAnswer(step)))
    s = reduce(s, { type: 'NEXT' })
    s = reduce(s, { type: 'BACK' })
    s = reduce(s, attempt(step.id, checkSolve(step, '1', 'cm')))
    expect(s.records[step.id]).toMatchObject({ attempts: 1, is_correct: true })
  })
})
