# Node Manager Detection and Switching

Use this guide during SPFx upgrades to detect a Node version manager and switch to the Node major required by the target SPFx version.

## Detection order

Detect managers in this order and stop at the first valid result:

1. nvm (Windows)
2. nvs
3. fnm
4. volta

A valid result means: command exits with code 0 and returns a non-empty version string.

## Run the detector script

From the skill root (the folder containing `scripts`), run:

```powershell
pwsh -File ./scripts/detect-node-manager.ps1
```

The script returns compact JSON, for example:

```json
{"detected":true,"manager":"nvm (Windows)","version":"1.2.2"}
```

If no manager is found, it returns:

```json
{"detected":false,"manager":"manual","version":""}
```

## Switch Node version by manager

After you compute the target Node for the chosen SPFx version:

- nvm (Windows): use a full version, then switch
```powershell
nvm install <target-node-version>
nvm use <target-node-version>
```

- nvs: switch by major
```powershell
nvs use <target-node-major>
```

- fnm: switch by major
```powershell
fnm use <target-node-major>
```

- volta: pin major for the project
```powershell
volta pin node@<target-node-major>
```

## .nvmrc handling

Create or update `.nvmrc` with the target Node major.

Example:

```text
18
```

## Manual fallback

If no manager is detected:

1. Ask the user to switch Node manually to a compatible version.
2. Confirm with `node --version`.
3. Continue only after the version matches the target compatibility guidance.

## Related scripts

- `./scripts/detect-node-manager.ps1`: detects manager and version in a deterministic order.
