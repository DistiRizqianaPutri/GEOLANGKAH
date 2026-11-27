# ROADMAP.md — Tahapan Pembuatan (Milestone)

> **Aturan:** kerjakan berurutan, **satu milestone per sesi** Claude Code. Setiap milestone dimulai di **Plan mode**, dan baru dikerjakan setelah rencananya disetujui.
> Setelah selesai: jalankan semua "Cek selesai", centang kotaknya di file ini, `git commit`, lalu `/clear` sebelum milestone berikutnya.

Legenda: ☐ belum · ☑ selesai

---

## M0 — Tinjau blueprint *(tanpa kode)*
- [x] Claude Code membaca semua file di `docs/` dan `CLAUDE.md`
- [x] Daftar pertentangan / kekosongan / pertanyaan dijawab pengembang *(pertentangan diperbaiki di dokumen; pertanyaan terbuka untuk M1 & M4/M5 dicatat di bawah)*
- [x] Asumsi A-1 s.d. A-7 di `PRD.md` dikonfirmasi atau diperbarui (26-11-2026)

**Pertanyaan terbuka (dijawab sebelum milestone terkait):**
- Sebelum **M1** — *dijawab 26-11-2026:*
  - Tailwind **v4** (lihat `ARSITEKTUR.md` §1).
  - `git init` dilakukan di awal M1.
  - Domain email teknis: `siswa.geolangkah.test` (lihat `ARSITEKTUR.md` §5).
  - Supabase dibuat pengembang sebelum M6 (tidak dibutuhkan di M1).
  - ☑ Akun GitHub & Vercel sudah ada. Repo **publik**, dibuat & diimpor ke Vercel lewat web (tanpa CLI `gh`/`vercel`).
- ☑ *Urutan prioritas `diagnose()` dijawab 26-11-2026 di M2* ("spesifik dulu", lihat `ARSITEKTUR.md` §3).
- Sebelum **M4/M5:** tipe langkah pilihan ganda & cerita; perilaku setelah 2 percobaan di Tantangan; reset saat tombol Kembali; *seed* soal acak.
  - ☑ *Dijawab 26-11-2026:* aturan seret per jenis trapesium (`DESIGN.md` §5); kotak kosong pada langkah memudar (`KONTEN.md` §1); angka baru Tantangan Pos ⑤ soal 1–2 = taplak meja (`KONTEN.md` §10, sudah dites).
  - ☑ *Dijawab 26-11-2026 (awal M4):*
    - Pertanyaan pilihan berupa PG dengan umpan balik per opsi. Siswa boleh mencoba sampai benar, setiap percobaan dicatat, dan Lanjut terbuka setelah benar.
    - Tantangan: jika percobaan ke-2 salah, jawaban + pembahasan (L3) tampil.
    - Tombol ‹ membuka langkah sebelumnya; langkah yang sudah selesai terkunci beserta jawabannya. "Ulangi langkah" hanya me-reset gambar.
    - Seed soal acak = kode siswa + pertemuan.
    - Soal cerita (P5) belum dibahas; dijawab di M5.
  - ☑ *Dijawab 26-11-2026 (awal M5):* P5 tetap 4 fase (Kenali pengantar, Bangun = Soal 1, Latih = Soal 2–3, Tantangan). Tandai info wajib lengkap; pengecoh ditolak & dicatat. Ditanya = PG keliling/luas. Detail di `KONTEN.md` §6.

**Cek selesai:** tidak ada pertanyaan terbuka yang menghalangi M1.

## M1 — Kerangka proyek
- [x] `git init` (sebelum file lain dibuat)
- [x] Vite + React + Tailwind v4 (`@tailwindcss/vite`) + React Router + Vitest terpasang
- [x] Struktur folder sesuai `ARSITEKTUR.md` §2 (boleh berisi file kosong)
- [x] Token warna & tipografi dari `DESIGN.md` §2 dimasukkan ke blok `@theme` di `src/styles/index.css`
- [x] `.env.example`, `.gitignore` (termasuk `.env`), README singkat
- [x] Repo GitHub + deploy pertama ke Vercel (halaman "Halo GeoLangkah")

**Cek selesai:** `npm run dev`, `npm test`, `npm run build` sukses; URL Vercel terbuka di HP.
*Selesai 26-11-2026:* lint bersih, 25 tes lulus, build sukses; repo `github.com/DistiRizqianaPutri/GEOLANGKAH`; deploy `https://geolangkah.vercel.app` dibuka di Chrome Android tanpa geser horizontal.

## M2 — Logika matematika (tes dulu)
- [x] Tulis `geometry.test.js` berisi **semua kunci** di `KONTEN.md` dan semua kode kesalahan §7 → tes gagal dulu
- [x] Implementasi `geometry.js` sampai semua tes lulus

**Cek selesai:** `npm test` hijau; tunjukkan keluaran tes.
*Selesai 26-11-2026:* dengan stub, 76 tes gagal; setelah implementasi, 104 tes lulus (79 geometry + 25 tema); lint bersih; build sukses. Dua soal ⑤ bertanda PERLU DIGANTI belum dites sebagai Tantangan. Tesnya ditambah saat angka barunya ada (sebelum M5). *Diperbarui 26-11-2026:* ⑤ diganti soal taplak meja, tesnya ditambahkan, dan kini 110 tes lulus.
*Catatan Windows:* jalankan `npm test` dari path ber-drive kapital (`C:\proyek\geolangkah`). Dari `c:\…` (huruf kecil), vitest dimuat dua kali dan semua suite gagal dengan `Cannot read properties of undefined (reading 'config')`.

## M3 — Gambar interaktif
- [x] `FigureCanvas` (SVG) untuk persegi panjang & trapesium (sama kaki, siku-siku, sembarang)
- [x] Lapisan: `grid`, `parallel`, `height`, `rightAngle`, `legs`, `labels`, `area`, `perimeter`
- [x] `DragHandle` untuk titik D & C dengan batasan di `DESIGN.md` §5 (snap ke petak)
- [x] Animasi `decompose` dan `doubleRotate` yang dijalankan tombol + dukungan `prefers-reduced-motion`
- [x] Halaman uji `/lab` (hanya mode pengembangan) untuk mencoba semua lapisan

**Cek selesai:** di viewport 360 × 640 dan HP Android asli, titik bisa diseret tanpa halaman ikut tergulir; tinggi selalu tegak lurus; label sesuai hitungan `geometry.js`.
*Selesai 26-11-2026:* 142 tes lulus (32 tes baru untuk model gambar: ukuran semua angka KONTEN §2–5, snap, aturan seret per jenis, batas, `decompose`/`doubleRotate`, `formatMeasure`); lint bersih; build sukses, dan kode `/lab` tidak ada di `dist/`. Label dan garis tinggi diambil langsung dari `trapezoidMeasures()`; D dan C selalu punya y yang sama (dites). `doubleRotate` berhenti di jajargenjang; langkah potong-geser ke persegi panjang dikerjakan bersama konten P3 (M5). **Belum dicek:** seret di HP Android asli dan di 360 × 640. Pengembang mengeceknya sendiri di `/lab` (`npm run dev -- --host`).

## M4 — Mesin langkah, petunjuk, umpan balik + Pertemuan 1–2
- [x] `StepEngine` membaca `meeting-*.json` (format di `KONTEN.md` §9)
- [x] Tipe langkah: `explain`, `explore` (gambar digeser), `identify` (ketuk unsur), `faded`, `solve`, `why`
- [x] `HintPanel` 3 tingkat dengan aturan buka di `KONTEN.md` §7
- [x] `AnswerInput` + pilihan satuan, `FeedbackBanner` memakai `diagnose()`
- [x] `FormulaCard` "Ingat rumus"
- [x] Layar Pembuka/Masuk (tanpa ilustrasi final), **Peta Petualangan** 5 pos, layar **Hasil Pos**
- [x] Langkah bertipe `challenge` (Tantangan Pos, `KONTEN.md` §10)
- [x] Konten Pertemuan 1 & 2 lengkap, termasuk Tantangan Pos ① dan ②
- [x] Perbaikan temuan M3: label kaki terpotong di tepi gambar (juga pada gambar statis selebar layar); format `s ≈ 6,1 cm`

**Cek selesai:** Pertemuan 1 & 2 bisa dimainkan dari awal sampai akhir di HP; semua item daftar periksa `DESIGN.md` §9 terpenuhi.

*Selesai 26-11-2026 (logika & build).* 337 tes lulus (195 tes baru); lint bersih; build sukses.

**Bukti alur dimainkan (tanpa peramban):**
- `playthrough.test.js` memainkan P1 & P2 sampai Hasil Pos untuk T01, S01, S02 dengan konten asli dan reducer + pemeriksa yang sama dengan UI. Hasilnya 3 dari 3, dan 2 dari 3 bila satu Tantangan salah 2×.
- Jalur salah yang ikut dites: `E_SATUAN`, `E_KL_TERTUKAR`, `E_KOTAK`, `E_SETENGAH_KELILING`, `E_KAKI_SBG_TINGGI`, `E_TINGGI_DI_KELILING`, `E_SISI_KURANG`; tawaran petunjuk setelah 2× salah; L3 terkunci sebelum mencoba; tombol ‹ tidak me-reset langkah yang sudah benar.
- `StepView.test.jsx` merender setiap langkah P1–P2 (belum dijawab dan sudah dijawab) tanpa galat dan tanpa emoji.

**DESIGN §9:**
- Dicek otomatis di `content.test.js`: ≤ 3 kalimat dan ≤ 15 kata per kalimat, satu gambar per langkah, tanpa emoji di layar dalam, kunci = `geometry.js`.
- Ditinjau di kode: target sentuh ≥ 48 px (`min-h-12`/`h-12`), teks ≥ 16 px, tanpa timer/auto-lanjut, panel petunjuk tidak menutup gambar, baris isian `flex-wrap` agar muat 360 px.

**Belum dicek:** tampilan 360 × 640 di peramban dan HP Android asli. Sesi ini tidak punya alat peramban. Pengembang memainkan P1 → Hasil ① → P2 → Hasil ② di HP (Vercel setelah push, atau `npm run dev -- --host`) dan mengecek label kaki di `/lab` (a = 16, seret ke b = 14, t = 6).

## M5 — Pertemuan 3–5 + soal cerita
- [x] Konten Pertemuan 3 & 4 (termasuk penyegaran Pythagoras)
- [x] `StoryReader` + `KnownAskedTable` (mode baca ringkas)
- [x] Konten Pertemuan 5 (3 soal cerita, tahap Rumuskan–Hitung–Tafsirkan)
- [x] Tantangan Pos ③–⑤
- [x] Pertanyaan "Mengapa?" (P1)

**Cek selesai:** kelima pertemuan berjalan tanpa error; tes konten memastikan setiap `answer` di JSON sama dengan hasil `geometry.js`.

*Selesai 26-11-2026 (logika & build).* 522 tes lulus (185 baru); lint bersih; build sukses.

**Bukti:**
- `content.test.js` (100 tes, P1–P5): setiap `answer` dibandingkan langsung dengan `solveProblem()` (nilai + satuan). Kotak memudar, angka gambar, dan akhir L3 juga harus sama dengan `geometry.js`. Info penting soal cerita = `problem` di langkah Hitung. Kunci Tantangan ①–⑤ dan Latih P3–P5 dicocokkan dengan tabel KONTEN. Uji mutasi: kunci P4 330 → 331 membuat 3 tes gagal.
- `playthrough.test.js` (35 tes): P1–P5 dimainkan sampai Hasil Pos untuk T01, S01, S02 (3 dari 3; 2 dari 3 bila salah 2×). Jalur salah baru: `E_LUPA_SETENGAH`, `E_KAKI_SBG_TINGGI`, `E_KOTAK` (x tidak dibagi), `E_PYTHA_TAMBAH`, `E_X_TIDAK_DIBAGI`, `E_TIDAK_WAJAR`, `E_SATUAN`/`E_KL_TERTUKAR` pada kg, biaya belum dikali, dan pengecoh cerita + gerbang Lanjut.
- `StepView.test.jsx` (95 tes): setiap langkah P1–P5 dirender tanpa galat dan tanpa emoji; StoryStep awal (kosong) dan selesai (lengkap, terkunci).
- `geometry.test.js` +satuan turunan, segitiga 3-4-5/6-8-10/5-12-13/8-15-17, `formatAnswer`; `story.test.js` (14 tes).

**Penyederhanaan:** "ketuk segitiga, lalu sisi miringnya" (P4) dijadikan satu ketuk sisi miring (`KONTEN.md` §5).

**Belum dicek:** tampilan 360 × 640 dan HP Android asli (sesi tanpa peramban). Pengembang memainkan P3 → P5 di Vercel. Fokus: chip & tabel soal cerita, label `t = ?`, segitiga di `/lab`, dan templat memudar panjang P4/P5 yang harus terbungkus rapi di 360 px.

## M6 — Supabase: masuk, progres, log, offline
- [x] Migrasi `0001_init.sql` + kebijakan RLS
- [x] Halaman Masuk (Kode + PIN) dan Peta Pertemuan dengan kunci berurutan
- [x] Simpan progres (lanjut dari langkah terakhir)
- [x] `logQueue.js` + tes (simulasi offline → online, tanpa data ganda)

**Cek selesai:** matikan data seluler di tengah pertemuan → lanjutkan → nyalakan lagi → log masuk ke Supabase **tepat satu kali**.
*Selesai 27-11-2026:* 580 tes lulus (17 tes `logQueue`: offline → online, respons hilang, flush bersamaan, muat ulang tab), lint bersih, build sukses. Migrasi dijalankan; akses tanpa login ditolak di semua tabel; pendaftaran mandiri mati. Akun T01 (domain `.test` diterima): PIN salah → pesan error; Pos 1 dimainkan sampai Hasil → `step_logs` 14 baris, `progress` tercatat. Variabel `VITE_*` diisi di Vercel. Perbaikan: `useEffect` ringkas di StepEngine diubah ke blok `{ }` + tes `src/effects.test.js`.

## M7 — Instrumen penelitian & halaman peneliti
- [x] `TestPage` (pretest di awal Pertemuan 1, posttest di akhir Pertemuan 5; terkunci setelah dikirim)
- [x] `LeppinkPage` (10 butir, tombol 0–10) di akhir setiap pertemuan
- [x] Peneliti mengisi `tests.json` dan `leppink.json` *(teks diberikan peneliti di prompt, disalin kata demi kata; kunci di `api/_shared/test_key.json`)*
- [x] `api/_shared/scoring.py` (skor, N-gain, rata-rata IL/EL/GL) + tes `pytest`
- [x] `api/export.py` (Python, Vercel) sesuai `ARSITEKTUR.md` §8 — CSV & ringkasan, memakai JWT peneliti
- [x] `/peneliti`: daftar siswa, progres, isi skor butir uraian, tombol unduh CSV (`step_logs`, `test_answers`, `leppink`) lewat `/api/export`
- [x] `analysis/process_data.py` (mengimpor `scoring.py`) + contoh data palsu untuk mengujinya

**Cek selesai:** akun uji `T01` menyelesaikan seluruh alur; peneliti mengisi skor uraian; CSV terunduh dari `/api/export`; ringkasan `/api/export?summary=1` sama dengan hasil `process_data.py`; `pytest` hijau.

*Selesai 27-11-2026 (kode):* 591 tes Vitest lulus, lint bersih, build sukses; `pytest analysis api/_shared` 13 lulus; `process_data.py` jalan pada `analysis/sample_data`; teks kunci tidak ditemukan di `dist/`. Ringkasan API = `process_data.py` dijamin oleh fungsi `summarize()` yang sama + tes bolak-balik CSV. **Belum diuji (manual, setelah deploy):** jalankan `0002_m7.sql`, buat akun peneliti, alur T01 penuh, isi skor, unduh CSV dari `/api/export`. Catatan Windows: jalankan `npm test` dari folder berhuruf drive besar (`C:\…`); dari `c:\…` Vitest gagal memuat semua suite.

## M8 — Tutor AI *(P1)*
- [ ] `api/tutor.py` sesuai `ARSITEKTUR.md` §9
- [ ] Tombol "Tanya tutor" muncul setelah petunjuk L2 dibuka

**Cek selesai:** tutor tidak pernah menyebut jawaban akhir pada 10 percobaan uji; kunci API tidak terlihat di *bundle* frontend.

## M9 — PWA & penghalusan tema *(P1)*
- [ ] Font Nunito (400 & 800) di-*host* sendiri; ilustrasi pembuka orisinal (SVG ≤ 30 KB) — `DESIGN.md` §2.5
- [ ] (P2) Tombol musik: hanya di layar luar, mati secara bawaan
- [ ] `vite-plugin-pwa`: ikon, *manifest*, materi bisa dibuka offline
- [ ] Audit Lighthouse (mode HP): Performance & Accessibility ≥ 90
- [ ] Uji di 2 HP Android berbeda (salah satunya kelas menengah ke bawah)

**Cek selesai:** aplikasi bisa dipasang ke layar utama dan dibuka saat mode pesawat.

## M10 — Siap uji coba
- [ ] Buat akun `S01`, `S02` (dan `T01` untuk uji)
- [ ] Pastikan proyek Supabase aktif (tidak dijeda) sebelum setiap pertemuan
- [ ] Uji coba kering (*dry run*) satu pertemuan oleh pengembang di HP
- [ ] Sembunyikan lagi halaman uji `/lab` dari build produksi (kembalikan syarat `import.meta.env.DEV` di `src/App.jsx`)
- [ ] Bekukan versi (tag `v1.0-ujicoba`) — tidak ada perubahan konten selama 5 pertemuan uji coba
