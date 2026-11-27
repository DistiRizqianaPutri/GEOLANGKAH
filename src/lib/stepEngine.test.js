import { describe, expect, it } from 'vitest'
import {
  canAdvance,
  challengeSummary,
  createStepReducer,
  flattenSteps,
  initialState,
  isFreshProgress,
  isMeetingDone,
  logKeys,
  progressItem,
  resumeFromServer,
  stepLogItem,
  unqueuedKeys,
  loadProgress,
  progressKey,
  saveProgress,
} from './stepEngine.js'

const meeting = {
  meeting: 9,
  phases: [
    {
      phase: 'kenali',
      steps: [
        { id: 'm9-kenali-01', type: 'explain' },
        { id: 'm9-kenali-02', type: 'explore', question: { options: [] } },
        {
          id: 'm9-kenali-03',
          type: 'identify',
          pick: 2,
          items: [{ id: 'm9-kenali-03a' }, { id: 'm9-kenali-03b' }, { id: 'm9-kenali-03c' }, { id: 'm9-kenali-03d' }],
        },
      ],
    },
    { phase: 'latih', steps: [{ id: 'm9-latih-01', type: 'solve' }] },
    {
      phase: 'tantangan',
      steps: [
        { id: 'm9-tantangan-01', type: 'challenge' },
        { id: 'm9-tantangan-02', type: 'challenge' },
        { id: 'm9-tantangan-03', type: 'challenge' },
      ],
    },
  ],
}

const steps = flattenSteps(meeting, 'S01-m9')
const reduce = createStepReducer(steps)
const run = (actions, state = initialState()) => actions.reduce(reduce, state)
const attempt = (stepId, correct, errorCode = correct ? null : 'E_LAIN') => ({
  type: 'ATTEMPT',
  stepId,
  correct,
  errorCode,
  answer: 'x',
})

describe('flattenSteps', () => {
  it('fase diratakan, identifikasi diambil `pick` soal dengan seed', () => {
    expect(steps).toHaveLength(2 + 2 + 1 + 3)
    expect(steps[0]).toMatchObject({ id: 'm9-kenali-01', phase: 'kenali' })
    const picked = steps.filter((s) => s.type === 'identify')
    expect(picked).toHaveLength(2)
    expect(new Set(picked.map((s) => s.id)).size).toBe(2)
  })
  it('seed sama → soal sama', () => {
    const ids = (seed) => flattenSteps(meeting, seed).map((s) => s.id)
    expect(ids('S01-m9')).toEqual(ids('S01-m9'))
  })
})

describe('canAdvance — tempo oleh siswa, tanpa auto-lanjut', () => {
  it('explain dan explore tanpa pertanyaan: selalu boleh', () => {
    expect(canAdvance({ type: 'explain' }, undefined)).toBe(true)
    expect(canAdvance({ type: 'explore' }, undefined)).toBe(true)
  })
  it('explore dengan pertanyaan, solve, why: setelah benar', () => {
    for (const type of ['explore', 'solve', 'faded', 'why', 'identify']) {
      const step = { type, question: {} }
      expect(canAdvance(step, undefined)).toBe(false)
      expect(canAdvance(step, { done: true })).toBe(true)
    }
  })
})

describe('reducer', () => {
  it('Lanjut terkunci sebelum jawaban benar', () => {
    const s = run([{ type: 'NEXT' }, { type: 'NEXT' }])
    expect(s.index).toBe(1) // explain lolos, explore berpertanyaan tertahan
  })

  it('percobaan dicatat; benar → done', () => {
    const s = run([attempt('m9-latih-01', false, 'E_SATUAN'), attempt('m9-latih-01', true)])
    expect(s.records['m9-latih-01']).toMatchObject({
      attempts: 2,
      is_correct: true,
      error_code: null,
      done: true,
      first_error_code: 'E_SATUAN',
    })
  })

  it('langkah yang sudah selesai tidak menerima percobaan baru (Kembali tidak me-reset)', () => {
    const s = run([attempt('m9-latih-01', true), attempt('m9-latih-01', false)])
    expect(s.records['m9-latih-01']).toMatchObject({ attempts: 1, is_correct: true })
  })

  it('Tantangan: maksimal 2 percobaan, lalu jawaban ditampilkan', () => {
    const s = run([attempt('m9-tantangan-01', false), attempt('m9-tantangan-01', false), attempt('m9-tantangan-01', true)])
    expect(s.records['m9-tantangan-01']).toMatchObject({ attempts: 2, is_correct: false, done: true, revealed: true })
  })

  it('Tantangan benar di percobaan ke-2: tidak revealed', () => {
    const s = run([attempt('m9-tantangan-02', false), attempt('m9-tantangan-02', true)])
    expect(s.records['m9-tantangan-02']).toMatchObject({ attempts: 2, is_correct: true, revealed: false })
  })

  it('level petunjuk tertinggi dicatat', () => {
    const s = run([
      { type: 'OPEN_HINT', stepId: 'm9-latih-01', level: 1 },
      { type: 'OPEN_HINT', stepId: 'm9-latih-01', level: 2 },
      { type: 'OPEN_HINT', stepId: 'm9-latih-01', level: 1 },
    ])
    expect(s.records['m9-latih-01'].max_hint_level).toBe(2)
  })

  it('petunjuk di langkah yang sudah selesai tidak mengubah log', () => {
    const s = run([attempt('m9-latih-01', true), { type: 'OPEN_HINT', stepId: 'm9-latih-01', level: 1 }])
    expect(s.records['m9-latih-01'].max_hint_level).toBe(0)
  })

  it('Kembali: ke langkah sebelumnya, tidak di bawah 0', () => {
    expect(run([{ type: 'NEXT' }, { type: 'BACK' }, { type: 'BACK' }]).index).toBe(0)
  })

  it('Lanjut di langkah terakhir → selesai', () => {
    let s = { ...initialState(), index: steps.length - 1 }
    s = run([attempt(steps.at(-1).id, true), { type: 'NEXT' }], s)
    expect(s.finished).toBe(true)
    expect(s.index).toBe(steps.length - 1)
  })

  it('Ulangi langkah hanya menambah penghitung reset gambar', () => {
    const s = run([attempt('m9-latih-01', false), { type: 'RESET_FIGURE' }])
    expect(s.figureReset).toBe(1)
    expect(s.records['m9-latih-01'].attempts).toBe(1)
  })
})

describe('challengeSummary (Hasil Pos)', () => {
  it('skor = soal Tantangan benar; petunjuk = jumlah level dibuka di Tantangan', () => {
    const s = run([
      { type: 'OPEN_HINT', stepId: 'm9-latih-01', level: 1 }, // bukan Tantangan
      attempt('m9-tantangan-01', true),
      { type: 'OPEN_HINT', stepId: 'm9-tantangan-02', level: 1 },
      attempt('m9-tantangan-02', false),
      attempt('m9-tantangan-02', false),
      attempt('m9-tantangan-03', true),
    ])
    expect(challengeSummary(steps, s.records)).toEqual({ correct: 2, total: 3, hintsUsed: 1 })
  })
})

describe('simpan & muat progres (localStorage)', () => {
  const memory = () => {
    const data = {}
    return { getItem: (k) => data[k] ?? null, setItem: (k, v) => (data[k] = String(v)), data }
  }

  it('kunci memuat kode dan nomor pertemuan', () => {
    expect(progressKey('T01', 2)).toBe('geolangkah:progress:T01:m2')
  })

  it('simpan → muat sama persis', () => {
    const store = memory()
    const s = run([{ type: 'NEXT' }, attempt('m9-latih-01', true)])
    saveProgress(store, 'T01', 9, s)
    expect(loadProgress(store, 'T01', 9)).toEqual(s)
  })

  it('belum ada / rusak → state awal', () => {
    const store = memory()
    expect(loadProgress(store, 'T01', 9)).toEqual(initialState())
    store.setItem(progressKey('T01', 9), '{rusak')
    expect(loadProgress(store, 'T01', 9)).toEqual(initialState())
  })

  it('isMeetingDone', () => {
    const store = memory()
    expect(isMeetingDone(store, 'T01', 9)).toBe(false)
    saveProgress(store, 'T01', 9, { ...initialState(), finished: true })
    expect(isMeetingDone(store, 'T01', 9)).toBe(true)
    expect(isMeetingDone(store, 'S01', 9)).toBe(false)
  })
})

describe('M6: client_id, waktu aktif, baris log', () => {
  const ids = (...keys) => Object.fromEntries(keys.map((k) => [k, `id-${k}`]))

  it('Lanjut pertama memberi client_id & menambah waktu; Lanjut ulang tidak mengganti id', () => {
    let s = run([{ type: 'NEXT', clientIds: ids('m9-kenali-01'), elapsedMs: 4200 }])
    expect(s.records['m9-kenali-01']).toMatchObject({ client_id: 'id-m9-kenali-01', elapsed_ms: 4200, queued: false })
    s = run([{ type: 'BACK' }, { type: 'NEXT', clientIds: { 'm9-kenali-01': 'lain' }, elapsedMs: 9000 }], s)
    expect(s.records['m9-kenali-01']).toMatchObject({ client_id: 'id-m9-kenali-01', elapsed_ms: 4200 })
  })

  it('logKeys: langkah + sub-catatan "#" yang belum ber-id', () => {
    const step = { id: 'm9-tantangan-01' }
    const records = { 'm9-tantangan-01#pilih': { done: true }, 'm9-tantangan-02': {}, 'm9-tantangan-01': { client_id: 'x' } }
    expect(logKeys(step, records)).toEqual(['m9-tantangan-01#pilih'])
    expect(logKeys({ id: 'm9-kenali-01' }, {})).toEqual(['m9-kenali-01'])
  })

  it('ADD_TIME & Kembali menambah waktu sebelum dicatat', () => {
    const s = run([
      { type: 'NEXT', clientIds: ids('m9-kenali-01') },
      { type: 'ADD_TIME', stepId: 'm9-kenali-02', ms: 1000 },
      { type: 'BACK', elapsedMs: 500 },
    ])
    expect(s.records['m9-kenali-02'].elapsed_ms).toBe(1500)
  })

  it('MARK_QUEUED → unqueuedKeys kosong', () => {
    let s = run([{ type: 'NEXT', clientIds: ids('m9-kenali-01') }])
    expect(unqueuedKeys(s.records)).toEqual(['m9-kenali-01'])
    s = reduce(s, { type: 'MARK_QUEUED', key: 'm9-kenali-01' })
    expect(unqueuedKeys(s.records)).toEqual([])
  })

  it('selesai menyimpan completed_at', () => {
    let s = { ...initialState(), index: steps.length - 1 }
    s = run([attempt(steps.at(-1).id, true), { type: 'NEXT', now: Date.UTC(2026, 10, 26) }], s)
    expect(s.completed_at).toBe('2026-11-26T00:00:00.000Z')
  })

  it('stepLogItem memakai kolom step_logs (termasuk first_error_code)', () => {
    const s = run([
      attempt('m9-latih-01', false, 'E_SATUAN'),
      attempt('m9-latih-01', true),
      { type: 'ADD_TIME', stepId: 'm9-latih-01', ms: 12_400 },
    ])
    const rec = { ...s.records['m9-latih-01'], client_id: 'c1' }
    expect(stepLogItem('m9-latih-01', rec, { studentId: 'u1', meeting: 9 })).toEqual({
      client_id: 'c1',
      table: 'step_logs',
      row: {
        client_id: 'c1',
        student_id: 'u1',
        meeting: 9,
        step_id: 'm9-latih-01',
        answer: 'x',
        is_correct: true,
        attempts: 2,
        max_hint_level: 0,
        error_code: null,
        first_error_code: 'E_SATUAN',
        duration_sec: 12,
      },
    })
  })

  it('progressItem: last_step_id, completed_at, digabung per pertemuan', () => {
    const item = progressItem({ ...initialState(), index: 2 }, steps, { studentId: 'u1', meeting: 9, clientId: 'p' })
    expect(item).toMatchObject({
      table: 'progress',
      row: { student_id: 'u1', meeting: 9, last_step_id: steps[2].id, completed_at: null },
      onConflict: 'student_id,meeting',
      ignoreDuplicates: false,
      dedupeKey: 'progress:9',
    })
  })
})

describe('M6: lanjut di HP baru (resumeFromServer)', () => {
  const log = (step_id, extra = {}) => ({ step_id, client_id: `c-${step_id}`, attempts: 1, is_correct: true, duration_sec: 3, ...extra })

  it('langkah tercatat menjadi selesai & terkunci; lanjut dari last_step_id', () => {
    const s = resumeFromServer(steps, [log(steps[0].id, { attempts: 0, is_correct: null }), log(steps[1].id)], { last_step_id: steps[2].id })
    expect(s.index).toBe(2)
    expect(s.finished).toBe(false)
    expect(s.records[steps[1].id]).toMatchObject({ done: true, queued: true, client_id: `c-${steps[1].id}`, elapsed_ms: 3000 })
    // percobaan baru di langkah yang sudah tercatat diabaikan → tidak ada log ganda
    const after = reduce(s, attempt(steps[1].id, false))
    expect(after.records[steps[1].id].attempts).toBe(1)
    expect(unqueuedKeys(after.records)).toEqual([])
  })

  it('Tantangan salah 2 kali → revealed; sub-catatan "#" ikut dipulihkan', () => {
    const s = resumeFromServer(
      steps,
      [log('m9-tantangan-01', { attempts: 2, is_correct: false }), log('m9-tantangan-01#pilih')],
      null,
    )
    expect(s.records['m9-tantangan-01'].revealed).toBe(true)
    expect(s.records['m9-tantangan-01#pilih']).toMatchObject({ done: true, revealed: false })
    expect(s.index).toBe(0) // langkah pertama belum tercatat
  })

  it('completed_at di server → pertemuan selesai', () => {
    const s = resumeFromServer(steps, [], { last_step_id: steps.at(-1).id, completed_at: '2026-11-26T00:00:00Z' })
    expect(s).toMatchObject({ finished: true, index: steps.length - 1 })
  })

  it('isFreshProgress', () => {
    expect(isFreshProgress(initialState())).toBe(true)
    expect(isFreshProgress(run([{ type: 'NEXT' }]))).toBe(false)
  })
})
