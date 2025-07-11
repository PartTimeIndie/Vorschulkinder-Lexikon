@echo off
echo Konfiguriere lokale Domain: www.klex.home
echo =========================================

:: Überprüfe Admin-Rechte
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Admin-Rechte erkannt. Fortfahren...
) else (
    echo FEHLER: Dieses Script muss als Administrator ausgeführt werden!
    echo Rechtsklick auf die Datei und "Als Administrator ausführen" wählen.
    pause
    exit /b 1
)

:: Backup der hosts-Datei erstellen
echo Erstelle Backup der hosts-Datei...
copy C:\Windows\System32\drivers\etc\hosts C:\Windows\System32\drivers\etc\hosts.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%

:: Prüfe ob Eintrag bereits existiert
findstr /c:"www.klex.home" C:\Windows\System32\drivers\etc\hosts >nul
if %errorLevel% == 0 (
    echo www.klex.home ist bereits in der hosts-Datei konfiguriert.
) else (
    echo Füge www.klex.home zur hosts-Datei hinzu...
    echo. >> C:\Windows\System32\drivers\etc\hosts
    echo # Kinderlexikon lokale Domain >> C:\Windows\System32\drivers\etc\hosts
    echo 192.168.178.151 www.klex.home >> C:\Windows\System32\drivers\etc\hosts
    echo 192.168.178.151 klex.home >> C:\Windows\System32\drivers\etc\hosts
)

:: DNS Cache leeren
echo Leere DNS Cache...
ipconfig /flushdns >nul

echo.
echo ✅ KONFIGURATION ABGESCHLOSSEN!
echo.
echo Die folgenden Domains zeigen jetzt auf diesen Computer:
echo   http://www.klex.home:3000      (Next.js Frontend)
echo   http://www.klex.home:5000      (Express API)
echo   http://klex.home:3000          (Alternative)
echo.
echo NÄCHSTE SCHRITTE:
echo 1. Starte das Kinderlexikon im Netzwerk-Modus:
echo    npm run dev-network
echo.
echo 2. Öffne im Browser: http://www.klex.home:3000
echo.
echo 3. Für andere Geräte im Netzwerk:
echo    - Router-Einstellungen öffnen
echo    - DNS-Einträge hinzufügen oder
echo    - Direkt IP verwenden: http://192.168.178.151:3000
echo.
pause 