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
- Sebelum **M4/M5:** aturan seret per jenis trapesium; urutan prioritas `diagnose()`; kotak kosong pada langkah memudar P2/P3/P4; tipe langkah pilihan ganda & cerita; perilaku setelah 2 percobaan di Tantangan; reset saat tombol Kembali; *seed* soal acak; angka baru Tantangan Pos ⑤ (soal 1–2).

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
- [ ] Tulis `geometry.test.js` berisi **semua kunci** di `KONTEN.md` dan semua kode kesalahan §7 → tes gagal dulu
- [ ] Implementasi `geometry.js` sampai semua tes lulus

**Cek selesai:** `npm test` hijau; tunjukkan keluaran tes.

## M3 — Gambar interaktif
- [ ] `FigureCanvas` (SVG) untuk persegi panjang & trapesium (sama kaki, siku-siku, sembarang)
- [ ] Lapisan: `grid`, `parallel`, `height`, `rightAngle`, `legs`, `labels`, `area`, `perimeter`
- [ ] `DragHandle` untuk titik D & C dengan batasan di `DESIGN.md` §5 (snap ke petak)
- [ ] Animasi `decompose` dan `doubleRotate` yang dijalankan tombol + dukungan `prefers-reduced-motion`
- [ ] Halaman uji `/lab` (hanya mode pengembangan) untuk mencoba semua lapisan

**Cek selesai:** di viewport 360 × 640 dan HP Android asli, titik bisa diseret tanpa halaman ikut tergulir; tinggi selalu tegak lurus; label sesuai hitungan `geometry.js`.

## M4 — Mesin langkah, petunjuk, umpan balik + Pertemuan 1–2
- [ ] `StepEngine` membaca `meeting-*.json` (format di `KONTEN.md` §9)
- [ ] Tipe langkah: `explain`, `explore` (gambar digeser), `identify` (ketuk unsur), `faded`, `solve`, `why`
- [ ] `HintPanel` 3 tingkat dengan aturan buka di `KONTEN.md` §7
- [ ] `AnswerInput` + pilihan satuan, `FeedbackBanner` memakai `diagnose()`
- [ ] `FormulaCard` "Ingat rumus"
- [ ] Layar Pembuka/Masuk (tanpa ilustrasi final), **Peta Petualangan** 5 pos, layar **Hasil Pos**
- [ ] Langkah bertipe `challenge` (Tantangan Pos, `KONTEN.md` §10)
- [ ] Konten Pertemuan 1 & 2 lengkap, termasuk Tantangan Pos ① dan ②

**Cek selesai:** Pertemuan 1 & 2 bisa dimainkan dari awal sampai akhir di HP; semua item daftar periksa `DESIGN.md` §9 terpenuhi.

## M5 — Pertemuan 3–5 + soal cerita
- [ ] Konten Pertemuan 3 & 4 (termasuk penyegaran Pythagoras)
- [ ] `StoryReader` + `KnownAskedTable` (mode baca ringkas)
- [ ] Konten Pertemuan 5 (3 soal cerita, tahap Rumuskan–Hitung–Tafsirkan)
- [ ] Tantangan Pos ③–⑤
- [ ] Pertanyaan "Mengapa?" (P1)

**Cek selesai:** kelima pertemuan berjalan tanpa error; tes konten memastikan setiap `answer` di JSON sama dengan hasil `geometry.js`.

## M6 — Supabase: masuk, progres, log, offline
- [ ] Migrasi `0001_init.sql` + kebijakan RLS
- [ ] Halaman Masuk (Kode + PIN) dan Peta Pertemuan dengan kunci berurutan
- [ ] Simpan progres (lanjut dari langkah terakhir)
- [ ] `logQueue.js` + tes (simulasi offline → online, tanpa data ganda)

**Cek selesai:** matikan data seluler di tengah pertemuan → lanjutkan → nyalakan lagi → log masuk ke Supabase **tepat satu kali**.

## M7 — Instrumen penelitian & halaman peneliti
- [ ] `TestPage` (pretest di awal Pertemuan 1, posttest di akhir Pertemuan 5; terkunci setelah dikirim)
- [ ] `LeppinkPage` (10 butir, tombol 0–10) di akhir setiap pertemuan
- [ ] Peneliti mengisi `tests.json` dan `leppink.json` *(bukan Claude Code)*
- [ ] `api/_shared/scoring.py` (skor, N-gain, rata-rata IL/EL/GL) + tes `pytest`
- [ ] `api/export.py` (Python, Vercel) sesuai `ARSITEKTUR.md` §8 — CSV & ringkasan, memakai JWT peneliti
- [ ] `/peneliti`: daftar siswa, progres, isi skor butir uraian, tombol unduh CSV (`step_logs`, `test_answers`, `leppink`) lewat `/api/export`
- [ ] `analysis/process_data.py` (mengimpor `scoring.py`) + contoh data palsu untuk mengujinya

**Cek selesai:** akun uji `T01` menyelesaikan seluruh alur; peneliti mengisi skor uraian; CSV terunduh dari `/api/export`; ringkasan `/api/export?summary=1` sama dengan hasil `process_data.py`; `pytest` hijau.

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
- [ ] Bekukan versi (tag `v1.0-ujicoba`) — tidak ada perubahan konten selama 5 pertemuan uji coba
