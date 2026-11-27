import { Link } from 'react-router'
import MEETINGS from '../content/meetings.js'
import stations from '../content/stations.json'
import TextButton from '../components/ui/TextButton.jsx'
import useServerProgress from '../components/ui/useServerProgress.js'
import useSession from '../components/ui/useSession.js'
import { isMeetingDone, loadProgress } from '../lib/stepEngine.js'

const NUMBER = ['①', '②', '③', '④', '⑤']

/**
 * Peta Petualangan (layar luar, DESIGN.md §4.2): jalur vertikal 5 pos.
 * Pos dibuka berurutan: selesai ✓ · sedang berjalan [Mulai ›] · terkunci 🔒.
 * Pos yang kontennya belum ada (M5) terkunci dengan tulisan "Segera".
 * M6: pos selesai = selesai di HP ini ATAU tercatat selesai di Supabase (HP lain).
 */
export default function AdventureMap() {
  const { session, signOut } = useSession()
  const { code, nickname } = session
  const server = useServerProgress() ?? {}
  const done = stations.map((s) => isMeetingDone(localStorage, code, s.meeting) || Boolean(server[s.meeting]?.completed_at))
  const current = done.findIndex((d) => !d)

  return (
    <main className="mx-auto min-h-dvh max-w-md space-y-4 p-4">
      <header>
        <p className="text-step-title font-extrabold text-heading">Halo, {nickname ?? code}! 👋</p>
        <p className="text-text-muted">Jelajah Desa Bangun Datar</p>
      </header>

      <ol className="space-y-0">
        {stations.map((s, i) => {
          const available = Boolean(MEETINGS[s.meeting])
          const isCurrent = i === current && available
          const started =
            isCurrent && (loadProgress(localStorage, code, s.meeting).index > 0 || Boolean(server[s.meeting]?.last_step_id))
          return (
            <li key={s.meeting}>
              {i > 0 && <div className="ml-7 h-6 border-l-4 border-dotted border-surface-border" aria-hidden="true" />}
              <div
                className={`flex min-h-16 items-center gap-3 rounded-card border bg-surface p-3 ${isCurrent ? 'border-2 border-heading' : 'border-surface-border'}`}
              >
                <span className="text-step-title font-extrabold text-heading" aria-hidden="true">
                  {NUMBER[i]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold">{s.name}</span>
                  <span className="block text-base text-text-muted">{s.title}</span>
                </span>
                {done[i] && (
                  <Link to={`/hasil/${s.meeting}`} className="flex min-h-12 items-center font-extrabold text-success" aria-label={`${s.name} selesai, lihat hasil`}>
                    ✓ Hasil
                  </Link>
                )}
                {isCurrent && (
                  <Link
                    to={`/pertemuan/${s.meeting}`}
                    className="flex min-h-12 items-center rounded-button bg-linear-to-b from-primary-from to-primary-to px-3 font-extrabold text-primary-text shadow-[0_3px_0_var(--color-primary-shadow)]"
                  >
                    {started ? 'Lanjut ›' : 'Mulai ›'}
                  </Link>
                )}
                {!done[i] && !isCurrent && (
                  <span className="text-text-muted" aria-label="Terkunci">
                    🔒{!available && ' Segera'}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <TextButton onClick={signOut}>Keluar ({code})</TextButton>
    </main>
  )
}
