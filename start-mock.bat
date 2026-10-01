@echo off
title HostelCare — Mock Mode Launcher

echo.
echo  ========================================
echo    HostelCare ^| Mock Mode (no MongoDB)
echo  ========================================
echo.

:: Temporarily set mock mode and start frontend only
start "HostelCare — Frontend (mock mode)" cmd /k "cd /d "%~dp0frontend" && set VITE_USE_MOCK=true && npm run dev"

timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"

echo  Frontend launched in mock mode!
echo  Site: http://localhost:5173
echo.
echo  Uses fake data — no backend or MongoDB needed.
echo.
pause
