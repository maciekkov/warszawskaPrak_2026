@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title AutoKlinika - uruchamianie

set "AK_BUILD=v13.4.0-local-dev-booking-20260917"

echo.
echo =============================================
echo   AutoKlinika - v13.4 LOCAL DEV
echo =============================================
echo.
echo Szukam wolnego portu i uruchamiam TEN folder aplikacji...

where py >nul 2>nul
if not errorlevel 1 goto HAVE_PY
where python >nul 2>nul
if not errorlevel 1 goto HAVE_PYTHON

echo.
echo [BLAD] Nie znaleziono Python 3.
echo Zainstaluj Python 3 z https://www.python.org/downloads/
echo Podczas instalacji zaznacz "Add Python to PATH".
echo.
pause
exit /b 1

:HAVE_PY
set "PY_CMD=py -3"
goto FIND_PORT

:HAVE_PYTHON
set "PY_CMD=python"
goto FIND_PORT

:FIND_PORT
for /f %%P in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "$p=5173; while($p -le 5199){ try { $l=[System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback,$p); $l.Start(); $l.Stop(); Write-Output $p; exit 0 } catch { $p++ } }; exit 1"') do set "AK_PORT=%%P"
if not defined AK_PORT goto NO_PORT

echo Uzywam portu: %AK_PORT%
start "AutoKlinika - SERWER %AK_PORT%" cmd /k "cd /d ""%~dp0"" && set AUTOKLINIKA_PORT=%AK_PORT% && %PY_CMD% server.py"

goto WAIT_SERVER

:WAIT_SERVER
powershell -NoProfile -ExecutionPolicy Bypass -Command "$deadline=(Get-Date).AddSeconds(15); while((Get-Date)-lt $deadline){ try { $r=Invoke-RestMethod 'http://127.0.0.1:%AK_PORT%/api/build-info' -TimeoutSec 1; if($r.ok -and $r.build -eq '%AK_BUILD%'){ exit 0 } } catch {}; Start-Sleep -Milliseconds 300 }; exit 1" >nul 2>nul
if errorlevel 1 goto SERVER_ERROR

start "" "http://127.0.0.1:%AK_PORT%/?build=13.1"
echo.
echo Gotowe. Otwarta zostala wersja v13.4 z TEGO folderu.
echo Strona: http://127.0.0.1:%AK_PORT%/
echo Panel administratora: http://127.0.0.1:%AK_PORT%/administrator/
echo Login lokalny: admin
echo Haslo lokalne: admin
echo.
echo Jezeli poprzednia wersja nadal dziala na 5173, ta paczka korzysta z kolejnego wolnego portu.
exit /b 0

:NO_PORT
echo.
echo [BLAD] Brak wolnego portu w zakresie 5173-5199.
echo Zamknij stare okna serwera AutoKlinika i sprobuj ponownie.
echo.
pause
exit /b 1

:SERVER_ERROR
echo.
echo [BLAD] Nie uruchomiono oczekiwanej wersji %AK_BUILD%.
echo Sprawdz okno "AutoKlinika - SERWER %AK_PORT%".
echo Launcher celowo nie otwiera starej aplikacji dzialajacej na innym porcie.
echo.
pause
exit /b 1
