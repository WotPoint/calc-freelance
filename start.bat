@echo off
chcp 65001 > nul
cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 ( pause & exit /b 1 )
)

:: Vite запустится и сам откроет браузер на 127.0.0.1:5173
:: Ctrl+C — остановить сервер
npm run dev

pause
