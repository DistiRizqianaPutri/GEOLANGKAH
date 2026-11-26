import Icon from '../ui/Icon.jsx'

/** "Butuh petunjuk?" — selalu terlihat. Setelah 2× salah, ditawarkan lebih jelas (tidak dipaksakan). */
export default function HintButton({ onClick, offer, expanded }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`inline-flex min-h-12 items-center gap-2 rounded-button px-2 font-extrabold text-hint ${offer ? 'border-2 border-hint bg-hint-bg' : ''}`}
    >
      <Icon name="hint" />
      {offer ? 'Mau petunjuk? Buka di sini' : 'Butuh petunjuk?'}
    </button>
  )
}
