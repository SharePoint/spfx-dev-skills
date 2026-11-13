# Upgrade SPFx Project

## Ensure CLI for Microsoft 365 is installed

Run `m365 version` to check if CLI for Microsoft 365 is installed. If the command fails (not found), install it globally:

```
npm install -g @pnp/cli-microsoft365@latest --silent --no-fund --no-audit
```

## Before you start

1. **Ensure a clean, committed git state.** The upgrade rewrites many files; the user needs a clean baseline to review the diff and roll back. If the working tree is dirty, ask the user to commit or stash first.
2. **Detect the current version.** Read `.yo-rc.json` (`@microsoft/generator-sharepoint.version`) and the `@microsoft/sp-*` versions in `package.json`. State the current and target versions before running anything.
3. **Check Node/TypeScript compatibility for the target version.** Each SPFx version supports specific Node ranges. If the installed Node is outside the target's range the build will fail — surface this up front (use `m365 spfx doctor` if unsure).

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

Read the **entire** generated report and apply **all** steps in the order listed. The report is long, so if you read it in parts, keep reading until you reach the end of its final `## Summary` section; don't decide how much to read from a line count. The report contains file modifications, package version changes, and configuration updates. Apply them sequentially — order matters. If a step targets a customized file, merge carefully rather than overwriting custom logic.

- Migrate retained gulp customizations to **Heft** for supported 1.24 builds using the [official migration guide](https://learn.microsoft.com/sharepoint/dev/spfx/toolchain/migrate-gulptoolchain-hefttoolchain). Check whether the CLI report includes this migration; version edits alone are insufficient.
- Follow the [React 18 migration guide](https://learn.microsoft.com/sharepoint/dev/spfx/react-18-upgrade): exact `react` / `react-dom` **18.3.1**, compatible React 18 types, configuration/externals and dependency overrides. Replace owned legacy mounts with one reusable `createRoot` per container and matching unmount/disposal across web parts, extensions/placeholders/cells, dialogs, property controls, tests and Copilot `onTeardown`. Check explicit `children`, batching and effect cleanup; do not add React to non-React solutions.

## Verify

1. Run `npm install --silent --no-fund --no-audit` to update dependencies.
2. Run `npm run build` and resolve every error — the upgrade is not complete until the build is clean.
3. Fix any **deprecated or removed APIs** flagged as build errors.
4. Tell the user to serve the project (`heft start` on v1.22+, `gulp serve` on legacy), smoke-test in the workbench, and review the git diff before committing.
