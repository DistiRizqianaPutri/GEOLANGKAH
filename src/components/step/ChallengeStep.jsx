import ChoiceQuestion from './ChoiceQuestion.jsx'
import IdentifyStep from './IdentifyStep.jsx'
import SolveStep from './SolveStep.jsx'

/** Kunci catatan pilihan pendahuluan (mis. "keliling atau luas?"); tidak ikut skor. */
const choiceKey = (step) => `${step.id}#pilih`

/**
 * Soal Tantangan Pos (KONTEN.md §10): tanpa contoh, petunjuk tetap ada (tercatat),
 * maksimal 2 percobaan. Bisa berupa ketuk unsur atau soal hitung (dengan pilihan pendahuluan).
 */
export default function ChallengeStep({ step, records, onAttempt, onHint }) {
  const record = records[step.id]
  if (step.task === 'identify') {
    return <IdentifyStep step={step} record={record} onAttempt={(r) => onAttempt(r)} onHint={onHint} isChallenge />
  }
  const choice = records[choiceKey(step)]
  const ready = !step.question || choice?.done === true
  return (
    <SolveStep
      step={step}
      record={record}
      onAttempt={(r) => onAttempt(r)}
      onHint={onHint}
      isChallenge
      ready={ready}
      prelude={step.question && <ChoiceQuestion question={step.question} record={choice} onAttempt={(r) => onAttempt(r, choiceKey(step))} />}
    />
  )
}
