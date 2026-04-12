#!/usr/bin/env python3
"""
Micro servidor local para ejecutar actualizar.sh desde el portal.
Escucha en localhost:7891 y responde a peticiones del botón Actualizar Tareas.
"""

import subprocess
import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

SCRIPT = os.path.expanduser("~/GitHub/00.-csilvasantin.github.io/assets/actualizar.sh")

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == "/ping":
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode())
            return

        if self.path == "/actualizar":
            print(f"[{datetime.now():%H:%M:%S}] Ejecutando actualizar.sh...")
            try:
                result = subprocess.run(
                    ["bash", SCRIPT],
                    capture_output=True, text=True, timeout=300
                )
                repos = 0
                for line in result.stdout.splitlines() + result.stderr.splitlines():
                    if "commit + push" in line or "repos actualizado" in line:
                        repos += 1

                # Leer el JSON de estado generado por el script
                estado_file = os.path.expanduser(
                    "~/GitHub/00.-csilvasantin.github.io/assets/ultima-actualizacion.json"
                )
                estado = {}
                if os.path.exists(estado_file):
                    with open(estado_file) as f:
                        estado = json.load(f)

                respuesta = {
                    "status": "ok",
                    "fecha": estado.get("fecha", ""),
                    "hora": estado.get("hora", ""),
                    "repos": estado.get("repos", 0),
                    "log": result.stdout[-500:] if result.stdout else "",
                }
                print(f"[{datetime.now():%H:%M:%S}] Hecho: {estado.get('repos', 0)} repos")
            except subprocess.TimeoutExpired:
                respuesta = {"status": "error", "msg": "Timeout (5 min)"}
            except Exception as e:
                respuesta = {"status": "error", "msg": str(e)}

            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(respuesta).encode())
            return

        self.send_response(404)
        self.end_headers()

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")

    def log_message(self, format, *args):
        pass  # silenciar logs HTTP


if __name__ == "__main__":
    port = 7891
    server = HTTPServer(("127.0.0.1", port), Handler)
    print(f"Actualizar server escuchando en http://localhost:{port}")
    print(f"  /ping        — comprobar que esta vivo")
    print(f"  /actualizar  — ejecutar actualizar.sh")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor parado.")
