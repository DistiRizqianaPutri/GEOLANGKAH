import { createContext } from 'react'

/** { session: {code, nickname, userId} | null, signIn, signOut, queue, sync } — diisi SessionProvider. */
export const SessionContext = createContext(null)
