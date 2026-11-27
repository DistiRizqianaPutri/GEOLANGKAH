// Tutor AI (ARSITEKTUR §9, RMT.md §7). Hanya data soal yang dikirim; tanpa kode/nama siswa.

export const MAX_QUESTIONS = 5
export const TUTOR_MIN_HINT = 2

/** Tutor tampil setelah petunjuk L2 dibuka dan soal belum selesai. */
export function canAskTutor(record) {
  return (record?.max_hint_level ?? 0) >= TUTOR_MIN_HINT && record?.done !== true
}

export const tutorCountKey = (stepId) => `geolangkah:tutor:${stepId}`

export function readTutorCount(storage, stepId) {
  const n = Number(storage?.getItem(tutorCountKey(stepId)))
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function writeTutorCount(storage, stepId, n) {
  storage?.setItem(tutorCountKey(stepId), String(n))
}

/** Isi permintaan ke /api/tutor. Jawaban kunci dipakai server hanya untuk menyaring balasan. */
export function tutorPayload(step, record, question, asked) {
  const answer = step.answer && typeof step.answer === 'object' && !Array.isArray(step.answer) ? step.answer.value : null
  return {
    step_id: step.id,
    phase: step.phase,
    title: step.title ?? '',
    prompt: [].concat(step.text ?? []).join(' '),
    problem: step.problem ?? null,
    answer,
    student_answer: record?.answer ?? '',
    hint_level: record?.max_hint_level ?? 0,
    question: question.trim().slice(0, 300),
    asked,
  }
}

/** → {reply} atau {fallback: true}. Tidak pernah melempar galat. */
export async function askTutor(payload, fetcher = fetch) {
  try {
    const res = await fetcher('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    return res.ok && typeof data.reply === 'string' && data.reply ? { reply: data.reply } : { fallback: true }
  } catch {
    return { fallback: true }
  }
}
