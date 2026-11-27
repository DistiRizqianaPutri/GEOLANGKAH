import { useCallback, useEffect, useState } from 'react'
import TextButton from '../../components/ui/TextButton.jsx'
import tests from '../../content/tests.json'
import { callExport, fetchDashboard, isResearcher, saveScore } from '../../lib/researcher.js'
import { supabase } from '../../lib/supabase.js'
import ExportPanel from './ExportPanel.jsx'
import ResearcherLogin from './ResearcherLogin.jsx'
import ScoreForm from './ScoreForm.jsx'
import StudentTable from './StudentTable.jsx'

const KIND_NAMES = { pre: 'Pretest', post: 'Posttest' }

/**
 * Halaman peneliti /peneliti (PRD F-14): daftar siswa & progres, isi skor per tahap
 * untuk tiap butir uraian, unduh CSV/ringkasan. Kunci & pedoman penskoran diambil dari
 * /api/export?key=1 (hanya untuk peneliti), tidak pernah ada di bundle aplikasi siswa.
 */
export default function Dashboard() {
  const [user, setUser] = useState(undefined) // undefined = memeriksa
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user
      setUser(u && (await isResearcher(supabase, u.id).catch(() => false)) ? u : null)
    })
  }, [])

  if (!supabase) return <p className="p-4">Supabase belum diatur (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).</p>
  if (user === undefined) return <p className="p-4 text-text-muted">Memuat…</p>

  const signIn = async (email, password) => {
    setLoginError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setLoginError('Email atau kata sandi salah.')
    if (!(await isResearcher(supabase, data.user.id).catch(() => false))) {
      await supabase.auth.signOut({ scope: 'local' })
      return setLoginError('Akun ini bukan akun peneliti.')
    }
    setUser(data.user)
  }

  if (!user) return <ResearcherLogin onSubmit={signIn} error={loginError} />
  return (
    <ResearcherHome
      user={user}
      onSignOut={async () => {
        await supabase.auth.signOut({ scope: 'local' })
        setUser(null)
      }}
    />
  )
}

function ResearcherHome({ user, onSignOut }) {
  const [students, setStudents] = useState(null)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [key, setKey] = useState(null)

  const load = useCallback(() => {
    fetchDashboard(supabase)
      .then(setStudents)
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    load()
    callExport(supabase, { key: '1' })
      .then((res) => res.json())
      .then(setKey)
      .catch(() => setKey({ error: true }))
  }, [load])

  const selected = students?.find((s) => s.id === selectedId)
  const onSave = async ({ id, stageScores, score }) => {
    await saveScore(supabase, { id, stageScores, score, researcherId: user.id })
    load()
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-step-title font-extrabold text-heading">Halaman Peneliti</h1>
        <TextButton onClick={onSignOut}>Keluar</TextButton>
      </header>

      <section className="rounded-card border border-surface-border bg-hint-bg p-3">
        <p className="font-extrabold">Pedoman umum penskoran</p>
        <p>{key?.guide ?? (key?.error ? '! Pedoman & kunci hanya termuat lewat /api/export (Vercel).' : 'Memuat…')}</p>
      </section>

      {error && <p className="font-extrabold text-error">! {error}</p>}
      {!students && !error && <p className="text-text-muted">Memuat data siswa…</p>}
      {students && <StudentTable students={students} selectedId={selectedId} onSelect={setSelectedId} />}

      {selected && (
        <section className="space-y-3">
          <h2 className="text-step-title font-extrabold text-heading">Skor uraian — {selected.name || selected.code}</h2>
          {['pre', 'post'].map((kind) => {
            const rows = selected.answers.filter((a) => a.kind === kind)
            return (
              <div key={kind} className="space-y-2">
                <h3 className="font-extrabold">{KIND_NAMES[kind]}</h3>
                {rows.length === 0 && <p className="text-text-muted">Belum dikirim.</p>}
                {tests.items.map((item) => {
                  const answer = rows.find((a) => a.item_id === item.id)
                  return answer ? <ScoreForm key={`${answer.id}`} item={item} answer={answer} answerKey={key?.keys?.[item.id]} onSave={onSave} /> : null
                })}
              </div>
            )
          })}
        </section>
      )}

      <ExportPanel client={supabase} />
    </main>
  )
}
