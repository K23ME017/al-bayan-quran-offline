@echo off
title Al-Bayan Quran Ecosystem
cd /d "%~dp0"

echo ========================================================
echo    Al-Bayan: AI-Powered Quran & Tafseer Ecosystem        
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "%USERPROFILE%\AppData\Roaming\fnm\aliases\default\node.exe" (
        set "PATH=%USERPROFILE%\AppData\Roaming\fnm\aliases\default;%PATH%"
    )
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "%USERPROFILE%\AppData\Roaming\fnm\aliases\default\npm.cmd" (
        set "PATH=%USERPROFILE%\AppData\Roaming\fnm\aliases\default;%PATH%"
    )
)

echo Starting Al-Bayan Desktop Application...
node launch-app.cjs
pause
