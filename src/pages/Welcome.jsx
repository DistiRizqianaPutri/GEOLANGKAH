import { useState } from 'react'
import { useNavigate } from 'react-router'
import PrimaryButton from '../components/ui/PrimaryButton.jsx'
import TextButton from '../components/ui/TextButton.jsx'
import useSession from '../components/ui/useSession.js'

// Layar Pembuka + Masuk (layar luar, DESIGN.md §4.1).
// Masuk tanpa kode: Nama lengkap + Kelas → anonymous sign-in Supabase (sesi tersimpan di HP).
const KELAS = ['VII', 'VIII', 'IX']

const START_ERROR = {
  wrong: 'Belum bisa masuk. Coba lagi sebentar.',
  offline: 'Belum ada sinyal. Coba lagi sebentar.',
  unregistered: 'Data belum tersimpan. Coba lagi atau hubungi guru.',
  config: 'Aplikasi belum tersambung ke server. Hubungi guru.',
}

export default function Welcome() {
  const navigate = useNavigate()
  const { session, start, signOut } = useSession()
  const [name, setName] = useState('')
  const [kelas, setKelas] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    const n = name.trim().replace(/\s+/g, ' ')
    if (n.length < 2) return setError('Tulis nama lengkapmu dulu.')
    if (!KELAS.includes(kelas)) return setError('Pilih kelasmu dulu.')
    setError('')
    setBusy(true)
    try {
      await start(n, kelas)
      navigate('/peta')
    } catch (err) {
      setError(START_ERROR[err.reason] ?? START_ERROR.offline)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-4">
      <header className="text-center">
        <p className="text-step-title font-extrabold text-heading">⭐ Jelajah Desa Bangun Datar ✨</p>
        <p className="text-text-muted">Petualangan keliling & luas persegi panjang & trapesium</p>
      </header>

      <section className="rounded-card border border-surface-border bg-surface p-4">
        <p className="font-extrabold text-heading">
          {session ? `Halo lagi, ${session.nickname ?? session.code}! 👋` : 'Halo, penjelajah! 👋'}
        </p>
        <p>Yuk, temukan rahasia trapesium bersama!</p>
      </section>

      {session ? (
        <div className="space-y-2">
          <PrimaryButton onClick={() => navigate('/peta')}>Lanjutkan Petualangan 🚀</PrimaryButton>
          <TextButton onClick={signOut}>Bukan {session.nickname ?? session.code}? Ganti</TextButton>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3 rounded-card border border-surface-border bg-surface p-4" noValidate>
          <label className="block">
            <span className="font-extrabold">Nama lengkap</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              autoCapitalize="words"
              maxLength={80}
              className="mt-1 h-12 w-full rounded-button border-2 border-surface-border bg-white px-3 focus:border-heading focus:outline-none"
            />
          </label>
          <fieldset>
            <legend className="font-extrabold">Kelas</legend>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {KELAS.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kelas === k}
                  onClick={() => setKelas(k)}
                  className={`min-h-12 rounded-button border-2 font-extrabold ${
                    kelas === k ? 'border-heading bg-heading text-white' : 'border-surface-border bg-white'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </fieldset>
          {error && (
            <p role="alert" className="font-extrabold text-error">
              ! {error}
            </p>
          )}
          <PrimaryButton type="submit" disabled={busy}>
            {busy ? 'Menyiapkan…' : 'Mulai Petualangan 🚀'}
          </PrimaryButton>
        </form>
      )}
    </main>
  )
}
