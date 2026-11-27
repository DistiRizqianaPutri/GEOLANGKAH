// Klien Supabase (anon/publishable key saja, dilindungi RLS — ARSITEKTUR §5, §7).
// Bila variabel lingkungan kosong (mis. saat tes), `supabase` bernilai null.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const domain = import.meta.env.VITE_STUDENT_EMAIL_DOMAIN || 'siswa.geolangkah.test'

export const supabase = url && key ? createClient(url, key) : null

/** Kode siswa → email teknis: "T01" → "t01@siswa.geolangkah.test". */
export function codeToEmail(code, emailDomain = domain) {
  return `${code.toLowerCase()}@${emailDomain}`
}
