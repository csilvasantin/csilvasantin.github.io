@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-RestMethod 'https://raw.githubusercontent.com/csilvasantin/csilvasantin.github.io/main/admira-shop/tools/join-admira-workflow.ps1' | Invoke-Expression"

echo.
echo Press any key to close.
pause >nul
