# Proyecto 31 — csilvasantin.github.io

> GitHub Pages portfolio and project hub

## Contexto
Página principal en GitHub Pages que sirve como hub de proyectos y portafolio personal. Contiene múltiples secciones: índice principal, Agentic Team, proyectos Claude, Codex, registro y Yarig AI.

## Arquitectura
- **Tipo**: GitHub Pages (HTML estático)
- **Estructura principal**:
  - `index.html` — Página de inicio principal
  - `/claude/` — Sección de proyectos Claude (con index.html)
  - `/codex/` — Sección Codex (11 archivos)
  - `/agentic-team/` — Documentación de equipo agentic
  - `/registro/` — Sistema de registro
  - `/yarig-ai/` — Proyectos Yarig AI
  - `/assets/` — Recursos estáticos
  - Documentos: `agenda-altadis-ia.html`, `agenda-altadis-ia.pdf`, `logo.svg`
- **Hospedaje**: GitHub Pages (rama main)

## Notas para IAs
- Es un site estático simple, sin build process
- Editar archivos .html directamente
- Mantener estructura de carpetas para navegación
- Los cambios se reflejan automáticamente en GitHub Pages
- Documentos PDF y agendas se sirven como archivos estáticos
- Considerar centralizar estilos CSS si hay duplicación
