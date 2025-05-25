# Get the project root directory (parent of scripts folder)
$projectRoot = Split-Path -Parent $PSScriptRoot

# Get all files recursively from src folder
$textExtensions = @('.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.json', '.md', '.yaml', '.yml')
$files = Get-ChildItem -Path "$projectRoot\src" -Recurse -File | Where-Object { $textExtensions -contains $_.Extension }

# Initialize empty array for storing formatted content and line counter
$formattedContent = @()
$totalLines = 0

foreach ($file in $files) {
    try {
        # Get relative path from src folder
        $relativePath = $file.FullName.Replace($projectRoot, "").Replace("\", "/")
        
        # Read file content
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        
        # Count lines in this file
        $fileLines = ($content | Measure-Object -Line).Lines
        $totalLines += $fileLines
        
        # Format the output
        $formattedContent += "$relativePath`n$content`n"
    }
    catch {
        Write-Warning "Skipping file $($file.Name) - Could not read content"
    }
}

# Join all content with double newlines
$result = $formattedContent -join "`n"

# Copy to clipboard
$result | Set-Clipboard
$resultLines = ($result | Measure-Object -Line).Lines
Write-Host "Code from all files in /src has been copied to clipboard! ($resultLines lines)"
Write-Host "Total number of lines across all files: $totalLines"
