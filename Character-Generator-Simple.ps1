# Simple Character Generator für Kinderlexikon
# Generiert Character-Emotion-Varianten in HD Portrait Format MIT passenden Tiergefährten
# Verwendet player-idle.png als Referenz für konsistente Character-Darstellung
#
# Usage: powershell -ExecutionPolicy Bypass -File .\Character-Generator-Simple.ps1

param(
    [string]$Emotion = "excited",
    [int]$Count = 1
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

# Verwenden detaillierte Text-Prompts für konsistente Character-Generierung

# Final Character Prompt (UPDATED: Vision-improved detailed prompt)
$basePrompt = "Hand-drawn children's book illustration of a friendly, gender-neutral young scientist character, age 3-7. The character stands in a neutral, full-body pose, facing the viewer with a calm and friendly smile. They have big, round, friendly glasses and warm medium-brown skin with an ambiguous ethnicity. Their soft, medium-length hair is slightly tousled and gender-neutral. A yellow pencil is tucked behind their right ear. They wear a light beige shirt with rolled-up sleeves under a brown explorer vest with front pockets, along with simple brown pants that are slightly cuffed at the bottom and dark brown shoes. In their hands, they hold a small, colorful striped notebook - a learning journal with vertical rainbow-colored sections in red orange yellow green blue - a symbol of knowledge and discovery. The character holds it proudly and gently, close to their chest. Style is inspired by classic children's book illustrators like Eric Carle or Beatrix Potter - hand-drawn, watercolor, and soft organic lines with visible brush textures. Color palette includes warm natural tones in browns beiges soft oranges, subtle shadows, and gentle watercolor washes with slight imperfections and texture - no digital perfection. No text or letters anywhere in the image. Transparent background PNG format. Portrait orientation HD resolution 1024x1536, character perfectly centered in frame. Character has a charming, slightly nerdy but very approachable expression. Illustration should feel cozy, analog, and storybook-like - as if painted on textured paper. No high-tech or modern elements - only timeless, nature-inspired educational explorer themes."

# Emotion-spezifische Zusätze MIT passenden Tiergefährten (lustig überzeichnet)
switch ($Emotion) {
    "excited" { 
        $emotionText = "Character has a very excited expression with big bright eyes, raised eyebrows, and a huge joyful smile. Character might have arms slightly raised or be bouncing slightly on their toes, showing pure enthusiasm and joy about discovery."
        $animalText = "A small, hyperactive baby monkey is hanging from the character's arm or shoulder, equally excited and animated, with its tiny arms in the air mimicking the character's enthusiasm. The monkey has huge bright eyes and an infectious grin that's just as big as the character's!"
    }
    "curious" { 
        $emotionText = "Character has a curious, inquisitive expression with head tilted slightly to one side, eyes wide with wonder, and a thoughtful smile. Character might be leaning forward slightly, showing fascination."
        $animalText = "A tiny gray mouse is running across the character's head or sitting on their shoulder, with its little nose twitching curiously and whiskers moving as it sniffs around with the same intense curiosity as the character. The mouse's eyes are comically wide with wonder!"
    }
    "surprised" { 
        $emotionText = "Character has a surprised expression with very wide eyes, raised eyebrows, and a small 'o' shaped mouth. Character looks amazed and delighted by an unexpected discovery."
        $animalText = "A fluffy golden hamster sits on the character's head or hat with hilariously oversized surprised eyes that mirror the character's expression. The hamster's cheeks are puffed out and its tiny mouth forms a perfect 'o' shape just like the character!"
    }
    "thinking" { 
        $emotionText = "Character has a thoughtful expression with one hand near their chin in a thinking pose, eyes looking up contemplatively, and a gentle concentrated smile."
        $animalText = "A tiny wise owl with comically large thinking eyes perches on the character's head, also with one tiny wing near its beak in a thinking pose, perfectly mirroring the character's contemplative expression. The owl wears tiny round glasses just like the character!"
    }
    "laughing" { 
        $emotionText = "Character is laughing joyfully with eyes crinkled in happiness, mouth open in laughter, and possibly holding their colorful notebook while giggling with pure delight."
        $animalText = "A small, colorful parrot sits on the character's shoulder, also laughing with its beak wide open and wings slightly spread in joy. The parrot's feathers are ruffled from laughing so hard, and it's tilting back in the same joyful manner as the character!"
    }
    default { 
        $emotionText = "Character is in a neutral standing pose looking directly at viewer with a calm, friendly smile, holding their colorful notebook with wonder."
        $animalText = "A curious brown squirrel (Eichhörnchen) sits peacefully on the character's shoulder, also looking directly at the viewer with bright, friendly eyes and a content expression that matches the character's calm demeanor."
        $Emotion = "idle"
    }
}

# Kombiniere alle Prompts (Base + Emotion + Animal für lustige Überzeichnung)
$fullPrompt = $basePrompt + " " + $emotionText + " " + $animalText + " The scene is slightly exaggerated and playful to make children laugh, with both character and animal showing the same emotion in an endearing, funny way. The animal companion adds charm and humor while keeping the overall tone educational and friendly."

Write-Host "Kinderlexikon Character Generator MIT Tiergefährten" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "Generating Character with emotion: $Emotion" -ForegroundColor Cyan
Write-Host "Including matching animal companion for extra fun!" -ForegroundColor Magenta

Write-Host "Using detailed text prompts for consistent character generation" -ForegroundColor Green
Write-Host ""

# Erstelle Request
$requestBody = @{
    model = "gpt-image-1"
    prompt = $fullPrompt
    n = 1
    size = "1024x1536"
    quality = "high"
} | ConvertTo-Json -Depth 3

try {
    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Generating HD portrait image (1024x1536) with animal companion..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "https://api.openai.com/v1/images/generations" -Method Post -Body $requestBody -Headers $headers
    
    if ($response.data -and $response.data[0].b64_json) {
        # Finde einen freien Dateinamen
        $baseFileName = "Character-$Emotion"
        $counter = 1
        do {
            if ($Count -eq 1) {
                # Für einzelne Bilder: erst ohne Suffix versuchen, dann mit -1, -2, etc.
                if ($counter -eq 1) {
                    $outputPath = ".\Characters\$baseFileName.png"
                } else {
                    $outputPath = ".\Characters\$baseFileName-$counter.png"
                }
            } else {
                # Für mehrere Bilder: immer mit Suffix
                $outputPath = ".\Characters\$baseFileName-$counter.png"
            }
            $counter++
        } while (Test-Path $outputPath)
        
        $imageBytes = [System.Convert]::FromBase64String($response.data[0].b64_json)
        [System.IO.File]::WriteAllBytes($outputPath, $imageBytes)
        
        Write-Host "Character with animal companion generated successfully: $outputPath" -ForegroundColor Green
        Write-Host ""
        Write-Host "Available emotions: excited, curious, surprised, thinking, laughing, idle" -ForegroundColor Gray
        Write-Host "Each emotion includes a matching animal companion for extra fun!" -ForegroundColor Gray
        

    } else {
        Write-Host "Failed to generate character image" -ForegroundColor Red
    }
} catch {
    Write-Host "Error generating character: $_" -ForegroundColor Red
}

Write-Host "" 