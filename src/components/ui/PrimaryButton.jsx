/** Tombol utama (DESIGN.md §2.4): tinggi 52 px, lebar penuh. Satu per layar. */
export default function PrimaryButton({ children, onClick, disabled = false, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="h-13 w-full rounded-button bg-linear-to-b from-primary-from to-primary-to text-body font-extrabold text-primary-text shadow-[0_3px_0_var(--color-primary-shadow)] active:translate-y-0.5 active:shadow-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}
