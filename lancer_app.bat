@echo off
setlocal

set "APP_DIR=%~dp0"
set "PORT=4180"

cd /d "%APP_DIR%"

where py >nul 2>nul
if %errorlevel%==0 (
  start "Serveur echecs 3D" /min py -3 -m http.server %PORT% --bind 127.0.0.1
) else (
  start "Serveur echecs 3D" /min python -m http.server %PORT% --bind 127.0.0.1
)

timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:%PORT%/"

endlocal
