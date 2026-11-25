# PROMPTS.md — Mulai dari sini

Panduan memakai blueprint GeoLangkah dengan **Claude Code di VS Code**: rencanakan dulu (Plan), baru koding.

---

## A. Persiapan (sekali saja)

1. Pasang **VS Code** (versi 1.94 ke atas), **Node.js LTS**, **Git**, dan **Python 3**.
2. Pasang ekstensi **Claude Code**: tekan `Ctrl+Shift+X` → cari "Claude Code" → **Install**. Masuk dengan akun Claude berbayar (Pro/Max/Team/Enterprise) atau akun Console.
3. Buat folder `geolangkah`, salin **semua** file blueprint ke dalamnya — termasuk folder tersembunyi `.vscode`. Lalu **File → Open Folder…** pilih folder itu.
4. Buka panel Claude: klik ikon ✦ (Spark) di pojok kanan atas editor (muncul saat ada file terbuka), atau ikon Spark di bilah kiri.

> **Privasi:** jangan masukkan PDF wawancara ke folder proyek/GitHub (berisi nama sekolah & foto). `docs/RISET.md` sudah berisi ringkasan tanpa identitas.

## B. Ganti mode "Auto" → "Plan" (penting)

- Di **bagian bawah kotak prompt** ada indikator mode. Pada versi baru biasanya tertulis **Auto** — artinya Claude langsung mengubah file.
- **Klik indikator itu → pilih Plan.** Di mode Plan, Claude hanya membaca dan menyusun rencana, lalu menunggu persetujuanmu. VS Code membuka rencananya sebagai dokumen Markdown yang bisa kamu beri komentar.
- Cara cepat: ketik `/plan` di kotak prompt.
- File `.vscode/settings.json` dari blueprint ini sudah membuat **setiap percakapan baru langsung mulai di Plan**.
- Setelah rencana benar dan kamu setujui, pakai mode **Manual** (Claude minta izin sebelum mengubah file — kamu bisa melihat setiap perubahan). Hindari **Auto** / **Edit automatically** sampai kamu terbiasa.

---

## C. Urutan prompt

### Prompt 0 — Tinjau blueprint (Milestone M0, mode Plan)

```
Kamu akan membantu saya membangun aplikasi GeoLangkah. JANGAN menulis atau mengubah file apa pun dulu.

1. Baca CLAUDE.md dan semua file di folder docs/ (RISET, PRD, DESIGN, KONTEN, ARSITEKTUR, ROADMAP).
2. Jelaskan kembali dengan bahasamu sendiri (maksimal 10 poin): masalah siswa dari wawancara, solusi aplikasi, dan alur 5 pertemuan.
3. Buat tiga daftar: (a) hal yang saling bertentangan antardokumen, (b) hal yang belum jelas untuk mulai membangun, (c) risiko teknis terbesar di HP Android.
4. Tanyakan kepada saya, satu per satu dan dengan pilihan jawaban, tentang asumsi A-1 sampai A-6 di docs/PRD.md.
5. Setelah semua terjawab, usulkan perubahan dokumen yang perlu (tunjukkan bagian yang berubah) dan tunggu persetujuan saya.
```

### Prompt 1 — Rencana milestone (mode Plan)

Ganti `M1` dengan milestone berikutnya. Kolom "Bagian dokumen" di tabel bawah membantu kamu mengisi baris kedua.

```
/plan Kerjakan Milestone M1 dari docs/ROADMAP.md.
Baca dulu: docs/ARSITEKTUR.md §1–2 dan docs/DESIGN.md §2.
Rencana harus memuat: file yang dibuat/diubah, urutan langkah, tes yang ditulis, perintah yang dijalankan, dan cara membuktikan setiap butir "Cek selesai".
Jangan menambah dependensi di luar ARSITEKTUR.md. Tanyakan dulu jika ada yang belum jelas.
```

| Milestone | Bagian dokumen yang disebut di prompt | Tambahan khusus |
|---|---|---|
| M1 Kerangka | ARSITEKTUR §1–2, §7 · DESIGN §2 | — |
| M2 Logika | KONTEN (semua tabel Latih + §7) · ARSITEKTUR §3 | "Tulis tesnya dulu dan tunjukkan bahwa tes gagal, baru implementasi." |
| M3 Gambar | DESIGN §2.2, §5 · KONTEN §3–5 bagian Kenali/Bangun | "Buat halaman /lab untuk mencoba semua lapisan." |
| M4 Mesin langkah | KONTEN §1–3, §7, §9, §10 · DESIGN §2.5, §3, §4, §6 | — |
| M5 Konten 3–5 | KONTEN §4–6, §10 · DESIGN §4.5 | "Tambahkan tes yang mencocokkan setiap answer di JSON dengan geometry.js." |
| M6 Supabase | ARSITEKTUR §4–6 | "Tulis tes logQueue untuk skenario offline → online tanpa data ganda." |
| M7 Instrumen | PRD F-12–F-14 · ARSITEKTUR §9 · KONTEN §8 | "Isi tests.json dan leppink.json HANYA dengan struktur kosong." |
| M8 PWA & tema | PRD §8 · ARSITEKTUR §1 · DESIGN §2.5 | Lampirkan tangkapan layar acuan (lihat catatan di bawah tabel) |
| M9 Tutor AI | ARSITEKTUR §8 | — |

**Untuk M8 (penghalusan tema):** tempel tangkapan layar aplikasi contoh di kotak prompt, lalu tambahkan kalimat:
`Gambar ini hanya acuan suasana (warna hangat, kartu membulat, sapaan ramah). Jangan menyalin ilustrasi atau teksnya. Terapkan sesuai docs/DESIGN.md §2.5, dan pastikan layar dalam tetap tanpa hiasan.`

### Prompt 2 — Setelah rencana disetujui

Setujui rencananya (jika ditawari pilihan, pilih yang **meminta izin setiap edit / manual**). Jika Claude belum mulai, kirim:

```
Rencana disetujui. Kerjakan sesuai rencana.
Setelah selesai: jalankan npm test dan npm run build, tunjukkan keluarannya, centang butir milestone ini di docs/ROADMAP.md, lalu ringkas perubahan dalam maksimal 5 poin. Berhenti setelah itu.
```

### Prompt 3 — Periksa hasil sebelum lanjut

```
Periksa hasil milestone ini sebelum kita lanjut. Jangan memperbaiki apa pun dulu, laporkan saja.
1. Jalankan npm test dan npm run build, tunjukkan keluarannya.
2. Periksa setiap layar baru dengan daftar periksa docs/DESIGN.md §9 pada ukuran 360×640 (ambil tangkapan layar dengan Playwright jika tersedia; jika tidak, minta saya mengirim tangkapan layar dari HP). Laporkan dalam tabel: layar | butir | lulus/tidak | usulan perbaikan.
3. Pastikan tidak ada nama siswa/sekolah dan tidak ada kunci rahasia di kode.
```

### Prompt 4 — Tinjauan oleh "mata segar" (untuk M4, M6, M7)

```
Gunakan subagent untuk meninjau perubahan milestone ini terhadap docs/ROADMAP.md, docs/DESIGN.md §8–9, docs/KONTEN.md, dan aturan di CLAUDE.md.
Laporkan hanya kekurangan yang memengaruhi kebenaran matematika, keamanan/privasi data, atau beban kognitif siswa. Abaikan selera gaya.
```

### Prompt 5 — Saat ada error

```
Terjadi error saat saya [jelaskan apa yang kamu lakukan]:
[tempel pesan error atau tangkapan layar]
Cari penyebab utamanya (jangan hanya menyembunyikan error), jelaskan singkat, usulkan perbaikan, lalu tunggu persetujuan saya.
```

### Prompt 6 — Saat keputusan berubah

```
Saya memutuskan: [tulis keputusan, mis. "tutor AI tidak dipakai"].
Perbarui semua dokumen di docs/ dan CLAUDE.md yang terkena agar tetap konsisten. Tunjukkan daftar perubahan dulu sebelum menyimpan.
```

---

## D. Mencoba di HP Android

1. Laptop dan HP tersambung ke Wi-Fi yang sama.
2. Jalankan `npm run dev -- --host` di terminal VS Code.
3. Buka alamat `Network: http://192.168.x.x:5173` yang muncul di terminal, lewat Chrome di HP.
4. Setelah deploy (M1), pakai juga alamat Vercel untuk uji dengan data seluler.

## E. Kebiasaan baik

- **Satu milestone = satu sesi.** Setelah selesai dan di-*commit*, ketik `/clear` sebelum milestone berikutnya.
- `git commit` setiap milestone selesai, supaya mudah kembali jika ada yang rusak.
- Tekan `Esc` untuk menghentikan Claude; `Esc` dua kali atau `/rewind` untuk kembali ke titik sebelumnya.
- Jika Claude salah dua kali pada hal yang sama → `/clear`, lalu tulis prompt yang lebih jelas.
- `tests.json` (butir pretest/posttest) dan `leppink.json` **kamu ketik sendiri** dari instrumen penelitian.
