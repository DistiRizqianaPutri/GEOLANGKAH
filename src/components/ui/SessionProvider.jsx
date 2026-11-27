import { useEffect, useMemo, useState } from 'react'
import { isAuthRetryableFetchError } from '@supabase/supabase-js'
import { createLogQueue, queueKey, startAutoSync, supabaseSender } from '../../lib/logQueue.js'
import { codeToEmail, supabase } from '../../lib/supabase.js'
import { SessionContext } from './sessionContext.js'

// Sesi siswa (ARSITEKTUR §5). Masuk = Kode + PIN → signInWithPassword ke email teknis.
// PIN TIDAK pernah disimpan aplikasi (sesi Supabase menyimpan token, bukan PIN).
// localStorage `geolangkah:session` → { code, nickname, userId }; nama panggilan tidak dikirim ke server.
const KEY = 'geolangkah:session'

function readSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    return s && /^[ST]\d{2}$/.test(s.code) && s.userId ? s : null
  } catch {
    return null
  }
}

/** Alasan gagal masuk: 'wrong' | 'offline' | 'unregistered' | 'config' */
class SignInError extends Error {
  constructor(reason) {
    super(reason)
    this.reason = reason
  }
}

const isOffline = (error) => isAuthRetryableFetchError(error) || error?.status === 0 || !navigator.onLine

export function SessionProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const [sync, setSync] = useState({ pending: 0, flushing: false, lastError: null })
  const userId = session?.userId

  const clear = () => {
    localStorage.removeItem(KEY)
    setSession(null)
  }

  // Sesi Supabase hilang (keluar di tab lain / token dicabut) → keluar juga di sini.
  // Saat offline, token kedaluwarsa tidak dianggap keluar: siswa tetap belajar, log menunggu sinyal.
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data, error }) => {
      if (!error && !data.session) clear()
      else if (data.session && readSession()?.userId !== data.session.user.id) clear()
    })
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') clear()
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // Antrian per pengguna: log tidak pernah terkirim atas nama akun lain.
  const queue = useMemo(
    () => (userId && supabase ? createLogQueue({ storage: localStorage, key: queueKey(userId), send: supabaseSender(supabase) }) : null),
    [userId],
  )
  useEffect(() => {
    if (!queue) return
    const unsubscribe = queue.subscribe(setSync)
    const stop = startAutoSync(queue)
    return () => {
      unsubscribe()
      stop()
    }
  }, [queue])

  const signIn = async (code, pin, nickname) => {
    if (!supabase) throw new SignInError('config')
    if (!navigator.onLine) throw new SignInError('offline')
    const { data, error } = await supabase.auth.signInWithPassword({ email: codeToEmail(code), password: pin })
    if (error) throw new SignInError(isOffline(error) ? 'offline' : 'wrong')
    const { data: row, error: rowError } = await supabase.from('students').select('code').eq('id', data.user.id).maybeSingle()
    if (rowError) throw new SignInError(isOffline(rowError) ? 'offline' : 'unregistered')
    if (row?.code !== code) {
      await supabase.auth.signOut({ scope: 'local' })
      throw new SignInError('unregistered')
    }
    const next = { code, nickname: nickname.trim() || null, userId: data.user.id }
    localStorage.setItem(KEY, JSON.stringify(next))
    setSession(next)
  }

  const signOut = async () => {
    const pending = queue?.size() ?? 0
    if (
      pending > 0 &&
      !window.confirm(`Ada ${pending} catatan yang belum terkirim. Catatan tetap aman di HP ini dan terkirim saat kamu masuk lagi. Tetap keluar?`)
    )
      return
    clear()
    await supabase?.auth.signOut({ scope: 'local' }).catch(() => {})
  }

  return <SessionContext.Provider value={{ session, signIn, signOut, queue, sync }}>{children}</SessionContext.Provider>
}
