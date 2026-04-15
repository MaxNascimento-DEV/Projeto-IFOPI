@echo off
echo === FIX INTER 3 - Clean Reinstall ===
echo 1. Kill Node processes...
taskkill /f /im node.exe >nul 2>&1

echo 2. Delete node_modules...
if exist node_modules rmdir /s /q node_modules

echo 3. Delete .vite cache...
if exist .vite rmdir /s /q .vite

echo 4. Clean NPM cache...
npm cache clean --force

echo 5. Fresh install...
npm install

echo 6. Vite + Backend start...
npm run start

echo === DONE! Open http://localhost:5173/ ===
pause
