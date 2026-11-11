# Create SPFx Project

For an **SPFx Copilot UX component**, use [copilot.md](./copilot.md) instead of the web-part/extension scaffold below.

## Select the target and environment

Confirm the solution/component names, component type, framework, host and destination. Use a new, empty solution directory; do not overwrite an existing project. Default to **SPFx 1.24.1** for SharePoint Online unless the user requests another supported target.

Follow [setup.md](./setup.md) to select **Node.js 26 LTS**, verify the exact **1.24.1** generator and check prerequisites in the build shell. Preserve older/SharePoint Server targets and supported existing Node pins.

## Scaffold the project

```
yo @microsoft/sharepoint --solution-name "<name>" --framework react --component-type webpart --component-name "<WebPartName>" --skip-install --no-insight
```

For an **extension**, pass `--extension-type` (omit it for web parts):

```
yo @microsoft/sharepoint --solution-name "<name>" --component-type extension --extension-type ApplicationCustomizer --component-name "<Name>" --framework none --skip-install --no-insight
```

**Critical: always use non-interactive mode** with explicit flags as shown above. Interactive mode (arrow-key navigation) is unreliable in agent terminals and causes wrong template selection. Adjust flags based on what the user asks for.

Use **Heft** for supported 1.24.1 builds; do not pass `--use-gulp`. For an explicitly requested older release, verify its own generator flags and toolchain rather than applying these defaults unchanged.

## Install dependencies

From the generated project directory, run `npm install --no-fund --no-audit` synchronously with at least a three-minute timeout. Verify release-coupled SPFx runtime, rig, plugin and lint packages in `package.json` and the lockfile resolve to exact **1.24.1**, not `1.24.0-rc.0`. React solutions must resolve `react` and `react-dom` to **18.3.1** with compatible React 18 types. Preserve the selected template's unrelated dependency versions and reviewed overrides.

For React UI, apply [react-design.md](./react-design.md): **MUST use Fluent UI v9 wherever compatible**, even when the web-part scaffold starts with v8. Verify peers rather than copying the scaffold's UI model unchanged.

## Build and local testing

Run `npm run build` and resolve errors. The standard 1.24.1 script tests/builds and packages for production; confirm the actual script before claiming packaging succeeded.

For local testing, obtain the tenant/site and a real development page from the user. Configure `config/serve.json`, trust the development certificate with the installed local tool (`npm exec -- heft trust-dev-cert`) only with approval, and run `npm start`. Use the [developer toolbar on a modern SharePoint page](https://learn.microsoft.com/sharepoint/dev/spfx/debug-modern-pages), not a new local/Online workbench setup. The Online workbench is deprecated and retires **2026-12-01**; Copilot uses its separate supported Workbench.

## Packaging (when the user wants to deploy)

Verify the deployable `.sppkg` exists in `sharepoint/solution`. If customized build scripts do not package it, use installed local tools according to the [toolchain decision](../SKILL.md#toolchain-decision-rule):

- Heft: `npm exec -- heft test --clean --production`, then `npm exec -- heft package-solution --production`.
- Legacy gulp: `npm exec -- gulp bundle --ship`, then `npm exec -- gulp package-solution --ship`.

Package creation is not deployment authorization. Test in the intended host and report checks blocked by tenant access.
