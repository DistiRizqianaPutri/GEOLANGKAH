import { describe, expect, it, vi } from 'vitest'
import { createLogQueue, newId, PermanentSendError, queueKey, startAutoSync, supabaseSender } from './logQueue.js'

// Storage di memori (pengganti localStorage).
function memoryStorage() {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  }
}

// Server palsu: client_id unik seperti di step_logs (ON CONFLICT DO NOTHING).
function fakeServer() {
  const rows = new Map()
  const server = {
    online: true,
    loseResponse: false, // server menyimpan, tetapi respons tidak sampai ke HP
    calls: 0,
    rows,
    send: async (item) => {
      server.calls++
      await Promise.resolve()
      if (!server.online) throw new Error('Failed to fetch')
      if (item.dedupeKey) rows.set(item.dedupeKey, item.row)
      else if (!rows.has(item.client_id)) rows.set(item.client_id, item.row)
      if (server.loseResponse) {
        server.loseResponse = false
        throw new Error('network timeout')
      }
    },
  }
  return server
}

let n = 0
const log = (step) => {
  const id = `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`
  return { client_id: id, table: 'step_logs', row: { client_id: id, step_id: step } }
}

const setup = (storage = memoryStorage(), server = fakeServer()) => {
  const queue = createLogQueue({ storage, key: queueKey('u1'), send: server.send })
  return { storage, server, queue }
}

describe('logQueue: offline → online tanpa data ganda', () => {
  it('saat offline log tetap tersimpan, saat online terkirim tepat satu kali', async () => {
    const { storage, server, queue } = setup()
    server.online = false
    queue.enqueue(log('m1-a'))
    queue.enqueue(log('m1-b'))
    queue.enqueue(log('m1-c'))

    expect(await queue.flush()).toBe(0)
    expect(queue.size()).toBe(3)
    expect(JSON.parse(storage.getItem('geolangkah:queue:u1'))).toHaveLength(3)
    expect(server.rows.size).toBe(0)

    server.online = true
    expect(await queue.flush()).toBe(3)
    expect(queue.size()).toBe(0)
    expect([...server.rows.values()].map((r) => r.step_id)).toEqual(['m1-a', 'm1-b', 'm1-c'])

    // flush berikutnya tidak mengirim apa pun lagi
    expect(await queue.flush()).toBe(0)
    expect(server.rows.size).toBe(3)
  })

  it('log disimpan ke storage sebelum dikirim', () => {
    const { storage, queue } = setup()
    const item = log('m1-a')
    queue.enqueue(item)
    expect(JSON.parse(storage.getItem(queueKey('u1')))).toEqual([item])
  })

  it('respons hilang → dikirim ulang → server tetap punya satu baris', async () => {
    const { server, queue } = setup()
    queue.enqueue(log('m1-a'))
    server.loseResponse = true
    await queue.flush()
    expect(queue.size()).toBe(1) // HP belum tahu bahwa server sudah menyimpan
    await queue.flush()
    expect(queue.size()).toBe(0)
    expect(server.calls).toBe(2)
    expect(server.rows.size).toBe(1)
  })

  it('flush bersamaan (event online + timer) tidak mengirim dua kali', async () => {
    const { server, queue } = setup()
    queue.enqueue(log('m1-a'))
    queue.enqueue(log('m1-b'))
    const [a, b] = await Promise.all([queue.flush(), queue.flush()])
    expect(a).toBe(2)
    expect(b).toBe(2) // proses yang sama
    expect(server.calls).toBe(2)
  })

  it('enqueue client_id yang sama dua kali → satu item', () => {
    const { queue } = setup()
    const item = log('m1-a')
    expect(queue.enqueue(item)).toBe(true)
    expect(queue.enqueue(item)).toBe(false)
    expect(queue.size()).toBe(1)
  })

  it('tab ditutup lalu dibuka ulang: antrian dilanjutkan dari storage', async () => {
    const storage = memoryStorage()
    const server = fakeServer()
    server.online = false
    const first = setup(storage, server).queue
    first.enqueue(log('m1-a'))
    first.enqueue(log('m1-b'))
    await first.flush()

    server.online = true
    const reopened = setup(storage, server).queue
    expect(reopened.size()).toBe(2)
    await reopened.flush()
    expect(server.rows.size).toBe(2)
    expect(reopened.size()).toBe(0)
  })

  it('log yang masuk saat pengiriman berjalan tidak hilang', async () => {
    const { server, queue } = setup()
    queue.enqueue(log('m1-a'))
    const running = queue.flush()
    queue.enqueue(log('m1-b'))
    await running
    await queue.flush()
    expect(server.rows.size).toBe(2)
    expect(queue.size()).toBe(0)
  })

  it('sinyal putus di tengah antrian: yang terkirim dihapus, sisanya menunggu urut', async () => {
    const server = fakeServer()
    let count = 0
    const q = createLogQueue({
      storage: memoryStorage(),
      key: 'k',
      send: async (item) => {
        if (++count === 2) throw new Error('offline') // sinyal putus saat item ke-2
        return server.send(item)
      },
    })
    for (const s of ['a', 'b', 'c']) q.enqueue(log(s))
    expect(await q.flush()).toBe(1)
    expect(q.items().map((i) => i.row.step_id)).toEqual(['b', 'c'])
    expect(await q.flush()).toBe(2)
    expect(server.rows.size).toBe(3)
  })

  it('progres pertemuan digabung: hanya versi terbaru yang dikirim', async () => {
    const { server, queue } = setup()
    server.online = false
    const progress = (id, last) => ({
      client_id: id,
      table: 'progress',
      row: { meeting: 1, last_step_id: last },
      onConflict: 'student_id,meeting',
      ignoreDuplicates: false,
      dedupeKey: 'progress:1',
    })
    queue.enqueue(log('m1-a'))
    queue.enqueue(progress('p1', 'm1-a'))
    queue.enqueue(progress('p2', 'm1-b'))
    expect(queue.size()).toBe(2)
    server.online = true
    await queue.flush()
    expect(server.rows.get('progress:1')).toEqual({ meeting: 1, last_step_id: 'm1-b' })
  })

  it('kesalahan permanen dipindah ke daftar gagal, antrian tetap jalan', async () => {
    const storage = memoryStorage()
    const sent = []
    const queue = createLogQueue({
      storage,
      key: 'k',
      send: async (item) => {
        if (item.row.step_id === 'rusak') throw new PermanentSendError('23514: check')
        sent.push(item.row.step_id)
      },
    })
    queue.enqueue(log('rusak'))
    queue.enqueue(log('m1-b'))
    expect(await queue.flush()).toBe(2)
    expect(sent).toEqual(['m1-b'])
    expect(queue.failed()).toHaveLength(1)
  })

  it('storage rusak → antrian kosong', () => {
    const storage = memoryStorage()
    storage.setItem(queueKey('u1'), '{rusak')
    expect(setup(storage).queue.size()).toBe(0)
  })

  it('subscribe melaporkan status pending → tersimpan', async () => {
    const { server, queue } = setup()
    const seen = []
    queue.subscribe((s) => seen.push(s.pending))
    server.online = false
    queue.enqueue(log('m1-a'))
    await queue.flush()
    expect(queue.status().lastError).toBe('Failed to fetch')
    server.online = true
    await queue.flush()
    expect(seen[0]).toBe(0)
    expect(seen).toContain(1)
    expect(seen.at(-1)).toBe(0)
  })
})

describe('supabaseSender', () => {
  const client = (result) => {
    const upsert = vi.fn(async () => result)
    return { upsert, from: vi.fn(() => ({ upsert })) }
  }

  it('step_logs: upsert onConflict client_id, ignoreDuplicates', async () => {
    const c = client({ error: null })
    const item = log('m1-a')
    await supabaseSender(c)(item)
    expect(c.from).toHaveBeenCalledWith('step_logs')
    expect(c.upsert).toHaveBeenCalledWith(item.row, { onConflict: 'client_id', ignoreDuplicates: true })
  })

  it('progress: memakai onConflict & ignoreDuplicates dari item', async () => {
    const c = client({ error: null })
    await supabaseSender(c)({ client_id: 'x', table: 'progress', row: {}, onConflict: 'student_id,meeting', ignoreDuplicates: false })
    expect(c.upsert).toHaveBeenCalledWith({}, { onConflict: 'student_id,meeting', ignoreDuplicates: false })
  })

  it('error jaringan → dicoba lagi; error constraint → permanen', async () => {
    await expect(supabaseSender(client({ error: { message: 'Failed to fetch', code: '' } }))(log('a'))).rejects.not.toHaveProperty('permanent')
    await expect(supabaseSender(client({ error: { message: 'check', code: '23514' } }))(log('a'))).rejects.toHaveProperty('permanent', true)
  })
})

describe('startAutoSync', () => {
  it('flush saat mulai, saat online, dan tiap interval', () => {
    vi.useFakeTimers()
    const queue = { flush: vi.fn() }
    const handlers = {}
    const win = {
      addEventListener: (e, fn) => (handlers[e] = fn),
      removeEventListener: (e) => delete handlers[e],
    }
    const stop = startAutoSync(queue, win, 30_000)
    expect(queue.flush).toHaveBeenCalledTimes(1)
    handlers.online()
    expect(queue.flush).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(30_000)
    expect(queue.flush).toHaveBeenCalledTimes(3)
    stop()
    expect(handlers.online).toBeUndefined()
    vi.advanceTimersByTime(60_000)
    expect(queue.flush).toHaveBeenCalledTimes(3)
    vi.useRealTimers()
  })
})

describe('newId', () => {
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  it('memakai randomUUID bila ada, getRandomValues bila tidak (http di LAN)', () => {
    expect(newId()).toMatch(UUID)
    const fallback = { getRandomValues: (a) => globalThis.crypto.getRandomValues(a) }
    const id = newId(fallback)
    expect(id).toMatch(UUID)
    expect(newId(fallback)).not.toBe(id)
  })
})
