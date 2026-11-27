-- GeoLangkah — masuk tanpa kode: Nama lengkap + Kelas + anonymous sign-in.
-- Jalankan sekali di SQL Editor Supabase setelah 0002_m7.sql. Aman dijalankan ulang; tidak menghapus data.
-- Prasyarat: Authentication → Sign In / Providers → "Allow anonymous sign-ins" aktif.

-- Kode siswa kini opsional (akun lama S001/T01 tetap punya kode; CHECK lama berlaku untuk nilai non-null).
alter table public.students alter column code drop not null;

alter table public.students add column if not exists name text;
alter table public.students add column if not exists kelas text;

alter table public.students drop constraint if exists students_name_check;
alter table public.students add constraint students_name_check
  check (name is null or (char_length(name) between 1 and 80 and name = btrim(name)));
alter table public.students drop constraint if exists students_kelas_check;
alter table public.students add constraint students_kelas_check
  check (kelas is null or kelas in ('VII', 'VIII', 'IX'));

-- Siswa hanya boleh menulis kolom id, name, kelas (tidak bisa mengisi/mengubah code).
grant insert (id, name, kelas) on public.students to authenticated;
-- id ikut karena upsert PostgREST menulis ulang semua kolom; RLS memastikan id = auth.uid().
grant update (id, name, kelas) on public.students to authenticated;

-- RLS: siswa hanya baris miliknya sendiri. (students_select dari 0001 tetap: sendiri atau peneliti.)
drop policy if exists students_insert on public.students;
create policy students_insert on public.students for insert to authenticated
  with check (id = (select auth.uid()));
drop policy if exists students_update on public.students;
create policy students_update on public.students for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
