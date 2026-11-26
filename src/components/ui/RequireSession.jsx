import { Navigate } from 'react-router'
import useSession from './useSession.js'

/** Halaman yang butuh kode siswa: tanpa sesi → kembali ke Pembuka. */
export default function RequireSession({ children }) {
  const { session } = useSession()
  return session ? children : <Navigate to="/" replace />
}
