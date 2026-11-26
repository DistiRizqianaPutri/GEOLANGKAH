# KONTEN.md — Isi Materi, Contoh Soal, Petunjuk, dan Umpan Balik

> **Untuk Claude Code:** angka-angka di sini sudah dicek. Jangan mengubah angka contoh tanpa menghitung ulang dengan `src/lib/geometry.js` dan menambahkan tesnya.
> Butir **pretest/posttest** dan **teks skala Leppink** TIDAK ada di sini — keduanya diisi peneliti (lihat §8).

---

## 1. Struktur setiap pertemuan

Alur mengikuti tiga fase *Rigorous Mathematical Thinking* (Kinard & Kozulin), ditampilkan ke siswa dengan nama sederhana:

| Fase (RMT) | Nama di aplikasi | Isi | Prinsip CLT |
|---|---|---|---|
| 1. Pengembangan kognitif | **Kenali** | Mengamati, membandingkan, memberi label unsur dengan gambar interaktif | Unsur diperkenalkan satu per satu |
| 2. Konten sebagai proses | **Bangun** | Menurunkan rumus/strategi langkah demi langkah dari bangun yang sudah dikenal | Segmentasi, contoh terurai |
| 3. Praktik konstruksi konseptual | **Latih** | Contoh lengkap → contoh memudar → soal mandiri → soal konteks | *Fading*, umpan balik spesifik |

Petunjuk bertingkat berperan sebagai **mediator** (pertanyaan pemantik dulu, jawaban terakhir).

**Aturan langkah memudar** (kotak kosong ▢ pada rumus):
- **Memudar 1:** satu angka yang dimasukkan ke rumus dikosongkan.
- **Memudar 2:** dua angka dikosongkan, atau satu angka + hasilnya.
- **Mandiri:** siswa mengisi hasil akhir dan satuannya sendiri.
- Khusus Pythagoras (P4): memudar 1 mengosongkan **x**; memudar 2 mengosongkan **x dan t**.

Setiap pertemuan adalah satu **pos** di Peta Petualangan dan ditutup dengan **Tantangan Pos** (§10):

| Pos | Nama di peta | Pertemuan |
|---|---|---|
| ① | Kebun Persegi Panjang | 1 — Persegi panjang: keliling atau luas? |
| ② | Jembatan Trapesium | 2 — Mengenal trapesium & kelilingnya |
| ③ | Sawah Trapesium | 3 — Luas trapesium |
| ④ | Bukit Pythagoras | 4 — Mencari tinggi |
| ⑤ | Pasar Desa | 5 — Soal cerita literasi |

Nama pos hanya tampil di Peta dan TopBar; isi layar belajar tidak memakai cerita tema.

Rumus baku yang dipakai di seluruh aplikasi:

| Bangun | Keliling | Luas |
|---|---|---|
| Persegi panjang | K = 2 × (p + l) | L = p × l |
| Trapesium | K = jumlah keempat sisi | L = ½ × (a + b) × t |

`a`, `b` = sisi sejajar · `t` = tinggi (jarak **tegak lurus** antara dua sisi sejajar) · `s` = kaki · `x` = selisih proyeksi (alas segitiga siku-siku di tepi trapesium).

---

## 2. Pertemuan 1 — Persegi panjang: keliling atau luas? *(singkat, jembatan)*

Diawali **Pretest** (hanya pertemuan ini). Persegi panjang sudah mudah bagi siswa (R-11), jadi pertemuan ini fokus **membedakan keliling dan luas** serta **satuan**.

**Kenali**
1. Persegi panjang 6 × 4 petak. Tombol "Telusuri tepi" → titik ungu mengelilingi tepi, hitungan naik sampai **20 satuan**. "Ini **keliling**: panjang batas bangun."
2. Tombol "Isi petak" → petak terarsir satu baris demi satu baris, total **24 petak**. "Ini **luas**: banyak petak yang menutupi bangun."
3. Geser sudut kanan atas. Pertanyaan: "Apa yang berubah: keliling, luas, atau keduanya?"

**Bangun**
- K = p + l + p + l = 2 × (p + l), satuan panjang (cm).
- L = p × l, satuan luas (cm²) karena yang dihitung adalah petak persegi 1 cm × 1 cm.

**Latih**
| Jenis | Soal | Kunci |
|---|---|---|
| Contoh lengkap | p = 8 cm, l = 5 cm | K = 2 × (8 + 5) = 26 cm · L = 8 × 5 = 40 cm² |
| Memudar (1 kosong) | p = 10 cm, l = 5 cm · L = 10 × ▢ | L = 50 cm² · K = 30 cm |
| Memudar (2 kosong) | p = 12 cm, l = 7 cm · K = 2 × (▢ + ▢) | K = 38 cm · L = 84 cm² |
| Mandiri | p = 9 cm, l = 6 cm (pilih satuan sendiri) | K = 30 cm · L = 54 cm² |
| Mengapa? | "Mengapa satuan luas cm²?" | Karena luas menghitung petak berukuran 1 cm × 1 cm |

**Penerapan di aplikasi (M4, `src/content/meeting-1.json`):** baris berkunci dua dipecah menjadi dua layar, satu besaran per layar. Contoh lengkap → 2 layar (K, L). Memudar 1 → templat `L = 10 × ▢` lalu soal K. Memudar 2 → `K = 2 × (▢ + ▢)` lalu soal L. Mandiri → soal K lalu soal L. Kenali 1–2: label K/L baru muncul dan menghitung naik (20 satuan, 24 petak) setelah tombol ditekan.

*Draf Claude Code, perlu ditinjau peneliti:*

| Langkah | Pertanyaan / soal | L1 (pemantik) | L2 (strategi) | L3 (langkah contoh) |
|---|---|---|---|---|
| Kenali 3 (PG) | Apa yang berubah? Hanya keliling · Hanya luas · **Keduanya** | — | — | — |
| Memudar 1 | L = 10 × ▢ | Angka berapa yang dikalikan dengan panjang? | Luas = panjang × lebar. Lebarnya tertulis di gambar. | L = 10 × 5 = 50 cm² |
| … lalu K | K (10 × 5) | Keliling adalah panjang batas bangun. Ada berapa sisi? | Jumlahkan panjang dan lebar, lalu kalikan 2. | K = 2 × (10 + 5) = 2 × 15 = 30 cm |
| Memudar 2 | K = 2 × (▢ + ▢) | Dua angka apa yang dijumlahkan di dalam kurung? | Isi kotak dengan panjang dan lebar dari gambar. Lalu kalikan 2. | K = 2 × (12 + 7) = 2 × 19 = 38 cm |
| … lalu L | L (12 × 7) | Luas menghitung petak yang menutupi bangun. | Kalikan panjang dengan lebar. Satuannya satuan persegi. | L = 12 × 7 = 84 cm² |
| Mandiri K / L | 9 × 6 | Keliling mengukur batas / Luas menghitung petak. Rumus mana yang dipakai? | K = 2 × (p + l) / L = p × l, beserta satuannya | K = 30 cm · L = 54 cm² |
| Mengapa? (PG) | **Karena luas menghitung petak 1 cm × 1 cm** · Karena luas selalu lebih besar dari keliling · Karena rumus luas memakai angka 2 | — | — | — |

Setiap opsi PG punya umpan balik satu kalimat (lihat JSON). Petunjuk Tantangan ① ada di `meeting-1.json`.

---

## 3. Pertemuan 2 — Mengenal trapesium & kelilingnya

**Kenali** (gambar trapesium sama kaki a = 16, b = 10, s = 5, t = 4)
1. Hanya lapisan `parallel`: "Dua sisi biru ini **sejajar**. Jaraknya selalu sama."
2. Tambah lapisan `height` + `rightAngle`: "Garis oranye putus-putus adalah **tinggi**: jarak tegak lurus antara dua sisi sejajar."
3. Geser titik C ke kanan/kiri → tinggi **tetap**, kaki **berubah**. Pertanyaan: "Apakah kaki miring sama dengan tinggi?" (jawaban: tidak, kaki lebih panjang dari tinggi).
4. Tombol "Ubah jenis" pada gambar yang sama: **sama kaki** → **siku-siku** → **sembarang**. Pada siku-siku, sisi tegaknya **sama dengan** tinggi.
5. Latihan identifikasi (3 soal acak): "Ketuk dua sisi yang sejajar" / "Ketuk garis tinggi" — kaki miring selalu ada sebagai pengecoh.

**Bangun**
- Keliling trapesium = jumlah **keempat sisi**: K = a + b + s₁ + s₂.
- Tinggi **bukan** sisi, jadi tidak dijumlahkan — kecuali pada trapesium siku-siku, karena sisi tegaknya memang salah satu sisi.

**Latih** (tinggi sengaja ditampilkan sebagai pengecoh)
| Jenis | Soal | Kunci |
|---|---|---|
| Contoh lengkap | Sama kaki: a = 16, b = 10, kaki 5 dan 5 (t = 4 tampil) | K = 16 + 10 + 5 + 5 = 36 cm |
| Memudar (1 kosong) | Siku-siku: a = 12, b = 7, sisi tegak 12, kaki miring 13 | K = 12 + 7 + 12 + 13 = 44 cm |
| Mandiri | Sembarang: a = 24, b = 10, kaki 13 dan 15 (t = 12 tampil) | K = 62 cm |

**Penerapan di aplikasi (M4, `src/content/meeting-2.json`):**
- Kenali 3: seret C hanya mendatar (`lockHeight`), jadi tinggi tetap. PG: Ya, sama panjang · **Tidak, kaki lebih panjang** · Tidak, kaki lebih pendek. Bila kaki diseret sampai tegak, s = t. Umpan balik "Ya" menjelaskan hal ini.
- Kenali 4: tombol "Ubah jenis" pada a = 16, b = 10, t = 4: sama kaki (x = 3), siku-siku, sembarang (x₁ = 2). Kaki yang tidak bulat tampil dengan ≈.
- Kenali 5: 3 soal diambil dari 5 soal dengan seed = kode siswa + pertemuan:
  - (a) sisi sejajar, sama kaki 16/10/4
  - (b) tinggi, sama kaki 16/10/4
  - (c) tinggi, siku-siku 12/7/12 (jawaban: sisi AD)
  - (d) sisi sejajar, sembarang 24/10/12
  - (e) tinggi, sembarang 24/10/12
- Memudar siku-siku: `K = 12 + 7 + ▢ + 13`. Kotaknya sisi tegak AD = 12.

*Draf petunjuk (perlu ditinjau peneliti):*

| Soal | L1 | L2 | L3 |
|---|---|---|---|
| Ketuk sisi sejajar | Sisi sejajar arahnya sama. Sisi mana yang mendatar? | Sisi sejajar tidak pernah bertemu walau diperpanjang. | AB dan DC sama-sama mendatar, jadi keduanya sejajar. |
| Ketuk tinggi | Garis mana yang tegak lurus terhadap alas? | Kaki trapesium ini miring. Tinggi tidak miring. | Garis putus-putus dari D tegak lurus ke alas. Itulah tinggi. |
| Ketuk tinggi (siku-siku) | Sisi mana yang tegak lurus terhadap alas? | Ini trapesium siku-siku. Satu sisinya sudah tegak. | Sisi AD tegak lurus terhadap AB dan DC, jadi AD adalah tinggi. |
| Memudar siku-siku | Sisi mana yang belum dijumlahkan? | Sisi tegak AD adalah salah satu sisi. Panjangnya sama dengan tinggi. | K = 12 + 7 + 12 + 13 = 44 cm |
| Mandiri sembarang | Ada berapa sisi pada trapesium? | Jumlahkan a, b, dan kedua kaki. Tinggi tidak ikut. | K = 24 + 10 + 13 + 15 = 62 cm |

---

## 4. Pertemuan 3 — Luas trapesium (menurunkan rumus)

**Kenali**
1. "Kamu sudah bisa menghitung luas persegi panjang. Sekarang kita ubah trapesium menjadi bangun yang kamu kenal."
2. Trapesium a = 16, b = 10, t = 4 di atas petak; siswa memperkirakan luasnya (pilihan: sekitar 40 / 50 / 60 cm²).

**Bangun** — cara utama (lapisan `doubleRotate`)
1. Gandakan trapesium. Putar salinannya 180° dan tempelkan → terbentuk **jajargenjang**.
2. Alas jajargenjang = a + b = 16 + 10 = 26 cm; tingginya tetap t = 4 cm.
3. Potong segitiga di ujung jajargenjang, geser ke ujung lain → menjadi **persegi panjang** 26 × 4. Luasnya 104 cm².
4. Itu luas **dua** trapesium. Satu trapesium = ½ × 104 = **52 cm²**.
5. Kalimat kunci: **"Luas trapesium = setengah × jumlah sisi sejajar × tinggi"** → L = ½ × (a + b) × t.

Cara kedua (P1, tombol "Cara lain", lapisan `decompose`): persegi panjang 10 × 4 = 40 cm² + dua segitiga ½ × 3 × 4 = 6 cm² → 40 + 6 + 6 = **52 cm²** (hasil sama).

**Latih**
| Jenis | Soal | Kunci |
|---|---|---|
| Contoh lengkap | a = 16, b = 10, t = 4 | L = ½ × 26 × 4 = 52 cm² |
| Memudar (1 kosong) | a = 10, b = 6, t = 4 · L = ½ × (10 + ▢) × 4 | L = 32 cm² |
| Memudar (2 kosong) | a = 18, b = 12, t = 8 | L = ½ × 30 × 8 = 120 cm² |
| Mandiri + pengecoh | Sama kaki a = 22, b = 10, kaki 10, t = 8 | L = 128 cm² *(bukan 160: itu memakai kaki)* |
| Mandiri | Siku-siku a = 12, b = 7, t = 12 | L = ½ × 19 × 12 = 114 cm² |
| Mengapa? | "Mengapa ada ½ pada rumus?" | Karena dua trapesium yang sama membentuk satu jajargenjang/persegi panjang |

**Penerapan di aplikasi (M5, `src/content/meeting-3.json`):**
- Kenali 2: PG perkiraan pada gambar berpetak: 40 · **50** · 60 cm² (luas tepat 52).
- Bangun: (1) tombol "Putar salinan" (`doubleRotate`) → jajargenjang, alas a + b = 26; (2) persegi panjang 26 × 4 = 104 cm²; (3) ½ × 104 = 52 cm²; (4) kalimat kunci; (5) tombol "Cara lain" (`decompose`) → 40 + 6 + 6 = 52.
- Memudar 1: `L = ½ × (10 + ▢) × 4`. Memudar 2: `L = ½ × (▢ + ▢) × 8`. Mandiri + pengecoh: kaki 10 dan t 8 tampil; 160 → `E_KAKI_SBG_TINGGI`.

*Draf petunjuk (perlu ditinjau peneliti):*

| Soal | L1 | L2 | L3 |
|---|---|---|---|
| Memudar 1 | Sisi sejajar mana yang belum ditulis? | Sisi sejajar atas panjangnya 6 cm. Jumlahkan dengan 10. | L = ½ × (10 + 6) × 4 = ½ × 16 × 4 = 32 cm² |
| Memudar 2 | Dua angka apa yang dijumlahkan di dalam kurung? | Isi kotak dengan kedua sisi sejajar. Lalu kalikan ½ dan tinggi. | L = ½ × (18 + 12) × 8 = ½ × 30 × 8 = 120 cm² |
| Mandiri sama kaki | Garis mana yang tegak lurus terhadap sisi sejajar? | Pakai tinggi, bukan kaki miring. | L = ½ × (22 + 10) × 8 = ½ × 32 × 8 = 128 cm² |
| Mandiri siku-siku | Pada siku-siku, sisi mana yang menjadi tinggi? | Sisi tegak AD = tinggi = 12 cm. Kaki miring 13 cm tidak dipakai. | L = ½ × (12 + 7) × 12 = ½ × 19 × 12 = 114 cm² |

---

## 5. Pertemuan 4 — Mencari tinggi dengan Teorema Pythagoras

**Kenali — Penyegaran Pythagoras (F-07, 3 layar)**
1. Segitiga siku-siku: sisi terpanjang (**sisi miring**) selalu berhadapan dengan sudut siku-siku.
2. sisi miring² = sisi tegak₁² + sisi tegak₂². Contoh: 3, 4, 5 → 9 + 16 = 25 ✓.
3. Mencari sisi tegak: t² = s² − x². Tripel yang dipakai di aplikasi: **3-4-5, 6-8-10, 5-12-13, 8-15-17**.

**Kenali — Menemukan segitiga di dalam trapesium**
- Lapisan `decompose` menyorot segitiga siku-siku di tepi trapesium: sisi miringnya = **kaki**, sisi tegaknya = **tinggi** dan **x**.
- Siswa mengetuk segitiga itu, lalu mengetuk sisi miringnya.

**Bangun — Strategi 4 langkah**
1. Temukan segitiga siku-siku (kaki, tinggi, x).
2. Cari x:
   - Sama kaki: **x = (a − b) ÷ 2**
   - Siku-siku: **x = a − b**
3. Hitung tinggi: **t = √(s² − x²)**
4. Cek kewajaran: tinggi **harus lebih pendek** dari kaki (t < s).

**Latih**
| Jenis | Soal | Langkah | Kunci |
|---|---|---|---|
| Contoh lengkap | Sama kaki a = 16, b = 10, s = 5 | x = 3 → t = √(25 − 9) = 4 | t = 4 cm · L = 52 cm² |
| Memudar 1 (x kosong) | Sama kaki a = 22, b = 10, s = 10 | x = 6 → t = √(100 − 36) | t = 8 cm · L = 128 cm² |
| Memudar 2 (x dan t kosong) | Siku-siku a = 12, b = 7, s = 13 | x = 5 → t = √(169 − 25) | t = 12 cm · L = 114 cm² |
| Mandiri | Sama kaki a = 30, b = 14, s = 17 | x = 8 → t = 15 | L = 330 cm² · K = 78 cm |
| Mandiri | Siku-siku a = 20, b = 12, s = 17 | x = 8 → t = 15 | L = 240 cm² · K = 64 cm |

Contoh petunjuk bertingkat (soal sama kaki a = 22, b = 10, s = 10):
- **L1 (pemantik):** "Segitiga siku-siku mana yang memuat tinggi?"
- **L2 (strategi):** "Kurangkan dua sisi sejajar, lalu bagi 2. Itu alas segitiga (x). Tinggi adalah sisi tegaknya."
- **L3 (langkah contoh):** "x = (22 − 10) ÷ 2 = 6. t² = 10² − 6² = 100 − 36 = 64, jadi t = 8 cm."

**Penerapan di aplikasi (M5, `src/content/meeting-4.json`):**
- Penyegaran: 3 layar dengan gambar segitiga siku-siku 3-4-5 (`shape: 'triangle'`). Layar 3 menyembunyikan label t (`t = ?`).
- "Siswa mengetuk segitiga itu, lalu mengetuk sisi miringnya" **disederhanakan**: tombol "Pisahkan segitiga" (`decompose`), lalu satu langkah ketuk unsur `ask: 'hypotenuse'` (jawaban kaki AD). Mengetuk daerah segitiga belum didukung.
- Bangun: 4 layar strategi pada 16/10/5. Label t tersembunyi sampai langkah 3.
- Latih, satu besaran per layar: memudar 1 `x = (22 − 10) ÷ 2 = ▢` → t = 8, lalu L = 128; memudar 2 `x = 12 − 7 = ▢ · t = √(169 − 25) = ▢` → L = 114; mandiri 30/14/17 → L 330, lalu K 78; mandiri 20/12/17 → L 240, lalu K 64. Nilai kotak x dan t dihitung `geometry.js`.
- "Mengapa?" (F-10): "Mengapa tinggi harus lebih pendek dari kaki?" → **karena kaki adalah sisi miring segitiga siku-siku** · tinggi selalu setengah kaki · kaki sejajar dengan tinggi.

---

## 6. Pertemuan 5 — Soal cerita literasi matematis

Setiap soal cerita mengikuti tiga proses literasi matematis, ditampilkan sebagai 3 tahap:

| Tahap | Yang dilakukan siswa | Fitur |
|---|---|---|
| **Rumuskan** | Baca per potongan, tandai info penting, isi Diketahui/Ditanya, pilih bangun & ukuran yang dipakai | `StoryReader`, `KnownAskedTable` |
| **Hitung** | Kerjakan dengan langkah (dan petunjuk bila perlu) | `AnswerInput`, `HintPanel` |
| **Tafsirkan** | Kembalikan ke konteks: keliling atau luas? satuan? masuk akal? | Pertanyaan cek kewajaran |

**Soal 1 — terbimbing (sawah)**
> Sawah Pak Darto berbentuk trapesium siku-siku. / Sisi yang sejajar panjangnya 20 m dan 12 m. / Sisi tegaknya 15 m dan sisi miringnya 17 m. / (a) Pak Darto ingin memagari seluruh tepi sawah. Berapa meter pagar yang dibutuhkan? / (b) Setiap 10 m² sawah membutuhkan 1 kg pupuk. Berapa kg pupuk yang dibutuhkan?

Kunci: (a) **keliling** = 20 + 12 + 15 + 17 = **64 m** · (b) **luas** = ½ × 32 × 15 = 240 m² → 240 ÷ 10 = **24 kg**.
Penafsiran: "Pagar mengelilingi tepi → keliling. Pupuk menutupi permukaan → luas."

**Soal 2 — memudar (taman, tinggi harus dicari)**
> Taman sekolah berbentuk trapesium sama kaki. / Sisi sejajarnya 30 m dan 14 m. / Panjang setiap kakinya 17 m. / Taman akan ditanami rumput dengan biaya Rp15.000 per m². Berapa biaya seluruhnya?

Kunci: x = 8, t = 15, L = 330 m² → biaya = **Rp4.950.000**.

**Soal 3 — mandiri (karton hiasan)**
> Karton hiasan berbentuk trapesium sama kaki. / Sisi sejajarnya 22 cm dan 10 cm, kakinya 10 cm. / (a) Berapa panjang pita minimal untuk menghias seluruh tepinya? / (b) Berapa luas karton yang akan dicat?

Kunci: (a) K = 22 + 10 + 10 + 10 = **52 cm** · (b) t = 8 → L = **128 cm²**.

Setelah soal cerita: **Tantangan Pos 5** (§10), **Skala Leppink**, lalu **Posttest**.

**Penerapan di aplikasi (M5, `src/content/meeting-5.json`)** — *diputuskan 26-11-2026 (awal M5):*
- Tetap 4 fase: **Kenali** = 1 layar pengantar 3 tahap · **Bangun** = Soal 1 sawah (terbimbing) · **Latih** = Soal 2 taman (memudar) + Soal 3 karton (mandiri) · **Tantangan** ⑤.
- **Rumuskan** = langkah `story`. Setiap potongan punya chip: info penting (masuk Diketahui dengan label dari JSON, mis. `a = 20 m`) dan minimal satu pengecoh (nama, tempat, kegunaan). Pengecoh ditolak dengan umpan balik dan dicatat sebagai percobaan (`E_LAIN`). Baris Diketahui bisa dihapus (dikoreksi).
- **Ditanya** = PG "keliling atau luas?" per pertanyaan (umpan balik per opsi, dicatat dengan id `<step_id>#ditanya-N`, tidak ikut skor).
- Lanjut ke Hitung terbuka setelah semua info penting ada di Diketahui **dan** semua Ditanya benar.
- **Hitung**: satu besaran per layar. Soal 1: `K = 20 + 12 + 15 + ▢` (64 m) → `L = ½ × (20 + 12) × ▢` (240 m²) → pupuk 24 kg. Soal 2: `x = (30 − 14) ÷ 2 = ▢ · t = √(289 − 64) = ▢` (330 m²) → biaya Rp4.950.000 (diketik tanpa titik ribuan). Soal 3: K 52 cm → L 128 cm² (mandiri).
- **Tafsirkan**: PG cek kewajaran (tipe `why`): Soal 1 "mengapa pagar keliling, pupuk luas?", Soal 2 "apakah hasil ini masuk akal?", Soal 3 "mengapa satuan pita cm, cat cm²?".
- Satuan turunan kg/Rp memakai `problem.convert` (ARSITEKTUR §3).

*Draf petunjuk Hitung (perlu ditinjau peneliti):*

| Soal | L1 | L2 | L3 |
|---|---|---|---|
| 1 pagar | Ada berapa sisi pada sawah ini? | Jumlahkan kedua sisi sejajar, sisi tegak, dan sisi miring. | K = 20 + 12 + 15 + 17 = 64 m |
| 1 luas | Sisi mana yang menjadi tinggi sawah ini? | Sisi tegak 15 m adalah tinggi. | L = ½ × (20 + 12) × 15 = ½ × 32 × 15 = 240 m² |
| 1 pupuk | Ada berapa kelompok 10 m² dalam 240 m²? | Bagi luas sawah dengan 10. | Pupuk = 240 ÷ 10 = 24 kg |
| 2 luas | Ukuran apa yang belum ada untuk menghitung luas? | x = (a − b) ÷ 2, lalu t = √(s² − x²). | x = 8, t = 15. L = ½ × (30 + 14) × 15 = 330 m² |
| 2 biaya | Setiap 1 m² butuh Rp15.000. Ada berapa m²? | Kalikan luas taman dengan 15.000. | Biaya = 330 × 15.000 = Rp4.950.000 |
| 3 pita | Pita dipasang di mana: di tepi atau di permukaan? | Jumlahkan keempat sisi karton. | K = 22 + 10 + 10 + 10 = 52 cm |
| 3 luas | Tinggi karton belum diketahui. Bagaimana mencarinya? | x = (a − b) ÷ 2, lalu t = √(s² − x²). | x = 6, t = 8. L = ½ × (22 + 10) × 8 = 128 cm² |

---

## 7. Jenis kesalahan & umpan balik

Dideteksi oleh `diagnose()` di `src/lib/geometry.js` dengan membandingkan jawaban siswa dengan hasil "cara salah" yang umum (toleransi ±0,01).

| Kode | Pola jawaban | Umpan balik (≤ 2 kalimat) |
|---|---|---|
| `E_LUPA_SETENGAH` | (a + b) × t | "Hasilmu dua kali lipat. Ingat, dua trapesium membentuk satu jajargenjang — kalikan ½." |
| `E_KAKI_SBG_TINGGI` | ½ × (a + b) × s | "Kamu memakai kaki miring sebagai tinggi. Tinggi adalah garis putus-putus yang tegak lurus." |
| `E_SATU_SISI` | ½ × a × t atau ½ × b × t | "Jumlahkan **kedua** sisi sejajar dulu, baru dikali tinggi." |
| `E_KL_TERTUKAR` | jawaban = keliling saat ditanya luas (atau sebaliknya) | "Itu nilai keliling. Yang ditanya luas: banyak petak yang menutupi bangun." |
| `E_SATUAN` | angka benar, satuan salah | "Angkanya tepat! Luas memakai satuan persegi (cm²)." |
| `E_TINGGI_DI_KELILING` | K + t pada trapesium bukan siku-siku | "Tinggi bukan sisi trapesium, jadi tidak ikut dijumlahkan." |
| `E_SISI_KURANG` | jumlah hanya 3 sisi | "Cek lagi: trapesium punya empat sisi." |
| `E_SETENGAH_KELILING` | p + l pada persegi panjang | "Itu baru setengah keliling. Panjang dan lebar masing-masing ada dua." |
| `E_PYTHA_TAMBAH` | t = √(s² + x²) | "Tinggi adalah sisi tegak, bukan sisi miring. Pakai s² − x²." |
| `E_X_TIDAK_DIBAGI` | x = a − b pada trapesium sama kaki | "Selisih sisi sejajar terbagi ke dua sisi kiri dan kanan. Bagi 2 dulu." |
| `E_TIDAK_WAJAR` | t ≥ s, atau hasil negatif/nol | "Tinggi tidak mungkin lebih panjang dari kaki miring. Cek langkah x." |
| `E_LAIN` | tidak cocok pola apa pun | "Belum tepat. Mau lihat petunjuk?" |
| `E_KOTAK` *(M4)* | kotak ▢ pada langkah memudar kosong/salah (dicek sebelum hasil akhir) | "Cek lagi angka di kotak yang kosong. Lihat label pada gambar." |

**Varian teks sesuai yang ditanya** (M4, `src/content/feedback.json`; `{unit}` = satuan soal):
- `E_SATUAN` saat ditanya keliling → "Angkanya tepat! Keliling memakai satuan panjang (cm)." Saat ditanya luas, satuannya mengikuti soal (cm² / m²).
- `E_KL_TERTUKAR` saat ditanya keliling → "Itu nilai luas. Yang ditanya keliling: panjang batas bangun."
- Ketuk unsur: kaki dipilih saat ditanya tinggi → `E_KAKI_SBG_TINGGI` dengan teks "Itu kaki miring. Tinggi tegak lurus terhadap kedua sisi sejajar."; pilihan salah saat ditanya sisi sejajar → `E_LAIN` dengan teks "Belum tepat. Sisi sejajar arahnya sama dan tidak pernah bertemu."
- Jawaban benar → "Tepat!" + tombol "Lihat pembahasan" (isi L3). Pilihan ganda memakai umpan balik per opsi (kode `E_LAIN` bila salah).

Aturan petunjuk:
- Tombol petunjuk selalu terlihat. L1 bisa dibuka kapan saja; **L2 setelah L1**; **L3 setelah L2 dan minimal 1 percobaan**.
- Setelah 2× salah, petunjuk L1 ditawarkan (tidak dipaksakan).
- Level petunjuk tertinggi yang dibuka dicatat di log.
- *(M4)* Petunjuk tidak bisa dibuka lagi setelah soal selesai. Petunjuk yang sudah dibuka tetap bisa dibaca.

---

## 8. Data yang diisi peneliti (bukan dibuat AI)

| File | Isi | Catatan |
|---|---|---|
| `src/content/tests.json` | 4 butir pretest/posttest dari instrumen literasi matematis peneliti, kunci, pedoman skor | Claude Code hanya membuat **struktur kosong + contoh format**, isinya diketik peneliti |
| `src/content/leppink.json` | 10 butir (IL 3, EL 3, GL 4), skala 0–10, label ujung skala | Gunakan terjemahan yang dipakai di penelitian (Leppink dkk., 2013) |

---

## 9. Format konten (contoh `src/content/meeting-3.json`)

```json
{
  "meeting": 3,
  "title": "Luas trapesium",
  "phases": [
    {
      "phase": "bangun",
      "steps": [
        {
          "id": "m3-bangun-02",
          "type": "explain",
          "title": "Dua trapesium jadi jajargenjang",
          "text": ["Alas jajargenjang = a + b.", "Tingginya tetap t."],
          "figure": {
            "shape": "trapezoid",
            "kind": "isosceles",
            "a": 16, "b": 10, "t": 4,
            "layers": ["parallel", "height", "labels", "doubleRotate"],
            "draggable": false
          }
        }
      ]
    },
    {
      "phase": "latih",
      "steps": [
        {
          "id": "m3-latih-02",
          "type": "faded",
          "title": "Lengkapi langkahnya",
          "figure": { "shape": "trapezoid", "kind": "isosceles", "a": 10, "b": 6, "t": 4, "layers": ["parallel", "height", "labels"] },
          "template": "L = ½ × (10 + {b}) × 4",
          "answer": { "value": 32, "unit": "cm²" },
          "units": ["cm", "cm²"],
          "hints": [
            "Sisi sejajar mana yang belum ditulis?",
            "Sisi sejajar atas panjangnya 6 cm. Jumlahkan dengan 10.",
            "L = ½ × (10 + 6) × 4 = ½ × 16 × 4 = 32 cm²"
          ]
        }
      ]
    }
  ]
}
```

**Bidang tambahan (M4).** Semua dicek otomatis oleh `src/content/content.test.js`.

| Bidang | Dipakai di | Arti |
|---|---|---|
| `figure.unit`, `figure.areaUnit` | semua | satuan label (`cm`, `m`, `satuan`); satuan luas bawaan `unit²`, mis. `"petak"` |
| `figure.draggable`, `figure.lockHeight` | `explore` | titik bisa digeser; `lockHeight` = hanya mendatar |
| `figure.counting` + `actions: [{run, label}]` | `explain` | tombol animasi (`perimeter`, `area`, …); label lapisan di `counting` menghitung naik setelah ditekan |
| `question: {prompt, options: [{text, correct, feedback}]}` | `explore`, `why`, `challenge` | pilihan ganda, tepat satu benar |
| `variants: [{label, kind, x1?, text}]` + `actionLabel` | `explore` | tombol "Ubah jenis" pada gambar yang sama |
| `items: [...]` + `pick` | `identify` | kumpulan soal; `pick` soal diambil dengan seed kode siswa + pertemuan. Tiap butir: `id`, `text`, `ask` (`parallel`/`height`), `answer` (kunci unsur `a`, `b`, `s1`, `s2`, `t`), `figure`, `hints` |
| `problem` | `faded`, `solve`, `challenge` | objek `diagnose()` (ARSITEKTUR §3). Kotak `{kunci}` di `template` bernilai `problem[kunci]` |
| `answerLabel`, `answer`, `units`, `hints[3]` | soal | label isian (`K`/`L`), kunci, tombol satuan, petunjuk L1–L3 |
| `task: "identify"` | `challenge` | soal Tantangan berupa ketuk unsur |
| `distractors: [{value, unit, code}]` | `challenge` | pengecoh §10. Dites: `diagnose()` harus memberi `code` |
| `summary` (tingkat pertemuan) | Hasil Pos | 1–2 baris "Yang kamu temukan hari ini" |

**Bidang tambahan (M5).** Juga dicek `content.test.js`, termasuk: setiap `answer` = `solveProblem()` di `geometry.js` (nilai + satuan), setiap kotak bernilai dari `geometry.js`, angka gambar = angka soal, dan L3 diakhiri kunci yang sama.

| Bidang | Dipakai di | Arti |
|---|---|---|
| `figure.shape: "triangle"` + `x`, `t` | `explain` (P4) | segitiga siku-siku penyegaran Pythagoras |
| `figure.hideLabels: ["t" \| "s1" \| "s2" …]` | semua | label unsur yang dicari tampil `t = ?` |
| `ask: "hypotenuse"` | `identify` | ketuk sisi miring segitiga di tepi trapesium |
| `{x}`, `{t}`, `{s2}` … di `template` | `faded` | nilai kotak dihitung `solveProblem(problem)`, tidak harus tertulis di `problem` |
| `problem.convert: {op, by, unit}` | `solve` (P5) | satuan turunan: pupuk (`divide` 10, `kg`), biaya (`multiply` 15000, `Rp`) |
| `stage: "rumuskan" \| "hitung" \| "tafsirkan"` | langkah soal cerita | label tahap di kartu; kartu "Ingat rumus" juga tampil saat `hitung` |
| `type: "story"` + `segments: [{text, chips}]` + `asked: [{label, question}]` | Rumuskan | chip `{id, text, known?: {key, label, value?, unit?, text?}}` atau pengecoh `{id, text, feedback}`. `known.key` = bidang `problem` (`a`, `b`, `s1`, `s2`), `kind`, atau `convert` |
| `story: "<id langkah story>"` | langkah Hitung | menghubungkan soal Hitung ke ceritanya; dites: `known.value` = `problem[key]` |

---

## 10. Tantangan Pos (3 soal di akhir tiap pertemuan)

Aturan: tanpa contoh, petunjuk tetap tersedia tetapi tercatat; tiap soal boleh 2 percobaan. Skor = jumlah soal benar (maks. 3), ditampilkan di Hasil Pos bersama jumlah petunjuk yang dibuka. Langkah bertipe `challenge`, `step_id` berawalan `mX-tantangan-`.

*Diputuskan 26-11-2026 (M4):*
- Jika percobaan ke-2 juga salah, soal dicatat salah. Jawaban yang benar dan pembahasan (isi L3) langsung tampil, lalu tombol Lanjut.
- "Petunjuk dipakai" = jumlah level petunjuk yang dibuka di ketiga soal Tantangan.
- Pilihan "keliling atau luas?" di ① soal 3 dicatat dengan id `m1-tantangan-03#pilih` dan tidak ikut skor.
- Kartu "Ingat rumus" tersedia di Latih dan Tantangan.
- *(M5)* Soal yang tingginya/sisi tegaknya harus dicari (④ semua, ⑤ soal 2–3) menampilkan label `t = ?` / `s = ?`. ⑤ soal 1 tidak menampilkan garis tinggi; pengecoh 83 tetap dideteksi karena t dihitung `geometry.js`. ④ pengecoh ditulis 8,3 (≈ 8,31; masih dalam toleransi ±0,01).

| Pos | Soal | Kunci | Pengecoh yang dideteksi |
|---|---|---|---|
| ① | Persegi panjang p = 11 cm, l = 4 cm. Hitung kelilingnya. | 30 cm | 44 (luas) → `E_KL_TERTUKAR`; 15 → `E_SETENGAH_KELILING` |
| ① | Persegi panjang p = 15 cm, l = 8 cm. Hitung luasnya. | 120 cm² | 46 (keliling) → `E_KL_TERTUKAR` |
| ① | Lantai kelas 8 m × 6 m akan ditutup karpet. Pilih dulu: keliling atau luas? Lalu hitung. | Luas, 48 m² | 28 m → `E_KL_TERTUKAR` |
| ② | Ketuk garis **tinggi** pada trapesium siku-siku. | Sisi tegak | Kaki miring |
| ② | Trapesium siku-siku: sisi sejajar 15 cm dan 9 cm, sisi tegak 8 cm, kaki miring 10 cm. Hitung kelilingnya. | 42 cm | 34 (3 sisi) → `E_SISI_KURANG` |
| ② | Trapesium sama kaki: sisi sejajar 20 cm dan 8 cm, kaki 10 cm (t = 8 cm tampil). Hitung kelilingnya. | 48 cm | 56 → `E_TINGGI_DI_KELILING` |
| ③ | a = 14 cm, b = 6 cm, t = 5 cm. Hitung luasnya. | 50 cm² | 100 → `E_LUPA_SETENGAH` |
| ③ | Sama kaki: a = 20 cm, b = 8 cm, kaki 10 cm, t = 8 cm. Hitung luasnya. | 112 cm² | 140 → `E_KAKI_SBG_TINGGI` |
| ③ | Siku-siku: a = 15 cm, b = 9 cm, t = 8 cm. Hitung luasnya. | 96 cm² | 192 → `E_LUPA_SETENGAH` |
| ④ | Sama kaki: a = 26 cm, b = 16 cm, kaki 13 cm. Hitung tingginya. | 12 cm (x = 5) | ≈ 8,3 (memakai x = 10) → `E_X_TIDAK_DIBAGI` |
| ④ | Trapesium yang sama. Hitung luasnya. | 252 cm² | 273 → `E_KAKI_SBG_TINGGI` |
| ④ | Siku-siku: a = 21 cm, b = 15 cm, kaki miring 10 cm. Hitung luasnya. | 144 cm² (x = 6, t = 8) | 180 → `E_KAKI_SBG_TINGGI` |
| ⑤ | Taplak meja berbentuk trapesium sama kaki. Sisi sejajarnya 25 cm dan 9 cm, kakinya 17 cm. (a) Berapa panjang renda untuk seluruh tepinya? | 68 cm | 83 (+ tinggi) → `E_TINGGI_DI_KELILING` |
| ⑤ | Taplak yang sama. (b) Berapa luas taplak? | 255 cm² (x = 8, t = 15) | 289 → `E_KAKI_SBG_TINGGI`; 510 → `E_LUPA_SETENGAH` |
| ⑤ | Kolam berbentuk trapesium siku-siku. Sisi sejajarnya 9 m dan 5 m, sisi miringnya 5 m. Kolam akan dipagari di sekelilingnya. Berapa panjang pagar? | 22 m (sisi tegak = 3 m, dicari dengan Pythagoras) | 19 → `E_SISI_KURANG` |
