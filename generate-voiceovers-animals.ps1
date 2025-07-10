# Voice-Over Generator fuer Tiere-Kategorie und Subkategorien
# Laeuft im Hintergrund und generiert alle benoetigten Audio-Dateien

Write-Host "Starte Voice-Over Generation fuer Tiere-Kategorie..." -ForegroundColor Green

# Stelle sicher, dass wir im richtigen Verzeichnis sind
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

Write-Host "Arbeitsverzeichnis: $PWD" -ForegroundColor Cyan

# Pruefe ob Node.js verfuegbar ist
try {
    $nodeVersion = & node --version 2>$null
    Write-Host "Node.js gefunden: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js nicht gefunden! Bitte installiere Node.js." -ForegroundColor Red
    exit 1
}

# Pruefe ob die Skripte existieren
$voiceOverGenerator = "scripts/voice-over-generator.js"
$voiceOverAnimals = "scripts/voice-over-animals.js"

if (-not (Test-Path $voiceOverGenerator)) {
    Write-Host "Skript nicht gefunden: $voiceOverGenerator" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $voiceOverAnimals)) {
    Write-Host "Skript nicht gefunden: $voiceOverAnimals" -ForegroundColor Red
    exit 1
}

Write-Host "Alle Skripte gefunden" -ForegroundColor Green

# Erstelle Output-Verzeichnis falls es nicht existiert
$audioDir = "public/audio"
if (-not (Test-Path $audioDir)) {
    New-Item -ItemType Directory -Path $audioDir -Force
    Write-Host "Audio-Verzeichnis erstellt: $audioDir" -ForegroundColor Yellow
}

Write-Host "`nStarte Voice-Over Generierung..." -ForegroundColor Magenta

# 1. Generiere Voice-Over fuer Hauptkategorie "Tiere"
Write-Host "`n1. Generiere Voice-Over fuer Hauptkategorie 'Tiere'..." -ForegroundColor Blue
$tiereProcess = Start-Process -FilePath "node" -ArgumentList "$voiceOverGenerator categories" -PassThru -WindowStyle Hidden

# 2. Warte kurz und starte dann Subkategorien
Start-Sleep -Seconds 2

Write-Host "2. Generiere Voice-Overs fuer alle Tier-Subkategorien..." -ForegroundColor Blue
$subcatProcess = Start-Process -FilePath "node" -ArgumentList $voiceOverAnimals -PassThru -WindowStyle Hidden

Write-Host "`nBeide Prozesse wurden im Hintergrund gestartet:" -ForegroundColor Green
Write-Host "   Kategorien-Prozess ID: $($tiereProcess.Id)" -ForegroundColor Cyan
Write-Host "   Subkategorien-Prozess ID: $($subcatProcess.Id)" -ForegroundColor Cyan

Write-Host "`nUeberwache Fortschritt..." -ForegroundColor Yellow

# Ueberwache die Prozesse
$startTime = Get-Date
$timeout = 300 # 5 Minuten Timeout

while ($true) {
    $elapsed = (Get-Date) - $startTime
    
    # Pruefe ob Prozesse noch laufen
    $tiereRunning = Get-Process -Id $tiereProcess.Id -ErrorAction SilentlyContinue
    $subcatRunning = Get-Process -Id $subcatProcess.Id -ErrorAction SilentlyContinue
    
    if (-not $tiereRunning -and -not $subcatRunning) {
        Write-Host "`nAlle Prozesse abgeschlossen!" -ForegroundColor Green
        break
    }
    
    # Timeout-Pruefung
    if ($elapsed.TotalSeconds -gt $timeout) {
        Write-Host "`nTimeout erreicht ($timeout Sekunden). Prozesse laufen moeglicherweise noch im Hintergrund." -ForegroundColor Yellow
        break
    }
    
    # Status anzeigen
    $tiereStatus = if ($tiereRunning) { "Laeuft" } else { "Fertig" }
    $subcatStatus = if ($subcatRunning) { "Laeuft" } else { "Fertig" }
    
    Write-Host "`rZeit: $([int]$elapsed.TotalSeconds)s | Kategorien: $tiereStatus | Subkategorien: $subcatStatus" -NoNewline
    
    Start-Sleep -Seconds 3
}

Write-Host "`n"

# Pruefe generierte Dateien
Write-Host "Pruefe generierte Audio-Dateien..." -ForegroundColor Blue

$expectedFiles = @(
    "category-tiere.mp3"
)

# Lade tiere.json und extrahiere erwartete Subkategorie-Dateien
try {
    $tiereJson = Get-Content "kategorien/tiere.json" -Raw | ConvertFrom-Json
    foreach ($subcat in $tiereJson.subcategories) {
        $expectedFiles += "subcat-$($subcat.slug).mp3"
    }
} catch {
    Write-Host "Konnte tiere.json nicht laden" -ForegroundColor Yellow
}

$foundFiles = 0
$missingFiles = @()

foreach ($file in $expectedFiles) {
    $filePath = Join-Path $audioDir $file
    if (Test-Path $filePath) {
        $foundFiles++
        $fileSize = (Get-Item $filePath).Length
        Write-Host "OK: $file ($([int]($fileSize/1024)) KB)" -ForegroundColor Green
    } else {
        $missingFiles += $file
        Write-Host "FEHLT: $file" -ForegroundColor Red
    }
}

Write-Host "`nZusammenfassung:" -ForegroundColor Magenta
Write-Host "   Gefunden: $foundFiles/$($expectedFiles.Count) Dateien" -ForegroundColor Green

if ($missingFiles.Count -gt 0) {
    Write-Host "   Fehlend: $($missingFiles.Count) Dateien" -ForegroundColor Red
    Write-Host "      $($missingFiles -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "   Alle erwarteten Dateien wurden generiert!" -ForegroundColor Green
}

Write-Host "`nVoice-Over Generation abgeschlossen!" -ForegroundColor Magenta 