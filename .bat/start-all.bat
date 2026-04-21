@echo off
title "ONG IFOPI - Start All"
color 0A
cls
echo ========================================
echo    ONG IFOPI - Backend + Frontend
echo ========================================
echo Backend PHP API (localhost:8000) + Frontend Vite (5173)
echo.
echo Kill old servers...
taskkill /f /im php.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.

start "PHP Backend" cmd /k "cd backend && php -S localhost:8000 -t . && echo Backend stopped"
echo Backend: http://localhost:8000/backend/routes/
timeout /t 2 /nobreak >nul

start "Vite Frontend" cmd /k "npm run dev"
echo Frontend: http://localhost:5173/
echo.
echo ========================================
echo Access: http://localhost:5173
echo ========================================
pause

