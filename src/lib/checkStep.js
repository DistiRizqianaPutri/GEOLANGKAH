// Memeriksa jawaban per tipe langkah. Semua hitungan tetap di geometry.js:
// file ini hanya menghubungkan isi konten (problem, template) ke checkAnswer/diagnose.
import { parseNumber } from './answer.js'
import { checkAnswer, diagnose } from './geometry.js'

const answerText = (raw, unit) => `${String(raw).trim()}${unit ? ` ${unit}` : ''}`

/**
 * Soal hitung (solve, challenge). Isian bukan angka → null (tombol Cek tidak aktif).
 * @returns {{correct:boolean, errorCode:string|null, answer:string}|null}
 */
export function checkSolve(step, raw, unit) {
  const value = parseNumber(raw)
  if (value === null) return null
  const errorCode = diagnose(step.problem, value, unit ?? '')
  return { correct: errorCode === null, errorCode, answer: answerText(raw, unit) }
}

/** "L = 10 × {l}" → [{text:'L = 10 × '}, {key:'l'}] */
export function parseTemplate(template) {
  return template
    .split(/(\{[a-z0-9]+\})/i)
    .filter(Boolean)
    .map((part) => (/^\{.+\}$/.test(part) ? { key: part.slice(1, -1) } : { text: part }))
}

/** Nama kotak ▢ di templat, mis. ['p', 'l']. */
export function templateKeys(template) {
  return parseTemplate(template)
    .filter((p) => p.key)
    .map((p) => p.key)
}

/**
 * Langkah memudar: kotak ▢ dicek dulu (nilainya = problem[kunci]);
 * bila ada yang salah/kosong → E_KOTAK, bila benar → hasil akhir didiagnosis.
 */
export function checkFaded(step, blanks, raw, unit) {
  const keys = templateKeys(step.template)
  const filled = keys.map((k) => `${k}=${(blanks[k] ?? '').trim()}`).join(', ')
  const blanksOk = keys.every((k) => {
    const v = parseNumber(blanks[k])
    return v !== null && checkAnswer(v, '', { value: step.problem[k], unit: '' }).valueOk
  })
  if (!blanksOk) return { correct: false, errorCode: 'E_KOTAK', answer: `${filled}; ${answerText(raw ?? '', unit)}` }
  const result = checkSolve(step, raw, unit)
  if (!result) return null
  return { ...result, answer: `${filled}; ${result.answer}` }
}

const LEGS = ['s1', 's2']

/**
 * Ketuk unsur. `item.answer` = kunci unsur yang benar (urutan bebas).
 * Kaki dipilih saat ditanya tinggi → E_KAKI_SBG_TINGGI; selain itu E_LAIN.
 */
export function checkIdentify(item, selection) {
  const want = new Set(item.answer)
  const got = new Set(selection)
  const correct = want.size === got.size && [...want].every((k) => got.has(k))
  let errorCode = null
  if (!correct) {
    const legChosen = [...got].some((k) => LEGS.includes(k) && !want.has(k))
    errorCode = item.ask === 'height' && legChosen ? 'E_KAKI_SBG_TINGGI' : 'E_LAIN'
  }
  return { correct, errorCode, answer: [...selection].sort().join(',') }
}

/** Pilihan ganda dengan umpan balik per opsi. */
export function checkChoice(question, index) {
  const option = question.options[index]
  return {
    correct: option.correct === true,
    errorCode: option.correct ? null : 'E_LAIN',
    answer: option.text,
    feedback: option.feedback,
  }
}
