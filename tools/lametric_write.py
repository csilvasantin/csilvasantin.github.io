#!/usr/bin/env python3
"""Send a local notification to a LaMetric TIME device."""

from __future__ import annotations

import argparse
import base64
import json
import os
import ssl
import sys
import urllib.error
import urllib.request
from typing import Optional


DEFAULT_ICON = "a2867"
DEFAULT_PRIORITY = "info"
DEFAULT_LIFETIME_MS = 120_000
VALID_MODES = {"auto", "notification", "push"}


class LaMetricConfigError(RuntimeError):
    """Raised when the local bridge is missing required LaMetric settings."""


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def build_payload(
    text: str,
    *,
    icon: str = DEFAULT_ICON,
    priority: str = DEFAULT_PRIORITY,
    lifetime_ms: int = DEFAULT_LIFETIME_MS,
    cycles: int = 1,
    sound: Optional[str] = None,
) -> dict:
    payload: dict = {
        "priority": priority,
        "lifeTime": lifetime_ms,
        "model": {
            "cycles": cycles,
            "frames": [
                {
                    "icon": icon,
                    "text": text,
                }
            ],
        },
    }
    if sound:
        payload["model"]["sound"] = {
            "category": "notifications",
            "id": sound,
            "repeat": 1,
        }
    return payload


def build_push_payload(text: str, *, icon: str = DEFAULT_ICON) -> dict:
    return {
        "frames": [
            {
                "icon": icon,
                "text": text,
            }
        ]
    }


def send_notification(
    text: str,
    *,
    host: Optional[str] = None,
    api_key: Optional[str] = None,
    protocol: Optional[str] = None,
    port: Optional[int] = None,
    icon: str = DEFAULT_ICON,
    priority: str = DEFAULT_PRIORITY,
    lifetime_ms: int = DEFAULT_LIFETIME_MS,
    cycles: int = 1,
    sound: Optional[str] = None,
    timeout: float = 8.0,
    verify_tls: Optional[bool] = None,
) -> dict:
    host = (host or os.getenv("LAMETRIC_HOST") or "").strip()
    api_key = api_key or os.getenv("LAMETRIC_API_KEY") or ""
    protocol = (protocol or os.getenv("LAMETRIC_PROTOCOL") or "http").strip().lower()

    if not host:
        raise LaMetricConfigError("Missing LAMETRIC_HOST.")
    if not api_key:
        raise LaMetricConfigError("Missing LAMETRIC_API_KEY.")
    if protocol not in {"http", "https"}:
        raise LaMetricConfigError("LAMETRIC_PROTOCOL must be http or https.")

    if port is None:
        env_port = os.getenv("LAMETRIC_PORT")
        port = int(env_port) if env_port else (4343 if protocol == "https" else 8080)
    if verify_tls is None:
        verify_tls = _env_bool("LAMETRIC_VERIFY_TLS", False)

    payload = build_payload(
        text,
        icon=icon,
        priority=priority,
        lifetime_ms=lifetime_ms,
        cycles=cycles,
        sound=sound,
    )
    body = json.dumps(payload).encode("utf-8")
    token = base64.b64encode(f"dev:{api_key}".encode("utf-8")).decode("ascii")
    url = f"{protocol}://{host}:{port}/api/v2/device/notifications"

    request = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Basic {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )

    context = None
    if protocol == "https" and not verify_tls:
        context = ssl._create_unverified_context()

    try:
        with urllib.request.urlopen(request, timeout=timeout, context=context) as response:
            response_body = response.read().decode("utf-8", errors="replace")
            parsed = json.loads(response_body) if response_body else {}
            return {
                "ok": 200 <= response.status < 300,
                "status": response.status,
                "url": url,
                "payload": payload,
                "response": parsed,
            }
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"LaMetric HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"LaMetric connection failed: {error.reason}") from error


def send_push_update(
    text: str,
    *,
    push_url: Optional[str] = None,
    access_token: Optional[str] = None,
    icon: str = DEFAULT_ICON,
    timeout: float = 8.0,
    verify_tls: Optional[bool] = None,
) -> dict:
    push_url = (push_url or os.getenv("LAMETRIC_PUSH_URL") or "").strip()
    access_token = access_token or os.getenv("LAMETRIC_PUSH_TOKEN") or os.getenv("LAMETRIC_ACCESS_TOKEN") or ""

    if not push_url:
        raise LaMetricConfigError("Missing LAMETRIC_PUSH_URL.")
    if not access_token:
        raise LaMetricConfigError("Missing LAMETRIC_PUSH_TOKEN.")
    if not push_url.startswith(("http://", "https://")):
        raise LaMetricConfigError("LAMETRIC_PUSH_URL must start with http:// or https://.")
    if verify_tls is None:
        verify_tls = _env_bool("LAMETRIC_VERIFY_TLS", False)

    payload = build_push_payload(text, icon=icon)
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        push_url,
        data=body,
        method="POST",
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-Access-Token": access_token,
        },
    )

    context = None
    if push_url.startswith("https://") and not verify_tls:
        context = ssl._create_unverified_context()

    try:
        with urllib.request.urlopen(request, timeout=timeout, context=context) as response:
            response_body = response.read().decode("utf-8", errors="replace")
            try:
                parsed = json.loads(response_body) if response_body else {}
            except json.JSONDecodeError:
                parsed = {"raw": response_body}
            return {
                "ok": 200 <= response.status < 300,
                "mode": "push",
                "status": response.status,
                "url": push_url,
                "payload": payload,
                "response": parsed,
            }
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"LaMetric push HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"LaMetric push connection failed: {error.reason}") from error


def send_text(
    text: str,
    *,
    mode: Optional[str] = None,
    host: Optional[str] = None,
    api_key: Optional[str] = None,
    protocol: Optional[str] = None,
    port: Optional[int] = None,
    push_url: Optional[str] = None,
    access_token: Optional[str] = None,
    icon: str = DEFAULT_ICON,
    priority: str = DEFAULT_PRIORITY,
    lifetime_ms: int = DEFAULT_LIFETIME_MS,
    cycles: int = 1,
    sound: Optional[str] = None,
    timeout: float = 8.0,
    verify_tls: Optional[bool] = None,
) -> dict:
    selected = (mode or os.getenv("LAMETRIC_MODE") or "auto").strip().lower()
    if selected not in VALID_MODES:
        raise LaMetricConfigError("LAMETRIC_MODE must be auto, notification, or push.")

    configured_push_url = push_url or os.getenv("LAMETRIC_PUSH_URL")
    configured_push_token = access_token or os.getenv("LAMETRIC_PUSH_TOKEN") or os.getenv("LAMETRIC_ACCESS_TOKEN")
    if selected == "push" or (selected == "auto" and configured_push_url and configured_push_token):
        return send_push_update(
            text,
            push_url=push_url,
            access_token=access_token,
            icon=icon,
            timeout=timeout,
            verify_tls=verify_tls,
        )

    result = send_notification(
        text,
        host=host,
        api_key=api_key,
        protocol=protocol,
        port=port,
        icon=icon,
        priority=priority,
        lifetime_ms=lifetime_ms,
        cycles=cycles,
        sound=sound,
        timeout=timeout,
        verify_tls=verify_tls,
    )
    result["mode"] = "notification"
    return result


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Write a notification to a local LaMetric TIME.")
    parser.add_argument("text", help="Text to show on the clock.")
    parser.add_argument("--mode", choices=sorted(VALID_MODES), default=os.getenv("LAMETRIC_MODE", "auto"))
    parser.add_argument("--host", default=os.getenv("LAMETRIC_HOST"), help="LaMetric IP or host.")
    parser.add_argument("--key", default=os.getenv("LAMETRIC_API_KEY"), help="LaMetric device API key.")
    parser.add_argument("--push-url", default=os.getenv("LAMETRIC_PUSH_URL"), help="LaMetric app local/cloud push URL from the developer portal.")
    parser.add_argument("--push-token", default=os.getenv("LAMETRIC_PUSH_TOKEN") or os.getenv("LAMETRIC_ACCESS_TOKEN"), help="LaMetric app X-Access-Token.")
    parser.add_argument("--protocol", choices=["http", "https"], default=os.getenv("LAMETRIC_PROTOCOL", "http"))
    parser.add_argument("--port", type=int, default=int(os.getenv("LAMETRIC_PORT", "0")) or None)
    parser.add_argument("--icon", default=os.getenv("LAMETRIC_ICON", DEFAULT_ICON))
    parser.add_argument("--priority", choices=["info", "warning", "critical"], default=os.getenv("LAMETRIC_PRIORITY", DEFAULT_PRIORITY))
    parser.add_argument("--lifetime-ms", type=int, default=int(os.getenv("LAMETRIC_LIFETIME_MS", str(DEFAULT_LIFETIME_MS))))
    parser.add_argument("--cycles", type=int, default=int(os.getenv("LAMETRIC_CYCLES", "1")))
    parser.add_argument("--sound", default=os.getenv("LAMETRIC_SOUND"))
    parser.add_argument("--timeout", type=float, default=float(os.getenv("LAMETRIC_TIMEOUT", "8")))
    parser.add_argument("--verify-tls", action="store_true", default=_env_bool("LAMETRIC_VERIFY_TLS", False))
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    try:
        result = send_text(
            args.text,
            mode=args.mode,
            host=args.host,
            api_key=args.key,
            push_url=args.push_url,
            access_token=args.push_token,
            protocol=args.protocol,
            port=args.port,
            icon=args.icon,
            priority=args.priority,
            lifetime_ms=args.lifetime_ms,
            cycles=args.cycles,
            sound=args.sound,
            timeout=args.timeout,
            verify_tls=args.verify_tls,
        )
    except Exception as error:
        print(json.dumps({"ok": False, "error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 1

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
