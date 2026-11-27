import { describe, expect, it } from 'vitest'
import { duplicateIds, nameKey } from './researcher.js'

describe('penanda nama + kelas ganda', () => {
  it('menormalkan huruf besar/kecil dan spasi', () => {
    expect(nameKey('  Siswa   Satu ', 'VII')).toBe('siswa satu|VII')
    expect(nameKey('', 'VII')).toBeNull()
    expect(nameKey(null, null)).toBeNull()
  })

  it('menandai nama sama di kelas sama, bukan di kelas berbeda', () => {
    const students = [
      { id: 'a', name: 'Siswa Satu', kelas: 'VII' },
      { id: 'b', name: 'siswa  satu', kelas: 'VII' },
      { id: 'c', name: 'Siswa Satu', kelas: 'VIII' },
      { id: 'd', name: null, kelas: null, code: 'S001' },
      { id: 'e', name: null, kelas: null, code: 'S002' },
    ]
    expect([...duplicateIds(students)].sort()).toEqual(['a', 'b'])
  })
})
