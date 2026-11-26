// "Cek selesai" M4–M5 di tingkat logika: Pertemuan 1–5 dimainkan dari awal sampai akhir
// memakai konten asli, reducer, dan pemeriksa jawaban yang sama dengan UI.
import { describe, expect, it } from 'vitest'
import MEETINGS from '../content/meetings.js'
import { checkChoice, checkFaded, checkIdentify, checkSolve, templateKeys, templateValue } from './checkStep.js'
import { canOpenHint, shouldOfferHint } from './hintRules.js'
import { canAdvance, challengeSummary, createStepReducer, flattenSteps, initialState } from './stepEngine.js'
import { askedKey, knownChips, moveToKnown, rejectResult, storyComplete, storyResult } from './story.js'

const decimal = (v) => String(v).replace('.', ',')
const correctIndex = (q) => q.options.findIndex((o) => o.correct)

/** Jawaban benar untuk satu langkah, dalam bentuk hasil pemeriksa (seperti yang dikirim UI). */
function rightAnswer(step) {
  if (step.type === 'identify' || step.task === 'identify') return checkIdentify(step, step.answer)
  if (step.type === 'faded') {
    const blanks = Object.fromEntries(templateKeys(step.template).map((k) => [k, decimal(templateValue(step, k))]))
    return checkFaded(step, blanks, decimal(step.answer.value), step.answer.unit)
  }
  if (step.type === 'story') return storyResult(step, knownChips(step).map((c) => c.id))
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
    if (step.type === 'story') {
      step.asked.forEach((a, i) => (s = reduce(s, attempt(askedKey(step, i), checkChoice(a.question, correctIndex(a.question))))))
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

describe.each([1, 2, 3, 4, 5])('Pertemuan %i dimainkan sampai Hasil Pos', (n) => {
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

describe('jalur salah P3–P5 dengan konten asli', () => {
  const steps = (n) => flattenSteps(MEETINGS[n], `T01-m${n}`)
  const byId = (n, id) => steps(n).find((s) => s.id === id)

  it('P3: lupa ½ → E_LUPA_SETENGAH; kaki sebagai tinggi (160) → E_KAKI_SBG_TINGGI', () => {
    expect(checkSolve(byId(3, 'm3-tantangan-01'), '100', 'cm²').errorCode).toBe('E_LUPA_SETENGAH')
    expect(checkSolve(byId(3, 'm3-latih-04'), '160', 'cm²').errorCode).toBe('E_KAKI_SBG_TINGGI')
  })

  it('P3 memudar: kotak b salah → E_KOTAK; benar → lanjut ke hasil', () => {
    const step = byId(3, 'm3-latih-02')
    expect(checkFaded(step, { b: '10' }, '32', 'cm²').errorCode).toBe('E_KOTAK')
    expect(checkFaded(step, { b: '6' }, '32', 'cm²').correct).toBe(true)
  })

  it('P4 memudar: kotak x dihitung geometry (6); x tidak dibagi (12) → E_KOTAK', () => {
    const step = byId(4, 'm4-latih-02')
    expect(templateValue(step, 'x')).toBe(6)
    expect(checkFaded(step, { x: '12' }, '8', 'cm').errorCode).toBe('E_KOTAK')
    expect(checkFaded(step, { x: '6' }, '8', 'cm').correct).toBe(true)
  })

  it('P4 memudar 2: kotak x dan t dari geometry (5 dan 12)', () => {
    const step = byId(4, 'm4-latih-04')
    expect([templateValue(step, 'x'), templateValue(step, 't')]).toEqual([5, 12])
    expect(checkFaded(step, { x: '5', t: '12' }, '114', 'cm²').correct).toBe(true)
  })

  it('P4: s² + x² → E_PYTHA_TAMBAH; x tidak dibagi → E_X_TIDAK_DIBAGI; t ≥ s → E_TIDAK_WAJAR', () => {
    const step = byId(4, 'm4-tantangan-01')
    expect(checkSolve(step, String(Math.sqrt(169 + 25)), 'cm').errorCode).toBe('E_PYTHA_TAMBAH')
    expect(checkSolve(step, '8,3', 'cm').errorCode).toBe('E_X_TIDAK_DIBAGI')
    expect(checkSolve(step, '14', 'cm').errorCode).toBe('E_TIDAK_WAJAR')
  })

  it('P4: ketuk tinggi saat ditanya sisi miring → E_LAIN; sisi AD → benar', () => {
    const step = byId(4, 'm4-kenali-05')
    expect(checkIdentify(step, ['t']).errorCode).toBe('E_LAIN')
    expect(checkIdentify(step, ['s1']).correct).toBe(true)
  })

  it('P5 pupuk: satuan m² → E_SATUAN; memakai keliling (6,4) → E_KL_TERTUKAR', () => {
    const step = byId(5, 'm5-bangun-04')
    expect(checkSolve(step, '24', 'm²').errorCode).toBe('E_SATUAN')
    expect(checkSolve(step, '6,4', 'kg').errorCode).toBe('E_KL_TERTUKAR')
  })

  it('P5 biaya: belum dikali (330) → E_LAIN; benar 4950000 Rp', () => {
    const step = byId(5, 'm5-latih-03')
    expect(checkSolve(step, '330', 'Rp').errorCode).toBe('E_LAIN')
    expect(checkSolve(step, '4950000', 'Rp').correct).toBe(true)
  })

  it('P5 cerita: pengecoh ditolak & dicatat; Lanjut baru terbuka setelah lengkap', () => {
    const list = steps(5)
    const step = list.find((s) => s.id === 'm5-bangun-01')
    const reduce = createStepReducer(list)
    let s = { ...initialState(), index: list.indexOf(step) }

    const r = moveToKnown(step, [], ['nama', 'a', 'b'])
    expect(r.rejected.map((c) => c.id)).toEqual(['nama'])
    s = reduce(s, attempt(step.id, rejectResult(r.rejected[0])))
    expect(s.records[step.id]).toMatchObject({ attempts: 1, is_correct: false, error_code: 'E_LAIN' })
    expect(canAdvance(step, s.records[step.id])).toBe(false)

    const all = moveToKnown(step, r.marked, ['bentuk', 'tegak', 'miring', 'pupuk']).marked
    expect(storyComplete(step, all, s.records)).toBe(false) // Ditanya belum dijawab
    s = reduce(s, attempt(askedKey(step, 0), checkChoice(step.asked[0].question, 1))) // salah: luas
    s = reduce(s, attempt(askedKey(step, 0), checkChoice(step.asked[0].question, 0)))
    s = reduce(s, attempt(askedKey(step, 1), checkChoice(step.asked[1].question, 1)))
    expect(storyComplete(step, all, s.records)).toBe(true)
    s = reduce(s, attempt(step.id, storyResult(step, all)))
    expect(s.records[step.id]).toMatchObject({ attempts: 2, is_correct: true, first_error_code: 'E_LAIN', done: true })
    expect(s.records[askedKey(step, 0)]).toMatchObject({ attempts: 2, first_error_code: 'E_LAIN' })
    expect(canAdvance(step, s.records[step.id])).toBe(true)
  })
})

describe('P5 biaya: isian rupiah format Indonesia', () => {
  const step = flattenSteps(MEETINGS[5], 'T01-m5').find((s) => s.id === 'm5-latih-03')

  it.each(['4950000', '4.950.000', 'Rp4.950.000', 'Rp 4.950.000'])('"%s" Rp → benar', (raw) => {
    expect(checkSolve(step, raw, 'Rp')).toMatchObject({ correct: true, errorCode: null })
  })

  it('angka rupiah benar, satuan m² → E_SATUAN', () => {
    expect(checkSolve(step, 'Rp4.950.000', 'm²').errorCode).toBe('E_SATUAN')
  })

  it('titik bukan kelompok ribuan → bukan angka (Cek tidak aktif)', () => {
    expect(checkSolve(step, '4.95', 'Rp')).toBeNull()
  })

  it('isian lain tidak berubah: koma desimal pada kg', () => {
    const pupuk = flattenSteps(MEETINGS[5], 'T01-m5').find((s) => s.id === 'm5-bangun-04')
    expect(checkSolve(pupuk, '24,0', 'kg').correct).toBe(true)
    expect(checkSolve(pupuk, '6,4', 'kg').errorCode).toBe('E_KL_TERTUKAR')
  })
})
