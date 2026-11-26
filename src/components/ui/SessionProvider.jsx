import { useState } from 'react'
import { SessionContext } from './sessionContext.js'

// Sesi siswa di HP ini (ARSITEKTUR §5). M4: tanpa Supabase — hanya kode + nama panggilan.
// PIN TIDAK pernah disimpan. Verifikasi Kode + PIN ke Supabase dikerjakan di M6.
const KEY = 'geolangkah:session'

function readSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    return s && /^[ST]\d{2}$/.test(s.code) ? s : null
  } catch {
    return null
  }
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(readSession)

  const signIn = (code, nickname) => {
    const next = { code, nickname: nickname.trim() || null }
    localStorage.setItem(KEY, JSON.stringify(next))
    setSession(next)
  }
  const signOut = () => {
    localStorage.removeItem(KEY)
    setSession(null)
  }

  return <SessionContext.Provider value={{ session, signIn, signOut }}>{children}</SessionContext.Provider>
}
