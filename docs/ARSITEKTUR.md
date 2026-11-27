# ARSITEKTUR.md — Teknologi, Struktur Folder, dan Data

## 1. Tumpukan teknologi (*stack*)

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Frontend | **React + Vite** (JavaScript/JSX) | Ringan, cepat, sesuai ketentuan tugas |
| Gaya | **Tailwind CSS v4** (plugin `@tailwindcss/vite`; token `DESIGN.md` §2 ditulis di blok `@theme` dalam `src/styles/index.css`, tanpa `tailwind.config.js`) | Konsisten dengan token di `DESIGN.md`, tanpa file CSS besar |
| Navigasi | React Router | Halaman sedikit, cukup sederhana |
| Gambar interaktif | **SVG + Pointer Events** buatan sendiri | Tajam di semua layar, ringan, tanpa pustaka 3D/canvas |
| State | `useState` / `useReducer` + 1 Context untuk sesi | Tidak perlu Redux/Zustand |
| Database & login | **Supabase** (Postgres + Auth + Row Level Security) | Gratis untuk skala uji coba, ada RLS |
| Fungsi server | **Python** — Vercel Serverless Functions (`api/*.py`) | `export.py` (CSV + ringkasan peneliti, P0) dan `tutor.py` (proxy DeepSeek, P1, kunci tetap rahasia). Ketentuan tugas: Python berjalan di aplikasi |
| Analisis data | **Python** (pandas) — `analysis/` | Skor, N-gain, rata-rata Leppink |
| Tes | **Vitest** (logika) + Playwright opsional (layar 360 × 640) | Logika matematika wajib dites |
| Lint | **oxlint** (bawaan template Vite saat M1; satu paket, pengganti ESLint) — `npm run lint` | Diputuskan 26-11-2026 |
| Hosting | **Vercel** dari repo GitHub | Deploy otomatis setiap *push* |
| Offline | `vite-plugin-pwa` (P1) + antrian di `localStorage` | Sinyal sekolah tidak stabil |

**Jangan dipakai tanpa izin:** pustaka 3D (three.js), pustaka UI besar (MUI, Chakra), pustaka animasi besar, pustaka rumus (KaTeX/MathJax).

## 2. Struktur folder

```
geolangkah/
├── CLAUDE.md
├── PROMPTS.md
├── docs/                      # blueprint (PRD, DESIGN, KONTEN, dst.)
├── public/
│   ├── fonts/                 # Nunito 400 & 800
│   ├── illustrations/         # ilustrasi pembuka (orisinal)
│   └── icons/                 # ikon PWA
├── src/
│   ├── main.jsx
│   ├── App.jsx                # rute
│   ├── lib/
│   │   ├── geometry.js        # FUNGSI MURNI: keliling, luas, tinggi, diagnose()
│   │   ├── geometry.test.js
│   │   ├── supabase.js        # klien Supabase (anon key saja)
│   │   ├── logQueue.js        # antrian offline + sinkron
│   │   └── logQueue.test.js
│   ├── content/
│   │   ├── meeting-1.json … meeting-5.json
│   │   ├── tests.json         # DIISI PENELITI
│   │   └── leppink.json       # DIISI PENELITI
│   ├── components/
│   │   ├── figure/            # FigureCanvas, DragHandle, layers/*
│   │   ├── step/              # StepCard, StepEngine, FadedTemplate
│   │   ├── hint/              # HintButton, HintPanel, FormulaCard
│   │   ├── story/             # StoryReader, KnownAskedTable
│   │   ├── answer/            # AnswerInput, FeedbackBanner
│   │   └── ui/                # TopBar, PrimaryButton, …
│   ├── pages/
│   │   ├── Welcome.jsx        # Pembuka + Masuk (layar luar)
│   │   ├── AdventureMap.jsx   # Peta Petualangan 5 pos
│   │   ├── ResultPage.jsx     # Hasil Pos
│   │   ├── Meeting.jsx        # menjalankan fase Kenali → Bangun → Latih
│   │   ├── TestPage.jsx       # pretest / posttest
│   │   ├── LeppinkPage.jsx
│   │   └── researcher/Dashboard.jsx
│   └── styles/index.css
├── api/
│   ├── export.py              # (P0) CSV & ringkasan untuk peneliti
│   ├── tutor.py               # (P1) proxy DeepSeek
│   └── _shared/scoring.py     # skor, N-gain, rata-rata IL/EL/GL (dipakai export.py & analysis/)
├── requirements.txt           # dependensi fungsi Python Vercel (pustaka standar; tanpa pandas)
├── analysis/
│   ├── process_data.py        # baca CSV ekspor → skor, N-gain, rata-rata IL/EL/GL
│   └── requirements.txt
├── supabase/
│   └── migrations/0001_init.sql
├── .env.example
└── package.json
```

## 3. Modul inti: `src/lib/geometry.js`

Semua hitungan ada di sini sebagai **fungsi murni** (masukan → keluaran, tanpa efek samping). Komponen UI **tidak boleh** menghitung sendiri.

```js
rectPerimeter(p, l)              // 2 * (p + l)
rectArea(p, l)                   // p * l
trapezoidPerimeter(a, b, s1, s2) // a + b + s1 + s2
trapezoidArea(a, b, t)           // 0.5 * (a + b) * t
offsetX(a, b, kind)              // 'isosceles' → (a - b) / 2, 'right' → a - b
heightFromLeg(s, x)              // Math.sqrt(s*s - x*x); lempar error bila s <= x
legFromHeight(t, x)              // Math.sqrt(t*t + x*x)
checkAnswer(value, unit, expected) // → { correct, valueOk, unitOk }; toleransi ±0,01 + cek satuan
diagnose(problem, value, unit)   // → null bila benar, atau kode kesalahan dari KONTEN.md §7

// Model gambar FigureCanvas (M3). Satuan petak: A=(0,0), B=(a,0), D=(d,t), C=(c,t)
trapezoidFromSides({ kind, a, b, t, x1 }) // → { shape:'trapezoid', kind, a, t, d, c }; sembarang wajib x1
trapezoidMeasures(shape)         // → { a, b, t, x1, x2, s1, s2, perimeter, area, points, foot }
rectMeasures({ p, l })           // → { p, l, perimeter, area }
dragTopVertex(shape, 'D'|'C', {x, y}) // snap + aturan seret per jenis + batas (DESIGN.md §5)
dragRectCorner(shape, {x, y})    // snap, p 1–12, l 1–8
decomposeParts(shape)            // persegi panjang + segitiga tepi (null bila x = 0), masing-masing dengan luas
doubleRotateParts(shape)         // salinan diputar 180° pada titik tengah BC → jajargenjang alas a + b
formatMeasure(v)                 // "16", "22,5", atau "≈ 4,5" (koma desimal)
formatLabel(name, v, unit)       // "s = 5 cm" atau "s ≈ 6,1 cm" (M4)
dragTopVertex(..., { lockHeight }) // seret hanya mendatar (M4)
perimeterTraceCount(K, progress) // penghitung "Telusuri tepi" 0 → K (M4)
rectFillProgress({p, l}, progress) // "Isi petak" per baris → { rows, count } (M4)

// M5
solveProblem(problem)            // semua besaran soal (a, b, t, x, s1, s2, p, l, perimeter, area, …)
                                 // + answer (nilai yang ditanya, sesudah convert) + unit jawaban
convertValue(v, convert)         // satuan turunan soal cerita: { op:'divide'|'multiply', by, unit }
rightTriangleMeasures({ x, t })  // segitiga siku-siku penyegaran Pythagoras → { x, t, s, points }
formatAnswer(v, unit)            // "52 cm²", "24 kg", "Rp4.950.000"
```

**Modul murni lain (M4, semuanya dites Vitest):**

| File | Isi |
|---|---|
| `lib/answer.js` | `parseNumber` (koma/titik desimal); `parseRupiah`, `parseAnswer(raw, unit)` — satuan Rp atau isian berawalan "Rp": titik = ribuan, koma = desimal |
| `lib/random.js` | `seededShuffle(list, seed)`: seed = kode siswa + pertemuan |
| `lib/hintRules.js` | `canOpenHint`, `shouldOfferHint` (KONTEN §7) |
| `lib/checkStep.js` | `checkSolve`, `checkFaded` (`E_KOTAK`), `checkIdentify` (juga `ask: 'hypotenuse'`, M5), `checkChoice`, `parseTemplate`, `templateValue` (nilai kotak dari `solveProblem`, M5) |
| `lib/feedback.js` | `feedbackText(code, {ask, unit})` dari `content/feedback.json` (varian `convert` untuk kg/Rp, M5) |
| `lib/figureSpec.js` | `figureModel(figure)`: `figure` di JSON → model FigureCanvas (termasuk `triangle`, M5); `measureText` (label atau `t = ?`) |
| `lib/story.js` *(M5)* | mode baca soal cerita: `splitSegment`, `moveToKnown`, `rejectResult`, `missingKnown`, `storyComplete`, `storyResult`, `askedKey` |
| `lib/stepEngine.js` | `flattenSteps`, reducer (`ATTEMPT`, `OPEN_HINT`, `NEXT`, `BACK`, `RESET_FIGURE`; M6: `ADD_TIME`, `MARK_QUEUED`), `canAdvance`, `challengeSummary`, simpan/muat progres; M6: `logKeys`, `stepLogItem`, `progressItem`, `resumeFromServer` |
| `lib/logQueue.js` *(M6)* | `createLogQueue`, `supabaseSender`, `startAutoSync`, `newId` (§6) |
| `lib/remote.js` *(M6)* | `fetchProgress`, `fetchStepLogs` (baca data milik siswa) |
| `components/figure/labelFit.js`, `hitTest.js` | penempatan label di dalam gambar; segmen terdekat untuk ketuk unsur |

**Catatan per langkah** (`records[step_id]` di progres) memakai nama kolom `step_logs`: `attempts`, `is_correct`, `max_hint_level`, `error_code`, `answer`, ditambah `first_error_code`, `done`, dan `revealed`. Di M6 catatan ini dikirim lewat `logQueue`. Langkah yang sudah `done` tidak menerima percobaan baru (tombol Kembali tidak me-reset).

**Rute (M4):** `/` (Pembuka + Masuk), `/peta`, `/pertemuan/:n`, `/hasil/:n`, `/lab`. Tanpa sesi → `/`. Pertemuan n terbuka bila n = 1 atau pertemuan n − 1 selesai. Pertemuan yang kontennya belum ada (`content/meetings.js`) terkunci dengan tulisan "Segera".

**`localStorage`:** `geolangkah:session` → `{code, nickname}`. **PIN tidak pernah disimpan.** `geolangkah:progress:<kode>:m<n>` → `{index, records, finished, figureReset}`.

Komponen `src/components/figure/` (`FigureCanvas`, `DragHandle`, `layers/*`) hanya menggambar hasil fungsi di atas. Halaman uji `/lab` (`src/pages/Lab.jsx`) sementara aktif juga di produksi agar bisa dicoba di HP; disembunyikan lagi di M10.

`offsetX` melempar error untuk jenis selain `isosceles`/`right`.

**Objek `problem`** untuk `diagnose()` (ditulis di konten langkah):

```js
{ shape: 'rect' | 'trapezoid',
  kind: 'isosceles' | 'right' | 'scalene',   // trapesium; boleh kosong bila tidak relevan
  ask: 'perimeter' | 'area' | 'height' | 'offset',
  unit: 'cm' | 'm',                          // satuan luas otomatis: unit + '²'
  p, l,                                      // persegi panjang
  a, b, t, s1, s2,                           // trapesium; siku-siku: s1 = sisi tegak, s2 = kaki miring
  convert }                                  // M5, soal cerita: { op:'divide'|'multiply', by, unit:'kg'|'Rp' }
```

Data yang tidak tertulis di soal dilengkapi otomatis jika bisa diturunkan. Contoh: t dari kaki (sama kaki/siku-siku), kaki miring dari t, atau sisi tegak = t. Pola yang datanya tidak lengkap dilewati.

*(M5)* Dengan `convert`, kunci = hasil `ask` lalu dikonversi (pupuk = luas ÷ 10 kg, biaya = luas × 15.000 Rp). Pola cara salah ikut dikonversi, mis. memakai keliling → `E_KL_TERTUKAR`, lupa ½ → `E_LUPA_SETENGAH`. Angka tepat tetapi satuan salah → `E_SATUAN` (teks varian `convert`). Hasil yang belum dikonversi → `E_LAIN`.

**Urutan prioritas `diagnose()`** (diputuskan 26-11-2026, "spesifik dulu"):
1. Angka dan satuan benar → `null`
2. Angka benar, satuan salah atau kosong → `E_SATUAN`
3. Pola "cara salah" sesuai `ask` (satuan diabaikan), dicek berurutan:
   - luas: `E_LUPA_SETENGAH` → `E_KAKI_SBG_TINGGI` → `E_SATU_SISI` → `E_KL_TERTUKAR`
   - keliling: `E_SETENGAH_KELILING` (persegi panjang) → `E_TINGGI_DI_KELILING` (bukan siku-siku) → `E_SISI_KURANG` (4 kombinasi 3 sisi) → `E_KL_TERTUKAR`
   - tinggi: `E_X_TIDAK_DIBAGI` (√(s² − (a − b)²), sama kaki) → `E_PYTHA_TAMBAH`
   - x: `E_X_TIDAK_DIBAGI` (a − b, sama kaki)
4. `E_TIDAK_WAJAR`: hasil ≤ 0, atau tinggi ≥ kaki miring
5. `E_LAIN`

Tes (`geometry.test.js`): semua kunci jawaban di `KONTEN.md`, setiap kode kesalahan di §7, kunci dan pengecoh Tantangan Pos §10, dan kasus tidak wajar (s ≤ x). *(M5)* `content/content.test.js` membandingkan setiap `answer` di `meeting-*.json` langsung dengan `solveProblem()`, termasuk nilai kotak memudar, angka gambar, akhir pembahasan L3, dan info penting soal cerita.

## 4. Skema database (`supabase/migrations/0001_init.sql`)

*(M6, 26-11-2026)* File migrasi adalah acuan akhir. Bedanya dari draf di bawah: `step_logs.first_error_code` (kode kesalahan percobaan pertama; `error_code` = percobaan terakhir) dan `duration_sec >= 0`; CHECK 0–10 tiap kolom Leppink; indeks `step_logs(student_id, meeting)`; *trigger* `progress_keep_completed` (pertemuan yang sudah `completed_at` tidak bisa dimundurkan HP lain); `anon` tidak punya hak apa pun, `authenticated` hanya hak yang dibutuhkan; fungsi `is_researcher()` (`security definer`) untuk kebijakan peneliti.

*(M7, 27-11-2026)* `supabase/migrations/0002_m7.sql`: kolom `test_answers.stage_scores jsonb` (skor tiap tahap rubrik, mis. `[1,2,1,0,1]`; `score` = jumlahnya), CHECK `score` 0–6, dan *grant update* peneliti diperluas ke `stage_scores`. Kiriman tes/Leppink memakai *upsert ignore-duplicates* dengan target `student_id,kind,item_id` / `student_id,meeting`, jadi kiriman kedua diabaikan (terkunci).

*(27-11-2026)* Kode siswa boleh 2 atau 3 angka: `^[ST][0-9]{2,3}$` (S001–S150 dari `buat-akun-siswa.mjs`; T01 tetap berlaku). CHECK `students.code` diubah langsung di SQL Editor Supabase. Pola yang sama dipakai di aplikasi (`STUDENT_CODE` di `src/lib/supabase.js`) dan analisis (`is_research_code` di `api/_shared/scoring.py`, hanya S). Email teknis = kode huruf kecil + `@<VITE_STUDENT_EMAIL_DOMAIN>`.

```sql
-- Siswa: satu baris per akun. Akun dibuat peneliti (email teknis: s001@<VITE_STUDENT_EMAIL_DOMAIN>)
create table students (
  id uuid primary key references auth.users(id) on delete cascade,
  code text unique not null check (code ~ '^[ST][0-9]{2,3}$'),  -- S = penelitian (S001–S150), T = uji coba (T01)
  created_at timestamptz default now()
);

create table researchers (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Log per langkah/soal
create table step_logs (
  id bigint generated always as identity primary key,
  student_id uuid not null references students(id) on delete cascade,
  meeting smallint not null check (meeting between 1 and 5),
  step_id text not null,
  answer text,
  is_correct boolean,
  attempts smallint not null default 1,
  max_hint_level smallint not null default 0 check (max_hint_level between 0 and 3),
  error_code text,
  duration_sec integer,
  client_id uuid not null unique,      -- mencegah data ganda saat sinkron ulang
  created_at timestamptz default now()
);

create table test_answers (
  id bigint generated always as identity primary key,
  student_id uuid not null references students(id) on delete cascade,
  kind text not null check (kind in ('pre','post')),
  item_id text not null,
  answer text,
  score numeric,                        -- diisi peneliti (semua butir berbentuk uraian)
  scored_by uuid references researchers(user_id),  -- opsional: siapa yang menilai
  scored_at timestamptz,                -- opsional: kapan dinilai
  client_id uuid not null unique,
  created_at timestamptz default now(),
  unique (student_id, kind, item_id)
);

create table leppink_responses (
  id bigint generated always as identity primary key,
  student_id uuid not null references students(id) on delete cascade,
  meeting smallint not null check (meeting between 1 and 5),
  il1 smallint, il2 smallint, il3 smallint,
  el1 smallint, el2 smallint, el3 smallint,
  gl1 smallint, gl2 smallint, gl3 smallint, gl4 smallint,
  client_id uuid not null unique,
  created_at timestamptz default now(),
  unique (student_id, meeting)
  -- tambahkan CHECK 0..10 untuk tiap kolom
);

create table progress (
  student_id uuid references students(id) on delete cascade,
  meeting smallint check (meeting between 1 and 5),
  last_step_id text,
  completed_at timestamptz,
  primary key (student_id, meeting)
);
```

**Row Level Security (wajib aktif di semua tabel):**
- Siswa: `insert` dan `select` hanya baris dengan `student_id = auth.uid()`; `update` hanya di `progress` miliknya.
- Peneliti: `select` semua baris jika `exists (select 1 from researchers where user_id = auth.uid())`; boleh `update` kolom `score`, `scored_by`, `scored_at` di `test_answers`.
- Karena siswa **tidak** punya izin `update` di `step_logs`, `test_answers`, dan `leppink_responses`, sinkron antrian memakai `upsert(..., { onConflict: 'client_id', ignoreDuplicates: true })` (= `ON CONFLICT DO NOTHING`, cukup izin `insert`).
- Tidak ada `delete` dari aplikasi.
- Skor Tantangan Pos tidak perlu tabel baru: dihitung dari `step_logs` dengan `step_id` berawalan `mX-tantangan-`.

## 5. Masuk (login)

- Peneliti membuat akun siswa di dasbor Supabase (*Add user* → centang *Auto Confirm User*, sehingga tidak ada email yang dikirim): email teknis `s001@<VITE_STUDENT_EMAIL_DOMAIN>`, kata sandi = PIN 6 digit, lalu menambah baris `students`.
- Domain email teknis: **`siswa.geolangkah.test`** (alamat palsu, tidak pernah dipakai mengirim email; diputuskan 26-11-2026). Jika di M6 Supabase menolak domain `.test`, Claude Code mengusulkan pengganti lalu memperbarui bagian ini.
- Layar Masuk meminta **Kode** + **PIN**, aplikasi mengubah kode menjadi email teknis lalu memanggil `signInWithPassword`.
  - *(M6)* Setelah `signInWithPassword` berhasil, aplikasi membaca baris `students` milik pengguna; bila tidak ada atau kodenya beda → "Akun belum terdaftar". `localStorage` `geolangkah:session` → `{code, nickname, userId}` (tanpa PIN). Pesan gagal: PIN/kode salah, belum ada sinyal, belum terdaftar.
  - Pendaftaran mandiri **dimatikan** di Supabase (*Allow new users to sign up* = off); akun hanya dibuat peneliti.
- Sesi disimpan Supabase di perangkat → siswa tidak perlu masuk ulang setiap pertemuan. Saat offline dengan token kedaluwarsa siswa tetap bisa belajar; log menunggu sinyal dan token diperbarui otomatis saat online.
- *(M6)* Progres: pos selesai = selesai di HP ini **atau** `progress.completed_at` di server. HP baru (progres lokal kosong) → progres dibangun ulang dari `step_logs` + `progress` milik siswa (`resumeFromServer`); langkah yang sudah tercatat terkunci sehingga tidak tercatat dua kali.
- **Nama panggilan** (opsional) hanya disimpan di `localStorage` untuk sapaan; tidak pernah dikirim ke Supabase atau ke tutor AI.
- Peneliti masuk dengan email pribadinya di `/peneliti`.

## 6. Antrian offline (`logQueue.js`)

1. Setiap log diberi `client_id` (UUID) lalu disimpan ke `localStorage` terlebih dahulu.
2. Coba kirim ke Supabase dengan `upsert(..., { onConflict: 'client_id', ignoreDuplicates: true })`.
3. Gagal/offline → tetap di antrian; dicoba lagi saat event `online`, saat aplikasi dibuka, dan tiap 30 detik.
4. Berhasil → hapus dari antrian. Indikator kecil "Tersimpan ✓ / Menunggu sinyal…" di TopBar.
5. Status langkah yang sedang dikerjakan juga disimpan ke `localStorage` setiap berubah, karena Chrome Android bisa menutup tab di latar belakang pada HP ber-RAM kecil.

*Rincian M6 (26-11-2026):*
- Kunci antrian per akun: `geolangkah:queue:<userId>` → log tidak pernah dikirim atas nama akun lain. Keluar dengan antrian belum kosong → konfirmasi; data tetap di HP dan terkirim saat akun itu masuk lagi.
- **Kapan log dibuat:** satu baris per langkah saat siswa **pertama kali** menekan Lanjut (juga langkah penjelasan, `attempts = 0`). Sub-catatan `<step_id>#pilih` (PG Tantangan) dan `<step_id>#ditanya-n` (soal cerita) dicatat sebagai baris sendiri dengan `step_id` tersebut. `client_id` dibuat saat itu dan disimpan di catatan langkah, jadi muat ulang/kirim ulang memakai id yang sama.
- **`duration_sec`** = waktu layar langkah terlihat sampai Lanjut pertama (tab tersembunyi tidak dihitung; Kembali ke langkah lama tidak menambah).
- `progress` dikirim lewat antrian yang sama (`upsert` `onConflict: 'student_id,meeting'`); item progres yang belum terkirim diganti yang terbaru.
- Kesalahan data/constraint (SQLSTATE 22xxx/23xxx) tidak diulang selamanya: item dipindah ke `geolangkah:queue:<userId>:failed` (tetap di HP untuk diperiksa).
- Inti `createLogQueue({storage, key, send})` murni; dites di `logQueue.test.js` (offline → online, respons hilang, flush bersamaan, muat ulang tab).

## 7. Variabel lingkungan (`.env.example`)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=        # anon ATAU publishable key (sb_publishable_…); boleh di frontend (dilindungi RLS)
VITE_STUDENT_EMAIL_DOMAIN=siswa.geolangkah.test   # domain email teknis akun siswa (palsu, tanpa kirim email)
DEEPSEEK_API_KEY=              # HANYA di server (Vercel), jangan pakai awalan VITE_
DEEPSEEK_MODEL=                # cek nama model terbaru di dokumentasi DeepSeek
```

Kunci `service_role` Supabase **tidak pernah** ada di repo maupun di frontend.

## 8. Fungsi ekspor peneliti (P0) — `api/export.py`

- Menerima `Authorization: Bearer <JWT peneliti>` dan meneruskannya ke Supabase REST bersama anon key, sehingga **RLS tetap berlaku**. Tidak memakai `service_role`.
- `GET /api/export?table=step_logs|test_answers|leppink` → CSV. Bawaan hanya kode `S..`; `&include_test=1` ikut menyertakan akun uji `T..`.
- `GET /api/export?summary=1` → JSON: skor pretest & posttest, N-gain, rata-rata IL/EL/GL per siswa per pertemuan.
- `GET /api/export?key=1` → JSON kunci jawaban & pedoman umum penskoran dari `api/_shared/test_key.json` *(M7)*. Kunci sengaja **tidak** ada di `src/` agar tidak ikut bundle yang bisa diunduh siswa; hanya halaman `/peneliti` yang memintanya.
- Setiap permintaan dicek dulu lewat RPC `is_researcher` (bukan peneliti → 403). CSV memakai kolom `student_code` (dari relasi `students`), tanpa UUID, dengan BOM agar rapi di Excel.
- Hanya pustaka standar Python (`csv`, `json`, `statistics`, `urllib`) agar *cold start* cepat. Logika hitung ada di `api/_shared/scoring.py`, format CSV di `api/_shared/export_core.py` (keduanya dites `pytest`) dan juga diimpor oleh `analysis/process_data.py`. `vercel.json` menyertakan `api/_shared/**` ke fungsi. Variabel server: `SUPABASE_URL`/`SUPABASE_ANON_KEY`, bila kosong memakai `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`.

## 9. Tutor AI (P1) — `api/tutor.py`

- Menerima: `step_id`, soal (angka saja), jawaban siswa, level petunjuk yang sudah dibuka. **Tidak** menerima kode/nama siswa.
- *System prompt* tutor: berbahasa Indonesia sederhana, maksimal 2 kalimat, menjawab dengan **pertanyaan pemantik**, **tidak memberi jawaban akhir**, memakai istilah sesuai `KONTEN.md`.
- Batas: 5 pertanyaan per soal; jika API gagal, tampilkan petunjuk L2 biasa.

## 10. Analisis data (`analysis/process_data.py`)

Masukan: CSV dari halaman peneliti (`step_logs.csv`, `test_answers.csv`, `leppink.csv`). Rumus skor/N-gain/rata-rata diimpor dari `api/_shared/scoring.py` (sama dengan `api/export.py`). Keluaran:
- Skor pretest & posttest per siswa, **N-gain** = (post − pre) / (skor maks − pre).
- Rata-rata IL, EL, GL per siswa per pertemuan (tabel + grafik garis).
- Per pertemuan: jumlah percobaan, level petunjuk rata-rata, kode kesalahan terbanyak.
- Hanya kode berawalan `S` yang diolah (akun uji `T..` diabaikan).
