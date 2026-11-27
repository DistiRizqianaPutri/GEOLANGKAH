// buat-akun-siswa.mjs — membuat banyak akun siswa GeoLangkah sekaligus.
//
// Taruh file ini di folder proyek (sejajar package.json), lalu di terminal VS Code (PowerShell):
//   $env:SUPABASE_SECRET_KEY="sb_secret_..."      <- tempel kunci SECRET di terminal saja, JANGAN di file
//   node buat-akun-siswa.mjs S 1 120              <- membuat S001 s.d. S120
// Coba dulu tanpa membuat akun:
//   node buat-akun-siswa.mjs S 1 120 --coba
//
// Hasil: daftar kode + PIN disimpan di folder DI ATAS proyek (mis. C:\proyek\akun-siswa-....csv),
// jadi tidak ikut terunggah ke GitHub. Simpan file itu baik-baik dan jangan dibagikan ke grup.

import { randomInt } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function bacaEnv(path) {
  const hasil = {}
  if (!existsSync(path)) return hasil
  for (const baris of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = baris.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) hasil[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return hasil
}

function berhenti(pesan) {
  console.error('\n[!] ' + pesan + '\n')
  process.exit(1)
}

const [awalan, dariStr, sampaiStr, ...opsi] = process.argv.slice(2)
const coba = opsi.includes('--coba')
const dari = Number(dariStr)
const sampai = Number(sampaiStr)

if (!['S', 'T'].includes(awalan) || !Number.isInteger(dari) || !Number.isInteger(sampai)) {
  berhenti('Cara pakai: node buat-akun-siswa.mjs S 1 120   (awalan S atau T, lalu nomor awal dan akhir)')
}
if (dari < 1 || sampai > 999 || dari > sampai) {
  berhenti('Nomor harus antara 1 dan 999, dan nomor awal tidak boleh lebih besar dari nomor akhir.')
}

const env = bacaEnv(resolve(process.cwd(), '.env'))
const url = env.VITE_SUPABASE_URL
const domain = env.VITE_STUDENT_EMAIL_DOMAIN
if (!url || !domain) {
  berhenti('VITE_SUPABASE_URL atau VITE_STUDENT_EMAIL_DOMAIN tidak ditemukan di .env. Jalankan dari folder proyek.')
}

const daftar = []
for (let n = dari; n <= sampai; n++) {
  const kode = awalan + String(n).padStart(3, '0')
  daftar.push({ kode, email: `${kode.toLowerCase()}@${domain}` })
}

if (coba) {
  console.log(`MODE COBA: akan dibuat ${daftar.length} akun (tidak ada yang dibuat sekarang).`)
  console.log(`Pertama: ${daftar[0].kode} -> ${daftar[0].email}`)
  console.log(`Terakhir: ${daftar.at(-1).kode} -> ${daftar.at(-1).email}`)
  process.exit(0)
}

const kunci = process.env.SUPABASE_SECRET_KEY
if (kunci && kunci.startsWith('sb_publishable_')) {
  berhenti('Itu kunci publishable. Yang dibutuhkan kunci SECRET (diawali sb_secret_).')
}
if (!kunci || (!kunci.startsWith('sb_secret_') && !kunci.startsWith('eyJ'))) {
  berhenti('Kunci SECRET belum diisi. Ketik dulu di terminal: $env:SUPABASE_SECRET_KEY="sb_secret_..."')
}

const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(url, kunci, { auth: { autoRefreshToken: false, persistSession: false } })

const hasil = []
let dibuat = 0
let sudahAda = 0
let gagal = 0
for (const { kode, email } of daftar) {
  const pin = String(randomInt(100000, 1000000))
  const { error } = await supabase.auth.admin.createUser({ email, password: pin, email_confirm: true })
  if (!error) {
    dibuat++
    hasil.push([kode, email, pin, 'dibuat'])
    process.stdout.write(`\r${kode} dibuat (${dibuat}/${daftar.length})   `)
  } else if (/already|registered|exists/i.test(error.message)) {
    sudahAda++
    hasil.push([kode, email, '', 'sudah ada - PIN lama tetap'])
  } else {
    gagal++
    hasil.push([kode, email, '', 'GAGAL: ' + error.message])
  }
}

const cap = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')
const fileHasil = resolve(process.cwd(), '..', `akun-siswa-${awalan}${dari}-${sampai}-${cap}.csv`)
const isi = ['kode;email;pin;status', ...hasil.map((r) => r.join(';'))].join('\r\n')
writeFileSync(fileHasil, '\uFEFF' + isi, 'utf8')

console.log(`\n\nSelesai. Dibuat: ${dibuat}, sudah ada: ${sudahAda}, gagal: ${gagal}.`)
console.log(`Daftar kode + PIN: ${fileHasil}`)
console.log('Langkah berikutnya: jalankan SQL "insert into students ..." di Supabase SQL Editor.')
