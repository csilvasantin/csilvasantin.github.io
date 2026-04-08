"""AdmiraNext Demo Server — proxy local para el Council Dashboard.

Sirve en localhost:3031 los endpoints que admiranext.html espera en modo DEMO:
  GET  /ping                      -> health check
  GET  /status                    -> estado de maquinas (proxy a Tailscale API o GitHub)
  POST /toggle/{machineId}        -> cambia estado online/offline (local)
  POST /power/{machineId}         -> sleep/wake via SSH + WoL
  GET  /screenshot/{machineId}    -> captura de pantalla via SSH

Requisitos: python 3.9+, sin dependencias externas.
"""

import http.server
import json
import subprocess
import threading
import time
import urllib.request
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 3032

# URLs de datos
TAILSCALE_API = "https://macmini.tail48b61c.ts.net/api/machines"
GITHUB_FALLBACK = "https://raw.githubusercontent.com/csilvasantin/AdmiraNext-Team/main/data/machines.json"

# Estado local (overrides por toggle manual)
local_overrides: dict[str, str] = {}

# Cache de machines.json
machines_cache = {"data": None, "ts": 0}
CACHE_TTL = 5  # seconds


def fetch_machines():
    now = time.time()
    if machines_cache["data"] and (now - machines_cache["ts"]) < CACHE_TTL:
        return machines_cache["data"]

    for url in [TAILSCALE_API, GITHUB_FALLBACK]:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "AdmiraNext-DemoServer/1.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                machines_cache["data"] = data
                machines_cache["ts"] = now
                return data
        except Exception:
            continue
    return machines_cache.get("data") or {"machines": []}


def get_machine_ssh(machine_id):
    """Busca IP y user SSH para un machineId."""
    data = fetch_machines()
    machines = data.get("machines", [])
    for m in machines:
        if m.get("id") == machine_id:
            ssh = m.get("ssh", {})
            return ssh.get("user", "csilvasantin"), ssh.get("ip_tailscale", "")
    return None, None


CONTROL_AGENT_PORT = 3030


def take_screenshot(machine_id, full=False):
    """Captura pantalla: local con screencapture, remoto via control-agent."""
    user, ip = get_machine_ssh(machine_id)
    if not ip:
        return None

    # Para el Mac Mini local, captura directa
    if ip == "100.74.101.14" or machine_id == "admira-macmini":
        try:
            tmp = f"/tmp/screenshot_{machine_id}.jpg"
            subprocess.run(
                ["screencapture", "-x", "-t", "jpg", "-m", tmp],
                timeout=5, capture_output=True
            )
            if os.path.exists(tmp):
                with open(tmp, "rb") as f:
                    return f.read()
        except Exception:
            pass
        return None

    # Para maquinas remotas: pedir al control-agent del Mac Mini (localhost:3030)
    # que centraliza capturas de todas las maquinas via SSH+ScreenCaptureKit.
    # Si falla, intentar el control-agent remoto de esa maquina.
    for url in [
        f"http://localhost:{CONTROL_AGENT_PORT}/api/screenshots/{machine_id}",
        f"http://{ip}:{CONTROL_AGENT_PORT}/api/screenshots/{machine_id}",
    ]:
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = resp.read()
                if len(data) > 100:  # Imagen valida
                    return data
        except Exception:
            continue
    return None


def send_sleep(machine_id):
    """Envia pmset sleepnow via SSH."""
    user, ip = get_machine_ssh(machine_id)
    if not ip:
        return False
    try:
        subprocess.run(
            ["ssh", "-o", "ConnectTimeout=3", "-o", "StrictHostKeyChecking=no",
             f"{user}@{ip}", "sudo pmset sleepnow"],
            timeout=8, capture_output=True
        )
        return True
    except Exception:
        return False


def send_wake(machine_id):
    """Envia WoL o intenta SSH para despertar."""
    user, ip = get_machine_ssh(machine_id)
    if not ip:
        return False
    # Intentar SSH (si esta dormida pero no apagada, puede despertar)
    try:
        subprocess.run(
            ["ssh", "-o", "ConnectTimeout=3", "-o", "StrictHostKeyChecking=no",
             f"{user}@{ip}", "caffeinate -u -t 5"],
            timeout=8, capture_output=True
        )
        return True
    except Exception:
        return False


class DemoHandler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json_response(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        qs = parse_qs(parsed.query)

        if path == "/ping":
            self._json_response({"ok": True})

        elif path == "/status":
            data = fetch_machines()
            # Aplicar overrides locales
            for m in data.get("machines", []):
                mid = m.get("id", "")
                if mid in local_overrides:
                    m["status"] = local_overrides[mid]
            self._json_response(data)

        elif path.startswith("/screenshot/"):
            machine_id = path.split("/screenshot/")[1]
            full = "full" in qs or qs.get("full", ["0"])[0] == "1"
            img_data = take_screenshot(machine_id, full=full)
            if img_data:
                self.send_response(200)
                self.send_header("Content-Type", "image/jpeg")
                self.send_header("Cache-Control", "no-cache")
                self._cors()
                self.end_headers()
                self.wfile.write(img_data)
            else:
                self.send_response(404)
                self._cors()
                self.end_headers()

        else:
            self.send_response(404)
            self._cors()
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        content_length = int(self.headers.get("Content-Length", 0))
        body = {}
        if content_length > 0:
            raw = self.rfile.read(content_length)
            try:
                body = json.loads(raw)
            except Exception:
                pass

        if path.startswith("/toggle/"):
            machine_id = path.split("/toggle/")[1]
            new_status = body.get("status", "online")
            local_overrides[machine_id] = new_status
            self._json_response({"ok": True, "machine": machine_id, "status": new_status})

        elif path.startswith("/power/"):
            machine_id = path.split("/power/")[1]
            action = body.get("action", "wake")
            if action == "sleep":
                ok = send_sleep(machine_id)
                if ok:
                    local_overrides[machine_id] = "offline"
            else:
                ok = send_wake(machine_id)
                if ok:
                    local_overrides.pop(machine_id, None)
            self._json_response({"ok": ok, "machine": machine_id, "action": action})

        else:
            self._json_response({"error": "not found"}, 404)

    def log_message(self, format, *args):
        print(f"[demo-server] {args[0]}")


class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True


def main():
    server = ReusableHTTPServer(("0.0.0.0", PORT), DemoHandler)
    print(f"AdmiraNext Demo Server corriendo en http://localhost:{PORT}")
    print(f"Endpoints: /ping, /status, /toggle/{{id}}, /power/{{id}}, /screenshot/{{id}}")
    print("Ctrl+C para parar")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nDemo server parado.")
        server.server_close()


if __name__ == "__main__":
    main()
