@echo off
title Degreed Automatizace

cls
echo ================================================================
echo            DEGREED AUTOMATIZACE - PORTABLE
echo ================================================================
echo.

REM Kontrola existuje url.txt
if exist "url.txt" goto :links_ok
echo Nelezen soubor url.txt!
echo.
echo Vytvor soubor url.txt s odkazy na kurzy.
echo.
pause
exit /b

:links_ok
REM Kontrola odkazu
powershell -Command "& {$content = Get-Content 'url.txt' -Raw; $links = $content -split ',' | Where-Object {$_ -match 'degreed.com'}; $count = $links.Count; if ($count -eq 0) { exit 1 } else { Write-Host 'Nalezeno kurzu:' $count }}"
if %errorlevel% neq 0 (
    echo Nenalezeny zadne platne odkazy v url.txt!
    pause
    exit /b
)

echo.
echo Kontrola prohlizece...
echo.

REM Kontrola/Stazeni prenosneho Chromia
set CHROMIUM_DIR=%~dp0chromium
set CHROMIUM_EXE=

if exist "%CHROMIUM_DIR%\chrome-win\chrome.exe" set CHROMIUM_EXE=%CHROMIUM_DIR%\chrome-win\chrome.exe
if exist "%CHROMIUM_DIR%\chrome-win32\chrome.exe" set CHROMIUM_EXE=%CHROMIUM_DIR%\chrome-win32\chrome.exe

if defined CHROMIUM_EXE goto :browser_ready

echo Prenosny prohlizec nenalezen. Stahuji Chromium...
if not exist "%CHROMIUM_DIR%" mkdir "%CHROMIUM_DIR%"
powershell -Command "& {Write-Host 'Stahuji...'; $url = 'https://github.com/RobRich999/Chromium_Clang/releases/latest/download/chrome.zip'; Invoke-WebRequest -Uri $url -OutFile '%CHROMIUM_DIR%\chromium.zip'; Write-Host 'Rozbaluji...'; Expand-Archive -Path '%CHROMIUM_DIR%\chromium.zip' -DestinationPath '%CHROMIUM_DIR%' -Force; Remove-Item '%CHROMIUM_DIR%\chromium.zip'}"

if exist "%CHROMIUM_DIR%\chrome-win\chrome.exe" set CHROMIUM_EXE=%CHROMIUM_DIR%\chrome-win\chrome.exe
if exist "%CHROMIUM_DIR%\chrome-win32\chrome.exe" set CHROMIUM_EXE=%CHROMIUM_DIR%\chrome-win32\chrome.exe

if not defined CHROMIUM_EXE (
    echo Nepodarilo se pripravit Chromium.
    pause
    exit /b
)

:browser_ready
if not exist "%~dp0browser_profile" mkdir "%~dp0browser_profile"
set BROWSER_FLAGS=--load-extension="%~dp0extension" --user-data-dir="%~dp0browser_profile" --no-first-run --no-default-browser-check --disable-popup-blocking --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows

echo Spoustim...
start "" "%CHROMIUM_EXE%" %BROWSER_FLAGS% "%~dp0index.html"
exit /b
