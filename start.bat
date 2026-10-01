@echo off
title HostelCare Launcher

echo.
echo  ========================================
echo    HostelCare ^| Starting servers...
echo  ========================================
echo.

:: Start backend in a new window (no nested quotes — use ^&^& instead of &&)
start "HostelCare - Backend (port 5000)" cmd /k cd /d %~dp0backend ^&^& npm run dev

:: Give backend a head start
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "HostelCare - Frontend (port 5173)" cmd /k cd /d %~dp0frontend ^&^& npm run dev

:: Wait for Vite to finish compiling before opening browser
echo  Waiting for Vite to start...
timeout /t 8 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo  Both servers launched!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:5000
echo.
echo  Close the two server windows to stop the app.
echo.
pause
