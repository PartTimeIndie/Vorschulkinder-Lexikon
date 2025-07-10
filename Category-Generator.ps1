# Category Image Generator für Kinderlexikon
# Generiert Kategorie-Bilder als 1024x1024 quadratische Tiles ohne Rand
# Verwendet API Key aus api-key.txt für konsistente Authentifizierung
#
# Usage: powershell -ExecutionPolicy Bypass -File .\Category-Generator.ps1 -CategoryName "Tiere"

param(
    [Parameter(Mandatory=$true)]
    [string]$CategoryName
)

# Get API Key (gleiche Struktur wie Character-Generator)
$apiKeyFile = ".\api-key.txt"
if (Test-Path $apiKeyFile) {
    $apiKey = (Get-Content $apiKeyFile -Raw).Trim()
    Write-Host "API Key loaded from api-key.txt" -ForegroundColor Green
} else {
    Write-Host "Error: api-key.txt not found" -ForegroundColor Red
    exit 1
}

# Optimized Category Prompt für randlose Tiles
$categoryPrompt = "Hand-drawn children's book illustration showing 4-6 different examples from the $CategoryName category arranged in a friendly, overlapping composition that fills the entire square frame edge-to-edge. Watercolor and colored pencil style with visible brush strokes and paper texture. Show different types, varieties, or breeds that belong to this category, each with distinct characteristics, arranged naturally across the full image area. No empty spaces, no borders, no frames - content extends to all edges of the square. Show only the main subjects themselves - no accessories, tools, or related objects. Soft organic lines, warm natural colors, gentle watercolor washes. Style reminiscent of classic children's picture books like Eric Carle or Beatrix Potter. No text, no words, no letters anywhere in the image. Perfect 1024x1024 square composition with subjects distributed across the entire frame. No digital perfection, charming hand-drawn imperfections. Soft, blended background that flows naturally with the subjects. Content should touch or nearly touch all four edges of the square for optimal tile appearance."

Write-Host "Kinderlexikon Category Generator" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow
Write-Host "Generating category image for: $CategoryName" -ForegroundColor Cyan
Write-Host "Format: 1024x1024 randlose Tile" -ForegroundColor Green
Write-Host ""

# Erstelle Kategorien-Ordner falls nicht vorhanden
$categoriesDir = ".\kategorien"
if (-not (Test-Path $categoriesDir)) {
    New-Item -ItemType Directory -Path $categoriesDir | Out-Null
    Write-Host "Created kategorien directory" -ForegroundColor Green
}

$imagesDir = "$categoriesDir\images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir | Out-Null
    Write-Host "Created kategorien\images directory" -ForegroundColor Green
}

# Erstelle Request für OpenAI Image API
$requestBody = @{
    model = "gpt-image-1"
    prompt = $categoryPrompt
    n = 1
    size = "1024x1024"
    quality = "high"
} | ConvertTo-Json -Depth 3

try {
    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Generating 1024x1024 category tile..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "https://api.openai.com/v1/images/generations" -Method Post -Body $requestBody -Headers $headers
    
    if ($response.data -and $response.data[0].b64_json) {
        # Dateiname: category-{name}.png
        $safeFileName = $CategoryName -replace '[^\w\-_]', ''
        $outputPath = "$imagesDir\category-$safeFileName.png"
        
        $imageBytes = [System.Convert]::FromBase64String($response.data[0].b64_json)
        [System.IO.File]::WriteAllBytes($outputPath, $imageBytes)
        
        Write-Host "Category image generated successfully: $outputPath" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next step: Create JSON file for category data" -ForegroundColor Gray
        
        return $outputPath
    } else {
        Write-Host "Failed to generate category image" -ForegroundColor Red
        return $null
    }
} catch {
    Write-Host "Error generating category image: $_" -ForegroundColor Red
    return $null
} 