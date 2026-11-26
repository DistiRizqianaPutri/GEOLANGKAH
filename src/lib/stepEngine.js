// Mesin langkah (F-04): logika murni, dipakai StepEngine.jsx lewat useReducer.
// Catatan per langkah memakai nama kolom step_logs (ARSITEKTUR §4) agar M6 tinggal mengirim.
import { seededShuffle } from './random.js'

/** Batas percobaan soal Tantangan Pos (KONTEN §10). */
export const CHALLENGE_ATTEMPTS = 2

/**
 * Ratakan fase → daftar langkah. Langkah `identify` dengan `items` + `pick`
 * diganti `pick` soal yang dipilih acak dengan seed (kode siswa + pertemuan).
 */
export function flattenSteps(meeting, seed) {
  const steps = []
  for (const { phase, steps: list } of meeting.phases) {
    for (const step of list) {
      if (step.items) {
        const { items, pick, ...common } = step
        for (const item of seededShuffle(items, `${seed}:${step.id}`).slice(0, pick ?? items.length)) {
          steps.push({ ...common, ...item, phase })
        }
      } else {
        steps.push({ ...step, phase })
      }
    }
  }
  return steps
}

export function initialState() {
  return { index: 0, records: {}, finished: false, figureReset: 0 }
}

const emptyRecord = () => ({
  attempts: 0,
  is_correct: null,
  max_hint_level: 0,
  error_code: null,
  first_error_code: null,
  answer: null,
  done: false,
  revealed: false,
})

/** Boleh menekan Lanjut? Tanpa pertanyaan: ya. Dengan pertanyaan/soal: setelah selesai. */
export function canAdvance(step, record) {
  if (step.type === 'explain') return true
  if (step.type === 'explore' && !step.question) return true
  return record?.done === true
}

/** Reducer untuk daftar langkah `steps`. */
export function createStepReducer(steps) {
  const byId = new Map(steps.map((s) => [s.id, s]))

  return function reduce(state, action) {
    const step = steps[state.index]
    switch (action.type) {
      case 'ATTEMPT': {
        const rec = state.records[action.stepId] ?? emptyRecord()
        if (rec.done) return state // langkah yang sudah selesai terkunci
        const isChallenge = byId.get(action.stepId)?.type === 'challenge'
        const attempts = rec.attempts + 1
        const outOfTries = isChallenge && !action.correct && attempts >= CHALLENGE_ATTEMPTS
        const next = {
          ...rec,
          attempts,
          is_correct: action.correct,
          error_code: action.errorCode ?? null,
          first_error_code: rec.first_error_code ?? action.errorCode ?? null,
          answer: action.answer ?? null,
          done: action.correct || outOfTries,
          revealed: outOfTries,
        }
        return { ...state, records: { ...state.records, [action.stepId]: next } }
      }
      case 'OPEN_HINT': {
        const rec = state.records[action.stepId] ?? emptyRecord()
        if (rec.done) return state
        const next = { ...rec, max_hint_level: Math.max(rec.max_hint_level, action.level) }
        return { ...state, records: { ...state.records, [action.stepId]: next } }
      }
      case 'NEXT': {
        if (!step || !canAdvance(step, state.records[step.id])) return state
        if (state.index >= steps.length - 1) return { ...state, finished: true }
        return { ...state, index: state.index + 1 }
      }
      case 'BACK':
        return { ...state, index: Math.max(0, state.index - 1) }
      case 'RESET_FIGURE':
        return { ...state, figureReset: state.figureReset + 1 }
      default:
        return state
    }
  }
}

/** Hasil Pos: soal Tantangan benar dan jumlah level petunjuk yang dibuka di Tantangan. */
export function challengeSummary(steps, records) {
  const challenge = steps.filter((s) => s.type === 'challenge')
  return {
    correct: challenge.filter((s) => records[s.id]?.is_correct === true).length,
    total: challenge.length,
    hintsUsed: challenge.reduce((sum, s) => sum + (records[s.id]?.max_hint_level ?? 0), 0),
  }
}

// --- Simpan di HP (ARSITEKTUR §6.5) -----------------------------------------

export function progressKey(code, meeting) {
  return `geolangkah:progress:${code}:m${meeting}`
}

export function loadProgress(storage, code, meeting) {
  try {
    const saved = JSON.parse(storage.getItem(progressKey(code, meeting)))
    if (saved && typeof saved.index === 'number' && saved.records) return { ...initialState(), ...saved }
  } catch {
    // data rusak → mulai dari awal
  }
  return initialState()
}

export function saveProgress(storage, code, meeting, state) {
  storage.setItem(progressKey(code, meeting), JSON.stringify(state))
}

export function isMeetingDone(storage, code, meeting) {
  return loadProgress(storage, code, meeting).finished === true
}
