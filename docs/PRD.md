# PRD.md — Product Requirements Document

**Nama kerja aplikasi:** GeoLangkah *(boleh diganti — cari & ganti di semua file)*
**Materi:** Keliling dan luas persegi panjang serta trapesium
**Jenis:** Aplikasi web *mobile-first* (utama: Chrome di HP Android)
**Gaya:** petualangan ramah anak — "Jelajah Desa Bangun Datar" (suasana seperti aplikasi *Jelajah Matematika*), dengan hiasan hanya di layar luar
**Kedudukan dalam ADDIE:** dokumen ini adalah hasil tahap **Design**; pembuatan kode = tahap **Development**.
**Status:** Draf v4 (asumsi A-1…A-7 dikonfirmasi di M0) — 26 November 2026

---

## 1. Ringkasan

GeoLangkah membantu siswa SMP memahami keliling dan luas trapesium dengan **mengurangi beban kognitif yang tidak perlu** (gambar ramai, soal cerita panjang, penjelasan terlalu cepat) dan **memperkuat proses yang membangun pemahaman** (gambar yang bisa digeser, langkah bertahap, petunjuk bertingkat). Tujuan akhirnya: meningkatkan **literasi matematis** — kemampuan merumuskan situasi nyata ke model matematika, menghitung, lalu menafsirkan hasilnya.

## 2. Masalah (dari wawancara S01 — detail di `RISET.md`)

1. Siswa **lupa rumus trapesium** dan **bingung menentukan tinggi**, terutama bila tinggi harus dicari dengan Pythagoras. *(Intrinsic)*
2. **Gambar soal terlalu ramai** dan **soal cerita terlalu panjang**, sehingga siswa bingung garis mana yang dihitung. *(Extraneous)*
3. Siswa paham jika **gambar bisa digeser**, dijelaskan **perlahan**, dan ada **petunjuk bertahap**. *(Germane)*

## 3. Tujuan dan indikator keberhasilan

| Tujuan | Indikator (target uji coba) |
|---|---|
| Siswa dapat mengenali unsur trapesium | ≥ 80% benar pada latihan "ketuk sisi sejajar / tinggi" di Pertemuan 2 |
| Siswa dapat menentukan tinggi dengan Pythagoras | Menyelesaikan soal tinggi trapesium sama kaki & siku-siku tanpa petunjuk level 3 di akhir Pertemuan 4 |
| Bantuan makin jarang dibutuhkan | Rata-rata level petunjuk per soal menurun dari Pertemuan 2 ke 5 |
| Penyajian tidak membebani | Skor *extraneous load* (skala Leppink) rendah dan tidak naik antarpertemuan |
| Literasi matematis meningkat | Skor posttest > pretest (dilaporkan juga N-gain), dibaca hati-hati karena sampel kecil |
| Nyaman di HP | Layar 360 px tanpa geser horizontal; muat pertama < 3 detik di 4G |

## 4. Pengguna

**Siswa (pengguna utama)** — siswa SMP yang sedang/sudah belajar materi ini (kelas VII–VIII). Memakai HP Android sendiri/orang tua, layar kecil, kuota & sinyal terbatas. Seperti S01: persegi panjang mudah, trapesium membingungkan, cepat malas jika tampilan ramai. Bagian tinggi-dengan-Pythagoras membutuhkan prasyarat Teorema Pythagoras, jadi aplikasi menyediakan penyegaran singkat.

**Peneliti / guru (pengguna kedua)** — menyiapkan akun siswa, memantau progres, mengekspor data pretest/posttest, skala Leppink, dan log belajar untuk dianalisis.

## 5. Lingkup

**Termasuk:** 5 pertemuan materi (lihat `KONTEN.md`), gambar interaktif 2D, petunjuk bertingkat, umpan balik, soal cerita literasi, pretest/posttest, skala Leppink, log belajar, dashboard & ekspor data peneliti.

**Tidak termasuk (versi ini):** bangun datar lain, gambar 3D, poin/bintang/lencana/papan peringkat (skor tantangan per pos tetap ada), forum/obrolan antarsiswa, manajemen banyak kelas/sekolah, aplikasi Android native (APK).

## 6. Daftar fitur

Prioritas: **P0** = wajib ada untuk uji coba · **P1** = sebaiknya ada · **P2** = jika waktu cukup.

| ID | Fitur | Dasar | Prioritas |
|---|---|---|---|
| F-01 | **Masuk** dengan Kode siswa (S01, S02, …) + PIN 6 digit; akun dibuat peneliti | Privasi | P0 |
| F-02 | **Gambar bersih berlapis**: unsur (sisi sejajar, kaki, tinggi, arsiran luas) muncul hanya pada langkah yang membahasnya; label menempel di gambar | R-02, R-04 | P0 |
| F-03 | **Gambar interaktif**: titik sudut atas trapesium dapat digeser; tinggi (garis putus-putus) selalu tegak lurus; ukuran ikut berubah | R-07 | P0 |
| F-04 | **Mesin langkah**: satu langkah per layar, tombol *Lanjut*, *Kembali*, *Ulangi*; tanpa timer & tanpa auto-lanjut | R-06 | P0 |
| F-05 | **Petunjuk 3 tingkat** (L1 pertanyaan pemantik → L2 strategi → L3 langkah contoh) — dibuka siswa, atau ditawarkan setelah 2× salah | R-08 | P0 |
| F-06 | **Contoh bertahap yang memudar** (contoh lengkap → 1 langkah kosong → 2 langkah kosong → soal mandiri) + kartu **"Ingat rumus"** yang selalu bisa dibuka | R-01, R-08 | P0 |
| F-07 | **Penyegaran Pythagoras** (± 3 layar) sebelum mencari tinggi trapesium | R-03 | P0 |
| F-08 | **Mode baca soal cerita ringkas**: soal tampil per potongan kalimat, siswa menandai info penting, tabel *Diketahui / Ditanya* terisi dari tanda | R-05 | P0 |
| F-09 | **Umpan balik spesifik** per jenis kesalahan (mis. kaki miring dipakai sebagai tinggi, lupa ½, satuan salah) + pembahasan langkah | R-09 | P0 |
| F-10 | **Pertanyaan "Mengapa?"** singkat (pilihan ganda) setelah langkah kunci | R-10 | P1 |
| F-11 | **Log belajar** per langkah (benar/salah, percobaan, level petunjuk, kode kesalahan, durasi); **antrian offline** — data disimpan di HP saat sinyal putus lalu dikirim otomatis | M-03 | P0 (log & antrian offline) |
| F-12 | **Pretest & posttest** — 4 butir **uraian** dari instrumen literasi matematis peneliti; dikunci agar dikerjakan sekali; skor diisi peneliti di halaman peneliti | M-01 | P0 |
| F-13 | **Skala Leppink** (10 butir, skala 0–10) di akhir setiap pertemuan; teks butir dari peneliti | M-02 | P0 |
| F-14 | **Halaman peneliti**: progres per siswa, isi skor butir uraian, **ekspor CSV & ringkasan** (skor, N-gain, rata-rata IL/EL/GL per pertemuan) dari fungsi server **Python** `api/export.py`; skrip `analysis/` memakai modul hitung yang sama | M-04, ketentuan tugas (Python) | P0 |
| F-15 | **Pasang ke layar utama (PWA)** & materi tetap terbuka saat offline | Konteks sinyal | P1 |
| F-16 | **Tutor AI** (DeepSeek) — hanya muncul setelah petunjuk L2 dibuka, menjawab dengan pertanyaan pemantik, tidak memberi jawaban akhir | Ketentuan tugas | P1 |
| F-17 | **Tema petualangan**: layar Pembuka dengan ilustrasi orisinal & sapaan, **Peta Petualangan** 5 pos, nama panggilan opsional yang hanya disimpan di HP | Motivasi ("bikin malas"), acuan gaya | P0 (peta & pembuka), P1 (ilustrasi final) |
| F-18 | **Tantangan Pos** (3 soal tanpa contoh di akhir tiap pertemuan) + layar **Hasil Pos** (skor & jumlah petunjuk) | R-08, M-03 | P0 |
| F-19 | **Musik latar** — tombol 🎵 hanya di layar luar, mati secara bawaan | Acuan gaya | P2 |

## 7. Alur pengguna utama (siswa)

```
Pembuka / Masuk (Kode + PIN, nama panggilan opsional)
  → Peta Petualangan (Pos 1–5, yang terkunci tampak abu-abu)
     → [Pertemuan 1 saja] Pretest
     → Fase 1 "Kenali"   (amati & labeli unsur, geser gambar)
     → Fase 2 "Bangun"   (turunkan rumus langkah demi langkah)
     → Fase 3 "Latih"    (contoh memudar → soal mandiri → soal cerita)
     → Tantangan Pos     (3 soal, skor dicatat)
     → Skala Leppink (10 butir)
     → [Pertemuan 5 saja] Posttest
     → Hasil Pos
  → kembali ke Peta Petualangan (pos berikutnya terbuka)
```

Alur peneliti: Masuk (email) → daftar siswa & progres → unduh CSV.

## 8. Kebutuhan non-fungsional

- **Perangkat:** Chrome Android versi baru; lebar 360–430 px, orientasi tegak; tetap rapi di laptop.
- **Kinerja:** muat pertama < 3 detik di 4G; JavaScript awal ≤ ± 300 KB (gzip); tanpa pustaka 3D/animasi berat.
- **Aksesibilitas:** target sentuh ≥ 48 px, teks isi ≥ 16 px, kontras memenuhi WCAG AA, informasi tidak hanya lewat warna (juga pola garis & label).
- **Keandalan data:** tidak ada data hilang saat sinyal putus (F-11); tidak ada data ganda saat sinkron ulang.
- **Privasi & keamanan:** hanya kode siswa; Row Level Security di Supabase; kunci rahasia hanya di server.
- **Bahasa:** seluruh antarmuka Bahasa Indonesia baku yang ramah, kalimat pendek.

## 9. Rencana uji coba (sesuaikan dengan ketentuan tugas)

- 5 pertemuan, sesuai `KONTEN.md`.
- 2 siswa SMP: 1 belajar lewat aplikasi, 1 diajar langsung sebagai pembanding.
- Data: pretest & posttest literasi matematis, skala Leppink tiap pertemuan, log aplikasi, catatan observasi.
- Karena sampel sangat kecil, hasil dibaca secara **deskriptif**; jangan menghitung reliabilitas dari 2 siswa.

## 10. Asumsi & keputusan yang perlu dikonfirmasi

Semua asumsi **dikonfirmasi pengembang pada 26 November 2026** (Milestone 0).

| ID | Keputusan | Status |
|---|---|---|
| A-1 | Stack: React (Vite) + Tailwind + Supabase. **Python wajib berjalan di aplikasi** sebagai fungsi server Vercel (`api/export.py` P0, `api/tutor.py` P1) dan dipakai di `analysis/` | Dikonfirmasi |
| A-2 | Alur pembelajaran memakai 3 fase *Rigorous Mathematical Thinking* (Kinard & Kozulin), tampil sebagai "Kenali → Bangun → Latih" | Dikonfirmasi |
| A-3 | Tutor AI (DeepSeek) **P1** (milestone M8) | Diubah (sebelumnya P2) |
| A-4 | Akun siswa dibuat peneliti; siswa masuk dengan Kode + PIN 6 digit | Dikonfirmasi |
| A-5 | Butir pretest/posttest (4 butir **uraian**, skor manual oleh peneliti), teks skala Leppink, **dan label ujung skalanya** disediakan peneliti, **tidak dibuat AI** | Dikonfirmasi (wajib) |
| A-6 | Nama aplikasi "GeoLangkah"; judul tema "Jelajah Desa Bangun Datar" | Dikonfirmasi |
| A-7 | Ilustrasi pembuka dibuat sebagai SVG orisinal sederhana oleh Claude Code (bisa diganti gambar buatanmu di `public/illustrations/`) | Dikonfirmasi |

## 11. Risiko

| Risiko | Mitigasi |
|---|---|
| Gambar interaktif sulit dipakai di layar kecil | Titik seret besar (≥ 48 px area sentuh), uji di HP asli sejak Milestone 2 |
| Sinyal sekolah lemah | Antrian offline (F-11), PWA (F-15), aset ringan |
| Siswa mengklik petunjuk tanpa berpikir | Petunjuk L3 baru bisa dibuka setelah L1 & L2, dan setelah ada minimal 1 percobaan |
| Konten matematika salah | Semua hitungan di fungsi murni yang dites (Vitest); contoh angka dicek ulang |
| Data penelitian tercampur data uji | Tandai akun uji dengan kode `T01…`; ekspor menyaring kode `S..` saja |
| Proyek Supabase gratis dijeda setelah ±7 hari tanpa aktivitas | Buka/ping proyek sebelum tiap pertemuan (daftar persiapan M10); log tetap aman di antrian offline |
| Tutor AI membocorkan jawaban akhir | Uji 10 percobaan (M8), batas 5 pertanyaan per soal, cadangan petunjuk L2 bila API gagal |
