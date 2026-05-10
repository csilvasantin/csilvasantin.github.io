# Unir cualquier PC al flujo Admira.shop

Este flujo evita configurar Telegram en cada ordenador. Telegram se envia desde GitHub Actions, usando secretos guardados una sola vez en GitHub.

## Preparacion unica

En GitHub deben existir estos secretos del repositorio:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

URL:

`https://github.com/csilvasantin/csilvasantin.github.io/settings/secrets/actions`

## En un PC nuevo

Ejecuta la automatizacion `join-admira-workflow.ps1`. El script:

- Clona o actualiza `csilvasantin/csilvasantin.github.io`.
- Configura Git para AdmiraNext.
- Entra en la carpeta `admira-shop`.
- Crea `publish.ps1` para publicar cambios con un comando.

Cuando el repo ya este clonado, publica desde `admira-shop` con:

```powershell
.\publish.ps1 "Update Admira.shop"
```

GitHub Pages publica la web y GitHub Actions avisa por `AdmiraCodexBot`.
