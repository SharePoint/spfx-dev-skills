---
name: spfx
description: 'SharePoint Framework (SPFx) development. Use when: "create SPFx project", "new web part", "SPFx extension", "upgrade SPFx", "SPFx upgrade", "update SPFx version", "scaffold SPFx", "SPFx React", "SPFx design", "web part styling", "Fluent UI in SPFx", "SPFx Heft", "gulp to Heft", "PnPjs", "read SharePoint list", "call Microsoft Graph from SPFx", "Copilot UX component", "SharePoint Copilot App". Covers project creation, upgrades, the Heft/gulp toolchain, React design, PnPjs, and SPFx components hosted in Microsoft 365 Copilot.'
argument-hint: 'Describe what you need: create, upgrade, design, data access, or a Copilot UX component'
version: 1.1.1
---

# SPFx Development

Pick the reference(s) that match the user's intent. Load **only** what is needed and execute the steps exactly:

- **Create a project** → [create.md](./references/create.md)
- **Upgrade a project** → [upgrade.md](./references/upgrade.md)
- **Create or change a Copilot UX component** (SPFx-hosted UI in Microsoft 365 Copilot) → [copilot.md](./references/copilot.md); load design guidance only for React UI work
- **Working on UI in a React SPFx project** (components, styling, layout, accessibility) → [react-design.md](./references/react-design.md)
- **Reading or writing SharePoint / Microsoft Graph data** → [pnpjs.md](./references/pnpjs.md)
- **Set up or switch the development environment** → [setup.md](./references/setup.md); create/upgrade/Copilot workflows reuse it

## Global rules (apply to every SPFx task)

- **Default to SPFx 1.24.1 and Node.js 26 LTS where supported**, with React/React DOM **18.3.1** for React solutions. Preserve explicit older/platform targets and supported existing Node pins; use [setup.md](./references/setup.md) before installing or switching tools.
- **Inspect actual project state.** Reconcile `.yo-rc.json` with declared/resolved dependencies, lockfile, scripts and rig/gulp configuration. Verify exact release-coupled runtime/build/lint versions; generator metadata alone does not prove an upgrade.
- **Preserve user work and verify commands.** Use explicit non-interactive flags supported by the selected tool version. Surface errors and blocked validation; never force incompatible peers or claim host validation from a build alone.
- **Prefer PnPjs for ordinary SharePoint and Microsoft Graph data operations.** See [pnpjs.md](./references/pnpjs.md). For Copilot UX components, follow the brokered-client guidance in [copilot.md](./references/copilot.md); raw clients are also appropriate when required by the API, host, user, or dependency constraints.
- **When running `npm install`, always run it synchronously with a timeout of at least 3 minutes.** SPFx projects have heavy dependency trees.

## Toolchain decision rule

SPFx introduced Heft at v1.22.0. Check `package.json` scripts/dependencies and rig/gulp configuration against `.yo-rc.json`; metadata alone does not identify a migrated build:

| Installed SPFx version | Toolchain |
| --- | --- |
| **v1.24.0 and newer** | **Heft** for supported builds; migrate retained gulp customizations |
| **v1.22 / v1.23** | New projects default to Heft; inspect existing projects, which may retain gulp |
| **v1.0 – v1.21.1** | **gulp** (legacy) |

Prefer the project's `npm run build` / `npm start` scripts and installed local tools, not an unrelated global Heft/gulp version. For custom packaging scripts, Heft uses `--production`; legacy gulp uses `--ship`. Do not opt new 1.24 projects into gulp even if the generator still exposes that flag.
