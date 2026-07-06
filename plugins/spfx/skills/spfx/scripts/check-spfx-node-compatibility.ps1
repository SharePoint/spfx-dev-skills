param(
  [string]$ProjectPath = ".",
  [string]$SpfxVersion,
  [switch]$InstallIfMissing,
  [int]$RecommendedMajor,
  [int[]]$SupportedMajors
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-ToolOutput {
  param(
    [Parameter(Mandatory = $true)][string]$Command,
    [string[]]$Args = @()
  )

  try {
    $output = & $Command @Args 2>$null
    return [pscustomobject]@{
      Success = ($LASTEXITCODE -eq 0)
      Output = (($output | Out-String).Trim())
    }
  }
  catch {
    return [pscustomobject]@{
      Success = $false
      Output = ""
    }
  }
}

function Get-FirstSemVerFromString {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $null
  }

  $match = [regex]::Match($Value, '(\d+\.\d+\.\d+)')
  if ($match.Success) {
    return $match.Groups[1].Value
  }

  return $null
}

function Get-SpfxVersionFromProject {
  param([string]$Root)

  $yoRcPath = Join-Path $Root ".yo-rc.json"
  if (Test-Path $yoRcPath) {
    try {
      $yo = Get-Content $yoRcPath -Raw | ConvertFrom-Json
      if ($yo.'@microsoft/generator-sharepoint'.version) {
        $fromYoRc = Get-FirstSemVerFromString -Value $yo.'@microsoft/generator-sharepoint'.version
        if ($fromYoRc) {
          return $fromYoRc
        }
      }
    }
    catch {
      # Fall through to package.json detection.
    }
  }

  $packageJsonPath = Join-Path $Root "package.json"
  if (Test-Path $packageJsonPath) {
    $pkg = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

    $candidates = @(
      $pkg.dependencies.'@microsoft/sp-core-library',
      $pkg.dependencies.'@microsoft/sp-build-web',
      $pkg.devDependencies.'@microsoft/sp-build-web',
      $pkg.dependencies.'@microsoft/generator-sharepoint',
      $pkg.devDependencies.'@microsoft/generator-sharepoint'
    )

    foreach ($candidate in $candidates) {
      $parsed = Get-FirstSemVerFromString -Value $candidate
      if ($parsed) {
        return $parsed
      }
    }
  }

  return $null
}

# Manually maintained mapping from the SharePoint Framework Platform & Toolchain Compatibility
# Reference (https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility). This script
# does NOT query that page at runtime -- when Microsoft publishes a newer SPFx release, update
# $script:LatestKnownSpfxVersion below and add/adjust a branch in Get-SpfxNodeCompatibility.
# Last verified against the matrix: SPFx 1.23.0 -> Node v22 (2026-07-06).
$script:LatestKnownSpfxVersion = [Version]"1.23.0"

function Get-SpfxNodeCompatibility {
  param([Version]$Spfx)

  if ($Spfx -ge [Version]"1.21.0") {
    return [pscustomobject]@{ RecommendedMajor = 22; SupportedMajors = @(22) }
  }

  if ($Spfx -ge [Version]"1.19.0" -and $Spfx -lt [Version]"1.21.0") {
    return [pscustomobject]@{ RecommendedMajor = 18; SupportedMajors = @(18) }
  }

  if ($Spfx -ge [Version]"1.18.0" -and $Spfx -lt [Version]"1.19.0") {
    return [pscustomobject]@{ RecommendedMajor = 18; SupportedMajors = @(16, 18) }
  }

  if ($Spfx -ge [Version]"1.16.0" -and $Spfx -lt [Version]"1.18.0") {
    return [pscustomobject]@{ RecommendedMajor = 16; SupportedMajors = @(16) }
  }

  if ($Spfx -ge [Version]"1.15.0" -and $Spfx -lt [Version]"1.16.0") {
    return [pscustomobject]@{ RecommendedMajor = 16; SupportedMajors = @(12, 14, 16) }
  }

  if ($Spfx -ge [Version]"1.13.0" -and $Spfx -lt [Version]"1.15.0") {
    return [pscustomobject]@{ RecommendedMajor = 14; SupportedMajors = @(12, 14) }
  }

  if ($Spfx -ge [Version]"1.12.1" -and $Spfx -lt [Version]"1.13.0") {
    return [pscustomobject]@{ RecommendedMajor = 14; SupportedMajors = @(10, 12, 14) }
  }

  if ($Spfx -ge [Version]"1.11.0" -and $Spfx -lt [Version]"1.12.1") {
    return [pscustomobject]@{ RecommendedMajor = 10; SupportedMajors = @(10) }
  }

  if ($Spfx -ge [Version]"1.8.2" -and $Spfx -lt [Version]"1.11.0") {
    return [pscustomobject]@{ RecommendedMajor = 10; SupportedMajors = @(8, 10) }
  }

  if ($Spfx -ge [Version]"1.7.0" -and $Spfx -lt [Version]"1.8.2") {
    return [pscustomobject]@{ RecommendedMajor = 8; SupportedMajors = @(8) }
  }

  if ($Spfx -ge [Version]"1.4.1" -and $Spfx -lt [Version]"1.7.0") {
    return [pscustomobject]@{ RecommendedMajor = 8; SupportedMajors = @(6, 8) }
  }

  if ($Spfx -ge [Version]"1.0.0" -and $Spfx -lt [Version]"1.4.1") {
    return [pscustomobject]@{ RecommendedMajor = 6; SupportedMajors = @(6) }
  }

  return $null
}

function Get-CurrentNodeInfo {
  $nodeResult = Get-ToolOutput -Command "node" -Args @("--version")

  if (-not $nodeResult.Success -or [string]::IsNullOrWhiteSpace($nodeResult.Output)) {
    return [pscustomobject]@{
      Detected = $false
      Version = ""
      Major = $null
    }
  }

  $semver = Get-FirstSemVerFromString -Value $nodeResult.Output
  if (-not $semver) {
    return [pscustomobject]@{
      Detected = $false
      Version = ""
      Major = $null
    }
  }

  $major = ([Version]$semver).Major

  return [pscustomobject]@{
    Detected = $true
    Version = $semver
    Major = $major
  }
}

# Single source of truth for manager metadata, shared by detection and installed-version listing.
# Order matches detect-node-manager.ps1: nvm (Windows) -> nvs -> fnm -> volta.
$script:NodeManagerCatalog = @(
  [pscustomobject]@{ Name = "nvm (Windows)"; Exec = "nvm";   ListArgs = @("list");         ListRegex = '(\d+)\.\d+\.\d+' }
  [pscustomobject]@{ Name = "nvs";           Exec = "nvs";   ListArgs = @("ls");           ListRegex = 'node\/(\d+)\.\d+\.\d+' }
  [pscustomobject]@{ Name = "fnm";           Exec = "fnm";   ListArgs = @("list");         ListRegex = 'v?(\d+)\.\d+\.\d+' }
  [pscustomobject]@{ Name = "volta";         Exec = "volta"; ListArgs = @("list", "node"); ListRegex = 'v(\d+)\.\d+\.\d+' }
)

function Get-DetectedNodeManager {
  # Detects in-process instead of spawning a child pwsh process for detect-node-manager.ps1.
  # Avoids process-startup overhead, a hard dependency on the sibling script file, and a
  # dependency on the "pwsh" executable name being on PATH.
  foreach ($candidate in $script:NodeManagerCatalog) {
    $result = Get-ToolOutput -Command $candidate.Exec -Args @("--version")
    if ($result.Success -and -not [string]::IsNullOrWhiteSpace($result.Output)) {
      return [pscustomobject]@{ Detected = $true; Manager = $candidate.Name; Version = $result.Output }
    }
  }

  return [pscustomobject]@{ Detected = $false; Manager = "manual"; Version = "" }
}

function Get-InstalledMajorsForManager {
  param([string]$Manager)

  $definition = $script:NodeManagerCatalog | Where-Object { $_.Name -eq $Manager }
  if (-not $definition) {
    return @()
  }

  $result = Get-ToolOutput -Command $definition.Exec -Args $definition.ListArgs
  if (-not $result.Success) {
    return @()
  }

  return @(
    [regex]::Matches($result.Output, $definition.ListRegex) |
      ForEach-Object { [int]$_.Groups[1].Value } |
      Sort-Object -Unique
  )
}

function Install-AndUseRecommendedNode {
  param(
    [string]$Manager,
    [int]$RecommendedMajor
  )

  switch ($Manager) {
    "nvm (Windows)" {
      & nvm install "$RecommendedMajor"
      if ($LASTEXITCODE -ne 0) { throw "nvm install failed." }
      & nvm use "$RecommendedMajor"
      if ($LASTEXITCODE -ne 0) { throw "nvm use failed." }
      return "Installed and switched Node v$RecommendedMajor using nvm (Windows)."
    }
    "nvs" {
      & nvs add "$RecommendedMajor"
      if ($LASTEXITCODE -ne 0) { throw "nvs add failed." }
      & nvs use "$RecommendedMajor"
      if ($LASTEXITCODE -ne 0) { throw "nvs use failed." }
      return "Installed and switched Node v$RecommendedMajor using nvs."
    }
    "fnm" {
      & fnm install "$RecommendedMajor"
      if ($LASTEXITCODE -ne 0) { throw "fnm install failed." }
      & fnm use "$RecommendedMajor"
      if ($LASTEXITCODE -ne 0) { throw "fnm use failed." }
      return "Installed and switched Node v$RecommendedMajor using fnm."
    }
    "volta" {
      & volta install "node@$RecommendedMajor"
      if ($LASTEXITCODE -ne 0) { throw "volta install failed." }
      return "Installed Node v$RecommendedMajor using volta."
    }
    default {
      throw "No supported Node manager detected."
    }
  }
}

$resolvedProjectPath = Resolve-Path -Path $ProjectPath

if (-not $SpfxVersion) {
  $SpfxVersion = Get-SpfxVersionFromProject -Root $resolvedProjectPath
}

if (-not $SpfxVersion) {
  Write-Error "Unable to detect SPFx version. Provide -SpfxVersion explicitly or ensure .yo-rc.json/package.json contains SPFx package versions."
  exit 1
}

$matrixSource = "static"
if ($PSBoundParameters.ContainsKey('RecommendedMajor')) {
  # Caller (e.g. an agent that fetched https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility
  # live) supplies the compatibility row directly, bypassing the static built-in matrix below.
  if (-not $PSBoundParameters.ContainsKey('SupportedMajors') -or -not $SupportedMajors -or $SupportedMajors.Count -eq 0) {
    $SupportedMajors = @($RecommendedMajor)
  }
  $compat = [pscustomobject]@{ RecommendedMajor = $RecommendedMajor; SupportedMajors = $SupportedMajors }
  $matrixSource = "live"
}
else {
  $compat = Get-SpfxNodeCompatibility -Spfx ([Version]$SpfxVersion)
  if (-not $compat) {
    Write-Error "SPFx version '$SpfxVersion' is not covered by the static compatibility matrix. Pass -RecommendedMajor/-SupportedMajors from the live https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility table, or update Get-SpfxNodeCompatibility."
    exit 1
  }
}

$warnings = @()
if ($matrixSource -eq "static" -and (([Version]$SpfxVersion) -gt $script:LatestKnownSpfxVersion)) {
  $warnings += "SPFx $SpfxVersion is newer than the last version verified in this script's built-in matrix ($script:LatestKnownSpfxVersion). The Node recommendation (v$($compat.RecommendedMajor)) is assumed from the latest known entry -- verify against https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility and update Get-SpfxNodeCompatibility if it changed."
}

$node = Get-CurrentNodeInfo
$manager = Get-DetectedNodeManager
$installedMajors = if ($manager.Detected) { @(Get-InstalledMajorsForManager -Manager $manager.Manager) } else { @() }

$recommendedInstalled = $false
if ($node.Detected -and $node.Major -eq $compat.RecommendedMajor) {
  $recommendedInstalled = $true
}
if ($installedMajors -contains $compat.RecommendedMajor) {
  $recommendedInstalled = $true
}

$supportedCurrent = $false
if ($node.Detected -and ($compat.SupportedMajors -contains $node.Major)) {
  $supportedCurrent = $true
}

$actions = @()
$manualInstructions = @()

if (-not $recommendedInstalled) {
  if ($InstallIfMissing -and $manager.Detected) {
    try {
      $actions += Install-AndUseRecommendedNode -Manager $manager.Manager -RecommendedMajor $compat.RecommendedMajor
      $node = Get-CurrentNodeInfo
      $supportedCurrent = ($node.Detected -and ($compat.SupportedMajors -contains $node.Major))
      $recommendedInstalled = ($node.Detected -and $node.Major -eq $compat.RecommendedMajor)
    }
    catch {
      $manualInstructions += "Automatic install failed with manager '$($manager.Manager)': $($_.Exception.Message)"
      $manualInstructions += "Install Node v$($compat.RecommendedMajor) manually and re-run this check."
    }
  }
  elseif (-not $manager.Detected) {
    $manualInstructions += "No supported Node manager detected. Install Node v$($compat.RecommendedMajor) manually and re-run this check."
  }
}

$result = [pscustomobject]@{
  source = "https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility"
  matrixSource = $matrixSource
  spfxVersion = $SpfxVersion
  warnings = $warnings
  node = [pscustomobject]@{
    recommendedMajor = $compat.RecommendedMajor
    supportedMajors = $compat.SupportedMajors
    currentVersion = if ($node.Detected) { $node.Version } else { "" }
    currentMajor = $node.Major
    currentIsSupported = $supportedCurrent
    recommendedIsInstalled = $recommendedInstalled
  }
  manager = [pscustomobject]@{
    detected = $manager.Detected
    name = $manager.Manager
    version = $manager.Version
    installedNodeMajors = $installedMajors
  }
  actions = $actions
  manualInstructions = $manualInstructions
}

$result | ConvertTo-Json -Depth 6

if (-not $result.node.currentIsSupported) {
  exit 2
}

exit 0