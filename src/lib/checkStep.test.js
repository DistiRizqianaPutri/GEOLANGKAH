import { describe, expect, it } from 'vitest'
import { checkChoice, checkFaded, checkIdentify, checkSolve, parseTemplate, templateKeys } from './checkStep.js'

const rectArea = {
  problem: { shape: 'rect', ask: 'area', unit: 'cm', p: 10, l: 5 },
  answer: { value: 50, unit: 'cm²' },
  template: 'L = 10 × {l}',
}

describe('checkSolve memakai diagnose()', () => {
  it('benar (koma diterima)', () => {
    expect(checkSolve(rectArea, '50', 'cm²')).toEqual({ correct: true, errorCode: null, answer: '50 cm²' })
    expect(checkSolve(rectArea, '50,0', 'cm²').correct).toBe(true)
  })
  it('angka benar, satuan salah → E_SATUAN', () => {
    expect(checkSolve(rectArea, '50', 'cm').errorCode).toBe('E_SATUAN')
  })
  it('satuan belum dipilih → E_SATUAN', () => {
    expect(checkSolve(rectArea, '50', null).errorCode).toBe('E_SATUAN')
  })
  it('nilai keliling saat ditanya luas → E_KL_TERTUKAR', () => {
    expect(checkSolve(rectArea, '30', 'cm²').errorCode).toBe('E_KL_TERTUKAR')
  })
  it('isian bukan angka → null (tombol Cek tidak aktif)', () => {
    expect(checkSolve(rectArea, '', 'cm²')).toBeNull()
  })
})

describe('templat memudar', () => {
  it('parseTemplate memecah teks dan kotak ▢', () => {
    expect(parseTemplate('K = 2 × ({p} + {l})')).toEqual([
      { text: 'K = 2 × (' },
      { key: 'p' },
      { text: ' + ' },
      { key: 'l' },
      { text: ')' },
    ])
    expect(templateKeys('K = 2 × ({p} + {l})')).toEqual(['p', 'l'])
  })

  it('kotak salah → E_KOTAK walau hasil akhir benar', () => {
    expect(checkFaded(rectArea, { l: '4' }, '50', 'cm²')).toMatchObject({ correct: false, errorCode: 'E_KOTAK' })
  })
  it('kotak kosong → E_KOTAK', () => {
    expect(checkFaded(rectArea, {}, '50', 'cm²').errorCode).toBe('E_KOTAK')
  })
  it('kotak benar → hasil akhir didiagnosis', () => {
    expect(checkFaded(rectArea, { l: '5' }, '50', 'cm²')).toMatchObject({ correct: true, answer: 'l=5; 50 cm²' })
    expect(checkFaded(rectArea, { l: '5' }, '50', 'cm').errorCode).toBe('E_SATUAN')
  })
  it('kotak siku-siku memakai nilai dari problem (s1 = 12)', () => {
    const step = {
      problem: { shape: 'trapezoid', kind: 'right', ask: 'perimeter', unit: 'cm', a: 12, b: 7, t: 12, s1: 12, s2: 13 },
      template: 'K = 12 + 7 + {s1} + 13',
    }
    expect(checkFaded(step, { s1: '12' }, '44', 'cm').correct).toBe(true)
    expect(checkFaded(step, { s1: '13' }, '44', 'cm').errorCode).toBe('E_KOTAK')
  })
})

describe('checkIdentify (ketuk unsur)', () => {
  it('dua sisi sejajar, urutan bebas', () => {
    expect(checkIdentify({ ask: 'parallel', answer: ['a', 'b'] }, ['b', 'a'])).toMatchObject({ correct: true, errorCode: null })
  })
  it('memilih kaki sebagai tinggi → E_KAKI_SBG_TINGGI', () => {
    expect(checkIdentify({ ask: 'height', answer: ['t'] }, ['s2']).errorCode).toBe('E_KAKI_SBG_TINGGI')
  })
  it('siku-siku: sisi tegak AD adalah tinggi, kaki miring BC pengecoh', () => {
    expect(checkIdentify({ ask: 'height', answer: ['s1'] }, ['s1']).correct).toBe(true)
    expect(checkIdentify({ ask: 'height', answer: ['s1'] }, ['s2']).errorCode).toBe('E_KAKI_SBG_TINGGI')
  })
  it('pilihan lain → E_LAIN', () => {
    expect(checkIdentify({ ask: 'parallel', answer: ['a', 'b'] }, ['a', 's1']).errorCode).toBe('E_LAIN')
    expect(checkIdentify({ ask: 'parallel', answer: ['a', 'b'] }, ['a']).errorCode).toBe('E_LAIN')
  })
})

describe('checkChoice (PG dengan umpan balik per opsi)', () => {
  const question = {
    options: [
      { text: 'Ya', correct: false, feedback: 'Bandingkan labelnya.' },
      { text: 'Tidak', correct: true, feedback: 'Tepat!' },
    ],
  }
  it('opsi benar', () => {
    expect(checkChoice(question, 1)).toEqual({ correct: true, errorCode: null, answer: 'Tidak', feedback: 'Tepat!' })
  })
  it('opsi salah → E_LAIN + umpan balik opsinya', () => {
    expect(checkChoice(question, 0)).toEqual({ correct: false, errorCode: 'E_LAIN', answer: 'Ya', feedback: 'Bandingkan labelnya.' })
  })
})
