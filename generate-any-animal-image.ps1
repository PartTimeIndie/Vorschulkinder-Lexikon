# Universeller Tier-Bild Generator für Kinderlexikon
# Erstellt Bilder für beliebige Tiere mit korrigiertem EINZELEINTRAG-PROMPT
# Usage: powershell -ExecutionPolicy Bypass -File .\generate-any-animal-image.ps1 -TierName "Katze" -EnglishName "friendly cat"

param(
    [Parameter(Mandatory=$true)]
    [string]$TierName,
    
    [Parameter(Mandatory=$true)]
    [string]$EnglishName
)

# Get API Key (wie im Category-Generator)
$apiKeyFile = ".\api-key.txt"
if (Test-Path $apiKeyFile) {
    $apiKey = (Get-Content $apiKeyFile -Raw).Trim()
    Write-Host "API Key loaded from api-key.txt" -ForegroundColor Green
} else {
    Write-Host "Error: api-key.txt not found" -ForegroundColor Red
    exit 1
}

# KORRIGIERTER EINZELEINTRAG-PROMPT (ohne Kategorie-Teile)
$singleItemPrompt = "Hand-drawn children's book illustration of a $EnglishName. Watercolor and colored pencil technique with visible brush strokes and paper texture. Gentle, friendly expression with soft organic lines. Simple background painted in loose watercolor washes. Warm natural colors, soft edges, no harsh lines. Style like classic children's picture books - Eric Carle, Beatrix Potter, or Maurice Sendak. No text, no words, no letters anywhere in the image. Square composition perfectly centered for 1024x1024 format. Charming imperfections, textured paper feel, cozy and inviting artwork. Perfect square tile design."

Write-Host "Kinderlexikon Tier-Bild Generator" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host "Generating image for: $TierName ($EnglishName)" -ForegroundColor Cyan
Write-Host "Using: CORRECTED EINZELEINTRAG-PROMPT" -ForegroundColor Green
Write-Host ""

# Erstelle images Ordner falls nicht vorhanden
$imagesDir = ".\public\images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null
    Write-Host "Created public\images directory" -ForegroundColor Green
}

# Erstelle Request für OpenAI Image API
$requestBody = @{
    model = "dall-e-3"
    prompt = $singleItemPrompt
    n = 1
    size = "1024x1024"
    quality = "standard"
    style = "natural"
} | ConvertTo-Json -Depth 3

try {
    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Generating 1024x1024 $TierName tile..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "https://api.openai.com/v1/images/generations" -Method Post -Body $requestBody -Headers $headers
    
    if ($response.data -and $response.data[0].url) {
        # Slug für Dateinamen erstellen
        $slug = $TierName.ToLower() -replace 'ä','ae' -replace 'ö','oe' -replace 'ü','ue' -replace 'ß','ss' -replace '[^a-z0-9]','-'
        $outputPath = "$imagesDir\tier-$slug.png"
        
        # Bild von URL herunterladen
        $imageResponse = Invoke-WebRequest -Uri $response.data[0].url
        [System.IO.File]::WriteAllBytes($outputPath, $imageResponse.Content)
        
        Write-Host "✅ $TierName-Bild erfolgreich erstellt: $outputPath" -ForegroundColor Green
        Write-Host "🎨 Verwendet: KORRIGIERTER EINZELEINTRAG-PROMPT" -ForegroundColor Green
        Write-Host "📁 Datei: tier-$slug.png" -ForegroundColor Green
        Write-Host "📐 1024x1024 Kinderbuch-Stil (Eric Carle/Beatrix Potter)" -ForegroundColor Green
        Write-Host ""
        
        # Beispiele für weitere Tiere
        Write-Host "💡 Weitere Beispiele:" -ForegroundColor Gray
        Write-Host "powershell -File .\generate-any-animal-image.ps1 -TierName `"Katze`" -EnglishName `"friendly cat`"" -ForegroundColor Gray
        Write-Host "powershell -File .\generate-any-animal-image.ps1 -TierName `"Elefant`" -EnglishName `"baby elephant`"" -ForegroundColor Gray
        
        return $outputPath
    } else {
        Write-Host "❌ Failed to generate $TierName image" -ForegroundColor Red
        return $null
    }
} catch {
    Write-Host "❌ Error generating $TierName image: $_" -ForegroundColor Red
    return $null
} 