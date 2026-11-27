"""Inti Tutor AI (ARSITEKTUR §9, RMT.md §7) — fungsi murni, dites pytest.

Tutor = mediator RMT: bertanya sesuai fase langkah, tidak pernah memberi jawaban akhir.
Payload hanya berisi data soal; kode/nama siswa tidak pernah diterima (kunci asing dibuang).
"""

import re

MAX_QUESTIONS = 5
MAX_SENTENCES = 2
MAX_TEXT = 300

ALLOWED = ("step_id", "phase", "title", "prompt", "problem", "answer", "unit", "student_answer", "hint_level", "question", "asked")

PHASE_GUIDE = {
    "kenali": "Fase 1 (Kenali): arahkan siswa mengamati gambar dan memberi label unsur (sisi sejajar, tinggi, kaki, petak).",
    "bangun": "Fase 2 (Bangun): ajak siswa menemukan pola dan hubungan dari hal yang sudah ia kenal.",
    "latih": "Fase 3 (Latih): ajak siswa memakai alat (rumus, tabel Diketahui/Ditanya, segitiga siku-siku) dan mengecek kewajaran jawabannya.",
    "tantangan": "Fase 3 (Latih, Tantangan Pos): ajak siswa memakai alat yang sudah dipelajari dan mengecek kewajaran jawabannya.",
}

SYSTEM_PROMPT = (
    "Kamu tutor matematika untuk siswa SMP yang belajar keliling dan luas persegi panjang dan trapesium. "
    "Kamu mediator: kamu bertanya, menyoroti hal penting, dan memberi makna. "
    "Aturan wajib: jawab dalam Bahasa Indonesia sederhana; paling banyak 2 kalimat pendek; "
    "akhiri dengan satu pertanyaan pemantik; JANGAN PERNAH menyebut jawaban akhir atau hasil hitungan akhir; "
    "jangan menulis rumus yang sudah terisi lengkap dengan hasilnya. "
    "Pakai istilah: keliling (K), luas (L), sisi sejajar a dan b, tinggi t (tegak lurus), kaki s, panjang p, lebar l. "
    "Sesekali minta siswa menamai cara berpikirnya, mis. 'Kamu sedang membandingkan apa dengan apa?'. "
    "Jika pertanyaan siswa di luar soal, ajak kembali ke soal."
)


class TutorError(ValueError):
    pass


def _text(value):
    return str(value if value is not None else "")[:MAX_TEXT]


def validate(payload):
    """Kembalikan payload bersih (hanya kunci ALLOWED) atau lempar TutorError."""
    if not isinstance(payload, dict):
        raise TutorError("payload harus objek JSON")
    clean = {k: payload[k] for k in ALLOWED if k in payload}
    if clean.get("phase") not in PHASE_GUIDE:
        raise TutorError("fase tidak dikenal")
    try:
        hint_level = int(clean.get("hint_level", 0))
        asked = int(clean.get("asked", 0))
    except (TypeError, ValueError) as err:
        raise TutorError("hint_level/asked harus angka") from err
    if hint_level < 2:
        raise TutorError("tutor terbuka setelah petunjuk 2")
    if asked >= MAX_QUESTIONS:
        raise TutorError("batas pertanyaan untuk soal ini sudah habis")
    if not _text(clean.get("question")).strip():
        raise TutorError("pertanyaan kosong")
    clean["hint_level"], clean["asked"] = hint_level, asked
    return clean


def build_messages(p):
    """Pesan format OpenAI untuk DeepSeek. Jawaban kunci tidak dikirim ke model."""
    problem = p.get("problem")
    numbers = ", ".join(f"{k} = {v}" for k, v in problem.items() if k in ("p", "l", "a", "b", "t", "s1", "s2", "x")) if isinstance(problem, dict) else ""
    context = "\n".join(
        line
        for line in (
            f"Judul langkah: {_text(p.get('title'))}",
            f"Teks soal: {_text(p.get('prompt'))}",
            f"Ukuran (satuan {_text((problem or {}).get('unit') if isinstance(problem, dict) else '')}): {numbers}" if numbers else "",
            f"Jawaban siswa terakhir: {_text(p.get('student_answer'))}" if p.get("student_answer") not in (None, "") else "Siswa belum menjawab.",
            f"Siswa sudah membuka petunjuk sampai tingkat {p['hint_level']}.",
        )
        if line
    )
    return [
        {"role": "system", "content": f"{SYSTEM_PROMPT}\n{PHASE_GUIDE[p['phase']]}"},
        {"role": "user", "content": f"{context}\n\nPertanyaan siswa: {_text(p.get('question'))}"},
    ]


def _numbers(text):
    return {n.replace(",", ".") for n in re.findall(r"\d+(?:[.,]\d+)?", text)}


def leaks_answer(reply, answer):
    """True bila balasan memuat angka jawaban akhir (66 bocor; 6 atau 166 tidak)."""
    if answer is None or isinstance(answer, (list, dict, bool)):
        return False
    try:
        target = float(str(answer).replace(",", "."))
    except ValueError:
        return False
    return any(float(n) == target for n in _numbers(reply))


def trim_sentences(reply, limit=MAX_SENTENCES):
    parts = re.findall(r"[^.!?]+[.!?]*", (reply or "").strip())
    return " ".join(s.strip() for s in parts[:limit] if s.strip())


def finalize(reply, payload):
    """Balasan siap tampil, atau None (frontend memakai petunjuk L2)."""
    text = trim_sentences(reply)
    if not text or leaks_answer(text, payload.get("answer")):
        return None
    return text
