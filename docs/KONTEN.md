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
| Memudar | Siku-siku: a = 12, b = 7, sisi tegak 12, kaki miring 13 | K = 12 + 7 + 12 + 13 = 44 cm |
| Mandiri | Sembarang: a = 24, b = 10, kaki 13 dan 15 (t = 12 tampil) | K = 62 cm |

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
| Memudar | Sama kaki a = 22, b = 10, s = 10 | x = 6 → t = √(100 − 36) | t = 8 cm · L = 128 cm² |
| Memudar | Siku-siku a = 12, b = 7, s = 13 | x = 5 → t = √(169 − 25) | t = 12 cm · L = 114 cm² |
| Mandiri | Sama kaki a = 30, b = 14, s = 17 | x = 8 → t = 15 | L = 330 cm² · K = 78 cm |
| Mandiri | Siku-siku a = 20, b = 12, s = 17 | x = 8 → t = 15 | L = 240 cm² · K = 64 cm |

Contoh petunjuk bertingkat (soal sama kaki a = 22, b = 10, s = 10):
- **L1 (pemantik):** "Segitiga siku-siku mana yang memuat tinggi?"
- **L2 (strategi):** "Kurangkan dua sisi sejajar, lalu bagi 2. Itu alas segitiga (x). Tinggi adalah sisi tegaknya."
- **L3 (langkah contoh):** "x = (22 − 10) ÷ 2 = 6. t² = 10² − 6² = 100 − 36 = 64, jadi t = 8 cm."

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

Aturan petunjuk:
- Tombol petunjuk selalu terlihat. L1 bisa dibuka kapan saja; **L2 setelah L1**; **L3 setelah L2 dan minimal 1 percobaan**.
- Setelah 2× salah, petunjuk L1 ditawarkan (tidak dipaksakan).
- Level petunjuk tertinggi yang dibuka dicatat di log.

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

---

## 10. Tantangan Pos (3 soal di akhir tiap pertemuan)

Aturan: tanpa contoh, petunjuk tetap tersedia tetapi tercatat; tiap soal boleh 2 percobaan. Skor = jumlah soal benar (maks. 3), ditampilkan di Hasil Pos bersama jumlah petunjuk yang dibuka. Langkah bertipe `challenge`, `step_id` berawalan `mX-tantangan-`.

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
| ⑤ | **PERLU DIGANTI** — Karton (Soal 3 §6) bagian (a): panjang pita | 52 cm | 60 → `E_TINGGI_DI_KELILING` |
| ⑤ | **PERLU DIGANTI** — Karton (Soal 3 §6) bagian (b): luas yang dicat | 128 cm² | 160 → `E_KAKI_SBG_TINGGI` |

> **PERLU DIGANTI:** dua soal ⑤ di atas menyalin Soal 3 §6 yang baru saja dikerjakan, sehingga bertentangan dengan aturan "tanpa contoh". Pengembang memberi angka baru; Claude Code menghitung ulang dan menambah tesnya sebelum M5.
| ⑤ | Kolam berbentuk trapesium siku-siku. Sisi sejajarnya 9 m dan 5 m, sisi miringnya 5 m. Kolam akan dipagari di sekelilingnya. Berapa panjang pagar? | 22 m (sisi tegak = 3 m, dicari dengan Pythagoras) | 19 → `E_SISI_KURANG` |
