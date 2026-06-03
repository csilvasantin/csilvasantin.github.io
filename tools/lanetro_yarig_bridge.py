#!/usr/bin/env python3
"""Local HTTP bridge between Pixeria Tool, Yarig.ai, and LaMetric TIME."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lametric_write import LaMetricConfigError, send_notification  # noqa: E402


DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 9135
DEFAULT_YARIG_BASE = "http://127.0.0.1:9124/yarig"
ALLOWED_YARIG_POSTS = {"/task/open", "/task/close", "/clocking"}


def json_bytes(data: object) -> bytes:
    return json.dumps(data, ensure_ascii=False).encode("utf-8")


def normalize_base_url(value: Optional[str]) -> str:
    base = (value or DEFAULT_YARIG_BASE).strip().rstrip("/")
    if not base.startswith(("http://", "https://")):
        raise ValueError("Yarig base URL must start with http:// or https://")
    return base


def fetch_json(url: str, *, method: str = "GET", payload: Optional[object] = None, timeout: float = 8.0) -> object:
    body = None if payload is None else json_bytes(payload)
    request = urllib.request.Request(
        url,
        data=body,
        method=method,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            text = response.read().decode("utf-8", errors="replace")
            return json.loads(text) if text else {}
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{url} returned HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"{url} connection failed: {error.reason}") from error


def read_request_json(handler: BaseHTTPRequestHandler) -> dict:
    size = int(handler.headers.get("Content-Length", "0") or 0)
    if size <= 0:
        return {}
    raw = handler.rfile.read(size).decode("utf-8", errors="replace")
    return json.loads(raw) if raw else {}


class LanetroHandler(BaseHTTPRequestHandler):
    server_version = "LanetroBridge/1.0"

    def log_message(self, format: str, *args: object) -> None:
        if self.server.quiet:  # type: ignore[attr-defined]
            return
        super().log_message(format, *args)

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, status: HTTPStatus, data: object) -> None:
        body = json_bytes(data)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        try:
            if parsed.path == "/api/health":
                self.handle_health()
                return
            if parsed.path == "/api/snapshot":
                self.handle_snapshot(parsed)
                return
            self.send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Unknown endpoint."})
        except Exception as error:
            self.send_json(HTTPStatus.BAD_GATEWAY, {"ok": False, "error": str(error)})

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        try:
            if parsed.path == "/api/write":
                self.handle_write()
                return
            if parsed.path == "/api/yarig":
                self.handle_yarig_post()
                return
            self.send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Unknown endpoint."})
        except LaMetricConfigError as error:
            self.send_json(HTTPStatus.SERVICE_UNAVAILABLE, {"ok": False, "error": str(error)})
        except Exception as error:
            self.send_json(HTTPStatus.BAD_GATEWAY, {"ok": False, "error": str(error)})

    def handle_health(self) -> None:
        host = os.getenv("LAMETRIC_HOST", "")
        self.send_json(
            HTTPStatus.OK,
            {
                "ok": True,
                "port": self.server.server_port,  # type: ignore[attr-defined]
                "lametric_host": host or None,
                "lametric_ready": bool(host and os.getenv("LAMETRIC_API_KEY")),
                "yarig_default": os.getenv("YARIG_BASE", DEFAULT_YARIG_BASE),
            },
        )

    def handle_snapshot(self, parsed: urllib.parse.ParseResult) -> None:
        query = urllib.parse.parse_qs(parsed.query)
        base = normalize_base_url(query.get("yarig", [os.getenv("YARIG_BASE", DEFAULT_YARIG_BASE)])[0])
        today = fetch_json(f"{base}/today")
        try:
            score = fetch_json(f"{base}/score")
        except Exception:
            score = None
        try:
            status = fetch_json(f"{base}/status")
        except Exception:
            status = None
        self.send_json(HTTPStatus.OK, {"ok": True, "today": today, "score": score, "status": status})

    def handle_write(self) -> None:
        data = read_request_json(self)
        text = str(data.get("text", "")).strip()
        if not text:
            self.send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Missing text."})
            return
        result = send_notification(
            text[:220],
            icon=str(data.get("icon") or os.getenv("LAMETRIC_ICON", "a2867")),
            priority=str(data.get("priority") or os.getenv("LAMETRIC_PRIORITY", "info")),
            sound=data.get("sound") or os.getenv("LAMETRIC_SOUND"),
        )
        self.send_json(HTTPStatus.OK, {"ok": True, "result": result})

    def handle_yarig_post(self) -> None:
        data = read_request_json(self)
        base = normalize_base_url(str(data.get("yarig") or os.getenv("YARIG_BASE", DEFAULT_YARIG_BASE)))
        path = str(data.get("path") or "")
        if path not in ALLOWED_YARIG_POSTS:
            self.send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Yarig path is not allowed."})
            return
        payload = data.get("payload")
        result = fetch_json(f"{base}{path}", method="POST", payload=payload if isinstance(payload, dict) else {})
        self.send_json(HTTPStatus.OK, {"ok": True, "result": result})


class LanetroServer(ThreadingHTTPServer):
    quiet: bool = False


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the local Lanetro bridge.")
    parser.add_argument("--host", default=os.getenv("LANETRO_BRIDGE_HOST", DEFAULT_HOST))
    parser.add_argument("--port", type=int, default=int(os.getenv("LANETRO_BRIDGE_PORT", str(DEFAULT_PORT))))
    parser.add_argument("--quiet", action="store_true", help="Disable request logs.")
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    server = LanetroServer((args.host, args.port), LanetroHandler)
    server.quiet = args.quiet
    print(f"Lanetro bridge listening on http://{args.host}:{args.port}")
    print("Set LAMETRIC_HOST and LAMETRIC_API_KEY before using /api/write.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nLanetro bridge stopped.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
