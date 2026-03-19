from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from agents import AGENTS, route_message, team_overview


BASE_DIR = Path(__file__).resolve().parent


def load_dotenv() -> None:
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Falta la variable de entorno {name}")
    return value


def allowed_chat_ids() -> set[int]:
    raw = os.getenv("TELEGRAM_ALLOWED_CHAT_IDS", "").strip()
    if not raw:
        return set()
    return {int(part.strip()) for part in raw.split(",") if part.strip()}


def telegram_api(method: str, token: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    url = f"https://api.telegram.org/bot{token}/{method}"
    data = None
    headers = {}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = Request(url, data=data, headers=headers, method="POST" if payload is not None else "GET")
    with urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def send_message(token: str, chat_id: int, text: str) -> None:
    telegram_api(
        "sendMessage",
        token,
        {
            "chat_id": chat_id,
            "text": text,
        },
    )


def get_updates(token: str, offset: int | None) -> list[dict[str, Any]]:
    params = {
        "timeout": 30,
        "allowed_updates": ["message"],
    }
    if offset is not None:
        params["offset"] = offset

    query = urlencode(params, doseq=True)
    url = f"https://api.telegram.org/bot{token}/getUpdates?{query}"
    request = Request(url, method="GET")
    with urlopen(request, timeout=60) as response:
        body = json.loads(response.read().decode("utf-8"))
    if not body.get("ok"):
        raise RuntimeError(f"Telegram devolvio error: {body}")
    return body.get("result", [])


def parse_command(text: str, team_name: str) -> str:
    stripped = text.strip()
    if not stripped:
        return "Mensaje vacio."

    if stripped.startswith("/start"):
        return (
            f"Bienvenido a {team_name}.\n\n"
            "Usa /team para ver el equipo o /ask <agente> <mensaje> para escribir a un rol."
        )

    if stripped.startswith("/help"):
        return (
            "Comandos disponibles:\n"
            "/team\n"
            "/ask david mensaje\n"
            "/ask marc mensaje\n"
            "/ask francesc mensaje\n"
            "/broadcast mensaje"
        )

    if stripped.startswith("/team"):
        return team_overview()

    if stripped.startswith("/ask "):
        parts = stripped.split(maxsplit=2)
        if len(parts) < 3:
            return "Formato: /ask <david|marc|francesc> <mensaje>"
        return route_message(parts[1], parts[2], team_name)

    if stripped.startswith("/broadcast "):
        message = stripped[len("/broadcast ") :].strip()
        if not message:
            return "Formato: /broadcast <mensaje>"
        responses = [
            route_message(agent_key, message, team_name)
            for agent_key in AGENTS
        ]
        return "\n\n".join(responses)

    return (
        "No reconozco ese comando.\n"
        "Prueba con /help para ver las opciones disponibles."
    )


def handle_update(update: dict[str, Any], token: str, valid_chats: set[int], team_name: str) -> None:
    message = update.get("message", {})
    chat = message.get("chat", {})
    chat_id = chat.get("id")
    text = message.get("text", "")

    if not chat_id or not text:
        return

    if valid_chats and chat_id not in valid_chats:
        send_message(token, chat_id, "Chat no autorizado para este bot.")
        return

    reply = parse_command(text, team_name)
    send_message(token, chat_id, reply)


def main() -> int:
    load_dotenv()

    try:
        token = required_env("TELEGRAM_BOT_TOKEN")
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    valid_chats = allowed_chat_ids()
    team_name = os.getenv("ADMIRA_TEAM_NAME", "Admira Next").strip() or "Admira Next"
    offset: int | None = None

    print(f"Bot de Telegram listo para {team_name}.")
    while True:
        try:
            updates = get_updates(token, offset)
            for update in updates:
                offset = update["update_id"] + 1
                handle_update(update, token, valid_chats, team_name)
        except (HTTPError, URLError, TimeoutError) as exc:
            print(f"Error de red con Telegram: {exc}", file=sys.stderr)
            time.sleep(3)
        except KeyboardInterrupt:
            print("\nBot detenido.")
            return 0
        except Exception as exc:  # noqa: BLE001
            print(f"Error inesperado: {exc}", file=sys.stderr)
            time.sleep(3)


if __name__ == "__main__":
    raise SystemExit(main())
