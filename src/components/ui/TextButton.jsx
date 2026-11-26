/** Tombol sekunder berupa teks (DESIGN.md §3), target sentuh ≥ 48 px. */
export default function TextButton({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-12 items-center gap-2 px-1 font-extrabold text-heading underline-offset-4 active:underline ${className}`}
    >
      {children}
    </button>
  )
}
