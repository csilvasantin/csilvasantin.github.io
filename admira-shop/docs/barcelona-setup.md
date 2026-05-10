# Continuar desde otro ordenador

El objetivo es que en Barcelona no tengas que configurar Telegram otra vez en el PC. Para eso, Telegram debe quedar configurado una sola vez en GitHub Actions como secretos del repositorio.

## Una sola vez en GitHub

En el repositorio `csilvasantin/csilvasantin.github.io`, configura estos secretos:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Ruta en GitHub:

`Settings > Secrets and variables > Actions > New repository secret`

Con eso, cada vez que se haga `push` de cambios dentro de `admira-shop/`, GitHub enviara un Telegram automaticamente.

## En el ordenador nuevo

Solo necesitas clonar el repo y trabajar:

```powershell
git clone https://github.com/csilvasantin/csilvasantin.github.io.git
cd csilvasantin.github.io\admira-shop
```

Para publicar:

```powershell
git add .
git commit -m "Update Admira.shop"
git push
```

GitHub Pages publicara la web y GitHub Actions enviara el aviso por `AdmiraCodexBot`.
