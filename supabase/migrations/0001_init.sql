-- GeoLangkah — skema awal (ARSITEKTUR.md §4). Jalankan sekali di SQL Editor Supabase.
-- Aman dijalankan ulang di proyek kosong; tidak menghapus data.

-- ---------------------------------------------------------------------------
-- Tabel
-- ---------------------------------------------------------------------------

-- Siswa: satu baris per akun. Akun dibuat peneliti (email teknis: s01@<VITE_STUDENT_EMAIL_DOMAIN>)
create table if not exists public.students (
  id uuid primary key references auth.users(id) on delete cascade,
  code text unique not null check (code ~ '^[ST][0-9]{2}$'),  -- S = penelitian, T = uji coba
  created_at timestamptz default now()
);

create table if not exists public.researchers (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Log per langkah/soal (satu baris per langkah, dikirim saat siswa pertama kali menekan Lanjut)
create table if not exists public.step_logs (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  meeting smallint not null check (meeting between 1 and 5),
  step_id text not null,
  answer text,
  is_correct boolean,
  attempts smallint not null default 1,
  max_hint_level smallint not null default 0 check (max_hint_level between 0 and 3),
  error_code text,                      -- kode kesalahan percobaan terakhir
  first_error_code text,                -- kode kesalahan percobaan pertama yang salah (M6)
  duration_sec integer check (duration_sec >= 0),
  client_id uuid not null unique,       -- mencegah data ganda saat sinkron ulang
  created_at timestamptz default now()
);
create index if not exists step_logs_student_meeting on public.step_logs (student_id, meeting);

create table if not exists public.test_answers (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  kind text not null check (kind in ('pre','post')),
  item_id text not null,
  answer text,
  score numeric,                        -- diisi peneliti (semua butir berbentuk uraian)
  scored_by uuid references public.researchers(user_id),
  scored_at timestamptz,
  client_id uuid not null unique,
  created_at timestamptz default now(),
  unique (student_id, kind, item_id)
);

create table if not exists public.leppink_responses (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  meeting smallint not null check (meeting between 1 and 5),
  il1 smallint check (il1 between 0 and 10),
  il2 smallint check (il2 between 0 and 10),
  il3 smallint check (il3 between 0 and 10),
  el1 smallint check (el1 between 0 and 10),
  el2 smallint check (el2 between 0 and 10),
  el3 smallint check (el3 between 0 and 10),
  gl1 smallint check (gl1 between 0 and 10),
  gl2 smallint check (gl2 between 0 and 10),
  gl3 smallint check (gl3 between 0 and 10),
  gl4 smallint check (gl4 between 0 and 10),
  client_id uuid not null unique,
  created_at timestamptz default now(),
  unique (student_id, meeting)
);

create table if not exists public.progress (
  student_id uuid references public.students(id) on delete cascade,
  meeting smallint check (meeting between 1 and 5),
  last_step_id text,
  completed_at timestamptz,
  primary key (student_id, meeting)
);

-- Pertemuan yang sudah selesai tetap selesai: HP lain yang progresnya tertinggal
-- tidak boleh menghapus completed_at atau memundurkan last_step_id.
create or replace function public.keep_progress_completed()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.completed_at is not null then
    new.completed_at := old.completed_at;
    new.last_step_id := old.last_step_id;
  end if;
  return new;
end;
$$;
drop trigger if exists progress_keep_completed on public.progress;
create trigger progress_keep_completed before update on public.progress
  for each row execute function public.keep_progress_completed();

-- ---------------------------------------------------------------------------
-- Hak akses: anon tidak boleh apa pun; authenticated hanya yang diperlukan.
-- (RLS di bawah tetap membatasi baris mana yang boleh.)
-- ---------------------------------------------------------------------------
revoke all on public.students, public.researchers, public.step_logs,
  public.test_answers, public.leppink_responses, public.progress from anon, authenticated;

grant select on public.students, public.researchers to authenticated;
grant select, insert on public.step_logs, public.test_answers, public.leppink_responses to authenticated;
grant update (score, scored_by, scored_at) on public.test_answers to authenticated;
grant select, insert, update on public.progress to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security (wajib aktif di semua tabel)
-- ---------------------------------------------------------------------------
alter table public.students          enable row level security;
alter table public.researchers       enable row level security;
alter table public.step_logs         enable row level security;
alter table public.test_answers      enable row level security;
alter table public.leppink_responses enable row level security;
alter table public.progress          enable row level security;

-- Apakah pengguna yang masuk adalah peneliti? security definer agar tidak terkena
-- RLS tabel researchers (mencegah rekursi kebijakan).
create or replace function public.is_researcher()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.researchers where user_id = (select auth.uid()));
$$;
revoke all on function public.is_researcher() from public, anon;
grant execute on function public.is_researcher() to authenticated;

-- students
drop policy if exists students_select on public.students;
create policy students_select on public.students for select to authenticated
  using (id = (select auth.uid()) or (select public.is_researcher()));

-- researchers: hanya baris sendiri (untuk cek "apakah saya peneliti")
drop policy if exists researchers_select on public.researchers;
create policy researchers_select on public.researchers for select to authenticated
  using (user_id = (select auth.uid()));

-- step_logs, test_answers, leppink_responses: siswa insert & select miliknya; peneliti select semua
drop policy if exists step_logs_select on public.step_logs;
create policy step_logs_select on public.step_logs for select to authenticated
  using (student_id = (select auth.uid()) or (select public.is_researcher()));
drop policy if exists step_logs_insert on public.step_logs;
create policy step_logs_insert on public.step_logs for insert to authenticated
  with check (student_id = (select auth.uid()));

drop policy if exists test_answers_select on public.test_answers;
create policy test_answers_select on public.test_answers for select to authenticated
  using (student_id = (select auth.uid()) or (select public.is_researcher()));
drop policy if exists test_answers_insert on public.test_answers;
create policy test_answers_insert on public.test_answers for insert to authenticated
  with check (student_id = (select auth.uid()));
-- Peneliti mengisi skor (kolom dibatasi oleh grant update di atas)
drop policy if exists test_answers_score on public.test_answers;
create policy test_answers_score on public.test_answers for update to authenticated
  using ((select public.is_researcher()))
  with check ((select public.is_researcher()));

drop policy if exists leppink_select on public.leppink_responses;
create policy leppink_select on public.leppink_responses for select to authenticated
  using (student_id = (select auth.uid()) or (select public.is_researcher()));
drop policy if exists leppink_insert on public.leppink_responses;
create policy leppink_insert on public.leppink_responses for insert to authenticated
  with check (student_id = (select auth.uid()));

-- progress: siswa insert, select, update miliknya; peneliti select semua
drop policy if exists progress_select on public.progress;
create policy progress_select on public.progress for select to authenticated
  using (student_id = (select auth.uid()) or (select public.is_researcher()));
drop policy if exists progress_insert on public.progress;
create policy progress_insert on public.progress for insert to authenticated
  with check (student_id = (select auth.uid()));
drop policy if exists progress_update on public.progress;
create policy progress_update on public.progress for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

-- Tidak ada kebijakan delete: aplikasi tidak pernah menghapus data.
