# 2026-05-02 · Pixer.ai × Admira.xp — Handoff (r5 → r23)

Sesión maratón sobre Pixer.ai. Cerramos el día en **v.2026.05.02-r23** con los 4 motores conectados a APIs reales y dos pendientes claros para mañana.

## Versión final pública

https://csilvasantin.github.io/pixer-ai-content/v.2026.05.02-r23/

## Lo que hay funcionando hoy

### Tema visual (r9–r14, r18)
- Paleta fósforo verde Matrix `#00ff41`, fuente JetBrains Mono, glow text-shadow, scanlines CRT.
- Digital rain de katakana en canvas de fondo (`matrix-rain.js`).
- 1 GIF Matrix por página servido desde Wikimedia Commons (libres) — float right + clearfix (sin huecos).
- Botón ✨ CREAR / ▶ REPRODUCIR DE NUEVO con animación de pulso.
- Selectores, modal de keys, todo en estilo terminal.

### Audio
- Default: Web Speech API (gratis, navegador).
- PRO: **ElevenLabs v2** vía worker `pixer-eleven`. Cuenta usuario en Free Tier bloqueada (`detected_unusual_activity`); upgrade a Starter $5/mes desbloquea.

### Música (r23)
- Default: **Pixer Loop** (Web Audio API, pentatónica Cm in-browser, gratis).
- PRO: **Suno (local)** y **Suno v4.5 (local)** vía proxy `suno-local` en `localhost:3777`.
- Falta arrancar el server local (ver "Pendiente para mañana").

### Imágenes (r21)
- Default: **FLUX.1 schnell** vía Pollinations (gratis).
- PRO: **Grok Imagine** ($0.02/img) y **Grok Imagine Pro** ($0.07/img) vía worker. **Verificado funcionando** (la xAI Image renombró `grok-2-image` → `grok-imagine-image`).

### Video (r22)
- Default: **Pixer Storyboard** (3 escenas Pollinations + crossfade + voz TTS, gratis).
- PRO: **Grok Imagine Video** vía worker, async con polling cada 3s, barra de progreso animada con ETA.
- Runway/Sora marcados "sin CORS" (abren tab).

### Plataforma
- Botón prominente **▶ LANZAR ADMIRAXPERIENCE GAME** apuntando a `https://csilvasantin.github.io/01.-AdmiraXperience-Game/` (verificada como última versión hoy).

### Defaults editables
- Toda la app pre-rellena valores razonables al cargar (cliente "Demo Pixer.ai", audio "Esto es una prueba" en es-ES tono Cercano, etc.). Persisten en localStorage.

### Menú simplificado (r17)
- Quitado "Inicio" (logo retorna a home) y "Plataforma" (sigue accesible vía card del home).
- Final: Audio · Música · Imágenes · Video · Admira.xp.

### UX (r22)
- Barras de progreso animadas en TODAS las llamadas largas (Grok video, Grok imagen, ElevenLabs, Suno) con ETA estimado y contador en segundos.

## Infraestructura nueva

### Cloudflare Worker `pixer-eleven`
- URL: https://pixer-eleven.csilvasantin.workers.dev
- Carpeta local: `~/Documents/New project/csilvasantin-repos/pixer-worker/`
- Endpoints:
  - `GET /healthz` → estado de keys
  - `POST /tts` → ElevenLabs
  - `POST /xai/image` → Grok image
  - `POST /xai/video` → Grok video start
  - `GET /xai/video/{id}` → poll
- CORS restringido a `csilvasantin.github.io` + localhost.
- Secrets cargados: `ELEVENLABS_KEY`, `XAI_KEY`. Rotación: `npx wrangler secret put NOMBRE`.

### Servidor local `suno-local` (sin desplegar aún)
- Carpeta: `~/Documents/New project/csilvasantin-repos/suno-local/`
- Servidor Node nativo (sin dependencias) en `http://localhost:3777`.
- Lee `SUNO_COOKIE` de `.env`.
- Endpoints: `/healthz`, `/generate`, `/status?ids=...`.
- Refresca el JWT de Clerk automáticamente cada ~50s.
- Pixer.ai r23 ya lo invoca; falta arrancarlo.

### Hooks de sonido (`~/.claude/sounds/`)
- `mario.wav` y `ghosts.wav` generados con Python stdlib.
- 3 modos controlables con `notificame.sh {full|audio|off|toggle|status}`:
  - `full`: sonido + voz "MacBook Negro pendiente aprobar" + cuenta atrás 5s + Cmd+Enter automático
  - `audio`: solo sonido + voz
  - `off`: silencio
- Estado guardado en `~/.claude/sounds/.notify_mode`.
- Hooks: `Notification` → `aprobar.sh`, `Stop` → `finalizar.sh`.
- Estado actual cuando termine la sesión: ver `notificame.sh status`.
- Cmd+Enter requiere Accesibilidad concedida a Claude.app en Ajustes → Privacidad y Seguridad.

## Pendiente para mañana

### 1. Arrancar `suno-local` y validar end-to-end
```bash
cd "/Users/csilvasantin/Documents/New project/csilvasantin-repos/suno-local"
cp .env.example .env
# Extraer cookie de suno.com (ver README.md)
# Pegar como: SUNO_COOKIE="..."
node server.js
# En otra terminal: curl http://localhost:3777/healthz
```
Después abrir https://csilvasantin.github.io/pixer-ai-content/v.2026.05.02-r23/musica.html, seleccionar Suno (local), pulsar ✨ CREAR.

Riesgo: Suno puede pedir hCaptcha — si pasa, el script sin captcha falla y habría que cambiar a `gcui-art/suno-api` con 2Captcha (~$3 inicial).

### 2. Lyria 3 en lugar de Udio
El usuario pidió Udio inicialmente; sugirió "Gemma 4" pensando que hace música. Aclarado que **Gemma es LLM de texto**, lo de Google que genera música es **Lyria 3** vía Vertex AI. Plan acordado:
- Comprobar si tiene proyecto GCP con Vertex AI activo.
- Si sí: extender el worker `pixer-eleven` con `/lyria/generate` usando OAuth2 + service account JSON como secret `GCP_SA_KEY`.
- Si no: guiarle paso a paso en setup GCP + habilitar Lyria 3 (preview) + descargar SA key.
- Añadir motor `lyria-3` y `lyria-3-pro` al catálogo de Música.

### 3. (Opcional) Rutina remota `/notifícame`
La skill `/schedule` cayó dos veces hoy. Reintentar para crear una rutina manual que invoque `bash ~/.claude/sounds/notificame.sh "${ARG:-toggle}"`. Mientras tanto el script local funciona.

### 4. ElevenLabs desbloqueo
El usuario tiene que decidir: pagar Starter $5/mes o contactar soporte para desbloquear el Free Tier. La integración del worker está completa y testeada — solo el lado de ElevenLabs está bloqueado.

## Versiones publicadas hoy

| | Cambio |
|---|---|
| r6 | Plataforma operativa con briefs JSON |
| r7 | Multi-página con cabecera común |
| r8 | Selector de motor IA por sección |
| r9 | Tema Matrix (rain + fósforo + mono + scanlines) |
| r10 | Defaults editables + botón REPRODUCIR (TTS / Web Audio / Pollinations) |
| r11 | Aviso PRO + modal API keys + ElevenLabs/Grok directos |
| r12 | Pixer Storyboard (video gratuito real) |
| r13 | Botón CREAR + previo limitado a 55vh |
| r14 | 1 GIF Matrix por página (Wikimedia) |
| r15 | Plataforma con CTA al juego AdmiraXperience |
| r16 | Grok Imagine Video integrado |
| r17 | Menú limpio (sin Inicio ni Plataforma) |
| r18 | Fix hueco vertical bajo cabeceras |
| r19 | ElevenLabs vía worker pixer-eleven |
| r20 | Grok image+video vía worker |
| r21 | Modelo grok-imagine-image (renombrado por xAI) |
| r22 | Barras de progreso animadas |
| **r23** | **Suno (local proxy) integrado en Música** |

## Otros descargas/utilidades del día

- `yt-dlp` usado para bajar audio MP3 de 2 vídeos de George Michael en `~/Downloads/yt-audio/`.
