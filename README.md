# GeoLangkah — Jelajah Desa Bangun Datar

Aplikasi web *mobile-first* untuk belajar keliling & luas persegi panjang dan trapesium bagi siswa SMP.
Dirancang dengan *Cognitive Load Theory*; tugas mata kuliah Algoritma & Pemrograman (tahap Development, ADDIE).

## Menjalankan

Prasyarat: Node.js ≥ 20.

```bash
npm install
npm run dev      # server pengembangan (http://localhost:5173)
npm test         # tes Vitest
npm run build    # build produksi ke dist/
npm run lint     # oxlint
```

> **Windows:** bila `npm test` gagal dengan *"Vitest failed to find the current suite"*, terminal dibuka dengan
> huruf drive kecil (`c:\…`). Jalankan `cd C:\proyek\geolangkah` (huruf besar) lalu ulangi.

Salin `.env.example` menjadi `.env` bila butuh variabel lingkungan (mulai M6).

## Dokumen

Rancangan lengkap ada di [`docs/`](docs/): PRD, RISET, DESIGN, KONTEN, ARSITEKTUR, ROADMAP.

## Keamanan

Rahasia (`DEEPSEEK_API_KEY`, Supabase `service_role`) hanya disimpan di pengaturan Vercel, tidak pernah di repo
dan tidak pernah berawalan `VITE_`. File `.env` diabaikan git.
