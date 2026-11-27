import { useState } from 'react'
import PrimaryButton from '../../components/ui/PrimaryButton.jsx'

const inputClass = 'h-12 w-full rounded-button border-2 border-surface-border bg-surface px-3 text-body focus:border-heading focus:outline-none'

/** Masuk peneliti: email + kata sandi akun Supabase yang terdaftar di tabel researchers. */
export default function ResearcherLogin({ onSubmit, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    await onSubmit(email.trim(), password)
    setBusy(false)
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-4">
      <h1 className="text-step-title font-extrabold text-heading">Halaman Peneliti</h1>
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block font-extrabold">Email</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
        </label>
        <label className="block">
          <span className="mb-1 block font-extrabold">Kata sandi</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
        </label>
        {error && (
          <p className="font-extrabold text-error" role="alert">
            ! {error}
          </p>
        )}
        <PrimaryButton type="submit" disabled={busy}>
          {busy ? 'Memeriksa…' : 'Masuk'}
        </PrimaryButton>
      </form>
    </main>
  )
}
