import { createContext } from 'react'

/** { session: {code, nickname} | null, signIn, signOut } — diisi SessionProvider. */
export const SessionContext = createContext(null)
