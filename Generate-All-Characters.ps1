# Generate All Characters - Batch Generator
# Generiert 3 Varianten für jede Emotion automatisch
#
# Usage: powershell -ExecutionPolicy Bypass -File .\Generate-All-Characters.ps1

Write-Host "Kinderlexikon - Batch Character Generator" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "Generating 3 variants for each emotion..." -ForegroundColor Cyan
Write-Host ""

# Erstelle Characters Ordner falls nicht vorhanden
if (!(Test-Path ".\Characters")) {
    New-Item -ItemType Directory -Path ".\Characters" | Out-Null
    Write-Host "Characters folder created" -ForegroundColor Green
}

# Alle Emotionen
$emotions = @("excited", "curious", "surprised", "thinking", "laughing", "idle")

$totalImages = $emotions.Count * 3
$currentImage = 0

foreach ($emotion in $emotions) {
    Write-Host ""
    Write-Host "=== Generating $emotion characters ===" -ForegroundColor Yellow
    
    for ($i = 1; $i -le 3; $i++) {
        $currentImage++
        Write-Host "[$currentImage/$totalImages] Generating $emotion variant $i..." -ForegroundColor Cyan
        
        try {
            # Rufe das Haupt-Script auf
            & ".\Character-Generator-Simple.ps1" -Emotion $emotion
            
            Start-Sleep -Seconds 2  # Kurze Pause zwischen Generationen
        }
        catch {
            Write-Host "Error generating $emotion variant $i`: $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== GENERATION COMPLETE ===" -ForegroundColor Green
Write-Host "Generated $totalImages character images total" -ForegroundColor Green
Write-Host "Check the Characters folder for all variants!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..."
Read-Host 