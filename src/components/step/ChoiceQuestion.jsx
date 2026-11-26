import { useState } from 'react'
import { checkChoice } from '../../lib/checkStep.js'
import FeedbackBanner from '../answer/FeedbackBanner.jsx'

/**
 * Pilihan ganda dengan umpan balik per opsi. Boleh mencoba sampai benar;
 * setiap pilihan dicatat sebagai percobaan. Setelah benar, terkunci.
 */
export default function ChoiceQuestion({ question, record, onAttempt }) {
  const [picked, setPicked] = useState(null)
  const done = record?.done === true
  const shown = picked ?? (done ? question.options.findIndex((o) => o.correct) : null)

  const choose = (i) => {
    if (done) return
    setPicked(i)
    onAttempt(checkChoice(question, i))
  }

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 font-extrabold text-heading">{question.prompt}</legend>
      {question.options.map((o, i) => (
        <button
          key={o.text}
          type="button"
          onClick={() => choose(i)}
          disabled={done && shown !== i}
          aria-pressed={shown === i}
          className="block min-h-12 w-full rounded-button border-2 border-surface-border bg-white px-3 py-2 text-left font-extrabold aria-pressed:border-heading aria-pressed:bg-primary-from/40 disabled:opacity-50"
        >
          {o.text}
        </button>
      ))}
      {shown !== null && (
        <FeedbackBanner key={`${shown}-${record?.attempts}`} correct={question.options[shown].correct === true} text={question.options[shown].feedback} />
      )}
    </fieldset>
  )
}
