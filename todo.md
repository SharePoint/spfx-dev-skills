# SPFx 1.24.1 update backlog

Setup guidance refreshed **2026-11-11** for **SPFx 1.24.1 / Node.js 26 LTS**. Shared environment checks, creation, upgrade and dependency guidance are implemented; isolated solution/host acceptance tests and the remaining P0 work below are still pending.

The earlier **2026-10-28** review covered the skill/references, root docs, GitHub feedback and upstream metadata. Its sample baseline was the four React/non-React web-part/Copilot solutions in `D:\pnp\124`, replacing the earlier sample folder. It cross-checked the published **1.24.0** generator/SDK and maintainer GA docs. Samples were inspected, not built or runtime-certified. Their generator metadata says GA but dependency/lockfile stamps remain prerelease; do not copy those pins or count these fixtures as 1.24.1 package-resolution evidence.

Refresh validation (**2026-11-11**): **200 checks** passed across published generator/CLI metadata, dependency groups, baseline consistency, skill frontmatter/routing, ten Markdown files and **64 relative links/anchors**. Regenerated the **1280x720** infographic and visually checked it for clipping; `git diff --check` passed. No SPFx solution build, runtime-manager switching or tenant/host tests were executed in this content-only repository.

## Keep the implementation lean

- Correct existing guidance rather than append a rule for every finding.
- Keep [SKILL.md](./plugins/spfx/skills/spfx/SKILL.md) a short router with shared SPFx-specific safeguards. Load task references on demand; do not repeat rules, version tables or command maps across them.
- Put migration edge cases in the relevant reference or link authoritative guidance. Add shared setup/toolchain references only where they remove duplication; keep Copilot details conditional on that task.

## Current baseline and dated dependency findings

| Area | Baseline / action |
| --- | --- |
| SPFx / React | Exact **1.24.1** release-coupled packages; `react` and `react-dom` **18.3.1**, compatible React 18 types. No `@next` or `react@latest` substitution. The 1.24.1 generator fixes 1.24.0's release-candidate pins. |
| Node.js | Recommend **26 LTS** for new 1.24.1 environments. Supported: `>=22.14.0 <23.0.0 \|\| >=24.0.0 <25.0.0 \|\| >=26.0.0 <27.0.0`. Preserve compatible existing pins and use each older target's supported Node version. |
| Build | `build`: `heft test --clean --production && heft package-solution --production`; `start`: `heft start --clean`. Preserve actual project scripts. |
| Tooling | Template baseline: TypeScript `~5.8.0`, Heft `1.3.2`, ESLint `9.37.0`. Do not upgrade unrelated tools indiscriminately. |
| Fluent UI | Copilot React includes v9 (`^9.70.0`, resolved `9.75.0` in the samples); standard React web parts retain v8 `^8.106.4`. **MUST use v9 wherever compatible** for new/changed UI; explain fallbacks. |
| PnPjs | Stable **4.22.0** at review; ESM, Node `>=18.12.0`. Validate against SPFx's stricter environment and target host. |
| PnP controls | React controls **3.25.0**, property controls **3.24.0** still declare React 17/SPFx 1.23 dependencies. Verify newer compatible releases before recommending them for 1.24. |
| CLI for Microsoft 365 | Published **12.0.0** upgrade/doctor coverage includes **1.24.1**, verified from the npm archive on **2026-11-11**. Check installed coverage and always specify the target. |

The 1.24.1 generator's Node range, React/Fluent dependency groups, Heft scripts/tool versions and PnPjs 4.22.0 metadata were rechecked on **2026-11-11**. PnP controls remain a finding from **2026-10-28**. These are review-time findings, not an evergreen dependency matrix; check selected package metadata when implementing.

## P0 - release-readiness changes

### 1. Router and toolchain

- [x] Update [SKILL.md](./plugins/spfx/skills/spfx/SKILL.md): reconcile dependencies, lock file, scripts and rig/gulp configuration with `.yo-rc.json`; metadata alone can be stale. Preserve explicit older/platform targets. Shared safeguards cover verified versions/flags, non-interactive commands, preserving user work, surfaced errors and honest validation.
- [x] Correct the version-only toolchain rule: <=1.21.1 uses gulp; existing 1.22/1.23 projects may retain it; **1.24 requires Heft for supported builds**. Keep the shared rule in the short router, with production flags (`--production` versus `--ship`), local command execution and [packaging guidance](./plugins/spfx/skills/spfx/references/create.md#packaging-when-the-user-wants-to-deploy), rather than adding a duplicate toolchain file.

### 2. Setup and creation

- [x] Consolidate #2/#3/#5 into one small [setup reference](./plugins/spfx/skills/spfx/references/setup.md) reused by create/upgrade/Copilot. Detect OS/shell, active Node/npm, manager and existing project pins before changes. Cover fnm, nvm-windows/Unix nvm, NVS and Volta; confirm installs/global changes, respect existing pins, and verify switching in the actual build shell, including installed-but-inactive Node and per-Node global tools. Manager execution scenarios still need acceptance testing.
- [x] Use Learn plus target-template/tool metadata; run `m365 spfx doctor --spfxVersion 1.24.1 --output json` only with verified installed coverage. Unknown CLI targets are tooling gaps, not invalid environments. Keep Server limits distinct: SP2016 FP2 <=1.1, SP2019 <=1.4.1, Subscription Edition <=1.5; never apply 1.24/Node 26 defaults to them.
- [x] Update [create.md](./plugins/spfx/skills/spfx/references/create.md): confirm component/framework/host/destination, use the exact generator and verified non-interactive flags, remove new-1.24 gulp opt-in, explain certificate trust and real SharePoint page debugging, then clean-build/package. Use project scripts/local tools, allow adequate install time, and distinguish `.sppkg` output from authorized deployment. The deprecated Online workbench is not the new-project test path.

### 3. Upgrade and React 18

- [x] In [upgrade.md](./plugins/spfx/skills/spfx/references/upgrade.md), baseline the source under its supported Node version before switching. Require published CLI coverage and explicit `--toVersion 1.24.1`; its default means latest *CLI-supported* release. Include the 1.24.0/prerelease maintenance path and an official-migration/exact-target comparison fallback when CLI coverage is missing.
- [x] Describe aligning existing SPFx packages, React/types, rig/configuration, overrides and CI while preserving identities/customizations. Check whether CLI reports include Heft migration. Verify release-coupled dependencies **and lockfile resolutions are 1.24.1**, including fixtures stamped GA only in generator metadata. Preserve/update the lock and verify `npm ci`; no routine lock deletion, forced peers, broad casts or copied overrides.
- [x] Require replacing owned legacy React mounts with one reusable `createRoot` per container and matching unmount/disposal, including non-web-part surfaces and Copilot `onTeardown`. Link the official guide for explicit `children`, duplicate types, batching/effect cleanup and updated test helpers. These migration scenarios still need execution.

### 4. React design and Fluent UI

- [ ] Finish #8 validation under the **v9 MUST-where-compatible policy**: [react-design.md](./plugins/spfx/skills/spfx/references/react-design.md) now distinguishes Copilot/web-part defaults, provides a document-scoped Fluent/Griffel boundary, and covers responsive/accessibility/localization/async states. Still verify a concrete branded SharePoint-to-v9 theme adapter and real-host peers, portals, focus, rerenders and disposal; generic light/dark themes are not site branding.

### 5. PnPjs and configurable data

- [x] In [pnpjs.md](./plugins/spfx/skills/spfx/references/pnpjs.md), replace unqualified "latest" installs with inspect -> resolve compatible stable version -> install required packages only. Keep `@pnp/*` versions coherent and check resolved dependencies. **4.22.0** is the reviewed candidate, not a permanent pin; older/on-premises targets need their own compatible track. Its Node minimum is not a Node-18-only ceiling.
- [ ] Keep separate SharePoint/Graph `SPFx` behaviors, selective imports and typed context-scoped services. Prefer PnPjs for ordinary operations without replacing compatible existing layers unnecessarily. Use documented `SPHttpClient`/`MSGraphClientV3` for Copilot brokered access unless PnPjs host integration is proven. Distinguish SharePoint user permissions from Graph scopes/admin approval; include a minimal `webApiPermissionRequests` example.
- [ ] Address #6: discover/ask for exact internal field names/types and site/list identity before CRUD. Wire configurable properties through typed props, property pane, manifest defaults, localization and service refresh; avoid invented schemas/hardcoded production lists. Treat PnP React/property controls as optional, independently verified packages; use built-in controls rather than casts or forced installs when incompatible.
- [ ] Correct paging: `.top()` limits one response; use bounded v4 async iteration for further pages. Summarize v3 migration traps: removed `.getAll()`/`.getPaged()`, changed add/update return shapes, taxonomy moved to Graph. Review 4.22's Graph recent/shared/insights deprecations, sharing and caching changes; revisit the README's "recent documents" scenario. Keep typed results, visible failures, stale-request handling and safe mutation/retry behavior.

## P1 - scope and public documentation

- [x] Make Copilot UX component support explicit through on-demand [copilot.md](./plugins/spfx/skills/spfx/references/copilot.md) and router/create/design/data links: verified scaffolding, contracts/lifecycle, brokered clients, input validation, rendered-view context (10 KB, deliberate retry), schema v1.8, GA availability and component-versus-agent update/sync guidance.
- [x] Align [README.md](./README.md), [CONTRIBUTING.md](./CONTRIBUTING.md) and [infographic.html](./assets/infographic.html)/PNG with implemented capabilities, GA baseline and the v9-first design policy. Replaced the placeholder installer, documented discovery/update paths, fixed links and preserved the historical evaluation context. Prepared the matching Microsoft Learn patch locally, as requested; nothing posted to GitHub.

P1 validation: published GA SDK context-helper and Fluent v9 boundary type-checks (including negative controls); 16 context payload/boundary/error/retry checks; nine Markdown files and 43 relative links/anchors; skill frontmatter/routing; earlier 1280x720 PNG browser checks; local Learn patch passed `git apply --check`. The GA refresh distinguishes source defaults from policy and warns against demo fallback data, unchecked bridge results, fixed resize dimensions and out-of-boundary style hooks. P0 scenarios and tenant/runtime tests remain pending.

## GitHub follow-up

No GitHub items were changed. All remain open except merged #1.

| Item | Disposition |
| --- | --- |
| [#1](https://github.com/SharePoint/spfx-dev-skills/pull/1) | Preserve merged tool-detection/non-interactive/install-wait improvements; the old delivery record overstated what exists. |
| [#2](https://github.com/SharePoint/spfx-dev-skills/issues/2) | Implement shared setup using maintained CLI knowledge plus documentation; retain on-premises coverage, omit feature-history trivia. |
| [#3](https://github.com/SharePoint/spfx-dev-skills/pull/3) | Rework static version extrapolation, patch/prerelease parsing, source-versus-target checks, inactive Node switching, shell persistence, unconditional `.nvmrc` and blanket cleanup. Prefer a smaller shared workflow. |
| [#4](https://github.com/SharePoint/spfx-dev-skills/pull/4) | Separate, nonblocking contribution policy. Narrow `applyTo: '**'`/commit-only output instructions; avoid applying them to ordinary coding tasks. |
| [#5](https://github.com/SharePoint/spfx-dev-skills/pull/5) | Do not merge as-is: incorrect Node/on-prem tables, malformed metadata detection, duplicate setup, nvm-only flow and unconditional gulp. Reconcile with #3. |
| [#6](https://github.com/SharePoint/spfx-dev-skills/issues/6) | Address schemas, complete property configuration and compatible optional controls; reject the comment's cast/lint-suppression workaround. |
| [#7](https://github.com/SharePoint/spfx-dev-skills/pull/7) | Keep application/sample work separate. Its 1.23.2/React 17/PnPjs 4.21 build claim is not 1.24 runtime evidence; upgrade/revalidate before using it as a fixture. |
| [#8](https://github.com/SharePoint/spfx-dev-skills/issues/8) | Require compatible v9 across new/changed UI. Copilot React already includes it; standard web parts still start with v8. Verify host-theme integration and fallbacks without implying all templates default to v9. |

## Acceptance before implementation sign-off

Use isolated fixtures, not the supplied reference solutions. Record exact versions, commands/results and blocked checks; the solution/host scenarios below have **not** been executed.

- New 1.24.1 on Node 26 LTS; upgrade 1.24.0/prerelease pins and 1.23.2/React 17; migrate legacy/custom gulp builds. Verify clean install, production tests/build/package, React externals, preserved IDs and deployment versions.
- Exercise supported Node 22.14+/24/26, reject 22.13/23/25, and cover missing/inactive managers, stale metadata, unavailable CLI coverage and correct Server ceilings.
- Test the v9-first path and justified v8 fallbacks: rerenders retain state; multiple instances, disposal/reopen and portals work; validate themes, narrow layouts and keyboard/focus in declared hosts. Copilot context must match the rendered view and respect the 10 KB message limit.
- Validate PnPjs SharePoint/Graph operations, bounded paging, exact schemas/configuration changes, consent/access failures and stale requests; check optional controls without peer/type bypasses.
- Check skill installation/discovery, on-demand routing and every relative link. Build success alone is not host validation; report pending tenant/browser checks explicitly.

## Sources

- Maintainer's [GA documentation snapshot](https://github.com/VesaJuvonen/sp-dev-docs/tree/af6397f04c3132eb7c4a67cdd8ff72b8ad8f013e/docs/spfx): 1.24 release and Copilot context, configuration, deployment, theme and availability guidance. Reviewed 2026-10-28; GA is **2026-10-28**. Package facts were rechecked on that date; sample provenance is recorded above.
- SPFx: [1.24.1 release](https://learn.microsoft.com/sharepoint/dev/spfx/release-1.24.1), [1.24 feature release](https://learn.microsoft.com/sharepoint/dev/spfx/release-1.24.0), [compatibility](https://learn.microsoft.com/sharepoint/dev/spfx/compatibility), [setup](https://learn.microsoft.com/sharepoint/dev/spfx/set-up-your-development-environment), [React 18 migration](https://learn.microsoft.com/sharepoint/dev/spfx/react-18-upgrade). The 1.24.1/Node 26 baseline was checked **2026-11-11** against Learn and published npm metadata.
- Node.js: [release schedule](https://github.com/nodejs/Release/blob/main/schedule.json); Node 26 entered LTS **2026-10-28**.
- Toolchain: [Heft/support timeline](https://learn.microsoft.com/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft), [command map](https://learn.microsoft.com/sharepoint/dev/spfx/toolchain/customize-heft-toolchain-overview#heft-actions-and-legacy-gulp-tasks), [migration](https://learn.microsoft.com/sharepoint/dev/spfx/toolchain/migrate-gulptoolchain-hefttoolchain).
- PnPjs: [compatibility/setup](https://pnp.github.io/pnpjs/getting-started/), [v3-to-v4](https://pnp.github.io/pnpjs/transition-guide/), [changelog](https://github.com/pnp/pnpjs/blob/version-4/CHANGELOG.md), [SP](https://pnp.github.io/pnpjs/sp/behaviors/#spfx)/[Graph](https://pnp.github.io/pnpjs/graph/behaviors/#spfx) behaviors.
- CLI: [upgrade](https://pnp.github.io/cli-microsoft365/cmd/spfx/project/project-upgrade/), [doctor](https://pnp.github.io/cli-microsoft365/cmd/spfx/spfx-doctor/), [development matrix](https://github.com/pnp/cli-microsoft365/blob/main/src/m365/spfx/commands/SpfxCompatibilityMatrix.ts); distinguish published coverage from development source.
- Other: [PnP React controls](https://github.com/pnp/sp-dev-fx-controls-react), [property controls](https://github.com/pnp/sp-dev-fx-property-controls), [Copilot data](https://learn.microsoft.com/sharepoint/dev/spfx/copilot/access-data), [published skill guidance](https://learn.microsoft.com/sharepoint/dev/spfx/agent-skills), [Node lifecycle](https://github.com/nodejs/Release/blob/main/schedule.json).
- Verify selected releases using `npm view <package> dist-tags --json` and `npm view <package>@<version> version engines dependencies peerDependencies --json`; inspect resolved versions with `npm ls`.
