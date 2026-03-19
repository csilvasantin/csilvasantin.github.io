# Admira Next Telegram Bot

Bot de Telegram para hablar con el equipo de `Admira Next` desde un chat.

## Objetivo

Permitir una comunicacion simple por Telegram con los roles del equipo:

- `David Harvey`
- `Marc Bohr`
- `Francesc Locke`

## Estado

MVP funcional por `long polling`, sin dependencias externas obligatorias.

## Archivos

- `bot.py`: bucle principal del bot y comandos de Telegram
- `agents.py`: definicion de agentes y enrutado por rol
- `.env.example`: variables de entorno necesarias

## Variables de entorno

- `TELEGRAM_BOT_TOKEN`: token del bot creado con BotFather
- `TELEGRAM_ALLOWED_CHAT_IDS`: ids de chat permitidos, separados por comas
- `ADMIRA_TEAM_NAME`: nombre visible del equipo, por defecto `Admira Next`

## Comandos

- `/start`: mensaje de bienvenida
- `/help`: resumen de comandos
- `/team`: lista de agentes disponibles
- `/ask david mensaje`
- `/ask marc mensaje`
- `/ask francesc mensaje`
- `/broadcast mensaje`

## Uso

```bash
cd codex/admira-next/telegram-bot
cp .env.example .env
python3 bot.py
```

## Nota

Este MVP deja la estructura preparada para que mas adelante conectemos las
respuestas del bot con agentes reales, colas, o servicios separados.
