import { describe, expect, it } from 'vitest'
import { STUDENT_CODE, codeToEmail } from './supabase.js'

describe('kode siswa', () => {
  it.each(['S01', 'S001', 'S150', 'T01', 'T001'])('menerima %s', (code) => {
    expect(STUDENT_CODE.test(code)).toBe(true)
  })

  it.each(['S1', 'S0001', 'X01', 's01', 'S0A', ''])('menolak %s', (code) => {
    expect(STUDENT_CODE.test(code)).toBe(false)
  })

  it('email teknis = kode huruf kecil + domain', () => {
    expect(codeToEmail('S001', 'siswa.geolangkah.test')).toBe('s001@siswa.geolangkah.test')
    expect(codeToEmail('T01', 'contoh.test')).toBe('t01@contoh.test')
  })
})
