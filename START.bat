@echo off
setlocal enabledelayedexpansion
title Degreed Automatizace

@cls
@echo =====================================================
@echo                 DEGREED AUTOMATIZACE
@echo =====================================================
@echo.

@REM Kontrola aktualizací z GitHubu
@echo Kontroluji aktualizace...
@powershell -Command "& { try { $latest = (Invoke-RestMethod -Uri 'https://api.github.com/repos/Hammanek/Degreed-Automation/commits/main').sha.Substring(0,7); $current = ''; if (Test-Path '.git/refs/heads/main') { $current = (Get-Content '.git/refs/heads/main').Substring(0,7) }; if ($current -ne $latest -and $current -ne '') { Write-Host 'Dostupna aktualizace! Stahuji...'; $zip = 'https://github.com/Hammanek/Degreed-Automation/archive/refs/heads/main.zip'; Invoke-WebRequest -Uri $zip -OutFile 'update.zip'; Expand-Archive -Path 'update.zip' -DestinationPath 'update_temp' -Force; Get-ChildItem 'update_temp/Degreed-Automation-main' | ForEach-Object { Copy-Item $_.FullName -Destination '.' -Recurse -Force -Exclude @('browser_profile','url.txt','chromium','.git') }; Remove-Item 'update.zip','update_temp' -Recurse -Force; Write-Host 'Aktualizace dokoncena!'; Start-Sleep -Seconds 2 } elseif ($current -eq '') { Write-Host 'Prvni spusteni - nastavuji Git tracking...'; New-Item -ItemType Directory -Path '.git/refs/heads' -Force | Out-Null; Set-Content -Path '.git/refs/heads/main' -Value $latest } else { Write-Host 'Aplikace je aktualni.' } } catch { Write-Host 'Kontrola aktualizaci selhala, pokracuji...' } }"
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
