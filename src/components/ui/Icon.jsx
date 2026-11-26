// Ikon fungsi berupa SVG garis sederhana (DESIGN.md §8: bukan emoji).
const PATHS = {
  back: 'M15 5l-7 7 7 7',
  hint: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h13',
  redo: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4',
  check: 'M5 12l5 5 9-10',
  alert: 'M12 6v8M12 18h.01',
}

export default function Icon({ name, className = 'size-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
