# Node Manager Detection and Switching

Use this guide during SPFx upgrades to align the machine with the **recommended Node major** from the official SPFx compatibility matrix:

- https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility

## Step 1 — Read the live compatibility matrix (preferred)

Before running the script, fetch the compatibility page above and find the row in the **SPFx development environment compatibility** table matching the detected/target SPFx version (e.g. `1.22.2` → `Node.js (LTS)` column). This keeps the check accurate for SPFx releases published after this skill was last updated.

- Recommended major = the newest Node LTS listed for that row (e.g. `v18` → `18`).
- Supported majors = all Node majors listed for that row (e.g. `v16, v18` → `16, 18`).

If the page can't be fetched (offline, blocked, page structure changed) or the target SPFx version isn't listed, skip straight to [Step 2](#step-2--run-the-compatibility-script) without `-RecommendedMajor`/`-SupportedMajors` — the script falls back to its own static built-in matrix.

## Step 2 — Run the compatibility script

`check-spfx-node-compatibility.ps1` detects the SPFx version, resolves Node compatibility (from the live values you pass in, or its static built-in matrix otherwise), detects an installed Node manager (nvm (Windows) → nvs → fnm → volta, in that order, in-process — no extra script call needed), and reports (or fixes) the gap in one pass.

From the skill root (the folder containing `scripts`), run with the values read from the live matrix:

```powershell
pwsh -File ./scripts/check-spfx-node-compatibility.ps1 -ProjectPath <spfx-project-root> -RecommendedMajor <recommended-major> -SupportedMajors <major1>,<major2>
```

If you skipped Step 1 (no live data), omit `-RecommendedMajor`/`-SupportedMajors` and the script uses its static mapping instead:

```powershell
pwsh -File ./scripts/check-spfx-node-compatibility.ps1 -ProjectPath <spfx-project-root>
```

To automatically install/switch to the recommended Node major when missing (only when a manager is detected):

```powershell
pwsh -File ./scripts/check-spfx-node-compatibility.ps1 -ProjectPath <spfx-project-root> -RecommendedMajor <recommended-major> -SupportedMajors <major1>,<major2> -InstallIfMissing
```

The script returns JSON with:

- `matrixSource`: `"live"` when `-RecommendedMajor` was supplied, `"static"` when it fell back to the built-in matrix
- detected SPFx version
- recommended and supported Node majors
- current Node version compatibility
- detected Node manager + installed Node majors
- performed actions, warnings, and manual fallback instructions

Exit codes:

- `0`: current Node is supported for the target SPFx version
- `2`: current Node is not supported
- `1`: detection error, or SPFx version not covered by the static matrix and no `-RecommendedMajor` was supplied

Note: when `matrixSource` is `"static"` and the target SPFx version is newer than the matrix's last verified version, the output includes a `warnings` entry saying the recommendation is assumed, not verified — that's the signal to re-check the live page.

## Step 3 — Write `.nvmrc` (required, do this even if the current Node already satisfies the check)

After Step 2 succeeds, always create or update `.nvmrc` at the SPFx project root with `node.recommendedMajor` from the JSON output — do this whether or not `currentIsSupported` was already `true`. This is a required action, not optional documentation: write the file yourself, don't just report the recommended major to the user.

Example `.nvmrc` content (recommended major `18`):

```text
18
```

## Manual fallback

If `manager.detected` is `false`, or `-InstallIfMissing` reports a failed action:

1. Ask the user to install/switch Node manually to the **recommended** major from the check output (e.g. `nvm install <major>` / `nvs add <major>` / `fnm install <major>` / `volta install node@<major>`, then the matching `use`/`pin` command).
2. Confirm with `node --version`.
3. Re-run the compatibility check and continue only once it exits `0`.

## Standalone manager detection (optional)

`detect-node-manager.ps1` detects only which Node manager is present, without any SPFx/compatibility logic. Use it outside the SPFx upgrade flow, e.g. for generic Node-manager scripting:

```powershell
pwsh -File ./scripts/detect-node-manager.ps1
```

Returns compact JSON, e.g. `{"detected":true,"manager":"nvm (Windows)","version":"1.2.2"}` or `{"detected":false,"manager":"manual","version":""}`.

## Related scripts

- `./scripts/check-spfx-node-compatibility.ps1`: primary tool — maps SPFx to Node compatibility, detects the manager, and can install/switch the recommended Node.
- `./scripts/detect-node-manager.ps1`: standalone manager detection, not required for the SPFx compatibility flow above.
