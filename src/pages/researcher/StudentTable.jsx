import tests from '../../content/tests.json'
import { duplicateIds, testState } from '../../lib/researcher.js'

function testCell(answers, kind) {
  const s = testState(answers, kind, tests.items.length)
  if (!s.sent) return '–'
  if (s.complete) return `${s.total}/${tests.maxScore}`
  return `terkirim (${s.scored}/${tests.items.length} dinilai)`
}

/** Daftar siswa: progres Pos 1–5, status pretest/posttest, jumlah Leppink terisi. */
export default function StudentTable({ students, selectedId, onSelect }) {
  const dupes = duplicateIds(students)
  return (
    <div className="overflow-x-auto rounded-card border border-surface-border bg-surface">
      <table className="w-full text-left text-base">
        <thead className="text-text-muted">
          <tr>
            <th className="p-2">Nama</th>
            <th className="p-2">Kelas</th>
            <th className="p-2">Kode</th>
            {[1, 2, 3, 4, 5].map((m) => (
              <th key={m} className="p-2 text-center">
                Pos {m}
              </th>
            ))}
            <th className="p-2">Pretest</th>
            <th className="p-2">Posttest</th>
            <th className="p-2">Leppink</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className={`border-t border-surface-border ${s.id === selectedId ? 'bg-hint-bg' : ''}`}>
              <td className="p-1">
                <button type="button" onClick={() => onSelect(s.id)} className="min-h-12 px-2 text-left font-extrabold text-heading underline">
                  {s.name || s.code || '(tanpa nama)'}
                </button>
                {dupes.has(s.id) && <span className="block px-2 font-extrabold text-error">⚠ nama & kelas sama</span>}
              </td>
              <td className="p-2">{s.kelas ?? '–'}</td>
              <td className="p-2">{s.code ?? '–'}</td>
              {[1, 2, 3, 4, 5].map((m) => (
                <td key={m} className="p-2 text-center">
                  {s.done[m] ? <span className="text-success">✓</span> : '·'}
                </td>
              ))}
              <td className="p-2">{testCell(s.answers, 'pre')}</td>
              <td className="p-2">{testCell(s.answers, 'post')}</td>
              <td className="p-2">{s.leppink.length}/5</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
