import json
import os

from process_data import analyze, main, read_csv

from _shared.scoring import summarize

SAMPLE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_data")


def test_data_contoh_diolah(tmp_path):
    summary = main([SAMPLE, "--out", str(tmp_path)])
    assert [s["student_code"] for s in summary["students"]] == ["S01", "S02", "S03"]  # T01 diabaikan
    s01 = summary["students"][0]
    assert (s01["pre_score"], s01["post_score"], s01["n_gain"]) == (8, 20, 0.75)
    assert summary["students"][2]["post_score"] is None  # S03 belum posttest
    assert json.loads((tmp_path / "ringkasan.json").read_text(encoding="utf-8")) == summary
    assert (tmp_path / "ringkasan_siswa.csv").exists()


def test_sama_dengan_rumus_ekspor():
    """process_data memakai summarize() yang sama dengan /api/export?summary=1."""
    summary, steps = analyze(SAMPLE)
    assert summary == summarize(read_csv(SAMPLE, "test_answers.csv"), read_csv(SAMPLE, "leppink.csv"))
    assert steps[0]["meeting"] == 1 and steps[0]["top_errors"].startswith("E_KL_TERTUKAR")
