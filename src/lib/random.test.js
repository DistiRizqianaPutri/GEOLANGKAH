import { describe, expect, it } from 'vitest'
import { seededShuffle } from './random.js'

const list = ['a', 'b', 'c', 'd', 'e', 'f']

describe('seededShuffle (seed = kode siswa + pertemuan)', () => {
  it('seed sama → urutan sama (juga setelah tab ditutup)', () => {
    expect(seededShuffle(list, 'S01-m2')).toEqual(seededShuffle(list, 'S01-m2'))
  })

  it('isi tetap sama, hanya urutan yang berubah', () => {
    expect([...seededShuffle(list, 'S01-m2')].sort()).toEqual(list)
  })

  it('seed berbeda → urutan bisa berbeda', () => {
    const seeds = ['S01-m2', 'S02-m2', 'S03-m2', 'S04-m2', 'T01-m2']
    const orders = new Set(seeds.map((s) => seededShuffle(list, s).join('')))
    expect(orders.size).toBeGreaterThan(1)
  })

  it('tidak mengubah daftar aslinya', () => {
    seededShuffle(list, 'S01-m2')
    expect(list).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  })
})
