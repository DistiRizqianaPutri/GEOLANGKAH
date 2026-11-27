import pytest

from api._shared.tutor_core import MAX_QUESTIONS, TutorError, build_messages, finalize, leaks_answer, trim_sentences, validate

BASE = {
    "step_id": "m3-latih-02",
    "phase": "latih",
    "title": "Lengkapi langkahnya",
    "prompt": "Isi kotak yang kosong, lalu hitung luasnya.",
    "problem": {"shape": "trapezoid", "ask": "area", "unit": "cm", "a": 10, "b": 6, "t": 4},
    "answer": 32,
    "student_answer": "64",
    "hint_level": 2,
    "question": "Kenapa jawabanku salah?",
    "asked": 0,
}


def test_validate_drops_unknown_keys():
    clean = validate({**BASE, "student_code": "S01", "nickname": "x"})
    assert "student_code" not in clean and "nickname" not in clean


@pytest.mark.parametrize("change", [{"hint_level": 1}, {"asked": MAX_QUESTIONS}, {"phase": "lain"}, {"question": "  "}])
def test_validate_rejects(change):
    with pytest.raises(TutorError):
        validate({**BASE, **change})


@pytest.mark.parametrize("phase, word", [("kenali", "label"), ("bangun", "pola"), ("latih", "kewajaran"), ("tantangan", "kewajaran")])
def test_prompt_follows_phase(phase, word):
    system = build_messages(validate({**BASE, "phase": phase}))[0]["content"]
    assert word in system and "JANGAN PERNAH" in system


def test_answer_not_sent_to_model():
    text = " ".join(m["content"] for m in build_messages(validate({**BASE, "answer": 9876})))
    assert "9876" not in text and "a = 10" in text


def test_leaks_answer():
    assert leaks_answer("Luasnya 32 cm².", 32)
    assert leaks_answer("Hasilnya 6,5 cm.", 6.5)
    assert not leaks_answer("Berapa 3 + 2?", 32)
    assert not leaks_answer("Coba 320 dibagi 10.", 32)
    assert not leaks_answer("Apa saja?", ["a", "b"])


def test_trim_sentences():
    assert trim_sentences("Satu. Dua? Tiga!") == "Satu. Dua?"


def test_finalize_falls_back_on_leak_or_empty():
    p = validate(BASE)
    assert finalize("Luasnya 32 cm². Benar?", p) is None
    assert finalize(None, p) is None
    assert finalize("Sisi sejajar mana yang dijumlahkan? Coba lihat gambar.", p)
