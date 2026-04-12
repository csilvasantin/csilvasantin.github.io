#!/bin/bash
# ──────────────────────────────────────────────────────────────
# actualizar.sh — Documenta el trabajo del día y sube a GitHub
# Se ejecuta cada hora via cron o manualmente desde el portal
# ──────────────────────────────────────────────────────────────

GITHUB_DIR="$HOME/GitHub"
LOG_FILE="$GITHUB_DIR/00.-csilvasantin.github.io/assets/actualizacion.log"
FECHA=$(date '+%Y-%m-%d')
HORA=$(date '+%H:%M')
RESUMEN=""
REPOS_TOCADOS=0

echo "[$FECHA $HORA] Inicio de actualización" >> "$LOG_FILE"

for repo_dir in "$GITHUB_DIR"/*/; do
  [ ! -d "$repo_dir/.git" ] && continue

  repo_name=$(basename "$repo_dir")

  cd "$repo_dir" || continue

  # Verificar si hay cambios (staged, unstaged o untracked)
  cambios_unstaged=$(git diff --stat 2>/dev/null)
  cambios_staged=$(git diff --cached --stat 2>/dev/null)
  archivos_untracked=$(git ls-files --others --exclude-standard 2>/dev/null)

  if [ -n "$cambios_unstaged" ] || [ -n "$cambios_staged" ] || [ -n "$archivos_untracked" ]; then
    REPOS_TOCADOS=$((REPOS_TOCADOS + 1))

    # Recoger resumen de lo que cambió
    ficheros_mod=$(git diff --name-only 2>/dev/null | head -10)
    ficheros_staged=$(git diff --cached --name-only 2>/dev/null | head -10)
    ficheros_new=$(git ls-files --others --exclude-standard 2>/dev/null | head -10)

    detalle=""
    [ -n "$ficheros_mod" ] && detalle="modificados: $ficheros_mod"
    [ -n "$ficheros_staged" ] && detalle="$detalle staged: $ficheros_staged"
    [ -n "$ficheros_new" ] && detalle="$detalle nuevos: $ficheros_new"

    RESUMEN="$RESUMEN\n- $repo_name: $detalle"

    # Stage all, commit y push
    git add -A 2>/dev/null
    git commit -m "Actualización automática $FECHA $HORA

Cambios detectados y documentados por actualizar.sh" 2>/dev/null

    git push 2>/dev/null

    echo "  ✓ $repo_name — commit + push" >> "$LOG_FILE"
  fi
done

# Registrar resumen final
if [ "$REPOS_TOCADOS" -gt 0 ]; then
  echo -e "[$FECHA $HORA] $REPOS_TOCADOS repos actualizados:$RESUMEN" >> "$LOG_FILE"
else
  echo "[$FECHA $HORA] Sin cambios pendientes en ningún repo" >> "$LOG_FILE"
fi

echo "[$FECHA $HORA] Fin de actualización" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"

# Mantener log limpio (últimas 500 líneas)
tail -500 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
