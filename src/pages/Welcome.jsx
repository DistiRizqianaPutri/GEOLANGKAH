import { useState } from 'react'
import { useNavigate } from 'react-router'
import PrimaryButton from '../components/ui/PrimaryButton.jsx'
import TextButton from '../components/ui/TextButton.jsx'
import useSession from '../components/ui/useSession.js'

// Layar Pembuka + Masuk (layar luar, DESIGN.md §4.1). Ilustrasi orisinal menyusul di M9.
// M4: Kode & PIN hanya dicek formatnya; PIN tidak disimpan. Verifikasi ke Supabase di M6.
const CODE = /^[ST]\d{2}$/
const PIN = /^\d{6}$/

export default function Welcome() {
  const navigate = useNavigate()
  const { session, signIn, signOut } = useSession()
  const [code, setCode] = useState('')
  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (!CODE.test(c)) return setError('Kode siswa terdiri dari huruf S atau T dan 2 angka, misalnya S01.')
    if (!PIN.test(pin)) return setError('PIN terdiri dari 6 angka.')
    signIn(c, nickname)
    navigate('/peta')
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
          <TextButton onClick={signOut}>Bukan {session.code}? Ganti kode</TextButton>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3 rounded-card border border-surface-border bg-surface p-4" noValidate>
          <label className="block">
            <span className="font-extrabold">Kode siswa</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={3}
              placeholder="S01"
              className="mt-1 h-12 w-full rounded-button border-2 border-surface-border bg-white px-3 font-extrabold uppercase focus:border-heading focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-extrabold">PIN</span>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="off"
              maxLength={6}
              className="mt-1 h-12 w-full rounded-button border-2 border-surface-border bg-white px-3 font-extrabold focus:border-heading focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-extrabold">Nama panggilan (opsional)</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoComplete="off"
              maxLength={20}
              className="mt-1 h-12 w-full rounded-button border-2 border-surface-border bg-white px-3 focus:border-heading focus:outline-none"
            />
            <span className="text-base text-text-muted">Hanya disimpan di HP ini.</span>
          </label>
          {error && (
            <p role="alert" className="font-extrabold text-error">
              ! {error}
            </p>
          )}
          <PrimaryButton type="submit">Mulai Petualangan 🚀</PrimaryButton>
        </form>
      )}
    </main>
  )
}
