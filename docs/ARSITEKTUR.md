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
checkAnswer(value, unit, expected) // toleransi ±0,01 + cek satuan
diagnose(problem, value, unit)   // → kode kesalahan dari KONTEN.md §7
```

Tes minimal (`geometry.test.js`): semua kunci jawaban di `KONTEN.md`, setiap kode kesalahan di §7, dan kasus tidak wajar (s ≤ x).

## 4. Skema database (draf `supabase/migrations/0001_init.sql`)

```sql
-- Siswa: satu baris per akun. Akun dibuat peneliti (email teknis: s01@<VITE_STUDENT_EMAIL_DOMAIN>)
create table students (
  id uuid primary key references auth.users(id) on delete cascade,
  code text unique not null check (code ~ '^[ST][0-9]{2}$'),  -- S = penelitian, T = uji coba
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

- Peneliti membuat akun siswa di dasbor Supabase (*Add user* → centang *Auto Confirm User*, sehingga tidak ada email yang dikirim): email teknis `s01@<VITE_STUDENT_EMAIL_DOMAIN>`, kata sandi = PIN 6 digit, lalu menambah baris `students`.
- Domain email teknis: **`siswa.geolangkah.test`** (alamat palsu, tidak pernah dipakai mengirim email; diputuskan 26-11-2026). Jika di M6 Supabase menolak domain `.test`, Claude Code mengusulkan pengganti lalu memperbarui bagian ini.
- Layar Masuk meminta **Kode** + **PIN**, aplikasi mengubah kode menjadi email teknis lalu memanggil `signInWithPassword`.
- Sesi disimpan Supabase di perangkat → siswa tidak perlu masuk ulang setiap pertemuan.
- **Nama panggilan** (opsional) hanya disimpan di `localStorage` untuk sapaan; tidak pernah dikirim ke Supabase atau ke tutor AI.
- Peneliti masuk dengan email pribadinya di `/peneliti`.

## 6. Antrian offline (`logQueue.js`)

1. Setiap log diberi `client_id` (UUID) lalu disimpan ke `localStorage` terlebih dahulu.
2. Coba kirim ke Supabase dengan `upsert(..., { onConflict: 'client_id', ignoreDuplicates: true })`.
3. Gagal/offline → tetap di antrian; dicoba lagi saat event `online`, saat aplikasi dibuka, dan tiap 30 detik.
4. Berhasil → hapus dari antrian. Indikator kecil "Tersimpan ✓ / Menunggu sinyal…" di TopBar.
5. Status langkah yang sedang dikerjakan juga disimpan ke `localStorage` setiap berubah, karena Chrome Android bisa menutup tab di latar belakang pada HP ber-RAM kecil.

## 7. Variabel lingkungan (`.env.example`)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=        # boleh di frontend (dilindungi RLS)
VITE_STUDENT_EMAIL_DOMAIN=siswa.geolangkah.test   # domain email teknis akun siswa (palsu, tanpa kirim email)
DEEPSEEK_API_KEY=              # HANYA di server (Vercel), jangan pakai awalan VITE_
DEEPSEEK_MODEL=                # cek nama model terbaru di dokumentasi DeepSeek
```

Kunci `service_role` Supabase **tidak pernah** ada di repo maupun di frontend.

## 8. Fungsi ekspor peneliti (P0) — `api/export.py`

- Menerima `Authorization: Bearer <JWT peneliti>` dan meneruskannya ke Supabase REST bersama anon key, sehingga **RLS tetap berlaku**. Tidak memakai `service_role`.
- `GET /api/export?table=step_logs|test_answers|leppink` → CSV. Bawaan hanya kode `S..`; `&include_test=1` ikut menyertakan akun uji `T..`.
- `GET /api/export?summary=1` → JSON: skor pretest & posttest, N-gain, rata-rata IL/EL/GL per siswa per pertemuan.
- Hanya pustaka standar Python (`csv`, `json`, `statistics`, `urllib`) agar *cold start* cepat. Logika hitung ada di `api/_shared/scoring.py` (dites `pytest`) dan juga diimpor oleh `analysis/process_data.py`.

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
