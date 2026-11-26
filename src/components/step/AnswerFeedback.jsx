import { feedbackText } from '../../lib/feedback.js'
import FeedbackBanner from '../answer/FeedbackBanner.jsx'

/**
 * Umpan balik sebuah soal: hasil cek terakhir (`result`) atau, saat langkah
 * dibuka lagi, catatan yang tersimpan. Tantangan: setelah 2× salah, jawaban + pembahasan tampil.
 */
export default function AnswerFeedback({ step, record, result, isChallenge, revealText }) {
  const solution = step.hints?.[2]
  const convert = step.problem?.convert
  const context = convert
    ? { ask: 'convert', unit: convert.unit }
    : { ask: step.problem?.ask ?? step.ask, unit: step.problem?.unit }
  const attempts = record?.attempts ?? 0

  if (record?.revealed) {
    return (
      <div className="space-y-2">
        {result && <FeedbackBanner correct={false} text={feedbackText(result.errorCode, context)} />}
        <FeedbackBanner correct={false} text={`Kesempatan habis. Jawaban yang benar: ${revealText}.`} solution={solution} revealed />
      </div>
    )
  }
  if (result) {
    return (
      <div className="space-y-2">
        <FeedbackBanner
          key={attempts}
          correct={result.correct}
          text={feedbackText(result.correct ? null : result.errorCode, context)}
          solution={result.correct ? solution : undefined}
        />
        {isChallenge && !result.correct && <p className="text-text-muted">Masih ada 1 kesempatan lagi.</p>}
      </div>
    )
  }
  if (record?.done && record.is_correct) {
    return <FeedbackBanner correct text={`Tepat! Jawabanmu: ${record.answer}`} solution={solution} />
  }
  return null
}
