# CLAUDE.md — GeoLangkah

Aplikasi web *mobile-first* (Chrome Android) untuk belajar **keliling & luas persegi panjang dan trapesium** bagi siswa SMP. Dirancang dengan *Cognitive Load Theory* untuk mendukung literasi matematis. Tugas mata kuliah Algoritma & Pemrograman, tahap **Development** model ADDIE.

## Dokumen rujukan (baca yang relevan sebelum merencanakan)
- `docs/PRD.md` — tujuan, fitur (F-xx) & prioritas, asumsi A-1…A-7
- `docs/RISET.md` — bukti wawancara → fitur. Jangan tambah fitur yang tidak ada dasarnya di sini
- `docs/DESIGN.md` — aturan tampilan, kode warna unsur bangun, daftar periksa per layar
- `docs/KONTEN.md` — isi materi, kunci jawaban, petunjuk, kode kesalahan
- `docs/ARSITEKTUR.md` — stack, folder, skema Supabase, offline
- `docs/ROADMAP.md` — milestone M0–M10; kerjakan berurutan

## Cara kerja
- Selalu jawab pengembang dalam **Bahasa Indonesia**.
- IMPORTANT: **Rencanakan dulu, jangan langsung menulis kode.** Setiap milestone: baca dokumen terkait → tulis rencana (file yang diubah, langkah, cara cek) → tunggu persetujuan.
- Satu milestone per sesi. Selesai → jalankan "Cek selesai" di ROADMAP, tunjukkan buktinya (keluaran tes/build), centang ROADMAP, ringkas perubahan, lalu berhenti.
- Jika dokumen bertentangan atau belum jelas, **tanya**; jangan menebak. Jika keputusan berubah, perbarui dokumen `docs/` yang terkait.
- Jangan menambah dependensi besar (3D, UI kit, state manager, KaTeX) tanpa izin.

## Perintah
- `npm run dev` · `npm test` · `npm run build` · `npm run lint`
- Analisis: `python analysis/process_data.py <folder-csv>`
- Tes Python: `pytest analysis api/_shared`

## Matematika
- K persegi panjang = 2 × (p + l); L = p × l. K trapesium = jumlah 4 sisi; L = ½ × (a + b) × t (a, b sejajar; t tegak lurus).
- Semua hitungan hanya di `src/lib/geometry.js` (fungsi murni, wajib dites Vitest). Komponen UI tidak menghitung sendiri.
- Angka contoh memakai tripel Pythagoras (3-4-5, 6-8-10, 5-12-13, 8-15-17). Jangan ubah angka di `KONTEN.md` tanpa menghitung ulang + tes.
- Satuan selalu tampil: panjang (cm, m), luas (cm², m²).
- IMPORTANT: **Jangan mengarang** butir pretest/posttest atau teks skala Leppink. Buat struktur kosong; isinya diketik peneliti.

## Beban kognitif (detail di DESIGN.md)
- Satu ide per layar, ≤ 3 kalimat pendek. Satu gambar per layar.
- Label menempel di gambar; tampilkan hanya unsur yang sedang dibahas.
- Tempo dikendalikan siswa: tanpa timer, tanpa auto-lanjut; animasi hanya setelah tombol ditekan.
- Tema petualangan ("Jelajah Desa Bangun Datar") hanya di **layar luar** (Pembuka, Peta, Hasil Pos). Layar belajar tanpa ilustrasi, emoji hiasan, atau musik. Tidak ada konfeti, poin, bintang, atau papan peringkat.
- Ilustrasi harus orisinal; jangan menyalin gambar dari aplikasi lain.

## Mobile / Android
- Uji di viewport 360 × 640. Target sentuh ≥ 48 px, teks isi ≥ 16 px, tanpa efek hover-saja.
- Gambar: SVG + Pointer Events, `touch-action: none` di area seret.

## Privasi & keamanan
- Siswa hanya dikenal lewat kode (S01, S02; akun uji T01). Jangan menulis nama siswa/sekolah di kode, data contoh, log, atau prompt AI. Nama panggilan opsional hanya di `localStorage`.
- Rahasia (`DEEPSEEK_API_KEY`, Supabase `service_role`) hanya di server/Vercel, tidak pernah berawalan `VITE_`. RLS aktif di semua tabel.

## Gaya kode
- React + Vite (JSX), Tailwind v4 (token di `@theme`, tanpa `tailwind.config.js`). Nama variabel/fungsi/file dalam bahasa Inggris; teks UI dan komentar dalam Bahasa Indonesia.
- Konten materi di `src/content/*.json`, bukan ditulis di dalam JSX.
- Komponen kecil dan fokus; satu komponen satu file.
