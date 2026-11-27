"""Fungsi ekspor peneliti (Vercel, Python) — ARSITEKTUR §8, PRD F-14.

GET /api/export?table=step_logs|test_answers|leppink[&include_test=1] -> CSV
GET /api/export?summary=1[&include_test=1]                           -> JSON ringkasan
GET /api/export?key=1                                                -> JSON kunci & pedoman skor

Wajib `Authorization: Bearer <JWT peneliti>`. JWT diteruskan ke Supabase REST bersama
anon key, jadi RLS tetap berlaku. TIDAK memakai service_role. Hanya pustaka standar.
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _shared.export_core import TABLES, flatten, select_param, to_csv  # noqa: E402
from _shared.scoring import summarize  # noqa: E402

PAGE = 1000
KEY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_shared", "test_key.json")


class HttpError(Exception):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status


def _config():
    url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")
    if not url or not key:
        raise HttpError(500, "SUPABASE_URL / SUPABASE_ANON_KEY belum diatur di Vercel")
    return url.rstrip("/"), key


def _request(path, token, *, method="GET", body=None, headers=None):
    url, anon = _config()
    req = urllib.request.Request(
        f"{url}{path}",
        method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={"apikey": anon, "Authorization": f"Bearer {token}", "Content-Type": "application/json", **(headers or {})},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return json.loads(res.read().decode() or "null")
    except urllib.error.HTTPError as err:
        if err.code in (401, 403):
            raise HttpError(401, "sesi tidak sah") from err
        raise HttpError(502, f"Supabase {err.code}") from err
    except urllib.error.URLError as err:
        raise HttpError(502, "Supabase tidak terjangkau") from err


def _require_researcher(token):
    if _request("/rest/v1/rpc/is_researcher", token, method="POST", body={}) is not True:
        raise HttpError(403, "bukan akun peneliti")


def _fetch_all(table, token):
    source, _ = TABLES[table]
    q = urllib.parse.urlencode({"select": select_param(table), "order": "id.asc"})
    rows, start = [], 0
    while True:
        page = _request(f"/rest/v1/{source}?{q}", token, headers={"Range-Unit": "items", "Range": f"{start}-{start + PAGE - 1}"})
        rows.extend(page)
        if len(page) < PAGE:
            return rows
        start += PAGE


def respond(query, auth_header):
    """(status, content_type, body, filename|None) — dipisah dari HTTP agar mudah dibaca."""
    token = (auth_header or "").removeprefix("Bearer ").strip()
    if not token:
        raise HttpError(401, "butuh Authorization: Bearer <JWT peneliti>")
    _require_researcher(token)
    include_test = query.get("include_test") == "1"

    if query.get("key") == "1":
        with open(KEY_FILE, encoding="utf-8") as f:
            data = json.load(f)
        return 200, "application/json", json.dumps({"guide": data["guide"], "keys": data["keys"]}, ensure_ascii=False), None

    if query.get("summary") == "1":
        tests = flatten(_fetch_all("test_answers", token), include_test)
        lep = flatten(_fetch_all("leppink", token), include_test)
        return 200, "application/json", json.dumps(summarize(tests, lep, include_test), ensure_ascii=False), None

    table = query.get("table")
    if table not in TABLES:
        raise HttpError(400, "parameter table harus step_logs, test_answers, atau leppink")
    rows = flatten(_fetch_all(table, token), include_test)
    return 200, "text/csv; charset=utf-8", "﻿" + to_csv(table, rows), f"{table}.csv"


class handler(BaseHTTPRequestHandler):  # noqa: N801 — nama wajib dari Vercel
    def do_GET(self):  # noqa: N802
        query = {k: v[-1] for k, v in urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query).items()}
        try:
            status, ctype, body, filename = respond(query, self.headers.get("Authorization"))
        except HttpError as err:
            status, ctype, body, filename = err.status, "application/json", json.dumps({"error": str(err)}), None
        data = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
