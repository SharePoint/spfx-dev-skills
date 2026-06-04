# Upgrade SPFx Project

## Before you start

1. **Ensure a clean, committed git state.** The upgrade rewrites many files; the user needs a clean baseline to review the diff and roll back. If the working tree is dirty, ask the user to commit or stash first.
2. **Detect the current version.** Read `.yo-rc.json` (`@microsoft/generator-sharepoint.version`) and the `@microsoft/sp-*` versions in `package.json`. State the current and target versions before running anything.
3. **Check Node/TypeScript compatibility for the target version.** Each SPFx version supports specific Node ranges. If the installed Node is outside the target's range the build will fail — surface this up front (use `m365 spfx doctor` if unsure).

## Run the upgrade

From the SPFx project root, use CLI for Microsoft 365 via npx:

- If the user specified a target version:
  ```
  npx --package @pnp/cli-microsoft365@latest -- m365 spfx project upgrade --toVersion <version> --output md
  ```
- If no version specified (upgrade to latest supported):
  ```
  npx --package @pnp/cli-microsoft365@latest -- m365 spfx project upgrade --output md
  ```

## Apply the upgrade

Read the generated report and apply **all** steps in the order listed. The report contains file modifications, package version changes, and configuration updates. Apply them sequentially — order matters. If a step targets a customized file, merge carefully rather than overwriting custom logic.

## Toolchain change at v1.22 (gulp → Heft)

Crossing the **v1.21.1 → v1.22** boundary does **not** automatically switch the project to Heft. An upgraded project keeps working on **gulp**. Decide with the user:

- **Stay on gulp** — supported on upgraded projects through v1.23, **unsupported at v1.24**. No further action needed.
- **Migrate to Heft** — a dedicated migration beyond the normal upgrade: uninstall gulp packages (`@microsoft/sp-build-web`, `ajv`, `gulp`, the matching `@microsoft/rush-stack-compiler-*`), install the Heft toolchain dependencies, add `./config/rig.json` referencing `@microsoft/spfx-web-build-rig`, and replace the `build`/`clean`/`test` npm scripts with Heft commands. See [toolchain.md](./toolchain.md) for the resulting commands.

## Verify

1. Run `npm install --silent --no-fund --no-audit` to update dependencies.
2. Run `npm run build` and resolve every error — the upgrade is not complete until the build is clean.
3. Fix any **deprecated or removed APIs** flagged as build errors.
4. Tell the user to serve the project (`heft start` on v1.22+, `gulp serve` on legacy), smoke-test in the workbench, and review the git diff before committing.
