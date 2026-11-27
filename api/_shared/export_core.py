"""Bagian ekspor yang tidak bergantung pada HTTP (dites pytest).

Kolom CSV di sini juga yang dibaca analysis/process_data.py, sehingga ringkasan
/api/export?summary=1 dan process_data.py memakai data & rumus yang sama.
"""

import csv
import io
import json

from .scoring import LEPPINK, is_research_code

LEPPINK_COLS = [c for cols in LEPPINK.values() for c in cols]

# tabel ekspor -> (tabel Supabase, kolom CSV setelah student_code)
TABLES = {
    "step_logs": (
        "step_logs",
        ["meeting", "step_id", "answer", "is_correct", "attempts", "max_hint_level", "error_code", "first_error_code", "duration_sec", "created_at"],
    ),
    "test_answers": ("test_answers", ["kind", "item_id", "answer", "score", "stage_scores", "scored_at", "created_at"]),
    "leppink": ("leppink_responses", ["meeting", *LEPPINK_COLS, "created_at"]),
}


def select_param(table):
    """Parameter `select` PostgREST: kolom + kode siswa lewat relasi students (tanpa UUID di CSV)."""
    _, cols = TABLES[table]
    return ",".join([*cols, "students(code)"])


def flatten(rows, include_test=False):
    """Ganti relasi students{code} menjadi kolom student_code; saring kode S (± T)."""
    out = []
    for r in rows:
        r = dict(r)
        code = (r.pop("students", None) or {}).get("code")
        if not is_research_code(code, include_test):
            continue
        out.append({"student_code": code, **r})
    return out


def _cell(value):
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (list, dict)):
        return json.dumps(value, ensure_ascii=False)
    return value


def to_csv(table, rows):
    _, cols = TABLES[table]
    header = ["student_code", *cols]
    buf = io.StringIO()
    writer = csv.writer(buf, lineterminator="\n")
    writer.writerow(header)
    for r in rows:
        writer.writerow([_cell(r.get(c)) for c in header])
    return buf.getvalue()


def read_csv_text(text):
    """CSV hasil to_csv -> list dict (string). BOM Excel diabaikan."""
    return list(csv.DictReader(io.StringIO(text.lstrip("﻿"))))
