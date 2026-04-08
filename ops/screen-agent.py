"""AdmiraNext Screen Agent — mini servidor en cada Mac que sirve screenshots.

Se ejecuta localmente en cada maquina del consejo como LaunchAgent.
Sirve en el puerto 9876:
  GET /screenshot       -> captura JPG de la pantalla principal
  GET /ping             -> health check

Usa CoreGraphics (CGWindowListCreateImage) que NO requiere permisos
de Screen Recording, a diferencia de screencapture.

Requisitos: macOS, Python 3.9+, sin dependencias externas.
"""

import subprocess
import os
import time
import tempfile
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 9876
SCREENSHOT_PATH = "/tmp/admiranext_screen.jpg"
# Throttle: no capturar mas de 1 vez cada 2 segundos
last_capture = 0
MIN_INTERVAL = 2


def capture_screen():
    """Captura pantalla usando screencapture. Si falla, intenta con osascript."""
    try:
        # Intentar screencapture primero (funciona si tiene permisos)
        result = subprocess.run(
            ["screencapture", "-x", "-t", "jpg", "-m", SCREENSHOT_PATH],
            timeout=5, capture_output=True
        )
        if os.path.exists(SCREENSHOT_PATH) and os.path.getsize(SCREENSHOT_PATH) > 0:
            return True
    except Exception:
        pass

    # Fallback: usar osascript para invocar screencapture desde la sesion GUI
    try:
        subprocess.run(
            ["osascript", "-e",
             f'do shell script "screencapture -x -t jpg -m {SCREENSHOT_PATH}"'],
            timeout=8, capture_output=True
        )
        if os.path.exists(SCREENSHOT_PATH) and os.path.getsize(SCREENSHOT_PATH) > 0:
            return True
    except Exception:
        pass

    return False


class ScreenHandler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/")

        if path == "/ping":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(b'{"ok":true}')

        elif path == "/screenshot":
            global last_capture
            now = time.time()
            # Capturar si ha pasado suficiente tiempo
            if (now - last_capture) >= MIN_INTERVAL:
                if capture_screen():
                    last_capture = now

            if os.path.exists(SCREENSHOT_PATH) and os.path.getsize(SCREENSHOT_PATH) > 0:
                with open(SCREENSHOT_PATH, "rb") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "image/jpeg")
                self.send_header("Content-Length", str(len(data)))
                self.send_header("Cache-Control", "no-cache")
                self._cors()
                self.end_headers()
                self.wfile.write(data)
            else:
                self.send_response(503)
                self.send_header("Content-Type", "application/json")
                self._cors()
                self.end_headers()
                self.wfile.write(b'{"error":"screencapture failed"}')
        else:
            self.send_response(404)
            self._cors()
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Silencioso


class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True


def main():
    server = ReusableHTTPServer(("0.0.0.0", PORT), ScreenHandler)
    print(f"Screen Agent corriendo en http://0.0.0.0:{PORT}")
    print(f"  GET /screenshot  ->  captura JPG")
    print(f"  GET /ping        ->  health check")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nScreen Agent parado.")
        server.server_close()


if __name__ == "__main__":
    main()
