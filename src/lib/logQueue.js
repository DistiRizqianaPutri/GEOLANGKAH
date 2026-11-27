// Antrian log offline + sinkron (ARSITEKTUR §6).
// 1. Setiap item punya client_id (UUID) dan disimpan ke storage DULU.
// 2. Dikirim berurutan; server menolak client_id ganda (ON CONFLICT DO NOTHING),
//    jadi kirim ulang setelah respons hilang tetap menghasilkan satu baris.
// 3. Gagal/offline → tetap di antrian; dicoba lagi saat `online`, saat dibuka, tiap 30 detik.
// 4. Berhasil → dihapus dari antrian.
// Inti tidak bergantung pada browser/Supabase: `storage` dan `send` disuntikkan (dites Vitest).

export const SYNC_INTERVAL_MS = 30_000

export function queueKey(userId) {
  return `geolangkah:queue:${userId}`
}

/**
 * UUID v4. `crypto.randomUUID` hanya ada di konteks aman (https/localhost);
 * saat dicoba di HP lewat http://<IP-laptop> dipakai getRandomValues.
 */
export function newId(c = globalThis.crypto) {
  if (c.randomUUID) return c.randomUUID()
  const b = c.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

/** Kesalahan yang tidak akan sembuh bila dikirim ulang (mis. melanggar CHECK). */
export class PermanentSendError extends Error {
  constructor(message) {
    super(message)
    this.permanent = true
  }
}

/**
 * Item: { client_id, table, row, onConflict?, ignoreDuplicates?, dedupeKey? }
 * `dedupeKey` (mis. progres satu pertemuan): item baru menggantikan item lama yang belum terkirim.
 */
export function createLogQueue({ storage, key, send }) {
  const failedKey = `${key}:failed`
  const listeners = new Set()
  let flushing = null
  let lastError = null

  const readList = (k) => {
    try {
      const v = JSON.parse(storage.getItem(k))
      return Array.isArray(v) ? v : []
    } catch {
      return []
    }
  }
  const read = () => readList(key)
  const write = (items) => storage.setItem(key, JSON.stringify(items))

  const status = () => ({ pending: read().length, flushing: Boolean(flushing), lastError })
  const notify = () => {
    const s = status()
    for (const fn of listeners) fn(s)
  }

  function enqueue(item) {
    if (!item?.client_id || !item.table) throw new Error('item antrian butuh client_id dan table')
    let items = read()
    if (items.some((i) => i.client_id === item.client_id)) return false
    if (item.dedupeKey) items = items.filter((i) => i.dedupeKey !== item.dedupeKey)
    items.push(item)
    write(items)
    notify()
    return true
  }

  async function run() {
    let sent = 0
    for (;;) {
      const [first] = read()
      if (!first) break
      try {
        await send(first)
        lastError = null
      } catch (err) {
        if (!err?.permanent) {
          lastError = err?.message ?? String(err)
          break
        }
        // Jangan menghambat antrian selamanya, tetapi jangan juga membuang data.
        storage.setItem(failedKey, JSON.stringify([...readList(failedKey), { ...first, error: err.message }]))
      }
      // Baca ulang: item baru mungkin masuk saat menunggu `send`.
      write(read().filter((i) => i.client_id !== first.client_id))
      sent++
      notify()
    }
    return sent
  }

  /** Kirim semua item. Panggilan saat proses berjalan memakai proses yang sama. */
  function flush() {
    if (!flushing) {
      flushing = run().finally(() => {
        flushing = null
        notify()
      })
      notify()
    }
    return flushing
  }

  function subscribe(fn) {
    listeners.add(fn)
    fn(status())
    return () => listeners.delete(fn)
  }

  return {
    enqueue,
    flush,
    subscribe,
    status,
    size: () => read().length,
    items: read,
    failed: () => readList(failedKey),
  }
}

/** Pengirim ke Supabase. Siswa hanya punya izin insert → ON CONFLICT DO NOTHING. */
export function supabaseSender(client) {
  return async function send(item) {
    const { table, row, onConflict = 'client_id', ignoreDuplicates = true } = item
    const { error } = await client.from(table).upsert(row, { onConflict, ignoreDuplicates })
    if (error) {
      // Kode SQLSTATE kelas 22 (data) / 23 (constraint) tidak akan berhasil bila diulang.
      if (/^2[23]/.test(error.code ?? '')) throw new PermanentSendError(`${error.code}: ${error.message}`)
      throw new Error(error.message || 'gagal mengirim')
    }
  }
}

/** Coba kirim saat dibuka, saat event `online`, dan tiap 30 detik. Mengembalikan fungsi berhenti. */
export function startAutoSync(queue, win = window, intervalMs = SYNC_INTERVAL_MS) {
  const tick = () => {
    queue.flush()
  }
  tick()
  win.addEventListener('online', tick)
  const timer = setInterval(tick, intervalMs)
  return () => {
    win.removeEventListener('online', tick)
    clearInterval(timer)
  }
}
