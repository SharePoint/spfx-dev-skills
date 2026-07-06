$checks = @(
  @{ Name = "nvm (Windows)"; Exec = "nvm"; Args = @("--version") },
  @{ Name = "nvs"; Exec = "nvs"; Args = @("--version") },
  @{ Name = "fnm"; Exec = "fnm"; Args = @("--version") },
  @{ Name = "volta"; Exec = "volta"; Args = @("--version") }
)

foreach ($check in $checks) {
  try {
    $output = & $check.Exec @($check.Args) 2>$null
    $exitCode = $LASTEXITCODE
    $version = ($output | Out-String).Trim()

    if ($exitCode -eq 0 -and -not [string]::IsNullOrWhiteSpace($version)) {
      [pscustomobject]@{
        detected = $true
        manager = $check.Name
        version = $version
      } | ConvertTo-Json -Compress
      exit 0
    }
  }
  catch {
    # Continue to the next manager candidate.
  }
}

[pscustomobject]@{
  detected = $false
  manager = "manual"
  version = ""
} | ConvertTo-Json -Compress

exit 1
