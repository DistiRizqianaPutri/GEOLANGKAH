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
