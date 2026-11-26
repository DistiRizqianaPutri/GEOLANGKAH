// Logika mode baca soal cerita (F-08, KONTEN §6 tahap Rumuskan). Fungsi murni,
// dipakai StoryStep.jsx. Langkah `story`: { segments: [{ text, chips }], asked: [{ label, question }] }.
// Chip info penting punya `known` ({ key, label, value?, unit?, text? }); chip pengecoh punya `feedback`.
import { formatAnswer } from './geometry.js'

/** Potong teks potongan menjadi teks biasa dan chip yang bisa diketuk (urut sesuai teks). */
export function splitSegment(segment) {
  const chips = (segment.chips ?? [])
    .map((chip) => ({ chip, at: segment.text.indexOf(chip.text) }))
    .filter(({ at }) => at >= 0)
    .sort((x, y) => x.at - y.at)
  const parts = []
  let pos = 0
  for (const { chip, at } of chips) {
    if (at < pos) continue // chip bertumpuk: abaikan
    if (at > pos) parts.push({ text: segment.text.slice(pos, at) })
    parts.push({ chip })
    pos = at + chip.text.length
  }
  if (pos < segment.text.length) parts.push({ text: segment.text.slice(pos) })
  return parts
}

/** Semua chip di cerita. */
export function allChips(step) {
  return step.segments.flatMap((s) => s.chips ?? [])
}

/** Chip info penting (wajib masuk Diketahui). */
export function knownChips(step) {
  return allChips(step).filter((c) => c.known)
}

/** Teks satu baris Diketahui, mis. "a = 20 m" atau "pupuk: 1 kg tiap 10 m²". */
export function knownText(known) {
  if (known.text) return `${known.label}: ${known.text}`
  return `${known.label} = ${formatAnswer(known.value, known.unit)}`
}

/** Info penting yang belum ada di Diketahui. */
export function missingKnown(step, marked) {
  const set = new Set(marked)
  return knownChips(step).filter((c) => !set.has(c.id))
}

/**
 * "Pindahkan ke Diketahui": chip penting yang dipilih masuk tabel (tanpa dobel, urutan cerita);
 * chip pengecoh ditolak dan dikembalikan dengan umpan baliknya.
 */
export function moveToKnown(step, marked, selected) {
  const chips = allChips(step)
  const picked = chips.filter((c) => selected.includes(c.id))
  const rejected = picked.filter((c) => !c.known)
  const set = new Set([...marked, ...picked.filter((c) => c.known).map((c) => c.id)])
  return { marked: chips.filter((c) => set.has(c.id)).map((c) => c.id), rejected }
}

/** Hasil (untuk catatan langkah) bila siswa memindahkan chip pengecoh. */
export function rejectResult(chip) {
  return { correct: false, errorCode: 'E_LAIN', answer: chip.text, feedback: chip.feedback }
}

/** Kunci catatan PG Ditanya ke-i (tidak ikut skor). */
export const askedKey = (step, i) => `${step.id}#ditanya-${i + 1}`

/** Teks kolom Ditanya setelah PG benar, mis. "Pagar: keliling". */
export function askedText(asked) {
  const right = asked.question.options.find((o) => o.correct)
  return `${asked.label}: ${right.text.toLowerCase()}`
}

/** Rumuskan selesai bila semua info penting ada di Diketahui dan semua PG Ditanya benar. */
export function storyComplete(step, marked, records) {
  const askedDone = (step.asked ?? []).every((_, i) => records[askedKey(step, i)]?.done === true)
  return missingKnown(step, marked).length === 0 && askedDone
}

/** Hasil akhir langkah cerita (dikirim sekali saat lengkap). */
export function storyResult(step, marked) {
  const byId = new Map(allChips(step).map((c) => [c.id, c]))
  return { correct: true, errorCode: null, answer: marked.map((id) => knownText(byId.get(id).known)).join('; ') }
}
