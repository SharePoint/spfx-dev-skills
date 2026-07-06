---
name: spfx
description: 'SharePoint Framework (SPFx) development. Use when: "create SPFx project", "new web part", "SPFx extension", "upgrade SPFx", "SPFx upgrade", "update SPFx version", "scaffold SPFx", "SPFx React", "SPFx design", "web part styling", "Fluent UI in SPFx", "SPFx Heft", "gulp to Heft", "PnPjs", "read SharePoint list", "call Microsoft Graph from SPFx". Covers project creation (Yeoman), upgrades (CLI for Microsoft 365), the Heft/gulp toolchain, React web part design, and PnPjs data access.'
argument-hint: 'Describe what you need: create, upgrade, design, or data access'
---

# SPFx Development

Pick the reference(s) that match the user's intent. Load **only** what is needed and execute the steps exactly. If the user's request matches more than one reference, load all matching references and synthesize guidance from each. If intent is still unclear, ask the user one clarifying question before loading any reference.

- **Create a project** → [create.md](./references/create.md)
- **Upgrade a project** → [upgrade.md](./references/upgrade.md)
- **Check or fix Node compatibility for SPFx** → [node-manager.md](./references/node-manager.md)
- **Working on UI in a React SPFx project** (components, styling, layout, accessibility) → [react-design.md](./references/react-design.md)
- **Reading or writing SharePoint / Microsoft Graph data** → [pnpjs.md](./references/pnpjs.md)

## Global rules (apply to every SPFx task)

- **Use PnPjs by default for all SharePoint and Microsoft Graph data operations.** See [pnpjs.md](./references/pnpjs.md). Only fall back to raw `SPHttpClient`/`MSGraphClientV3` when the user explicitly requires it or a dependency cannot be added.
- **When running `npm install`, always run it synchronously with a timeout of at least 3 minutes.** SPFx projects have heavy dependency trees.
- **Before reinstalling packages during an upgrade, run `scripts/cleanup-dependencies.ps1` first.** It removes `node_modules`, the lock file, and stale build output so incompatible versions from before the upgrade aren't kept. See [upgrade.md](./references/upgrade.md). If `scripts/cleanup-dependencies.ps1` is not present, manually delete `node_modules`, the lock file (`package-lock.json` or `yarn.lock`), and any `lib`/`dist`/`.heft` build output folders before reinstalling packages.

## Toolchain decision rule

SPFx switched build systems at v1.22.0. Determine the version from `.yo-rc.json` (`@microsoft/generator-sharepoint.version`) or `package.json`, then:

If neither `.yo-rc.json` nor `package.json` is available, ask the user which SPFx version they are targeting before applying toolchain-specific guidance.

| Installed SPFx version | Toolchain | 
| --- | --- | 
| **v1.22.0 and newer** | **Heft** | 
| **v1.0 – v1.21.1** | **gulp** (legacy) |
