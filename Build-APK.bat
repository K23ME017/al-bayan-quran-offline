@echo off
title Al-Bayan Android APK Builder
cd /d "%~dp0"

echo ========================================================
echo    Al-Bayan: AI Quran & Tafseer - Android APK Builder   
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "%USERPROFILE%\AppData\Roaming\fnm\aliases\default\node.exe" (
        set "PATH=%USERPROFILE%\AppData\Roaming\fnm\aliases\default;%PATH%"
    )
)

echo [1/3] Building latest web assets...
call npm run build

echo.
echo [2/3] Syncing Capacitor Android assets...
call npx cap sync android

echo.
echo [3/3] Checking build environment...

where docker >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Docker detected. Building APK via Android build container...
    docker build -t albayan-apk-builder -f Dockerfile.apk .
    docker run --rm -v "%cd%\android:/app/android" -v "%cd%:/out" albayan-apk-builder sh -c "cd /app/android && chmod +x gradlew && ./gradlew assembleDebug --no-daemon && cp app/build/outputs/apk/debug/app-debug.apk /out/Al-Bayan-Quran.apk"
    if exist "%~dp0Al-Bayan-Quran.apk" (
        echo.
        echo ========================================================
        echo SUCCESS! APK successfully generated at:
        echo %~dp0Al-Bayan-Quran.apk
        echo ========================================================
        goto finish
    )
)

where gradlew.bat >nul 2>nul
if exist "%~dp0android\gradlew.bat" (
    where java >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo Java detected. Building APK via Gradle wrapper...
        cd android
        call gradlew.bat assembleDebug
        cd ..
        if exist "%~dp0android\app\build\outputs\apk\debug\app-debug.apk" (
            copy /y "%~dp0android\app\build\outputs\apk\debug\app-debug.apk" "%~dp0Al-Bayan-Quran.apk"
            echo.
            echo ========================================================
            echo SUCCESS! APK generated at: %~dp0Al-Bayan-Quran.apk
            echo ========================================================
            goto finish
        )
    )
)

echo.
echo ========================================================
echo Android Native Project is 100%% Ready at: %~dp0android
echo.
echo To generate your APK instantly:
echo 1. Open Android Studio.
echo 2. Choose "Open" and select the "android" folder in this directory.
echo 3. Click "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)".
echo 4. Your APK will be compiled and ready to install on your phone!
echo ========================================================

:finish
pause
