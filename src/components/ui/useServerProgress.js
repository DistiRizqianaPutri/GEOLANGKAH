import { useEffect, useState } from 'react'
import { fetchProgress } from '../../lib/remote.js'
import { supabase } from '../../lib/supabase.js'
import useSession from './useSession.js'

/**
 * Progres siswa di Supabase: { [meeting]: { last_step_id, completed_at } }.
 * `null` selama memuat; `{}` bila offline/gagal (aplikasi memakai data HP saja).
 */
export default function useServerProgress() {
  const { session } = useSession()
  const userId = session?.userId
  const [rows, setRows] = useState(supabase && navigator.onLine ? null : {})

  useEffect(() => {
    if (!supabase || !userId || !navigator.onLine) return
    let alive = true
    fetchProgress(supabase, userId)
      .then((r) => alive && setRows(r))
      .catch(() => alive && setRows({}))
    return () => {
      alive = false
    }
  }, [userId])

  return rows
}
