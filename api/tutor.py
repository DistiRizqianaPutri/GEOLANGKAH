"""Tutor AI (Vercel, Python) — ARSITEKTUR §9, PRD F-16, RMT.md §7.

POST /api/tutor  body JSON: {step_id, phase, title, prompt, problem, answer, student_answer,
                             hint_level, question, asked}
-> {"reply": "..."} atau {"fallback": true} (frontend lalu menampilkan petunjuk L2).

Memanggil https://api.deepseek.com (format OpenAI). Kunci & model hanya dari env server:
DEEPSEEK_API_KEY, DEEPSEEK_MODEL. Tidak menerima/mengirim kode atau nama siswa.
"""

import json
import os
import sys
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _shared.tutor_core import TutorError, build_messages, finalize, validate  # noqa: E402

API_URL = "https://api.deepseek.com/chat/completions"
MAX_BODY = 8000


def _ask_deepseek(messages):
    key, model = os.environ.get("DEEPSEEK_API_KEY"), os.environ.get("DEEPSEEK_MODEL")
    if not key or not model:
        return None
    req = urllib.request.Request(
        API_URL,
        method="POST",
        data=json.dumps({"model": model, "messages": messages, "max_tokens": 120, "temperature": 0.3, "stream": False}).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read().decode())
        return data["choices"][0]["message"]["content"]
    except (urllib.error.URLError, TimeoutError, KeyError, IndexError, ValueError):
        return None


def respond(raw_body):
    """(status, dict) — dipisah dari HTTP agar mudah dibaca."""
    try:
        payload = validate(json.loads(raw_body or b"null"))
    except (TutorError, ValueError) as err:
        return 400, {"error": str(err), "fallback": True}
    reply = finalize(_ask_deepseek(build_messages(payload)), payload)
    return 200, ({"reply": reply} if reply else {"fallback": True})


class handler(BaseHTTPRequestHandler):  # noqa: N801 — nama wajib dari Vercel
    def do_POST(self):  # noqa: N802
        length = min(int(self.headers.get("Content-Length") or 0), MAX_BODY)
        status, body = respond(self.rfile.read(length))
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
