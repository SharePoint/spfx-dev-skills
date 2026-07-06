param(
  [ValidateSet("npm", "pnpm", "yarn", "")]
  [string]$PackageManager = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

switch ($PackageManager) {
  "pnpm" { Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue }
  "yarn" { Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue }
  "npm"  { Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue }
  default {
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
    Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue
    Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue
  }
}

Remove-Item -Recurse -Force .heft -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force temp -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force lib -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force release -ErrorAction SilentlyContinue
