// Membaca data milik siswa dari Supabase (RLS: hanya baris sendiri) — M6.

/** Baris progress per pertemuan → { [meeting]: { meeting, last_step_id, completed_at } } */
export async function fetchProgress(client, userId) {
  const { data, error } = await client
    .from('progress')
    .select('meeting, last_step_id, completed_at')
    .eq('student_id', userId)
  if (error) throw new Error(error.message)
  return Object.fromEntries(data.map((r) => [r.meeting, r]))
}

/** Instrumen yang sudah terkirim (M7) → { pre, post, leppink: { [meeting]: true } } */
export async function fetchInstrumentStatus(client, userId) {
  const [tests, lep] = await Promise.all([
    client.from('test_answers').select('kind').eq('student_id', userId),
    client.from('leppink_responses').select('meeting').eq('student_id', userId),
  ])
  if (tests.error) throw new Error(tests.error.message)
  if (lep.error) throw new Error(lep.error.message)
  const kinds = new Set(tests.data.map((r) => r.kind))
  return {
    pre: kinds.has('pre'),
    post: kinds.has('post'),
    leppink: Object.fromEntries(lep.data.map((r) => [r.meeting, true])),
  }
}

/** Log langkah satu pertemuan, untuk membangun ulang progres di HP baru. */
export async function fetchStepLogs(client, userId, meeting) {
  const { data, error } = await client
    .from('step_logs')
    .select('step_id, client_id, answer, is_correct, attempts, max_hint_level, error_code, first_error_code, duration_sec')
    .eq('student_id', userId)
    .eq('meeting', meeting)
  if (error) throw new Error(error.message)
  return data
}
