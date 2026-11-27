-- GeoLangkah M7 — skor per tahap butir uraian. Jalankan sekali di SQL Editor Supabase
-- setelah 0001_init.sql. Aman dijalankan ulang; tidak menghapus data.

-- Skor tiap tahap rubrik, mis. [1, 2, 1, 0, 1]; `score` = jumlahnya (diisi peneliti).
alter table public.test_answers add column if not exists stage_scores jsonb;

alter table public.test_answers drop constraint if exists test_answers_score_range;
alter table public.test_answers add constraint test_answers_score_range check (score is null or (score >= 0 and score <= 6));

-- Peneliti boleh memperbarui kolom skor saja (kebijakan test_answers_score sudah ada di 0001).
grant update (score, stage_scores, scored_by, scored_at) on public.test_answers to authenticated;
