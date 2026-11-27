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
  return { index: 0, records: {}, finished: false, figureReset: 0, completed_at: null }
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
  // M6: waktu aktif di layar, id log (diisi saat pertama menekan Lanjut), sudah masuk antrian?
  elapsed_ms: 0,
  client_id: null,
  queued: false,
})

/** Tambah waktu aktif ke catatan yang belum dicatat (waktu sesudah log terkirim tidak dihitung). */
function addTime(records, key, ms) {
  const rec = records[key] ?? emptyRecord()
  if (!ms || rec.client_id) return records
  return { ...records, [key]: { ...rec, elapsed_ms: (rec.elapsed_ms ?? 0) + ms } }
}

/**
 * Kunci catatan yang perlu diberi client_id saat siswa menekan Lanjut di `step`:
 * catatan langkah itu sendiri + sub-catatan `<id>#…` (PG Tantangan, Ditanya soal cerita).
 */
export function logKeys(step, records) {
  const keys = [step.id, ...Object.keys(records).filter((k) => k.startsWith(`${step.id}#`))]
  return keys.filter((k) => !records[k]?.client_id)
}

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
        // action: { clientIds: {kunci: uuid}, elapsedMs, now } — dibuat pemanggil agar reducer tetap murni.
        if (!step || !canAdvance(step, state.records[step.id])) return state
        let records = addTime(state.records, step.id, action.elapsedMs)
        for (const [key, id] of Object.entries(action.clientIds ?? {})) {
          const rec = records[key] ?? emptyRecord()
          if (!rec.client_id) records = { ...records, [key]: { ...rec, client_id: id } }
        }
        if (state.index >= steps.length - 1) {
          const completed_at = state.completed_at ?? (action.now ? new Date(action.now).toISOString() : null)
          return { ...state, records, finished: true, completed_at }
        }
        return { ...state, records, index: state.index + 1 }
      }
      case 'BACK':
        if (!step) return { ...state, index: Math.max(0, state.index - 1) }
        return { ...state, records: addTime(state.records, step.id, action.elapsedMs), index: Math.max(0, state.index - 1) }
      case 'ADD_TIME':
        return { ...state, records: addTime(state.records, action.stepId, action.ms) }
      case 'MARK_QUEUED': {
        const rec = state.records[action.key]
        if (!rec || rec.queued) return state
        return { ...state, records: { ...state.records, [action.key]: { ...rec, queued: true } } }
      }
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

/** Progres lokal masih kosong (belum ada langkah yang dikerjakan di HP ini)? */
export function isFreshProgress(state) {
  return state.index === 0 && !state.finished && Object.keys(state.records).length === 0
}

// --- Supabase (M6, ARSITEKTUR §4 & §6) ----------------------------------------

/** Item antrian `step_logs` dari satu catatan langkah. */
export function stepLogItem(key, record, { studentId, meeting }) {
  const row = {
    client_id: record.client_id,
    student_id: studentId,
    meeting,
    step_id: key,
    answer: record.answer ?? null,
    is_correct: record.is_correct ?? null,
    attempts: record.attempts ?? 0,
    max_hint_level: record.max_hint_level ?? 0,
    error_code: record.error_code ?? null,
    first_error_code: record.first_error_code ?? null,
    duration_sec: Math.round((record.elapsed_ms ?? 0) / 1000),
  }
  return { client_id: record.client_id, table: 'step_logs', row }
}

/** Catatan yang sudah punya client_id tetapi belum masuk antrian. */
export function unqueuedKeys(records) {
  return Object.keys(records).filter((k) => records[k].client_id && !records[k].queued)
}

/** Item antrian `progress` (satu per pertemuan; item baru menggantikan yang lama). */
export function progressItem(state, steps, { studentId, meeting, clientId }) {
  const step = steps[Math.min(state.index, steps.length - 1)]
  return {
    client_id: clientId,
    table: 'progress',
    row: {
      student_id: studentId,
      meeting,
      last_step_id: step.id,
      completed_at: state.finished ? (state.completed_at ?? new Date().toISOString()) : null,
    },
    onConflict: 'student_id,meeting',
    ignoreDuplicates: false,
    dedupeKey: `progress:${meeting}`,
  }
}

/**
 * HP baru: bangun ulang progres dari `step_logs` + baris `progress` milik siswa.
 * Langkah yang sudah tercatat menjadi selesai & terkunci, jadi tidak tercatat dua kali.
 */
export function resumeFromServer(steps, logs, progress) {
  const records = {}
  for (const log of logs) {
    const step = steps.find((s) => s.id === log.step_id.split('#')[0])
    records[log.step_id] = {
      ...emptyRecord(),
      attempts: log.attempts ?? 0,
      is_correct: log.is_correct ?? null,
      max_hint_level: log.max_hint_level ?? 0,
      error_code: log.error_code ?? null,
      first_error_code: log.first_error_code ?? null,
      answer: log.answer ?? null,
      done: true,
      revealed: step?.type === 'challenge' && !log.step_id.includes('#') && log.is_correct === false,
      elapsed_ms: (log.duration_sec ?? 0) * 1000,
      client_id: log.client_id,
      queued: true,
    }
  }
  const state = { ...initialState(), records }
  if (progress?.completed_at) {
    return { ...state, index: steps.length - 1, finished: true, completed_at: progress.completed_at }
  }
  // Lanjut dari last_step_id, atau dari langkah pertama yang belum tercatat.
  const fromProgress = steps.findIndex((s) => s.id === progress?.last_step_id)
  const firstOpen = steps.findIndex((s) => !records[s.id])
  const index = Math.max(fromProgress, firstOpen === -1 ? steps.length - 1 : firstOpen, 0)
  return { ...state, index: Math.min(index, steps.length - 1) }
}
