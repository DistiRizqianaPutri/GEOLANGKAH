import { useState } from 'react'
import { callExport, downloadBlob } from '../../lib/researcher.js'

const TABLES = [
  { table: 'step_logs', label: 'Log langkah' },
  { table: 'test_answers', label: 'Jawaban tes' },
  { table: 'leppink', label: 'Skala Leppink' },
]

/** Unduh CSV & ringkasan dari /api/export (Python, Vercel). Bawaan: hanya kode S..; centang untuk ikut T... */
export default function ExportPanel({ client }) {
  const [includeTest, setIncludeTest] = useState(false)
  const [message, setMessage] = useState('')

  const run = async (params, filename) => {
    setMessage('Mengunduh…')
    try {
      const res = await callExport(client, includeTest ? { ...params, include_test: '1' } : params)
      downloadBlob(await res.blob(), filename)
      setMessage('')
    } catch (err) {
      setMessage(`! ${err.message}`)
    }
  }

  const button = 'min-h-12 rounded-button border-2 border-heading px-3 font-extrabold text-heading'
  return (
    <section className="space-y-2 rounded-card border border-surface-border bg-surface p-3">
      <p className="font-extrabold text-heading">Unduh data</p>
      <label className="flex min-h-12 items-center gap-2">
        <input type="checkbox" checked={includeTest} onChange={(e) => setIncludeTest(e.target.checked)} className="size-5" />
        Sertakan akun uji (T..)
      </label>
      <div className="flex flex-wrap gap-2">
        {TABLES.map((t) => (
          <button key={t.table} type="button" className={button} onClick={() => run({ table: t.table }, `${t.table}.csv`)}>
            {t.label} (CSV)
          </button>
        ))}
        <button type="button" className={button} onClick={() => run({ summary: '1' }, 'ringkasan.json')}>
          Ringkasan (JSON)
        </button>
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  )
}
