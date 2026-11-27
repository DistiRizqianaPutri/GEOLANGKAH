import { describe, expect, it } from 'vitest'
import {
  emptyStatus,
  gateAfter,
  gateBefore,
  leppinkItem,
  loadStatus,
  markDone,
  mergeStatus,
  sumStages,
  testAnswerItems,
} from './instruments.js'

function memoryStorage() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

describe('urutan instrumen', () => {
  it('Pos 1 diawali pretest', () => {
    expect(gateBefore(1, emptyStatus())).toBe('/tes/pre')
    expect(gateBefore(1, { ...emptyStatus(), pre: true })).toBeNull()
    expect(gateBefore(2, emptyStatus())).toBeNull()
  })

  it('setelah pos: Leppink dulu, posttest hanya setelah Pos 5', () => {
    const s = emptyStatus()
    expect(gateAfter(3, s)).toBe('/skala/3')
    s.leppink[3] = true
    expect(gateAfter(3, s)).toBeNull()
    s.leppink[5] = true
    expect(gateAfter(5, s)).toBe('/tes/post')
    s.post = true
    expect(gateAfter(5, s)).toBeNull()
  })
})

describe('status tersimpan', () => {
  it('markDone menyimpan per kode siswa', () => {
    const st = memoryStorage()
    markDone(st, 'T01', 'pre')
    markDone(st, 'T01', 2)
    expect(loadStatus(st, 'T01')).toEqual({ pre: true, post: false, leppink: { 2: true } })
    expect(loadStatus(st, 'S01')).toEqual(emptyStatus())
  })

  it('mergeStatus: terkirim di salah satu = terkirim', () => {
    const a = { pre: true, post: false, leppink: { 1: true } }
    const b = { pre: false, post: true, leppink: { 2: true } }
    expect(mergeStatus(a, b)).toEqual({ pre: true, post: true, leppink: { 1: true, 2: true } })
  })
})

describe('item antrian', () => {
  let n = 0
  const makeId = () => `id-${++n}`

  it('test_answers: satu baris per butir, target konflik unik', () => {
    const items = testAnswerItems('pre', [{ id: 'b1' }, { id: 'b2' }], { b1: '  jawab  ' }, 'u1', makeId)
    expect(items).toHaveLength(2)
    expect(items[0].row).toEqual({ client_id: items[0].client_id, student_id: 'u1', kind: 'pre', item_id: 'b1', answer: 'jawab' })
    expect(items[1].row.answer).toBe('')
    expect(items[0].onConflict).toBe('student_id,kind,item_id')
  })

  it('leppink: 10 kolom', () => {
    const values = { il1: 1, il2: 2, il3: 3, el1: 4, el2: 5, el3: 6, gl1: 7, gl2: 8, gl3: 9, gl4: 10 }
    const item = leppinkItem(4, values, 'u1', makeId)
    expect(item.table).toBe('leppink_responses')
    expect(item.row).toMatchObject({ meeting: 4, student_id: 'u1', il1: 1, gl4: 10 })
    expect(item.onConflict).toBe('student_id,meeting')
  })
})

describe('sumStages', () => {
  const stages = [{ max: 1 }, { max: 2 }, { max: 1 }]
  it('menjumlah bila lengkap & dalam batas', () => {
    expect(sumStages([1, 2, 0], stages)).toBe(3)
  })
  it('null bila belum lengkap atau melebihi maks', () => {
    expect(sumStages([1, null, 0], stages)).toBeNull()
    expect(sumStages([1, 3, 0], stages)).toBeNull()
    expect(sumStages([1, 2], stages)).toBeNull()
    expect(sumStages(null, stages)).toBeNull()
  })
})
