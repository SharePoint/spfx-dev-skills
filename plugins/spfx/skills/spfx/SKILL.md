---
name: spfx
description: 'SharePoint Framework (SPFx) development. Use when: "create SPFx project", "new web part", "SPFx extension", "upgrade SPFx", "SPFx upgrade", "update SPFx version", "scaffold SPFx", "SPFx React", "SPFx design", "web part styling", "Fluent UI in SPFx", "SPFx Heft", "gulp to Heft", "PnPjs", "read SharePoint list", "call Microsoft Graph from SPFx". Covers project creation (Yeoman), upgrades (CLI for Microsoft 365), the Heft/gulp toolchain, React web part design, and PnPjs data access.'
argument-hint: 'Describe what you need: create, upgrade, design, or data access'
---

# SPFx Development

Pick the reference(s) that match the user's intent. Load **only** what is needed and execute the steps exactly:

- **Create a project** → [create.md](./references/create.md)
- **Upgrade a project** → [upgrade.md](./references/upgrade.md)
- **Working on UI in a React SPFx project** (components, styling, layout, accessibility) → [react-design.md](./references/react-design.md)
- **Choosing build/serve/package commands** (Heft vs gulp) → [toolchain.md](./references/toolchain.md)
- **Reading or writing SharePoint / Microsoft Graph data** → [pnpjs.md](./references/pnpjs.md)

## Global rules (apply to every SPFx task)

- **Run everything non-interactively.** Pass explicit flags to Yeoman, CLI for Microsoft 365, Heft, and gulp. Arrow-key prompts hang or misfire in agent terminals.
- **Never invent versions or APIs.** Read the project's `package.json` and `.yo-rc.json` to learn the installed SPFx version, then match it. Use `@latest` only for scaffolding/upgrade tooling, never for project dependencies.
- **Pick the toolchain from the SPFx version before running any build/serve/package command** (see decision rule below). Using the wrong toolchain is the most common failure.
- **Use PnPjs by default for all SharePoint and Microsoft Graph data operations.** See [pnpjs.md](./references/pnpjs.md). Only fall back to raw `SPHttpClient`/`MSGraphClientV3` when the user explicitly requires it or a dependency cannot be added.
- **Always validate with a clean build before declaring done.** Run `npm run build` and resolve every error. A task is not complete until the build is clean.
- **Respect the version's Node and TypeScript constraints.** Verify with `m365 spfx doctor` when unsure.

## Toolchain decision rule

SPFx switched build systems at v1.22. Determine the version from `.yo-rc.json` (`@microsoft/generator-sharepoint.version`) or `package.json`, then:

| Installed SPFx version | Toolchain | Build / serve / package |
| --- | --- | --- |
| **v1.22.0 and newer** | **Heft** | `npm run build`, `heft start`, `heft package-solution --production` |
| **v1.0 – v1.21.1** | **gulp** (legacy) | `gulp serve`, `gulp bundle --ship`, `gulp package-solution --ship` |

Full command mapping and details: [toolchain.md](./references/toolchain.md).