import { useEffect, useMemo, useReducer } from 'react'
import { useNavigate } from 'react-router'
import { canAdvance, createStepReducer, flattenSteps, loadProgress, saveProgress } from '../../lib/stepEngine.js'
import FormulaCard from '../hint/FormulaCard.jsx'
import Icon from '../ui/Icon.jsx'
import PrimaryButton from '../ui/PrimaryButton.jsx'
import TextButton from '../ui/TextButton.jsx'
import TopBar from '../ui/TopBar.jsx'
import StepView from './StepView.jsx'

/** Langkah yang gambarnya bisa diubah siswa → tampilkan "Ulangi langkah". */
const resettable = (step) => step.figure && (step.figure.draggable || step.actions || step.variants)

/**
 * Mesin langkah (F-04): satu langkah per layar, Lanjut / Kembali / Ulangi,
 * tanpa timer dan tanpa auto-lanjut. Progres disimpan di HP setiap berubah.
 */
export default function StepEngine({ meeting, stationName, code }) {
  const navigate = useNavigate()
  const n = meeting.meeting
  const steps = useMemo(() => flattenSteps(meeting, `${code}-m${n}`), [meeting, code, n])
  const reducer = useMemo(() => createStepReducer(steps), [steps])
  const [state, dispatch] = useReducer(reducer, null, () => loadProgress(localStorage, code, n))

  useEffect(() => saveProgress(localStorage, code, n, state), [state, code, n])
  useEffect(() => {
    if (state.finished) navigate(`/hasil/${n}`, { replace: true })
  }, [state.finished, n, navigate])
  useEffect(() => window.scrollTo(0, 0), [state.index])

  const step = steps[Math.min(state.index, steps.length - 1)]
  const record = state.records[step.id]
  const back = () => (state.index === 0 ? navigate('/peta') : dispatch({ type: 'BACK' }))

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title={stationName} index={state.index} total={steps.length} onBack={back} />
      <main className="mx-auto w-full max-w-md flex-1 space-y-3 p-4">
        <StepView
          key={`${step.id}-${state.figureReset}`}
          step={step}
          records={state.records}
          onAttempt={(r, stepId = step.id) =>
            dispatch({ type: 'ATTEMPT', stepId, correct: r.correct, errorCode: r.errorCode, answer: r.answer })
          }
          onHint={(level) => dispatch({ type: 'OPEN_HINT', stepId: step.id, level })}
        />
        {(step.phase === 'latih' || step.phase === 'tantangan') && <FormulaCard meeting={n} />}
        {resettable(step) && (
          <TextButton onClick={() => dispatch({ type: 'RESET_FIGURE' })}>
            <Icon name="redo" />
            Ulangi langkah
          </TextButton>
        )}
      </main>
      {canAdvance(step, record) && (
        <div className="sticky bottom-0 mx-auto w-full max-w-md bg-bg-to/95 p-4 pt-2">
          <PrimaryButton onClick={() => dispatch({ type: 'NEXT' })}>Lanjut</PrimaryButton>
        </div>
      )}
    </div>
  )
}
