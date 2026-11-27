import { useEffect, useState } from 'react'
import { loadStatus, mergeStatus } from '../../lib/instruments.js'
import { fetchInstrumentStatus } from '../../lib/remote.js'
import { supabase } from '../../lib/supabase.js'
import useSession from './useSession.js'

/**
 * Status pretest/posttest/Leppink: gabungan HP + server (HP baru).
 * `null` selama memuat; offline/gagal → data HP saja.
 */
export default function useInstrumentStatus() {
  const { session } = useSession()
  const { code, userId } = session
  const online = Boolean(supabase && navigator.onLine)
  const [status, setStatus] = useState(() => (online ? null : loadStatus(localStorage, code)))

  useEffect(() => {
    const local = loadStatus(localStorage, code)
    if (!online) return
    let alive = true
    fetchInstrumentStatus(supabase, userId)
      .then((server) => alive && setStatus(mergeStatus(local, server)))
      .catch(() => alive && setStatus(local))
    return () => {
      alive = false
    }
  }, [code, userId, online])

  return status
}
