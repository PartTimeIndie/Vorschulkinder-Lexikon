@echo off
echo Windows Firewall für Handy-Zugriff konfigurieren
echo ==============================================

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

echo.
echo Füge Firewall-Regeln für Kinderlexikon hinzu...

:: Frontend Port 3000
netsh advfirewall firewall add rule name="Kinderlexikon-Frontend" dir=in action=allow protocol=TCP localport=3000 profile=private
if %errorLevel% == 0 (
    echo ✅ Frontend Port 3000 freigegeben
) else (
    echo ❌ Fehler bei Frontend Port 3000
)

:: API Port 5000  
netsh advfirewall firewall add rule name="Kinderlexikon-API" dir=in action=allow protocol=TCP localport=5000 profile=private
if %errorLevel% == 0 (
    echo ✅ API Port 5000 freigegeben
) else (
    echo ❌ Fehler bei API Port 5000
)

:: Lokales Netzwerk erlauben
netsh advfirewall firewall add rule name="Kinderlexikon-Network" dir=in action=allow protocol=TCP localport=3000 remoteip=192.168.178.0/24 profile=private
if %errorLevel% == 0 (
    echo ✅ Lokales Netzwerk 192.168.178.x erlaubt
) else (
    echo ❌ Fehler bei Netzwerk-Regel
)

echo.
echo ✅ FIREWALL KONFIGURATION ABGESCHLOSSEN!
echo.
echo NÄCHSTE SCHRITTE:
echo 1. Kinderlexikon starten: npm run dev-network
echo 2. Teste vom Handy: http://192.168.178.151:3000
echo.
echo Falls es immer noch nicht funktioniert:
echo - Router-Einstellungen prüfen (AP-Isolation deaktivieren)
echo - Handy und Computer im gleichen WLAN?
echo.
pause 