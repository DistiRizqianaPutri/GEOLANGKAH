import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2)

/**
 * Progres animasi 0 → 1 yang HANYA berjalan setelah `trigger` bertambah
 * (siswa menekan tombol; DESIGN.md §5). Bisa diulang. Bila pengguna memilih
 * kurangi gerakan, hasil akhir langsung tampil.
 *
 * @param {number} trigger  penghitung dari tombol (0 = belum pernah ditekan)
 * @param {number} duration ms, maks. 1200
 * @returns {{progress:number, started:boolean}}
 */
export default function useAnimation(trigger, duration = 1000) {
  const [progress, setProgress] = useState(0)
  const frame = useRef(0)

  useEffect(() => {
    if (!trigger) return undefined
    const ms = Math.min(duration, 1200)
    const reduced = prefersReducedMotion()
    let start
    const tick = (now) => {
      start ??= now
      const p = reduced ? 1 : Math.min(1, (now - start) / ms)
      setProgress(ease(p))
      if (p < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [trigger, duration])

  return { progress, started: trigger > 0 }
}
