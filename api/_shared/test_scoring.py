import json
import os

import pytest

from _shared.export_core import flatten, read_csv_text, to_csv
from _shared.scoring import ITEM_IDS, MAX_SCORE, grade, is_research_code, leppink_means, n_gain, summarize, total_score

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def answers(code, kind, scores):
    return [{"student_code": code, "kind": kind, "item_id": i, "score": s} for i, s in zip(ITEM_IDS, scores)]


def test_konsisten_dengan_tests_json():
    with open(os.path.join(ROOT, "src", "content", "tests.json"), encoding="utf-8") as f:
        tests = json.load(f)
    assert tuple(i["id"] for i in tests["items"]) == ITEM_IDS
    assert tests["maxScore"] == MAX_SCORE == 24
    for item in tests["items"]:
        assert sum(s["max"] for s in item["stages"]) == item["max"] == 6


def test_kunci_ada_untuk_setiap_butir():
    with open(os.path.join(ROOT, "api", "_shared", "test_key.json"), encoding="utf-8") as f:
        key = json.load(f)
    assert set(key["keys"]) == set(ITEM_IDS)
    assert key["guide"]


def test_skor_dan_nilai():
    rows = answers("S01", "pre", [3, 2, 4, 1])
    assert total_score(rows, "S01", "pre") == 10
    assert grade(10) == pytest.approx(41.6667)
    assert grade(24) == 100


def test_skor_none_bila_belum_lengkap():
    rows = answers("S01", "pre", [3, None, 4, 1])
    assert total_score(rows, "S01", "pre") is None
    assert total_score(answers("S01", "pre", [3, 2, 4, 1])[:3], "S01", "pre") is None


def test_skor_dari_csv_string():
    rows = answers("S01", "post", ["6", "5.5", "4", "0"])
    assert total_score(rows, "S01", "post") == 15.5


def test_n_gain():
    assert n_gain(12, 18) == 0.5
    assert n_gain(0, 24) == 1
    assert n_gain(20, 16) == -1
    assert n_gain(24, 24) is None
    assert n_gain(None, 10) is None


def test_leppink_means():
    row = {"il1": 2, "il2": 4, "il3": 6, "el1": "1", "el2": "1", "el3": "4", "gl1": 8, "gl2": 8, "gl3": 9, "gl4": 7}
    assert leppink_means(row) == {"IL": 4, "EL": 2, "GL": 8}
    assert leppink_means({**row, "gl4": ""})["GL"] is None


def test_kode_penelitian():
    assert is_research_code("S01")
    assert not is_research_code("T01")
    assert is_research_code("T01", include_test=True)
    assert is_research_code("S001") and is_research_code("S150") and is_research_code(" s001 ")
    assert not is_research_code("S1") and not is_research_code("S0001") and not is_research_code("SX1")


def lep(code, meeting, il, el, gl):
    return {"student_code": code, "meeting": meeting, **{c: il for c in ("il1", "il2", "il3")}, **{c: el for c in ("el1", "el2", "el3")}, **{c: gl for c in ("gl1", "gl2", "gl3", "gl4")}}


def test_summarize():
    tests = answers("S01", "pre", [2, 2, 2, 0]) + answers("S01", "post", [5, 5, 4, 4]) + answers("S02", "pre", [3, 3, 3, 3]) + answers("T01", "pre", [6, 6, 6, 6])
    leps = [lep("S01", 1, 4, 2, 8), lep("S02", 1, 6, 4, 6), lep("T01", 1, 0, 0, 0)]
    s = summarize(tests, leps)
    codes = [x["student_code"] for x in s["students"]]
    assert codes == ["S01", "S02"]
    s01 = s["students"][0]
    assert (s01["pre_score"], s01["post_score"]) == (6, 18)
    assert s01["n_gain"] == pytest.approx(0.6667)
    assert s["students"][1]["post_score"] is None
    assert s["meetings"]["1"] == {"n": 2, "IL": 5, "EL": 3, "GL": 7}
    assert s["group"]["n_paired"] == 1
    assert summarize(tests, leps, include_test=True)["meetings"]["1"]["n"] == 3


def test_csv_bolak_balik_memberi_ringkasan_sama():
    """Ringkasan dari data API (angka) = ringkasan dari CSV ekspor (string) — dasar cek M7."""
    api_tests = [
        {"kind": "pre", "item_id": i, "answer": "a, \"b\"\nc", "score": s, "stage_scores": [s], "scored_at": None, "created_at": "2026-11-27", "students": {"code": "S01"}}
        for i, s in zip(ITEM_IDS, [1, 2, 3, 4])
    ]
    api_lep = [{"meeting": 2, "created_at": "x", "students": {"code": "S01"}, **{c: 5 for c in ("il1", "il2", "il3", "el1", "el2", "el3", "gl1", "gl2", "gl3", "gl4")}}]
    t, lp = flatten(api_tests), flatten(api_lep)
    direct = summarize(t, lp)
    via_csv = summarize(read_csv_text("﻿" + to_csv("test_answers", t)), read_csv_text(to_csv("leppink", lp)))
    assert direct == via_csv
    assert read_csv_text(to_csv("test_answers", t))[0]["answer"] == "a, \"b\"\nc"


def test_flatten_menyaring_akun_uji_dan_menghapus_relasi():
    rows = [{"meeting": 1, "students": {"code": "S01"}}, {"meeting": 1, "students": {"code": "T01"}}]
    assert flatten(rows) == [{"student_code": "S01", "meeting": 1}]
    assert len(flatten(rows, include_test=True)) == 2
