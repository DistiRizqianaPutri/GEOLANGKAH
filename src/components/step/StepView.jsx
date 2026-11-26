import ChallengeStep from './ChallengeStep.jsx'
import ExplainStep from './ExplainStep.jsx'
import ExploreStep from './ExploreStep.jsx'
import FadedStep from './FadedStep.jsx'
import IdentifyStep from './IdentifyStep.jsx'
import SolveStep from './SolveStep.jsx'
import WhyStep from './WhyStep.jsx'

/** Pilih tampilan sesuai tipe langkah (KONTEN.md §9). */
export default function StepView({ step, records, onAttempt, onHint }) {
  const props = { step, record: records[step.id], onAttempt, onHint }
  switch (step.type) {
    case 'explain':
      return <ExplainStep {...props} />
    case 'explore':
      return <ExploreStep {...props} />
    case 'identify':
      return <IdentifyStep {...props} />
    case 'faded':
      return <FadedStep {...props} />
    case 'solve':
      return <SolveStep {...props} />
    case 'why':
      return <WhyStep {...props} />
    case 'challenge':
      return <ChallengeStep step={step} records={records} onAttempt={onAttempt} onHint={onHint} />
    default:
      return null
  }
}
