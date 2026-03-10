@echo off
setlocal enabledelayedexpansion
title Degreed Automatizace

@cls
@echo ================================================================
@echo                 DEGREED AUTOMATIZACE
@echo ================================================================
@echo.

@echo Kontrola prohlizece...
@echo.

@REM Kontrola/Stazeni prenosneho Chromia
@set "CHROMIUM_DIR=%~dp0chromium"
@set "CHROMIUM_EXE="

@if exist "%CHROMIUM_DIR%\chrome-win\chrome.exe" (
    set "CHROMIUM_EXE=%CHROMIUM_DIR%\chrome-win\chrome.exe"
)
@if exist "%CHROMIUM_DIR%\chrome-win32\chrome.exe" (
    set "CHROMIUM_EXE=%CHROMIUM_DIR%\chrome-win32\chrome.exe"
)

@if defined CHROMIUM_EXE goto :browser_ready

@echo Prenosny prohlizec nenalezen. Stahuji Chromium...
@if not exist "%CHROMIUM_DIR%" mkdir "%CHROMIUM_DIR%"
@powershell -Command "& {Write-Host 'Stahuji...'; $url = 'https://github.com/RobRich999/Chromium_Clang/releases/latest/download/chrome.zip'; Invoke-WebRequest -Uri $url -OutFile '%CHROMIUM_DIR%\chromium.zip'; Write-Host 'Rozbaluji...'; Expand-Archive -Path '%CHROMIUM_DIR%\chromium.zip' -DestinationPath '%CHROMIUM_DIR%' -Force; Remove-Item '%CHROMIUM_DIR%\chromium.zip'}"

@if exist "%CHROMIUM_DIR%\chrome-win\chrome.exe" (
    set "CHROMIUM_EXE=%CHROMIUM_DIR%\chrome-win\chrome.exe"
)
@if exist "%CHROMIUM_DIR%\chrome-win32\chrome.exe" (
    set "CHROMIUM_EXE=%CHROMIUM_DIR%\chrome-win32\chrome.exe"
)

@if not defined CHROMIUM_EXE (
    echo Nepodarilo se pripravit Chromium.
    pause
    exit /b
)

:browser_ready
@echo off
@if not exist "%~dp0browser_profile" mkdir "%~dp0browser_profile"
@set "BROWSER_FLAGS=--load-extension="%~dp0extension" --user-data-dir="%~dp0browser_profile" --no-first-run --no-default-browser-check --disable-popup-blocking --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows"

@echo Spoustim...

@REM Kontrola, jestli je to první spuštění (prázdný browser_profile)
@set "FIRST_RUN=0"
@if not exist "%~dp0browser_profile\Default" set "FIRST_RUN=1"

@if %FIRST_RUN%==1 (
    echo.
    echo PRVNI SPUSTENI - Oteviram prihlasovaci stranku Degreed...
    echo Po prihlaseni muzete zavryt zalozku a spustit automatizaci.
    echo.
    start "" "%CHROMIUM_EXE%" %BROWSER_FLAGS% "https://eu.degreed.com/account/login" "%~dp0index.html"
) else (
    start "" "%CHROMIUM_EXE%" %BROWSER_FLAGS% "%~dp0index.html"
)
@exit /b
