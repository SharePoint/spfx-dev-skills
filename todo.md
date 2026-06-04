# SPFx Dev Skills — Update Record

Plan for revising the `spfx` skill to a high-quality, globally reusable baseline. **Status: ✅ Delivered** — all items below are implemented. Kept as a record.

## Goals

1. Make the toolchain version-aware: **Heft for SPFx ≥ 1.22**, **gulp for ≤ 1.21.1**.
2. Establish a strong, consistent set of global rules every reference inherits.
3. Add a **PnPjs** data-access track as the **default** for SharePoint/Graph operations.
4. Restructure files using industry best practices for skills (clear router, focused references, no duplication).
5. Fill the empty `react-design.md` placeholder.

## Verified facts (Microsoft Learn, June 2026)

| Topic | Detail |
|-------|--------|
| Toolchain split | gulp = SPFx v1.0–v1.21.1; Heft = v1.22.0+ |
| 1.22 generator | Defaults to Heft; legacy gulp still selectable via a generator flag |
| 1.23 | New projects Heft-only (CLI permitting) |
| 1.24+ | gulp officially unsupported |
| Heft npm scripts | `build` → `heft build --clean`, `clean` → `heft clean`, `test` → `heft test`, `start` → `heft start --clean` |
| Heft ↔ gulp commands | `gulp serve` → `heft start`; `gulp bundle`+`gulp build` → `heft build`; `gulp package-solution` → `heft package-solution`; `gulp trust-dev-cert` → `heft trust-dev-cert` |
| Production flag | gulp `--ship` → Heft `--production` |
| New Heft action | `dev-deploy` (test against real site via testing CDN) |
| Heft rig | `./config/rig.json` referencing `@microsoft/spfx-web-build-rig` |
| Upgrading existing 1.22 project | May keep gulp; switching to Heft is a dedicated migration, not a normal upgrade |
| TypeScript default in 1.22 | v5.8 |
| Global Heft CLI (optional) | `npm install @rushstack/heft --global` |

Reference docs:
- Heft toolchain: https://learn.microsoft.com/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft
- Gulp (legacy) toolchain: https://learn.microsoft.com/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain
- Heft ↔ gulp command map: https://learn.microsoft.com/sharepoint/dev/spfx/toolchain/customize-heft-toolchain-overview#heft-actions-and-legacy-gulp-tasks
- Gulp→Heft migration: https://learn.microsoft.com/sharepoint/dev/spfx/toolchain/migrate-gulptoolchain-hefttoolchain
- 1.22 release notes: https://learn.microsoft.com/sharepoint/dev/spfx/release-1.22.0

---

## Proposed file structure

```
plugins/spfx/skills/spfx/
  SKILL.md                      # router + global rules + toolchain decision
  references/
    create.md                   # scaffold (Heft default, gulp fallback)
    upgrade.md                   # version upgrade + Heft migration note
    react-design.md             # UI/component/styling guidance (Copilot UI Contract v2.1)
    toolchain.md                # NEW: Heft vs gulp command reference (shared)
    pnpjs.md                    # NEW: PnPjs data-access track (default)
```

Rationale: a single shared `toolchain.md` avoids duplicating Heft/gulp command tables across create/upgrade/react-design. `pnpjs.md` is the default data layer, loaded whenever data operations are involved.

---

## SKILL.md — changes

- [x] Keep the intent-router list; add **toolchain.md** and **pnpjs.md** as referenceable resources.
- [x] Add a **Global rules** section:
  - Run all CLI/Yeoman/Heft/gulp commands **non-interactively** (explicit flags only).
  - **Never invent versions or APIs** — read `package.json` + `.yo-rc.json` to learn the installed SPFx version, then match it.
  - **Determine the toolchain from the SPFx version** before running any build/serve command (see decision rule below).
  - **Use PnPjs by default** for all SharePoint/Graph data operations.
  - **Always validate with a clean build** before declaring done.
  - Respect the SPFx version's Node/TypeScript constraints.
- [x] Add a **Toolchain decision rule** (single source of truth):
  - SPFx **≥ 1.22** → Heft (`npm run build`, `heft start`, `heft package-solution`, `--production`).
  - SPFx **≤ 1.21.1** → gulp (`gulp serve`, `gulp bundle --ship`, `gulp package-solution --ship`).
  - When unsure, read `.yo-rc.json` `@microsoft/generator-sharepoint.version`.
- [x] Update front-matter `description` to mention Heft/gulp and PnPjs so the skill is discoverable.

## references/create.md — changes

- [x] Add a **Gather requirements** table: solution-name, framework, component-type (`webpart`/`extension`/`library`/`adaptiveCardExtension`), component-name, extension-type, naming constraints (kebab solution, PascalCase component).
- [x] Keep environment check (`m365 spfx doctor`).
- [x] Scaffold section stays Heft-by-default (1.22+ generator). Document the **legacy gulp opt-in flag** for users who explicitly need gulp.
- [x] Add **extension** scaffold example with `--extension-type`.
- [x] Replace gulp-specific post-scaffold steps with **toolchain-aware** steps that link to `toolchain.md`:
  - Trust dev cert (`heft trust-dev-cert` / `gulp trust-dev-cert`).
  - Validate build (`npm run build`).
  - Serve in workbench (`heft start` / `gulp serve`).
- [x] Add packaging section (`--production` for Heft, `--ship` for gulp).
- [x] Cross-link **pnpjs.md** when the new project will read/write SharePoint or Graph data.

## references/upgrade.md — changes

- [x] Add **Before you start**: clean/committed git state, detect current version from `.yo-rc.json`/`package.json`, check Node/TypeScript compatibility for the target.
- [x] Keep CLI for Microsoft 365 `m365 spfx project upgrade ... --output md` flow.
- [x] Add a **toolchain-crossing callout**: upgrading an existing project across the 1.21.1 → 1.22 boundary does **not** auto-switch to Heft. Two paths:
  - Keep gulp (supported through 1.23; unsupported at 1.24).
  - Migrate to Heft via the dedicated migration steps (uninstall gulp packages, install Heft deps, add `config/rig.json`, rewrite npm scripts) — link the migration doc.
- [x] Strengthen **Verify**: `npm install` → `npm run build` clean → fix deprecated/removed APIs → smoke-test in workbench → review diff before commit.

## references/react-design.md — changes

> Delivered as the **Copilot UI Contract v2.1** (Fluent UI v9 + SharePoint + host awareness). Integrated with the skill: fixed duplicate H1, added Fluent version-alignment rule, plus Data Access (§15, PnPjs default) and Validation (§16) sections.

- [x] **Component patterns**: function components + hooks, props typing, container/presentational split, no business logic in render.
- [x] **Fluent UI**: use the version aligned to the installed SPFx; theming via `FluentProvider` and theme tokens, no hardcoded colors.
- [x] **Styling**: Fluent defaults/tokens, responsive across zones, narrow-view readability.
- [x] **Accessibility**: semantic HTML, keyboard nav, accessible names, focus management, loading/empty/error states.
- [x] **Performance**: lightweight composition, avoid heavy components, async data states.
- [x] **Data access**: links to `pnpjs.md` for SharePoint/Graph operations (PnPjs by default).

## references/toolchain.md — NEW

- [x] Decision rule recap (version → toolchain).
- [x] Side-by-side **Heft ↔ gulp** command table (build, bundle, clean, test, serve/start, package-solution, trust-dev-cert, dev-deploy).
- [x] Heft npm scripts reference and optional global `@rushstack/heft` install.
- [x] `--production` vs `--ship` note.
- [x] `config/rig.json` + `@microsoft/spfx-web-build-rig` note.

## references/pnpjs.md — NEW (default data layer)

- [x] When to use: any SharePoint list/library or Microsoft Graph data operation (default; raw clients only on explicit request).
- [x] Install **latest PnPjs** (`@pnp/sp`, `@pnp/graph`) matching project needs.
- [x] Initialize using SPFx context (`spfi().using(SPFx(this.context))`, `graphfi().using(SPFx(this.context))`).
- [x] Selective imports for bundle size; side-effect import pattern.
- [x] CRUD + Graph examples (lists/items, `graph.me()`).
- [x] `webApiPermissionRequests` note for Graph permissions.
- [x] Note version alignment with SPFx and TypeScript.

---

## Resolved decisions

1. **react-design.md** — Filled and polished (Copilot UI Contract v2.1), integrated with the skill.
2. **New files** — Added `toolchain.md` and `pnpjs.md` as dedicated references (best for maintainability, no duplication).
3. **PnPjs scope** — PnPjs set as the **default** data layer, including wiring + CRUD + Graph examples.

---

## Repository documentation — changes

> Delivered alongside the skill update to make the repo presentable and contributor-ready.

- [x] **Infographic** — Built [assets/infographic.html](./assets/infographic.html) and rendered [assets/infographic.png](./assets/infographic.png) (1280×720, SharePoint-teal) showing the skill's capabilities + scaffold→design→build→upgrade→deploy flow; embedded at the top of the README.
- [x] **README.md** — Full rewrite: infographic header, preview note, "What's in this repo" file tree + capability table, "Why these skills?", use cases, **Install & use** (Option A Skills CLI placeholder, Option B manual install), Roadmap, **Help us improve** (issues/feedback), Contributing summary, and **MIT License** note.
- [x] **CONTRIBUTING.md** — Created with the **fork → branch → PR to `main`** workflow (exact git commands), content conventions (version accuracy, no invented APIs, non-interactive commands, PnPjs default, build validation), pre-PR checklist, and MIT note.

### Follow-ups (track in GitHub going forward)

- [ ] Replace the **Skills CLI** placeholder in the README with the real install command once the CLI/distribution is finalized.
- [ ] Add plugin/marketplace **distribution** for supported agent hosts (Roadmap item).

---

> **Note:** This `todo.md` is the initial planning/record artifact. Starting after this update, work is tracked via **GitHub issues/PRs** rather than this file.
