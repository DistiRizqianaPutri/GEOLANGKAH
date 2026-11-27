import { useEffect, useMemo, useReducer, useRef } from 'react'
import { useNavigate } from 'react-router'
import { newId } from '../../lib/logQueue.js'
import {
  canAdvance,
  createStepReducer,
  flattenSteps,
  loadProgress,
  logKeys,
  progressItem,
  saveProgress,
  stepLogItem,
  unqueuedKeys,
} from '../../lib/stepEngine.js'
import PHASE_LABEL from '../../content/phases.json'
import useSession from '../ui/useSession.js'
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
 * M6: saat Lanjut pertama kali, catatan langkah diberi client_id lalu masuk antrian log
 * (ARSITEKTUR §6). Durasi = waktu layar terlihat (bukan penghitung yang tampil ke siswa).
 */
export default function StepEngine({ meeting, stationName, code, userId }) {
  const navigate = useNavigate()
  const { queue } = useSession()
  const n = meeting.meeting
  const steps = useMemo(() => flattenSteps(meeting, `${code}-m${n}`), [meeting, code, n])
  const reducer = useMemo(() => createStepReducer(steps), [steps])
  const [state, dispatch] = useReducer(reducer, null, () => loadProgress(localStorage, code, n))
  const step = steps[Math.min(state.index, steps.length - 1)]
  const record = state.records[step.id]

  // Waktu aktif: dihitung sejak layar langkah tampil; berhenti saat tab disembunyikan.
  const shownAt = useRef(null)
  const takeElapsed = () => {
    const now = Date.now()
    const ms = shownAt.current === null ? 0 : now - shownAt.current
    shownAt.current = document.hidden ? null : now
    return ms
  }
  useEffect(() => {
    shownAt.current = document.hidden ? null : Date.now()
  }, [state.index])
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        dispatch({ type: 'ADD_TIME', stepId: step.id, ms: takeElapsed() })
        queue?.flush()
      } else {
        shownAt.current = Date.now()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [step.id, queue])

  // Badan efek selalu pakai { } agar tidak ada nilai yang dikembalikan ke React sebagai cleanup.
  useEffect(() => {
    saveProgress(localStorage, code, n, state)
  }, [state, code, n])

  // Catatan ber-client_id yang belum masuk antrian → antrian (aman diulang: client_id sama = satu item/baris).
  useEffect(() => {
    if (!queue) return
    const keys = unqueuedKeys(state.records)
    for (const key of keys) {
      queue.enqueue(stepLogItem(key, state.records[key], { studentId: userId, meeting: n }))
      dispatch({ type: 'MARK_QUEUED', key })
    }
    if (keys.length) queue.flush()
  }, [state.records, queue, userId, n])

  // Posisi langkah & selesai → tabel progress (item lama yang belum terkirim diganti).
  useEffect(() => {
    if (!queue) return
    queue.enqueue(progressItem(state, steps, { studentId: userId, meeting: n, clientId: newId() }))
    queue.flush()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hanya saat posisi/selesai berubah
  }, [state.index, state.finished, queue, userId, n, steps])

  useEffect(() => {
    if (state.finished) navigate(`/hasil/${n}`, { replace: true })
  }, [state.finished, n, navigate])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [state.index])

  const next = () => {
    const clientIds = Object.fromEntries(logKeys(step, state.records).map((k) => [k, newId()]))
    dispatch({ type: 'NEXT', clientIds, elapsedMs: takeElapsed(), now: Date.now() })
  }
  const back = () => {
    if (state.index === 0) {
      dispatch({ type: 'ADD_TIME', stepId: step.id, ms: takeElapsed() })
      navigate('/peta')
    } else {
      dispatch({ type: 'BACK', elapsedMs: takeElapsed() })
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title={stationName} index={state.index} total={steps.length} onBack={back} />
      <main className="mx-auto w-full max-w-md flex-1 space-y-3 p-4">
        {PHASE_LABEL[step.phase] && <p className="font-extrabold text-text-muted">{PHASE_LABEL[step.phase]}</p>}
        <StepView
          key={`${step.id}-${state.figureReset}`}
          step={step}
          records={state.records}
          onAttempt={(r, stepId = step.id) =>
            dispatch({ type: 'ATTEMPT', stepId, correct: r.correct, errorCode: r.errorCode, answer: r.answer })
          }
          onHint={(level) => dispatch({ type: 'OPEN_HINT', stepId: step.id, level })}
        />
        {(step.phase === 'latih' || step.phase === 'tantangan' || step.stage === 'hitung') && <FormulaCard meeting={n} />}
        {resettable(step) && (
          <TextButton onClick={() => dispatch({ type: 'RESET_FIGURE' })}>
            <Icon name="redo" />
            Ulangi langkah
          </TextButton>
        )}
      </main>
      {canAdvance(step, record) && (
        <div className="sticky bottom-0 mx-auto w-full max-w-md bg-bg-to/95 p-4 pt-2">
          <PrimaryButton onClick={next}>Lanjut</PrimaryButton>
        </div>
      )}
    </div>
  )
}
