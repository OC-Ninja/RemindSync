@echo off
cd /d "%~dp0"
title RemindSync - System Manager
color 0b

:menu
cls
echo ========================================================
echo             REMINDSYNC: AUTOMATED BILLING ENGINE
echo ========================================================
echo.
echo What would you like to do?
echo.
echo [1] Initial Setup (Run this ONLY on the first day)
echo [2] View WhatsApp QR Code (Scan to log in)
echo [3] Emergency Deep Restart (Fixes QR/Stuck Messages)
echo [4] Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto qr
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto exit

goto menu

:setup
cls
echo ========================================================
echo REMINDSYNC: INITIALIZING SYSTEM SETUP...
echo ========================================================
echo.
echo [1/4] Installing PM2 Global Engine...
call npm install -g pm2 pm2-windows-startup
echo.
echo [2/4] Installing Local Microservices (Reading package.json)...
call npm install
echo.
echo [3/4] Booting Systems via Ecosystem Blueprint...
call pm2 start ecosystem.config.js
echo.
echo [4/4] Saving Configuration to Windows Autostart...
call pm2-startup install
call pm2 save
echo.
echo SETUP COMPLETE!
echo The RemindSync brain is now running HIDDEN in the background.
echo It will start automatically even after a computer restart.
echo Access Dashboard at: http://localhost:5678
pause
goto menu

:qr
cls
echo ========================================================
echo REMINDSYNC: WAITING FOR WHATSAPP LOGS...
echo ========================================================
echo.
echo IMPORTANT: Maximize this window RIGHT NOW for the QR code.
echo Press CTRL + C to exit this screen (The server keeps running!)
echo.
call pm2 logs RemindSync-WhatsApp --lines 100 --raw
pause
goto menu

:restart
cls
echo ========================================================
echo REMINDSYNC: PERFORMING DEEP RESTART...
echo ========================================================
echo.
echo [1/3] Stopping background processes...
call pm2 stop ecosystem.config.js
echo.
echo [2/3] Wiping stuck session data for a fresh QR...
if exist ".wwebjs_auth" rd /s /q ".wwebjs_auth"
if exist ".wwebjs_cache" rd /s /q ".wwebjs_cache"
echo.
echo [3/3] Re-launching RemindSync Engine...
call pm2 start ecosystem.config.js
call pm2 save
echo.
echo RemindSync has been deep-refreshed!
echo Now use Option [2] to scan your fresh QR code.
pause
goto menu

:exit
exit