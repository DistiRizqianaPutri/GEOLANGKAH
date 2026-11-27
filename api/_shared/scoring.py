"""Hitungan penelitian GeoLangkah (M7, ARSITEKTUR §8, §10).

Dipakai bersama oleh api/export.py (ringkasan ?summary=1) dan analysis/process_data.py,
sehingga keduanya pasti memberi angka yang sama. Hanya pustaka standar.

- Skor tes = jumlah skor 4 butir uraian (maks 6 per butir, total 24).
- Nilai = skor / 24 x 100.
- N-gain = (post - pre) / (24 - pre); tidak terdefinisi bila pre = 24.
- Leppink: IL = rata-rata il1-il3, EL = rata-rata el1-el3, GL = rata-rata gl1-gl4.
- Hanya kode berawalan S yang diolah; akun uji T.. ikut bila include_test=True.
"""

from statistics import mean

ITEM_IDS = ("b1", "b2", "b3", "b4")
ITEM_MAX = 6
MAX_SCORE = ITEM_MAX * len(ITEM_IDS)  # 24
KINDS = ("pre", "post")
MEETINGS = (1, 2, 3, 4, 5)
LEPPINK = {
    "IL": ("il1", "il2", "il3"),
    "EL": ("el1", "el2", "el3"),
    "GL": ("gl1", "gl2", "gl3", "gl4"),
}
DIGITS = 4


def _num(value):
    """Angka dari nilai JSON/CSV; None bila kosong."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if text == "" or text.lower() in ("none", "null"):
        return None
    return float(text)


def _round(value):
    return None if value is None else round(value, DIGITS)


def _mean(values):
    values = [v for v in values if v is not None]
    return _round(mean(values)) if values else None


def is_research_code(code, include_test=False):
    code = (code or "").strip().upper()
    return code.startswith("S") or (include_test and code.startswith("T"))


def total_score(rows, code, kind):
    """Skor total satu siswa untuk 'pre'/'post'; None bila ada butir yang belum dinilai."""
    scores = {}
    for r in rows:
        if r.get("student_code") == code and r.get("kind") == kind:
            scores[r.get("item_id")] = _num(r.get("score"))
    if any(scores.get(i) is None for i in ITEM_IDS):
        return None
    return sum(scores[i] for i in ITEM_IDS)


def grade(score, max_score=MAX_SCORE):
    """Nilai 0-100."""
    return None if score is None else _round(score / max_score * 100)


def n_gain(pre, post, max_score=MAX_SCORE):
    if pre is None or post is None or pre >= max_score:
        return None
    return _round((post - pre) / (max_score - pre))


def leppink_means(row):
    """{'IL', 'EL', 'GL'} untuk satu baris Leppink; None bila ada butir kosong."""
    out = {}
    for dim, cols in LEPPINK.items():
        values = [_num(row.get(c)) for c in cols]
        out[dim] = None if any(v is None for v in values) else _round(mean(values))
    return out


def summarize(test_rows, leppink_rows, include_test=False):
    """Ringkasan per siswa + rata-rata kelompok. Baris memakai kolom `student_code`."""
    keep = lambda r: is_research_code(r.get("student_code"), include_test)  # noqa: E731
    test_rows = [r for r in test_rows if keep(r)]
    leppink_rows = [r for r in leppink_rows if keep(r)]
    codes = sorted({r["student_code"] for r in test_rows} | {r["student_code"] for r in leppink_rows})

    lep_by = {}
    for r in leppink_rows:
        lep_by[(r["student_code"], int(_num(r.get("meeting"))))] = leppink_means(r)

    students = []
    for code in codes:
        pre = total_score(test_rows, code, "pre")
        post = total_score(test_rows, code, "post")
        students.append(
            {
                "student_code": code,
                "pre_score": pre,
                "post_score": post,
                "pre_grade": grade(pre),
                "post_grade": grade(post),
                "n_gain": n_gain(pre, post),
                "leppink": {str(m): lep_by[(code, m)] for m in MEETINGS if (code, m) in lep_by},
            }
        )

    meetings = {}
    for m in MEETINGS:
        rows = [v for (c, mm), v in lep_by.items() if mm == m]
        if rows:
            meetings[str(m)] = {"n": len(rows), **{d: _mean(r[d] for r in rows) for d in LEPPINK}}

    pres = [s["pre_score"] for s in students if s["pre_score"] is not None]
    posts = [s["post_score"] for s in students if s["post_score"] is not None]
    paired = [s for s in students if s["pre_score"] is not None and s["post_score"] is not None]
    pre_mean_paired = _mean(s["pre_score"] for s in paired)
    post_mean_paired = _mean(s["post_score"] for s in paired)
    group = {
        "n_pre": len(pres),
        "n_post": len(posts),
        "n_paired": len(paired),
        "pre_mean": _mean(pres),
        "post_mean": _mean(posts),
        "pre_grade_mean": _mean(s["pre_grade"] for s in students),
        "post_grade_mean": _mean(s["post_grade"] for s in students),
        "n_gain_mean": _mean(s["n_gain"] for s in paired),
        "n_gain_of_means": n_gain(pre_mean_paired, post_mean_paired),
    }

    return {"max_score": MAX_SCORE, "include_test": include_test, "group": group, "meetings": meetings, "students": students}
