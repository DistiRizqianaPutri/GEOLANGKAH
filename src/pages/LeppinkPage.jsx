import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import LeppinkItem from '../components/ui/LeppinkItem.jsx'
import PrimaryButton from '../components/ui/PrimaryButton.jsx'
import TopBar from '../components/ui/TopBar.jsx'
import useInstrumentStatus from '../components/ui/useInstrumentStatus.js'
import useSession from '../components/ui/useSession.js'
import leppink from '../content/leppink.json'
import { clearDraft, leppinkItem, loadDraft, markDone, saveDraft } from '../lib/instruments.js'
import { isMeetingDone } from '../lib/stepEngine.js'

/**
 * Skala Leppink (/skala/:n) di akhir setiap pos — PRD F-13, DESIGN.md §4.7.
 * Satu pernyataan per layar; layar pertama berisi petunjuk. Setelah dikirim terkunci.
 */
export default function LeppinkPage() {
  const n = Number(useParams().n)
  const { session } = useSession()
  const status = useInstrumentStatus()
  if (!(n >= 1 && n <= 5) || !isMeetingDone(localStorage, session.code, n)) return <Navigate to="/peta" replace />
  if (!status) return null
  if (status.leppink[n]) return <Navigate to={`/hasil/${n}`} replace />
  return <LeppinkForm key={n} n={n} />
}

function LeppinkForm({ n }) {
  const navigate = useNavigate()
  const { session, queue } = useSession()
  const { code, userId } = session
  const name = `leppink-${n}`
  const items = leppink.items
  const [index, setIndex] = useState(0) // 0 = petunjuk
  const [values, setValues] = useState(() => loadDraft(localStorage, code, name, {}))
  const item = items[index - 1]
  const last = index === items.length

  const choose = (v) => {
    const next = { ...values, [item.id]: v }
    setValues(next)
    saveDraft(localStorage, code, name, next)
  }

  const submit = () => {
    if (queue) {
      queue.enqueue(leppinkItem(n, values, userId))
      queue.flush()
    }
    markDone(localStorage, code, n)
    clearDraft(localStorage, code, name)
    navigate(`/hasil/${n}`, { replace: true })
  }

  const back = () => (index === 0 ? navigate('/peta') : setIndex(index - 1))

  return (
    <>
      <TopBar title={`Pos ${n} · Pendapatmu`} index={index} total={items.length + 1} onBack={back} />
      <main className="mx-auto max-w-md space-y-4 p-4">
        {index === 0 ? (
          <section className="rounded-card border border-surface-border bg-surface p-4">
            <p>{leppink.instructions}</p>
          </section>
        ) : (
          <>
            <p className="text-text-muted">
              Pernyataan {index} dari {items.length}
            </p>
            <LeppinkItem text={item.text} label0={leppink.label0} label10={leppink.label10} value={values[item.id]} onChange={choose} />
          </>
        )}
        <PrimaryButton disabled={Boolean(item) && values[item.id] === undefined} onClick={last ? submit : () => setIndex(index + 1)}>
          {last ? 'Kirim' : 'Lanjut'}
        </PrimaryButton>
      </main>
    </>
  )
}
