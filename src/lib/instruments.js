// Pretest/posttest & skala Leppink (M7, PRD F-12, F-13).
// Urutan (PRD §7): Pos 1 diawali pretest; setelah Tantangan → Leppink pos itu → (Pos 5) posttest → Hasil Pos.
// Status "sudah dikirim" disimpan di HP; HP baru memakai data server (fetchInstrumentStatus).
// Server juga menolak kiriman kedua (unique student_id+kind+item_id / student_id+meeting).
import { newId } from './logQueue.js'

export const LEPPINK_IDS = ['il1', 'il2', 'il3', 'el1', 'el2', 'el3', 'gl1', 'gl2', 'gl3', 'gl4']

const statusKey = (code) => `geolangkah:instruments:${code}`
const draftKey = (code, name) => `geolangkah:draft:${code}:${name}`

export function emptyStatus() {
  return { pre: false, post: false, leppink: {} }
}

export function loadStatus(storage, code) {
  try {
    const s = JSON.parse(storage.getItem(statusKey(code)))
    return s ? { ...emptyStatus(), ...s, leppink: { ...(s.leppink ?? {}) } } : emptyStatus()
  } catch {
    return emptyStatus()
  }
}

/** Gabungkan dua status (HP + server): sekali terkirim tetap terkirim. */
export function mergeStatus(a, b) {
  return {
    pre: Boolean(a.pre || b.pre),
    post: Boolean(a.post || b.post),
    leppink: { ...a.leppink, ...b.leppink },
  }
}

export function markDone(storage, code, what) {
  const s = loadStatus(storage, code)
  if (what === 'pre' || what === 'post') s[what] = true
  else s.leppink[what] = true
  storage.setItem(statusKey(code), JSON.stringify(s))
  return s
}

/** Rute yang harus dikerjakan sebelum masuk pertemuan n, atau null. */
export function gateBefore(n, status) {
  return n === 1 && !status.pre ? '/tes/pre' : null
}

/** Rute yang harus dikerjakan setelah pertemuan n selesai (sebelum Hasil Pos), atau null. */
export function gateAfter(n, status) {
  if (!status.leppink[n]) return `/skala/${n}`
  if (n === 5 && !status.post) return '/tes/post'
  return null
}

export function loadDraft(storage, code, name, fallback) {
  try {
    return JSON.parse(storage.getItem(draftKey(code, name))) ?? fallback
  } catch {
    return fallback
  }
}

export function saveDraft(storage, code, name, value) {
  storage.setItem(draftKey(code, name), JSON.stringify(value))
}

export function clearDraft(storage, code, name) {
  storage.removeItem(draftKey(code, name))
}

/** Item antrian test_answers: satu baris per butir. Kiriman ganda diabaikan server. */
export function testAnswerItems(kind, items, answers, studentId, makeId = newId) {
  return items.map((item) => {
    const clientId = makeId()
    return {
      client_id: clientId,
      table: 'test_answers',
      row: { client_id: clientId, student_id: studentId, kind, item_id: item.id, answer: (answers[item.id] ?? '').trim() },
      onConflict: 'student_id,kind,item_id',
    }
  })
}

/** Item antrian leppink_responses untuk satu pertemuan. */
export function leppinkItem(meeting, values, studentId, makeId = newId) {
  const clientId = makeId()
  const row = { client_id: clientId, student_id: studentId, meeting }
  for (const id of LEPPINK_IDS) row[id] = values[id]
  return { client_id: clientId, table: 'leppink_responses', row, onConflict: 'student_id,meeting' }
}

/** Jumlah skor tahap; null bila ada tahap yang belum diisi. */
export function sumStages(stageScores, stages) {
  if (!Array.isArray(stageScores) || stageScores.length !== stages.length) return null
  let total = 0
  for (let i = 0; i < stages.length; i++) {
    const v = stageScores[i]
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > stages[i].max) return null
    total += v
  }
  return total
}
