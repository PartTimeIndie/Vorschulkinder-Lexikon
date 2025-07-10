# Kinderlexikon Image Processor - Fixed Version
# Processes images for children's encyclopedia with OpenAI API
# 
# Usage: powershell -ExecutionPolicy Bypass -File .\Kinderlexikon-ImageProcessor-Fixed.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$OpenAIKey = $env:OPENAI_API_KEY,
    
    [Parameter(Mandatory=$false)]
    [string]$InputImage,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFolder = ".\ProcessedImages"
)

# Configuration
$BaseCharacterPath = ".\Characters\BaseCharacter.png"
$OpenAIApiUrl = "https://api.openai.com/v1"

# Kinderlexikon-specific style
$KinderlexikonPrompt = "Create a warm, friendly, and educational illustration perfect for a children's encyclopedia (ages 3-7). Use bright, cheerful colors with soft edges and clear, simple forms. The style should be inviting and never scary, with a hand-drawn storybook quality. Focus on clarity and educational value while maintaining visual appeal for young children. The image should be square format (1024x1024) optimized for use as encyclopedia tiles. Make sure any characters are friendly, approachable, and suitable for preschool children."

function Get-ApiKey {
    # First try to read from api-key.txt file
    $apiKeyFile = ".\api-key.txt"
    if (Test-Path $apiKeyFile) {
        try {
            $key = Get-Content $apiKeyFile -Raw
            if ($key) {
                $key = $key.Trim()
                if ($key.Length -gt 0) {
                    Write-Host "API Key loaded from api-key.txt" -ForegroundColor Green
                    return $key
                }
            }
        } catch {
            Write-Host "Warning: Could not read api-key.txt" -ForegroundColor Yellow
        }
    }
    
    # Fallback to parameter or environment variable
    if ($OpenAIKey) {
        return $OpenAIKey
    }
    
    # Last resort: ask user
    $key = Read-Host "Please enter your OpenAI API Key"
    if (-not $key) {
        Write-Host "Error: OpenAI API key is required" -ForegroundColor Red
        Write-Host "Create a file 'api-key.txt' with your OpenAI API key" -ForegroundColor Yellow
        exit 1
    }
    return $key
}

function Convert-ImageToBase64 {
    param([string]$ImagePath)
    
    if (-not (Test-Path $ImagePath)) {
        Write-Host "Error: Image file not found: $ImagePath" -ForegroundColor Red
        return $null
    }
    
    try {
        $imageBytes = [System.IO.File]::ReadAllBytes($ImagePath)
        $base64 = [System.Convert]::ToBase64String($imageBytes)
        return $base64
    } catch {
        Write-Host "Error converting image to base64: $_" -ForegroundColor Red
        return $null
    }
}

function Get-ImageMimeType {
    param([string]$FilePath)
    
    $extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
    
    switch ($extension) {
        ".jpg" { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".png" { return "image/png" }
        ".gif" { return "image/gif" }
        ".bmp" { return "image/bmp" }
        ".webp" { return "image/webp" }
        default { return "image/jpeg" }
    }
}

function Process-SingleImage {
    param(
        [string]$ImagePath,
        [string]$ApiKey
    )
    
    Write-Host "Processing image: $([System.IO.Path]::GetFileName($ImagePath))" -ForegroundColor Cyan
    
    # Check if base character exists
    $useBaseCharacter = Test-Path $BaseCharacterPath
    
    if ($useBaseCharacter) {
        Write-Host "Using base character reference" -ForegroundColor Green
    } else {
        Write-Host "Processing without base character reference" -ForegroundColor Yellow
    }
    
    # Convert images to base64
    $imageBase64 = Convert-ImageToBase64 -ImagePath $ImagePath
    if (-not $imageBase64) {
        return $false
    }
    
    $imageMimeType = Get-ImageMimeType -FilePath $ImagePath
    
    # Create analysis prompt
    $analysisPrompt = "Analyze this image for use in a children's encyclopedia (Kinderlexikon) for ages 3-7. Provide a detailed description that focuses on: 1. Educational content - what can children learn from this image? 2. Main subject matter and key visual elements 3. Colors, shapes, and composition suitable for young children 4. Any characters, objects, or scenes that should be child-friendly. Make the description engaging and educational while ensuring all content is appropriate for preschool children."

    if ($useBaseCharacter) {
        $analysisPrompt += " Additionally, if there are characters in the image, compare them to the base character reference and note design consistency for the encyclopedia character style."
    }
    
    # Create request content
    $requestContent = @()
    $requestContent += @{
        type = "text"
        text = $analysisPrompt
    }
    
    # Add base character if available
    if ($useBaseCharacter) {
        $baseCharacterBase64 = Convert-ImageToBase64 -ImagePath $BaseCharacterPath
        if ($baseCharacterBase64) {
            $baseCharacterMimeType = Get-ImageMimeType -FilePath $BaseCharacterPath
            $baseUrl = "data:" + $baseCharacterMimeType + ";base64," + $baseCharacterBase64
            $requestContent += @{
                type = "image_url"
                image_url = @{
                    url = $baseUrl
                }
            }
        }
    }
    
    # Add target image
    $targetUrl = "data:" + $imageMimeType + ";base64," + $imageBase64
    $requestContent += @{
        type = "image_url"
        image_url = @{
            url = $targetUrl
        }
    }
    
    # Step 1: Analyze the image
    Write-Host "  Step 1: Analyzing image..." -ForegroundColor Cyan
    
    $analysisBody = @{
        model = "gpt-4o"
        messages = @(
            @{
                role = "user"
                content = $requestContent
            }
        )
        max_tokens = 600
    } | ConvertTo-Json -Depth 6
    
    try {
        $headers = @{
            "Authorization" = "Bearer " + $ApiKey
            "Content-Type" = "application/json"
        }
        
        $chatUrl = $OpenAIApiUrl + "/chat/completions"
        $response = Invoke-RestMethod -Uri $chatUrl -Method Post -Body $analysisBody -Headers $headers
        
        if ($response.choices -and $response.choices[0].message.content) {
            $description = $response.choices[0].message.content
            Write-Host "  Image analyzed successfully" -ForegroundColor Green
        } else {
            Write-Host "  Failed to analyze image" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  Error calling OpenAI API for analysis: $_" -ForegroundColor Red
        return $false
    }
    
    # Step 2: Generate new image
    Write-Host "  Step 2: Generating child-friendly image..." -ForegroundColor Cyan
    
    $combinedPrompt = $description + " " + $KinderlexikonPrompt
    
    $generationBody = @{
        model = "gpt-image-1"
        prompt = $combinedPrompt
        n = 1
        size = "1024x1024"
        quality = "high"
    } | ConvertTo-Json -Depth 3
    
    try {
        $imageUrl = $OpenAIApiUrl + "/images/generations"
        $response = Invoke-RestMethod -Uri $imageUrl -Method Post -Body $generationBody -Headers $headers
        
        if ($response.data -and $response.data[0].b64_json) {
            # Save the generated image
            $baseName = [System.IO.Path]::GetFileNameWithoutExtension($ImagePath)
            $outputPath = Join-Path $OutputFolder ($baseName + "-kinderlexikon.png")
            
            $imageBytes = [System.Convert]::FromBase64String($response.data[0].b64_json)
            [System.IO.File]::WriteAllBytes($outputPath, $imageBytes)
            
            # Save the description
            $descriptionPath = Join-Path $OutputFolder ($baseName + "-description.txt")
            $description | Out-File -FilePath $descriptionPath -Encoding UTF8
            
            Write-Host "  Generated image saved: $outputPath" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  Failed to generate image" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  Error generating image: $_" -ForegroundColor Red
        return $false
    }
}

function Process-AllImagesInFolder {
    param(
        [string]$FolderPath,
        [string]$ApiKey
    )
    
    # Get all image files
    $extensions = @("*.jpg", "*.jpeg", "*.png", "*.gif", "*.bmp", "*.webp")
    $imageFiles = @()
    
    foreach ($ext in $extensions) {
        $files = Get-ChildItem -Path $FolderPath -Filter $ext -ErrorAction SilentlyContinue
        $imageFiles += $files | Where-Object { $_.Name -ne "BaseCharacter.png" }
    }
    
    if ($imageFiles.Count -eq 0) {
        Write-Host "No image files found in: $FolderPath" -ForegroundColor Yellow
        Write-Host "Please add images to process (BaseCharacter.png is used as reference only)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Found $($imageFiles.Count) images to process" -ForegroundColor Green
    
    $successCount = 0
    $totalCount = $imageFiles.Count
    
    foreach ($imageFile in $imageFiles) {
        Write-Host "Processing $($successCount + 1)/$totalCount" -ForegroundColor Cyan
        
        $success = Process-SingleImage -ImagePath $imageFile.FullName -ApiKey $ApiKey
        if ($success) {
            $successCount++
        }
        
        # Small delay to respect rate limits
        Start-Sleep -Milliseconds 1000
    }
    
    Write-Host "Processing complete! $successCount/$totalCount images processed successfully." -ForegroundColor Green
}

# Main execution
try {
    Write-Host "Kinderlexikon Image Processor - Fixed Version" -ForegroundColor Yellow
    Write-Host "=============================================" -ForegroundColor Yellow
    
    # Get API key
    $apiKey = Get-ApiKey
    
    # Create output folder
    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
        Write-Host "Created output folder: $OutputFolder" -ForegroundColor Green
    }
    
    if ($InputImage) {
        # Process single image
        if (Test-Path $InputImage) {
            $success = Process-SingleImage -ImagePath $InputImage -ApiKey $apiKey
            if ($success) {
                Write-Host "Single image processed successfully!" -ForegroundColor Green
            } else {
                Write-Host "Failed to process image" -ForegroundColor Red
            }
        } else {
            Write-Host "Error: Input image not found: $InputImage" -ForegroundColor Red
        }
    } else {
        # Process all images in Characters folder
        if (Test-Path ".\Characters") {
            Process-AllImagesInFolder -FolderPath ".\Characters" -ApiKey $apiKey
        } else {
            Write-Host "Characters folder not found. Please create it and add images to process." -ForegroundColor Yellow
            Write-Host "Or use -InputImage parameter to process a specific image." -ForegroundColor Yellow
        }
    }
    
} catch {
    Write-Host "Script error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
Read-Host 