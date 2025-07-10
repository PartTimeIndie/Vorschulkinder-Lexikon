# Universeller Eintrag-Bild Generator für Kinderlexikon
# Erstellt Bilder für beliebige Einträge mit EXAKTEM EINZELEINTRAG-PROMPT
# Usage: powershell -ExecutionPolicy Bypass -File .\generate-entry-image.ps1 -EntryName "Hund" -EnglishName "friendly dog"

param(
    [Parameter(Mandatory=$true)]
    [string]$EntryName,
    
    [Parameter(Mandatory=$true)]
    [string]$EnglishName
)

# Get API Key
$apiKeyFile = ".\api-key.txt"
if (Test-Path $apiKeyFile) {
    $apiKey = (Get-Content $apiKeyFile -Raw).Trim()
    Write-Host "API Key loaded from api-key.txt" -ForegroundColor Green
} else {
    Write-Host "Error: api-key.txt not found" -ForegroundColor Red
    exit 1
}

# EXAKTER EINZELEINTRAG-PROMPT (genau wie gewünscht)
$entryPrompt = "Hand-drawn children's book illustration showing an $EnglishName. Watercolor and colored pencil style with visible brush strokes and paper texture. Soft organic lines, warm natural colors, gentle watercolor washes. Style reminiscent of classic children's picture books like Eric Carle or Beatrix Potter. No text, no words, no letters anywhere in the image. Square composition perfectly centered for 1024x1024 format. No digital perfection, charming hand-drawn imperfections. Textured paper background, artistic and cozy feeling. Perfect square tile design."

Write-Host "Kinderlexikon Eintrag-Bild Generator" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host "Generating image for Entry: $EntryName ($EnglishName)" -ForegroundColor Cyan
Write-Host "Using: EXACT EINZELEINTRAG-PROMPT" -ForegroundColor Green
Write-Host ""

# Erstelle images Ordner falls nicht vorhanden
$imagesDir = ".\public\images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null
    Write-Host "Created public\images directory" -ForegroundColor Green
}

# Erstelle Request für OpenAI Image API
$requestBody = @{
    model = "gpt-image-1"
    prompt = $entryPrompt
    n = 1
    size = "1024x1024"
    quality = "high"
} | ConvertTo-Json -Depth 3

try {
    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Generating 1024x1024 $EntryName tile..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "https://api.openai.com/v1/images/generations" -Method Post -Body $requestBody -Headers $headers
    
    if ($response.data -and $response.data[0].b64_json) {
        # Slug für Dateinamen erstellen
        $slug = $EntryName.ToLower() -replace 'ä','ae' -replace 'ö','oe' -replace 'ü','ue' -replace 'ß','ss' -replace '[^a-z0-9]','-'
        $outputPath = "$imagesDir\tier-$slug.png"
        
        # Base64 zu Bytes konvertieren und speichern
        $imageBytes = [System.Convert]::FromBase64String($response.data[0].b64_json)
        [System.IO.File]::WriteAllBytes($outputPath, $imageBytes)
        
        Write-Host "✅ $EntryName-Eintrag-Bild erfolgreich erstellt: $outputPath" -ForegroundColor Green
        Write-Host "🎨 Verwendet: EXAKTER EINZELEINTRAG-PROMPT" -ForegroundColor Green
        Write-Host "📁 Datei: tier-$slug.png" -ForegroundColor Green
        Write-Host "📐 1024x1024 Kinderbuch-Stil (Eric Carle/Beatrix Potter)" -ForegroundColor Green
        Write-Host "🖼️ Aquarell + Buntstift, handgezeichnete Unperfektion" -ForegroundColor Green
        Write-Host ""
        
        # Beispiele für weitere Einträge
        Write-Host "💡 Weitere Beispiele:" -ForegroundColor Gray
        Write-Host "powershell -File .\generate-entry-image.ps1 -EntryName `"Katze`" -EnglishName `"cute cat`"" -ForegroundColor Gray
        Write-Host "powershell -File .\generate-entry-image.ps1 -EntryName `"Elefant`" -EnglishName `"baby elephant`"" -ForegroundColor Gray
        Write-Host "powershell -File .\generate-entry-image.ps1 -EntryName `"Auto`" -EnglishName `"red car`"" -ForegroundColor Gray
        
        return $outputPath
    } else {
        Write-Host "❌ Failed to generate $EntryName entry image" -ForegroundColor Red
        return $null
    }
} catch {
    Write-Host "❌ Error generating $EntryName entry image: $_" -ForegroundColor Red
    return $null
} 