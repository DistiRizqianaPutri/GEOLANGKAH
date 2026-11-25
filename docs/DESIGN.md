# DESIGN.md — Desain Antarmuka & Interaksi

> Prinsip utama: **setiap piksel harus membantu siswa berpikir tentang matematikanya, bukan tentang aplikasinya.**
> Gaya umum: **petualangan yang hangat dan ramah anak** (suasana seperti aplikasi "Jelajah Matematika"), tetapi hiasan hanya di **layar luar** — layar belajar tetap bersih (lihat §2.5).
> Semua aturan di bawah diturunkan dari *Cognitive Load Theory* (CLT) dan temuan wawancara (`RISET.md`).

---

## 1. Prinsip desain (CLT → aturan konkret)

| Prinsip | Aturan di aplikasi | Dasar |
|---|---|---|
| **Segmentasi** | Satu langkah / satu ide per layar. Maks. 3 kalimat pendek per kartu. | R-06, EL3 |
| **Penandaan (*signaling*)** | Unsur yang sedang dibahas diberi warna + tebal; unsur lain diredupkan atau disembunyikan. | R-02, R-04 |
| **Hindari perhatian terbelah (*split-attention*)** | Label & angka **menempel di gambar**, bukan di legenda terpisah. Teks penjelasan tepat di bawah gambar, tidak perlu menggulir bolak-balik. | EL2 |
| **Koherensi** | Layar belajar tanpa hiasan: tanpa ilustrasi, emoji hiasan, musik, maskot, konfeti. Tema hanya di layar luar (§2.5). | EL2, "bikin malas" |
| **Tidak berulang (*redundancy*)** | Informasi yang sudah jelas di gambar tidak ditulis ulang panjang di teks. | EL1 |
| **Tempo oleh siswa** | Tanpa timer, tanpa auto-lanjut. Animasi hanya berjalan setelah siswa menekan tombol. | R-06 |
| **Contoh bertahap & memudar** | Contoh lengkap dulu, lalu bantuan dikurangi sedikit demi sedikit. | R-08 |
| **Interaktivitas unsur bertahap** | Unsur diperkenalkan satu per satu (sisi sejajar → tinggi → kaki) sebelum dihubungkan dalam rumus. | IL2 |
| **Bantuan yang bisa dilepas** | Petunjuk hanya muncul bila diminta / setelah 2× salah, sehingga siswa yang sudah mahir tidak terganggu. | GL3 |

## 2. Sistem visual

### 2.1 Warna (token)

| Token | Hex | Dipakai untuk |
|---|---|---|
| `bg` | gradasi `#FFF8E7` → `#FFE9B8` | Latar aplikasi (krem–kuning hangat) |
| `surface` | `#FFFDF7` | Kartu (sudut membulat, garis tepi `#FCE7A8`) |
| `text` | `#1E293B` | Teks utama |
| `text-muted` | `#57534E` | Teks pendukung |
| `heading` | `#1E3A5F` | Judul (biru tua) |
| `primary` | gradasi `#FDE047` → `#FCD34D`, teks `#1E3A5F`, bayangan bawah `#E6B84A` | Tombol utama (Mulai, Lanjut, Cek jawaban) |
| `success` | `#15803D` | Jawaban benar (selalu disertai ikon ✓) |
| `error` | `#B91C1C` | Jawaban belum tepat (selalu disertai ikon !) |
| `hint` | `#B45309` | Panel petunjuk (latar `#FFFBEB`) |
| `grid` | `#E2E8F0` | Petak satuan di gambar |

### 2.2 Kode visual unsur bangun (WAJIB konsisten di seluruh aplikasi)

| Unsur | Warna | Gaya garis | Label di gambar |
|---|---|---|---|
| Sisi sejajar (a, b) | Biru `#2563EB` | Tebal 4 px, ada tanda panah sejajar `>` | `a = 16 cm`, `b = 10 cm` |
| Tinggi (t) | Oranye `#EA580C` | **Putus-putus** 3 px + simbol siku-siku ∟ | `t = 4 cm` |
| Kaki (sisi miring) | Abu `#64748B` | Tebal 3 px | `s = 5 cm` |
| Daerah luas | Hijau muda `#22C55E` opasitas 20% | Arsiran rata | — |
| Keliling | Ungu `#7C3AED` | Garis tepi tebal 4 px dengan titik bergerak (sekali, saat diminta) | `K = …` |
| Unsur tidak dibahas | Abu muda `#CBD5E1` | Tipis 1,5 px | Disembunyikan |

> Biru–oranye dipilih karena tetap terbedakan oleh siswa dengan buta warna merah–hijau. Pembeda kedua selalu ada: **pola garis + label**.

### 2.3 Tipografi
- **Nunito** (ketebalan 400 & 800 saja), di-*host* sendiri di `public/fonts/`, `font-display: swap`; cadangan `system-ui, Roboto, sans-serif`.
- Teks isi 17 px / tinggi baris 1,5. Judul langkah 20 px tebal. Angka di gambar 15 px tebal.
- Rumus ditulis dengan tipografi biasa (`½ × (a + b) × t`); tidak memakai pustaka LaTeX.

### 2.4 Ruang & bentuk
- Kelipatan 4 px. Padding kartu 16 px. Sudut kartu 16 px, tombol 12 px.
- Tombol utama: tinggi 52 px, lebar penuh, di bagian bawah layar (mudah dijangkau jempol).

### 2.5 Tema petualangan: "Jelajah Desa Bangun Datar"

Lima pertemuan = lima **pos** di sebuah desa. Tema hanya membungkus, **tidak boleh masuk ke layar belajar**.

| Layar **luar** (boleh bertema) | Layar **dalam** (aturan §1 berlaku penuh) |
|---|---|
| Pembuka/Masuk, Peta Petualangan, Hasil Pos, Selesai | Kenali, Bangun, Latih, Tantangan, Pretest/Posttest, Skala Leppink |
| Ilustrasi, emoji secukupnya, sapaan hangat, tombol musik (P2) | Tanpa ilustrasi/emoji hiasan, tanpa musik. Tema hanya terlihat dari warna latar dan nama pos di TopBar |

- **Ilustrasi:** satu ilustrasi **orisinal** di layar Pembuka (SVG sederhana, ≤ 30 KB), mis. dua siswa SMP di depan peta desa dengan sawah berbentuk trapesium. **Jangan menyalin** gambar dari aplikasi lain.
- **Musik (P2):** tombol 🎵 hanya di layar luar, **mati secara bawaan**, berhenti otomatis saat masuk layar dalam.
- **Skor:** ditampilkan sebagai "3 dari 3 benar" + "petunjuk dipakai 1 kali" di Hasil Pos. Tanpa bintang, poin, lencana, atau peringkat (agar siswa tidak takut membuka petunjuk).

## 3. Komponen

| Komponen | Isi & perilaku |
|---|---|
| `TopBar` | Tombol kembali, nama pos singkat (mis. "Jembatan Trapesium"), indikator langkah berupa titik, bukan persentase. Bila langkah > 10, titik diganti teks `3 / 12` agar muat di 360 px. |
| `StepCard` | Judul langkah + ≤ 3 kalimat + (opsional) satu `FigureCanvas`. |
| `FigureCanvas` | SVG responsif, rasio 4:3, menerima daftar `layers` yang aktif (lihat §5). |
| `DragHandle` | Lingkaran 20 px terlihat, area sentuh 48 px; muncul getar halus (`navigator.vibrate(10)`) bila tersedia saat mulai seret. |
| `AnswerInput` | Input angka (`inputmode="decimal"`, menerima koma maupun titik desimal) + pilihan satuan sebagai tombol, bukan ketikan. Daftar satuan ditentukan per soal di JSON (`units`): `cm`, `cm²`, `m`, `m²`, serta `kg` dan `Rp` untuk soal cerita P5. |
| `HintButton` + `HintPanel` | Tombol "Butuh petunjuk?" → panel naik dari bawah, menampilkan L1; tombol "Petunjuk berikutnya" membuka L2, lalu L3. |
| `FeedbackBanner` | Hasil cek: ✓/! + 1 kalimat spesifik + tombol "Lihat pembahasan". |
| `StoryReader` | Soal cerita per potongan kalimat; ketuk kata/angka untuk menandai; tombol "Pindahkan ke Diketahui". |
| `KnownAskedTable` | Dua kolom: **Diketahui** / **Ditanya**, terisi dari tanda siswa, bisa dikoreksi. |
| `FormulaCard` | Kartu lipat "Ingat rumus" (ikon buku) — selalu bisa dibuka di fase Latih. |
| `LeppinkItem` | Pernyataan + 11 tombol angka 0–10 dalam 2 baris (0–5, 6–10); bukan *slider* (slider tidak presisi di HP). |
| `PrimaryButton` | Satu tombol utama per layar. Tombol sekunder berupa teks. |
| `WelcomeHero` | Ilustrasi + judul + sapaan di layar Pembuka (layar luar). |
| `AdventureMap` | Jalur vertikal 5 pos (`StationNode`): selesai ✓ / sedang berjalan [Mulai] / terkunci 🔒. |
| `ResultCard` | Hasil Pos: skor tantangan, jumlah petunjuk, satu kalimat ringkasan materi. |
| `MusicToggle` *(P2)* | Tombol 🎵 bulat di pojok kanan atas, hanya di layar luar. |

## 4. Rancangan layar (lebar 360 px)

### 4.1 Pembuka / Masuk (layar luar)
```
┌──────────────────────────────┐
│                          🎵  │
│      [ilustrasi orisinal]    │
│   ⭐ Jelajah Desa         ✨  │
│      Bangun Datar            │
│  Petualangan keliling & luas │
│  persegi panjang & trapesium │
│ ┌──────────────────────────┐ │
│ │ Halo, penjelajah! 👋     │ │
│ │ Yuk, temukan rahasia     │ │
│ │ trapesium bersama!       │ │
│ └──────────────────────────┘ │
│ Kode siswa    [ S01       ]  │
│ PIN           [ ••••••    ]  │
│ Nama panggilan (opsional)    │
│               [ Rina      ]  │
│  [  Mulai Petualangan 🚀  ]  │
└──────────────────────────────┘
```
Nama panggilan **hanya disimpan di HP itu** (`localStorage`) untuk sapaan, tidak dikirim ke server.

### 4.2 Peta Petualangan (layar luar)
```
┌──────────────────────────────┐
│ Halo, Rina! 👋           🎵  │
│ Jelajah Desa Bangun Datar    │
│                              │
│  ① Kebun Persegi Panjang  ✓  │
│   ┆                          │
│  ② Jembatan Trapesium     ✓  │
│   ┆                          │
│  ③ Sawah Trapesium [Mulai ›] │
│   ┆                          │
│  ④ Bukit Pythagoras       🔒 │
│   ┆                          │
│  ⑤ Pasar Desa             🔒 │
└──────────────────────────────┘
```

### 4.3 Layar belajar (Fase Kenali / Bangun)
```
┌──────────────────────────────┐
│ ‹  Jembatan Trapesium  ●●●○○ │
├──────────────────────────────┤
│  ┌────────────────────────┐  │
│  │      b = 10 cm         │  │
│  │    D ●━━━━━━━━● C      │  │
│  │     /   ┆        \     │  │
│  │    /    ┆t = 4    \    │  │
│  │ A ●━━━━━┷━━━━━━━━━● B  │  │
│  │      a = 16 cm         │  │
│  └────────────────────────┘  │
│  Geser titik C. Apa yang     │
│  terjadi pada tinggi?        │
│                              │
│  Ulangi langkah              │
│  [        Lanjut         ]   │
└──────────────────────────────┘
```

### 4.4 Layar latihan
```
┌──────────────────────────────┐
│ ‹  Sawah Trapesium    7 / 12 │
├──────────────────────────────┤
│  [gambar trapesium]          │
│  Hitung luas trapesium.      │
│                              │
│  L = ½ × (16 + ▢) × 4        │  ← langkah yang dikosongkan
│  L = [      ]  [cm][cm²]     │
│                              │
│  [ikon] Butuh petunjuk?      │  ← ikon fungsi SVG garis,
│                [ikon] Rumus  │    bukan emoji
│  [      Cek jawaban      ]   │
└──────────────────────────────┘
```

### 4.5 Soal cerita (mode baca ringkas)
```
┌──────────────────────────────┐
│ Bagian 2 dari 4              │
│                              │
│ "Sisi yang sejajar panjangnya│
│  [20 m] dan [12 m]."         │  ← angka bisa diketuk
│                              │
│ Diketahui      │ Ditanya     │
│ a = 20 m       │ keliling?   │
│ b = 12 m       │             │
│                              │
│  ‹ Sebelumnya   [ Lanjut ]   │
└──────────────────────────────┘
```

### 4.6 Hasil Pos (layar luar, setelah skala Leppink)
```
┌──────────────────────────────┐
│     Pos 3 selesai! 🎉        │
│                              │
│  Tantangan: 3 dari 3 benar   │
│  Petunjuk dipakai: 1 kali    │
│                              │
│  Yang kamu temukan hari ini: │
│  L = ½ × (a + b) × t         │
│                              │
│  [  Kembali ke Peta 🗺️  ]    │
└──────────────────────────────┘
```

### 4.7 Skala Leppink
```
┌──────────────────────────────┐
│ Pernyataan 4 dari 10         │
│ [teks butir dari peneliti]   │
│                              │
│ [label ujung 0]  [label 10]  │  ← teks dari peneliti
│                              │    (leppink.json)
│ [0][1][2][3][4][5]           │
│ [6][7][8][9][10]             │
│                              │
│  [        Lanjut         ]   │
└──────────────────────────────┘
```

## 5. Interaksi gambar trapesium (`FigureCanvas`)

- Koordinat dalam **satuan petak** (1 petak = 1 cm pada label). Titik dipasang ke petak terdekat (*snap*) agar ukuran selalu bilangan bulat.
- Titik yang bisa digeser: **D dan C** (sudut atas). Keduanya bergerak bersama secara vertikal (sisi atas tetap sejajar), dan masing-masing bebas bergerak horizontal.
- Batas (hanya saat gambar bisa digeser): tinggi 2–10 petak; panjang sisi atas ≥ 1 petak; D selalu di kiri C; tidak boleh menembus alas.
- Gambar statis (tidak bisa digeser) memakai **skala otomatis**: ukuran petak menyesuaikan lebar layar agar ukuran besar (mis. a = 30, t = 15) tetap muat di 360 px. Satuan pada label mengikuti soal (cm atau m).
- Garis tinggi selalu ditarik dari D (atau C) **tegak lurus** ke alas, dengan simbol siku-siku.
- Saat digeser, label ukuran diperbarui langsung. Kaki miring yang bukan bilangan bulat ditampilkan 1 angka desimal (≈).
- `layers` yang dapat diaktifkan per langkah: `grid`, `parallel`, `height`, `legs`, `area`, `perimeter`, `labels`, `rightAngle`, `decompose` (pecah jadi persegi panjang + 2 segitiga), `doubleRotate` (2 trapesium → jajargenjang).
- Animasi (`decompose`, `doubleRotate`) berjalan **hanya setelah tombol ditekan**, durasi ≤ 1,2 detik, dan bisa diulang. Hormati `prefers-reduced-motion` (langsung tampil tanpa animasi).
- Gunakan **Pointer Events** + `touch-action: none` pada SVG agar halaman tidak ikut menggulir saat menyeret.

## 6. Gaya bahasa (*microcopy*)

- Sapa dengan "kamu". Kalimat ≤ 15 kata. Satu instruksi per kalimat.
- Umpan balik tidak menghakimi: "Belum tepat. Coba cek garis yang kamu pakai sebagai tinggi." — bukan "Salah!".
- Pujian spesifik dan singkat: "Tepat! Kamu memakai tinggi, bukan kaki miring."
- Hindari istilah teori (intrinsic, extraneous, germane, CLT) di layar siswa.
- Istilah matematika konsisten: *sisi sejajar*, *kaki trapesium*, *tinggi*, *keliling*, *luas*.

## 7. Aksesibilitas & perangkat

- Target sentuh ≥ 48 × 48 px; jarak antartombol ≥ 8 px.
- Kontras teks ≥ 4,5 : 1. Warna tidak pernah satu-satunya pembeda.
- Semua tombol punya `aria-label`; SVG punya `<title>` dan deskripsi singkat.
- Tanpa efek *hover*-saja. Keyboard angka muncul untuk isian angka.
- Uji wajib di viewport **360 × 640** dan HP Android asli.

## 8. Yang DILARANG

- Lebih dari satu gambar dalam satu layar.
- Legenda warna terpisah dari gambar.
- Timer, hitung mundur, papan peringkat, poin/bintang/lencana, konfeti.
- Ilustrasi, maskot, emoji (termasuk sebagai ikon), dan musik **di layar dalam** (lihat §2.5). Ikon fungsi berupa SVG garis sederhana (petunjuk, rumus, kembali) **diperbolehkan**.
- Paragraf > 3 kalimat; teks berjalan; *carousel* otomatis.
- Pop-up yang menutup gambar saat siswa sedang mengerjakan.

## 9. Daftar periksa per layar (dipakai saat review)

- [ ] Hanya satu ide / satu tugas di layar ini?
- [ ] Unsur gambar yang tampil hanya yang dibahas?
- [ ] Label menempel di gambar?
- [ ] Teks ≤ 3 kalimat, tiap kalimat ≤ 15 kata?
- [ ] Siswa yang menentukan kapan lanjut?
- [ ] Ada jalan keluar jika bingung (petunjuk / ulangi)?
- [ ] Rapi di 360 px tanpa geser horizontal?
- [ ] Target sentuh ≥ 48 px?
- [ ] Jika layar dalam: bebas ilustrasi, emoji hiasan, dan musik?
