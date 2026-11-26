// Acak yang bisa diulang: seed = kode siswa + pertemuan (keputusan 26-11-2026).

/** Hash string → bilangan 32-bit (FNV-1a). */
function hash(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Pembangkit bilangan acak mulberry32 → fungsi yang menghasilkan [0, 1). */
function mulberry32(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Salinan `list` yang diacak (Fisher–Yates) dengan seed string. */
export function seededShuffle(list, seed) {
  const rand = mulberry32(hash(String(seed)))
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
