import { useContext } from 'react'
import { SessionContext } from './sessionContext.js'

/** { session: {code, nickname, userId} | null, signIn(code, pin, nickname), signOut, queue, sync: {pending, flushing, lastError} } */
export default function useSession() {
  return useContext(SessionContext)
}
