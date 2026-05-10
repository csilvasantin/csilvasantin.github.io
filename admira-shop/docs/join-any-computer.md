# Unir cualquier ordenador al flujo Admira.shop

Este flujo evita configurar Telegram en cada ordenador. Telegram se envia desde GitHub Actions, usando secretos guardados una sola vez en GitHub.

## Preparacion unica

En GitHub deben existir estos secretos del repositorio:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

URL:

`https://github.com/csilvasantin/csilvasantin.github.io/settings/secrets/actions`

## Windows

Descarga y ejecuta:

`https://raw.githubusercontent.com/csilvasantin/csilvasantin.github.io/main/admira-shop/tools/join-admira-workflow.cmd`

El script clona o actualiza el repo, configura Git y crea `publish.ps1`.

Publicar cambios:

```powershell
.\publish.ps1 "Update Admira.shop"
```

## macOS

Comando directo:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/csilvasantin/csilvasantin.github.io/main/admira-shop/tools/join-admira-workflow.sh)"
```

El script clona o actualiza el repo, configura Git y crea `publish.sh`.

Si Git no esta instalado, macOS pedira instalar Xcode Command Line Tools.

Publicar cambios:

```bash
./publish.sh "Update Admira.shop"
```

GitHub Pages publica la web y GitHub Actions avisa por `AdmiraCodexBot`.
