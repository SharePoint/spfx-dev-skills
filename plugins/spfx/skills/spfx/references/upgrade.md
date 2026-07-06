# Upgrade SPFx Project

## Ensure CLI for Microsoft 365 is installed

Run `m365 version` to check if CLI for Microsoft 365 is installed. If the command fails (not found), install it globally:

```
npm install -g @pnp/cli-microsoft365@latest --silent --no-fund --no-audit
```

## Before you start

1. **Ensure a clean, committed git state.** The upgrade rewrites many files; the user needs a clean baseline to review the diff and roll back. If the working tree is dirty, ask the user to commit or stash first.
2. **Detect the current version.** Read `.yo-rc.json` (`@microsoft/generator-sharepoint.version`) and the `@microsoft/sp-*` versions in `package.json`. State the current and target versions before running anything.
3. **Run compatibility matrix check first (required).** See [node-manager.md](./node-manager.md) for the full flow: fetch the live compatibility table from https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility for the target SPFx version and pass the result to the script, or omit it to use the script's static built-in matrix:
  ```
  pwsh -File ./scripts/check-spfx-node-compatibility.ps1 -ProjectPath <spfx-project-root> -RecommendedMajor <major> -SupportedMajors <major1>,<major2>
  ```
  If the recommended Node major is not installed, try automatic install/switch via detected manager:
  ```
  pwsh -File ./scripts/check-spfx-node-compatibility.ps1 -ProjectPath <spfx-project-root> -RecommendedMajor <major> -SupportedMajors <major1>,<major2> -InstallIfMissing
  ```
  If no manager is detected (or automatic install fails), ask the user to install/switch manually, confirm with `node --version`, then continue.
4. **Create/update `.nvmrc` (required).** See [node-manager.md](./node-manager.md#step-3--write-nvmrc-required-do-this-even-if-the-current-node-already-satisfies-the-check) — write `.nvmrc` at the project root with the `node.recommendedMajor` value from the check output. Do this even if the current Node version already passed the check; don't skip it just because no install/switch was needed.

## Run the upgrade

From the SPFx project root, run CLI for Microsoft 365:

- If the user specified a target version:
  ```
  m365 spfx project upgrade --toVersion <version> --output md
  ```
- If no version specified (upgrade to latest supported):
  ```
  m365 spfx project upgrade --output md
  ```

## Apply the upgrade

Read the generated report and apply **all** steps in the order listed. The report contains file modifications, package version changes, and configuration updates. Apply them sequentially — order matters. If a step targets a customized file, merge carefully rather than overwriting custom logic.

## Verify

1. **Clean stale dependencies first (required).** The upgrade changes `@microsoft/sp-*` and other package versions in `package.json`; reinstalling on top of the old `node_modules`/lock file/build output can silently keep incompatible resolved versions. From the SPFx project root, run:
   ```
   pwsh -File <skill-root>/scripts/cleanup-dependencies.ps1 -PackageManager <npm|pnpm|yarn>
   ```
   `<skill-root>` is this skill's folder (the one containing `scripts/`). Pass the package manager the project actually uses — check for `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` — or omit `-PackageManager` to clear all lock files if unsure. This removes `node_modules`, the lock file, and build output (`.heft`, `temp`, `lib`, `dist`, `release`).
2. Run `npm install --silent --no-fund --no-audit` (or the project's actual package manager) to reinstall dependencies from the updated `package.json`.
3. Run `npm run build` and resolve every error — the upgrade is not complete until the build is clean.
4. Fix any **deprecated or removed APIs** flagged as build errors.
5. Tell the user to serve the project (`heft start` on v1.22+, `gulp serve` on legacy), smoke-test in the workbench, and review the git diff before committing.
