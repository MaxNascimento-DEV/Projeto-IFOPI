@echo off
echo === START ONG IFOPI - Safe Mode ===
echo Closing old processes...
taskkill /f /im node.exe /im php.exe >nul 2>&1

echo Clean reinstall...
npm cache clean --force
rmdir /s /q node_modules >nul 2>&1
rmdir /s /q .vite >nul 2>&1

echo Installing deps...
npm install

echo Starting Backend...
start "BACKEND PHP" cmd /k "cd backend && php -S localhost:8000 -t ."

timeout /t 3 >nul

echo Starting Frontend...
npx vite

echo Frontend: localhost:5173
echo Backend: localhost:8000
pause
