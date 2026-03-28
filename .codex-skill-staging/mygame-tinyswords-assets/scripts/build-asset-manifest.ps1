param(
    [string]$AssetRoot = "public/assets/tinyswords",
    [string]$OutputPath = "public/assets/tinyswords/asset-manifest.json"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Normalize-KeyPart {
    param([string]$Value)

    $normalized = $Value.ToLowerInvariant()
    $normalized = $normalized -replace "[^a-z0-9]+", "."
    $normalized = $normalized -replace "\.+", "."
    return $normalized.Trim(".")
}

function Normalize-Segment {
    param(
        [string]$Segment,
        [string]$Family
    )

    $value = $Segment

    if ($value -ieq $Family) {
        return ""
    }

    if ($Family -eq "Buildings" -and $value -match "^(.*)\s+Buildings$") {
        return Normalize-KeyPart $matches[1]
    }

    if ($Family -eq "Units" -and $value -match "^(.*)\s+Units$") {
        return Normalize-KeyPart $matches[1]
    }

    return Normalize-KeyPart $value
}

function Get-PngDimensions {
    param([string]$Path)

    $stream = [System.IO.File]::OpenRead($Path)
    try {
        $reader = New-Object System.IO.BinaryReader($stream)
        $signature = $reader.ReadBytes(8)
        $chunkLengthBytes = $reader.ReadBytes(4)
        $chunkTypeBytes = $reader.ReadBytes(4)
        $widthBytes = $reader.ReadBytes(4)
        $heightBytes = $reader.ReadBytes(4)

        [Array]::Reverse($widthBytes)
        [Array]::Reverse($heightBytes)

        return @{
            width = [BitConverter]::ToUInt32($widthBytes, 0)
            height = [BitConverter]::ToUInt32($heightBytes, 0)
        }
    }
    finally {
        $stream.Dispose()
    }
}

$resolvedRoot = (Resolve-Path $AssetRoot).Path
$files = Get-ChildItem $resolvedRoot -Recurse -File | Where-Object {
    $_.Name -ne ".DS_Store"
}

$items = foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($resolvedRoot.Length + 1).Replace("\", "/")
    $segments = $relativePath.Split("/")
    $extension = $file.Extension.ToLowerInvariant()
    $family = if ($segments.Length -gt 0) { $segments[0] } else { "" }
    $keyParts = @("tinyswords")

    for ($i = 0; $i -lt $segments.Length; $i++) {
        $segment = $segments[$i]
        $normalized = if ($segment -eq $file.Name) {
            Normalize-KeyPart ([System.IO.Path]::GetFileNameWithoutExtension($segment))
        } elseif ($i -eq 0) {
            Normalize-KeyPart $segment
        } else {
            Normalize-Segment -Segment $segment -Family $family
        }

        if (-not [string]::IsNullOrWhiteSpace($normalized)) {
            $keyParts += $normalized
        }
    }

    $item = [ordered]@{
        key = ($keyParts -join ".")
        path = "/assets/tinyswords/$relativePath"
        relativePath = $relativePath
        family = $family
        extension = $extension
        bytes = $file.Length
    }

    if ($extension -eq ".png") {
        $size = Get-PngDimensions -Path $file.FullName
        $item.width = $size.width
        $item.height = $size.height
    }

    [PSCustomObject]$item
}

$summary = [ordered]@{
    root = "/assets/tinyswords"
    generatedAt = (Get-Date).ToString("o")
    totalFiles = @($items).Count
    byExtension = @{}
    byFamily = @{}
}

foreach ($group in ($items | Group-Object extension)) {
    $summary.byExtension[$group.Name] = $group.Count
}

foreach ($group in ($items | Group-Object family)) {
    $summary.byFamily[$group.Name] = $group.Count
}

$manifest = [ordered]@{
    summary = $summary
    items = @($items)
}

$outputDirectory = Split-Path -Parent $OutputPath
if ($outputDirectory) {
    New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
}

$manifest | ConvertTo-Json -Depth 6 | Set-Content -Path $OutputPath -Encoding utf8
Write-Output "Wrote manifest to $OutputPath"
