# RISET.md — Temuan Wawancara → Kebutuhan Aplikasi

> Dokumen ini adalah **dasar bukti** semua fitur. Aturannya sederhana: **fitur yang tidak punya baris di matriks bagian 4 tidak dibangun** (kecuali kebutuhan pengukuran penelitian di bagian 5).

## 1. Sumber data

| Komponen | Isi |
|---|---|
| Instrumen | Kisi-kisi & pedoman wawancara mendalam *Intrinsic / Extraneous / Germane Load* (model ADDIE, tahap Analysis) — penyusun: Disti Rizqiana Putri |
| Informan | **S01**, siswa SMP kelas VIII, sudah mempelajari materi |
| Materi | Keliling dan luas **persegi panjang** serta **trapesium** |
| Pelaksanaan | 7 November 2026, Google Meet, ±5 menit 29 detik |
| Artefak | Papan tulis & buku LKS (cara guru mengajar), catatan hasil wawancara, contoh soal di buku catatan |

**Privasi:** informan hanya ditulis dengan kode S01. Nama siswa dan nama sekolah **tidak boleh** masuk ke kode, data, prompt AI, atau repositori.

## 2. Keterbatasan (wajib diingat saat mengambil keputusan desain)

- Hanya **1 informan** dan durasi singkat → temuan bersifat *sementara*, bukan gambaran semua siswa SMP.
- Pedoman wawancara belum tervalidasi empiris; triangulasi dengan artefak/observasi belum penuh.
- Kode IL/EL/GL diberikan berdasarkan makna kutipan. Rasa malas/bosan dicatat sebagai **konteks** (motivasi), tidak otomatis dihitung sebagai satu jenis *cognitive load*.
- Karena itu setiap fitur di bawah punya **cara uji** — keputusan desain dibuktikan lagi saat uji coba.

## 3. Ringkasan temuan per dimensi

### Konteks (K)
- Guru mengajar dengan **papan tulis dan buku LKS**.
- S01 merasa materi **persegi panjang mudah** dipahami dan dihitung.
- Pada contoh soal di buku catatan, luas trapesium dihitung benar dengan ½(a + b)t **ketika tinggi sudah diketahui** (6 cm, 10 cm, t = 4 cm → 32 cm²). *(Perlu konfirmasi apakah tulisan itu milik S01.)*

### Intrinsic Load (IL) — kerumitan materi
- **IL1** Sering **lupa rumus trapesium**.
- **IL2** Bingung **menentukan tinggi trapesium** dan garis/sisi mana yang dihitung.
- **IL3** Paling sulit bila tinggi harus dicari dengan **Teorema Pythagoras** (prasyarat).

> Kutipan: *"…aku sering lupa rumus trapesiumnya dan aku bingung menentukan tinggi trapesium terutama jika menggunakan pythagoras…"*

### Extraneous Load (EL) — cara penyajian yang membebani
- **EL2** **Gambar terlalu ramai** (terlalu banyak garis) → sulit menentukan garis yang dihitung.
- **EL1/EL5** **Soal cerita panjang** membuat bingung memahami cara pengerjaan.
- **EL3** Butuh penjelasan **perlahan** agar bisa mengikuti langkah.

> Kutipan: *"…gambarnya terlalu ramai sehingga sulit menentukan garis yang dihitung… Ramai banget sampai bikin malas ngerjain…"*

### Germane Load (GL) — yang membantu membangun pemahaman
- **GL1** Lebih paham jika **gambar bisa digeser / diubah posisinya**.
- **GL2** Terbantu **penjelasan langkah demi langkah**.
- **GL3** Terbantu **petunjuk seperti di buku** → bisa mencoba sendiri "tanpa harus bingung-bingung lagi".
- Saran S01 untuk aplikasi: **fitur interaktif + petunjuk bertahap**, supaya siswa mencoba soal sambil memahami langkahnya.

> Kutipan: *"Mungkin aku bisa paham kalau misalnya gambarnya bisa digeser terus dikasih tahu bagaimana cara pengerjaannya…"*

## 4. Matriks keterlacakan: bukti → kebutuhan → fitur → cara uji

| ID | Bukti | Interpretasi | Kebutuhan / fitur (lihat PRD) | Cara menguji |
|---|---|---|---|---|
| **R-01** | IL1 | Rumus trapesium belum tersimpan sebagai skema bermakna | Rumus **diturunkan** dari bangun yang sudah dikuasai (2 trapesium → jajargenjang; persegi panjang sebagai jembatan). Kartu "Ingat rumus" bisa dibuka kapan saja. → **F-05, F-06** | Siswa menuliskan rumus dan menjelaskan asalnya dengan kata sendiri |
| **R-02** | IL2 | Unsur trapesium (sisi sejajar, kaki, tinggi) belum dibedakan | Penandaan unsur dengan **warna + pola garis + label**; latihan "ketuk sisi sejajar / tinggi". → **F-02, F-03** | ≥ 80% benar pada latihan identifikasi unsur |
| **R-03** | IL3 | Prasyarat Pythagoras belum kuat | **Penyegaran Pythagoras** singkat sebelum mencari tinggi; contoh bertahap; angka memakai tripel Pythagoras. → **F-07** | Siswa menentukan tinggi trapesium sama kaki & siku-siku |
| **R-04** | EL2 | Gambar ramai menambah beban yang tidak perlu | **Satu gambar per layar**, unsur muncul **hanya saat dibahas** (lapisan/*layer*), label menempel di gambar. → **F-02** | Siswa menemukan ukuran yang dibutuhkan pada gambar tanpa salah pilih garis |
| **R-05** | EL1, EL5 | Teks soal cerita panjang membebani memori kerja | **Mode baca ringkas**: soal dipotong per kalimat, tombol "tandai info penting", tabel *Diketahui / Ditanya* terisi dari tanda siswa. → **F-08** | Siswa mengisi Diketahui/Ditanya dengan benar sebelum menghitung |
| **R-06** | EL3 | Tempo penjelasan terlalu cepat | **Tempo dikendalikan siswa**: tombol Lanjut / Ulangi langkah; tanpa timer, tanpa auto-lanjut. → **F-04** | Catat jumlah "Ulangi"; wawancara singkat pascasesi |
| **R-07** | GL1 | Manipulasi visual membantu pembentukan konsep | **Gambar interaktif**: titik sudut bisa digeser, tinggi tetap tegak lurus, ukuran ikut berubah. → **F-03** | Siswa menjelaskan mengapa tinggi ≠ kaki miring setelah menggeser |
| **R-08** | GL3, GL2 | Bantuan bertahap mendukung kemandirian | **Petunjuk 3 tingkat** (pertanyaan pemantik → strategi → langkah contoh) dan **bantuan memudar** (*faded worked examples*). → **F-05, F-06** | Level petunjuk yang dipakai menurun dari pertemuan ke pertemuan |
| **R-09** | GL2 | Memeriksa langkah & kewajaran jawaban | **Pembahasan langkah** setelah menjawab + pertanyaan cek kewajaran (satuan, besar kecilnya hasil). Umpan balik spesifik per jenis kesalahan. → **F-09** | Jenis kesalahan berulang berkurang |
| **R-10** | Matriks analisis instrumen (baris 4–5), belum ada kutipan langsung | Menjelaskan sendiri & bantuan yang dikurangi membantu | Pertanyaan **"Mengapa?"** pilihan ganda singkat di akhir langkah kunci. → **F-10** (P1) | Kualitas penjelasan sebelum–sesudah |
| **R-11** | K (persegi panjang mudah) | Persegi panjang = skema yang sudah ada | Persegi panjang dipakai **singkat sebagai jembatan** ke trapesium, bukan materi panjang. → **KONTEN P1** | Waktu di Pertemuan 1 tidak lebih lama dari pertemuan lain |

## 5. Kebutuhan pengukuran penelitian (bukan dari kutipan, tetapi dari tujuan penelitian)

| ID | Kebutuhan | Fitur |
|---|---|---|
| **M-01** | Mengukur literasi matematis sebelum & sesudah | Pretest & posttest (butir dari instrumen peneliti) → **F-12** |
| **M-02** | Mengukur beban kognitif tiap pertemuan | Skala Leppink (10 butir, 0–10) di akhir pertemuan → **F-13** |
| **M-03** | Data proses belajar | Log per langkah: benar/salah, percobaan, level petunjuk, kode kesalahan, durasi → **F-11** |
| **M-04** | Peneliti mengolah data | Dashboard peneliti + ekspor CSV + skrip Python analisis → **F-14** |

## 6. Hal yang sengaja TIDAK dibuat (karena menambah beban yang tidak perlu)

- Gambar 3D, latar animasi, konfeti; musik/maskot/ilustrasi **di layar belajar**.
- Banyak gambar dalam satu layar; legenda warna terpisah dari gambar.
- Timer/hitung mundur, papan peringkat, poin/bintang (menekan dan bisa membuat siswa enggan membuka petunjuk).
- Paragraf penjelasan panjang.

## 7. Catatan tentang tema petualangan

Tema "Jelajah Desa Bangun Datar" diambil dari **acuan gaya** (aplikasi contoh), bukan dari kutipan wawancara. Dasarnya: S01 menyebut tampilan ramai membuatnya **malas** mengerjakan — artinya motivasi ikut berperan. Tema yang hangat dipakai untuk motivasi, tetapi dibatasi di **layar luar** (Pembuka, Peta, Hasil) agar tidak menambah *extraneous load* di layar belajar. Uji: bandingkan skor EL Leppink dan komentar siswa tentang tampilan.
