@echo off
echo Limpando cache...
npm cache clean --force

echo Parando todos os servers...
taskkill /f /im node.exe 2>nul

echo Deletando node_modules...
rmdir /s /q node_modules 2>nul

echo Deletando .vite...
rmdir /s /q .vite 2>nul

echo Reinstalando...
npm install

echo Iniciando...
npm run start

pause
