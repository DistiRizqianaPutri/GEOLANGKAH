import { useContext } from 'react'
import { SessionContext } from './sessionContext.js'

/** { session: {code, nickname} | null, signIn, signOut } */
export default function useSession() {
  return useContext(SessionContext)
}
