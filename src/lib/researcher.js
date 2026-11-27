// Akses data untuk halaman peneliti (M7, PRD F-14). RLS: peneliti boleh membaca semua baris
// dan memperbarui kolom skor test_answers saja. Tidak ada service_role di frontend.

/** Apakah pengguna yang masuk terdaftar di tabel researchers? */
export async function isResearcher(client, userId) {
  const { data, error } = await client.from('researchers').select('user_id').eq('user_id', userId).maybeSingle()
  if (error) throw new Error(error.message)
  return Boolean(data)
}

/** Semua data yang dibutuhkan dashboard, digabung per siswa. */
export async function fetchDashboard(client) {
  const [students, progress, answers, leppink] = await Promise.all([
    client.from('students').select('id, code, name, kelas').order('kelas').order('name').order('code'),
    client.from('progress').select('student_id, meeting, completed_at'),
    client.from('test_answers').select('id, student_id, kind, item_id, answer, score, stage_scores, scored_at'),
    client.from('leppink_responses').select('student_id, meeting'),
  ])
  for (const r of [students, progress, answers, leppink]) if (r.error) throw new Error(r.error.message)
  return students.data.map((s) => ({
    ...s,
    done: Object.fromEntries(progress.data.filter((p) => p.student_id === s.id && p.completed_at).map((p) => [p.meeting, true])),
    answers: answers.data.filter((a) => a.student_id === s.id),
    leppink: leppink.data.filter((l) => l.student_id === s.id).map((l) => l.meeting),
  }))
}

/** Nama + kelas → kunci pembanding (huruf kecil, spasi dirapikan); null bila nama kosong. */
export function nameKey(name, kelas) {
  const n = (name ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
  return n ? `${n}|${kelas ?? ''}` : null
}

/** Set id siswa yang nama + kelasnya sama dengan siswa lain (kemungkinan akun ganda). */
export function duplicateIds(students) {
  const groups = new Map()
  for (const s of students) {
    const k = nameKey(s.name, s.kelas)
    if (k) groups.set(k, [...(groups.get(k) ?? []), s.id])
  }
  return new Set([...groups.values()].filter((ids) => ids.length > 1).flat())
}

/** Ringkasan tes satu siswa: { sent, scored, total } untuk kind 'pre' | 'post'. */
export function testState(answers, kind, itemCount) {
  const rows = answers.filter((a) => a.kind === kind)
  const scored = rows.filter((a) => a.score !== null && a.score !== undefined)
  const total = scored.reduce((sum, a) => sum + Number(a.score), 0)
  return { sent: rows.length > 0, scored: scored.length, complete: scored.length === itemCount && rows.length === itemCount, total }
}

export async function saveScore(client, { id, stageScores, score, researcherId }) {
  const { error } = await client
    .from('test_answers')
    .update({ stage_scores: stageScores, score, scored_by: researcherId, scored_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

/** Panggil /api/export dengan JWT peneliti. */
export async function callExport(client, params) {
  const { data } = await client.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Sesi peneliti habis, silakan masuk lagi.')
  const res = await fetch(`/api/export?${new URLSearchParams(params)}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Ekspor gagal (${res.status}). ${text.slice(0, 200)}`)
  }
  return res
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
