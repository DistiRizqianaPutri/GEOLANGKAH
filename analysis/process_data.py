"""Analisis data GeoLangkah (ARSITEKTUR §10).

Pemakaian:
    python analysis/process_data.py <folder-csv> [--include-test] [--out <folder>]

Masukan: CSV dari halaman peneliti (test_answers.csv, leppink.csv, step_logs.csv).
Rumus skor, nilai, N-gain, rata-rata IL/EL/GL diimpor dari api/_shared/scoring.py
(sama persis dengan /api/export?summary=1). Keluaran: ringkasan.json, ringkasan_siswa.csv,
log_per_pertemuan.csv, dan leppink.png (bila matplotlib terpasang).
"""

import argparse
import csv
import json
import os
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.normpath(os.path.join(HERE, "..", "api")))

from _shared.export_core import read_csv_text  # noqa: E402
from _shared.scoring import LEPPINK, MEETINGS, _mean, _num, is_research_code, summarize  # noqa: E402


def read_csv(folder, name):
    path = os.path.join(folder, name)
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8-sig", newline="") as f:
        return read_csv_text(f.read())


def step_stats(rows, include_test=False):
    """Per pertemuan: jumlah baris, rata-rata percobaan & level petunjuk, kode kesalahan terbanyak."""
    rows = [r for r in rows if is_research_code(r.get("student_code"), include_test)]
    out = []
    for m in MEETINGS:
        rs = [r for r in rows if _num(r.get("meeting")) == m]
        if not rs:
            continue
        errors = Counter(r.get("first_error_code") or r.get("error_code") for r in rs)
        errors.pop(None, None)
        errors.pop("", None)
        top = errors.most_common(3)
        out.append(
            {
                "meeting": m,
                "rows": len(rs),
                "attempts_mean": _mean(_num(r.get("attempts")) for r in rs),
                "hint_level_mean": _mean(_num(r.get("max_hint_level")) for r in rs),
                "top_errors": "; ".join(f"{code} ({n})" for code, n in top),
            }
        )
    return out


def analyze(folder, include_test=False):
    summary = summarize(read_csv(folder, "test_answers.csv"), read_csv(folder, "leppink.csv"), include_test)
    return summary, step_stats(read_csv(folder, "step_logs.csv"), include_test)


def write_csv(path, rows, header):
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=header, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)


def plot_leppink(meetings, path):
    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return False
    xs = sorted(int(m) for m in meetings)
    fig, ax = plt.subplots(figsize=(6, 3.5))
    for dim in LEPPINK:
        ax.plot(xs, [meetings[str(m)][dim] for m in xs], marker="o", label=dim)
    ax.set_xticks(xs)
    ax.set_xlabel("Pertemuan")
    ax.set_ylabel("Rata-rata (0-10)")
    ax.set_ylim(0, 10)
    ax.legend()
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)
    return True


def main(argv=None):
    p = argparse.ArgumentParser(description="Olah CSV ekspor GeoLangkah")
    p.add_argument("folder")
    p.add_argument("--include-test", action="store_true", help="ikut mengolah akun uji T..")
    p.add_argument("--out", help="folder keluaran (bawaan: <folder>/hasil)")
    args = p.parse_args(argv)

    summary, steps = analyze(args.folder, args.include_test)
    out = args.out or os.path.join(args.folder, "hasil")
    os.makedirs(out, exist_ok=True)

    with open(os.path.join(out, "ringkasan.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    student_rows = [
        {**{k: v for k, v in s.items() if k != "leppink"}, **{f"{d}_p{m}": lp[d] for m, lp in s["leppink"].items() for d in LEPPINK}}
        for s in summary["students"]
    ]
    lep_cols = [f"{d}_p{m}" for m in MEETINGS for d in LEPPINK]
    write_csv(os.path.join(out, "ringkasan_siswa.csv"), student_rows, ["student_code", "pre_score", "post_score", "pre_grade", "post_grade", "n_gain", *lep_cols])
    write_csv(os.path.join(out, "log_per_pertemuan.csv"), steps, ["meeting", "rows", "attempts_mean", "hint_level_mean", "top_errors"])
    plotted = summary["meetings"] and plot_leppink(summary["meetings"], os.path.join(out, "leppink.png"))

    g = summary["group"]
    print(f"Siswa: {len(summary['students'])} | pasangan pre-post: {g['n_paired']}")
    print(f"Rata-rata skor pre {g['pre_mean']} | post {g['post_mean']} (maks {summary['max_score']})")
    print(f"Rata-rata nilai pre {g['pre_grade_mean']} | post {g['post_grade_mean']} | N-gain rata-rata {g['n_gain_mean']}")
    for s in summary["students"]:
        print(f"  {s['student_code']}: pre {s['pre_score']} -> post {s['post_score']}, N-gain {s['n_gain']}")
    print("Leppink per pertemuan (IL / EL / GL):")
    for m, v in summary["meetings"].items():
        print(f"  Pertemuan {m} (n={v['n']}): {v['IL']} / {v['EL']} / {v['GL']}")
    print("Log per pertemuan:")
    for r in steps:
        print(f"  Pertemuan {r['meeting']}: {r['rows']} baris, percobaan {r['attempts_mean']}, petunjuk {r['hint_level_mean']}, kesalahan: {r['top_errors'] or '-'}")
    print(f"Keluaran: {out}" + ("" if plotted else " (grafik dilewati: matplotlib tidak terpasang)"))
    return summary


if __name__ == "__main__":
    main()
