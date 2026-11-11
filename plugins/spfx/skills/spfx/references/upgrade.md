# Upgrade SPFx Project

## Before you start

1. **Ensure a clean, committed git state.** Applying the upgrade changes many files; the user needs a reviewable baseline. If the working tree is dirty, ask the user to commit or stash first; never discard their work.
2. **Detect actual source and target versions.** Reconcile `.yo-rc.json` with `package.json`, lockfile resolutions, scripts and rig/gulp configuration. State discrepancies, including `1.24.0-rc.0` packages in projects stamped 1.24.0. Default to **1.24.1** unless another supported target is requested; preserve SharePoint Server ceilings.
3. **Baseline the source first.** Use [setup.md](./setup.md) to select a Node version supported by the source, install from its existing lockfile (`npm ci` for npm), and run its build. Report pre-existing failures separately. Do not switch a 1.23-or-earlier solution directly to Node 26 and treat its failure as an upgrade regression.
4. **Select the target environment.** Follow [setup.md](./setup.md) for **Node.js 26 LTS** where supported, exact target tooling and installed CLI coverage. Align existing runtime pins/CI for an intentional switch; compatible existing Node 22.14+/24 pins can remain.

## Get exact-target instructions

For **1.24.0 / 1.24.0-rc.0 -> 1.24.1**, follow the [maintenance release instructions](https://learn.microsoft.com/sharepoint/dev/spfx/release-1.24.1#upgrading-projects-from-v1240-to-v1241): update existing release-coupled runtime, rig, plugin and lint packages to exact **1.24.1** in their existing dependency sections, compare with a separate 1.24.1 scaffold, and update the lockfile. Installing the generator alone does not upgrade the project.

For older projects, verify the installed CLI supports the target, then run from the project root:

```console
m365 spfx project upgrade --toVersion 1.24.1 --output md
```

Replace `1.24.1` with an explicitly requested supported target. Always specify it: omitting `--toVersion` selects the latest **CLI-supported** release, not necessarily the intended SPFx release. The command produces a report; it does **not** modify project files.

If installed CLI coverage is missing, verify/update to a published supporting release with approval. Otherwise use official migration guidance and a separate exact-target comparison project created via [create.md](./create.md); disclose the missing report. Never silently downgrade the target or substitute a preview.

## Apply the upgrade

Read the report and apply all applicable steps in order, merging customized files rather than overwriting them. Compare with the exact-target template for omissions:

- Align existing release-coupled SPFx runtime/build/lint packages and lockfile resolutions to **1.24.1**. Do not assign that version to unrelated Heft, TypeScript, Fluent UI or PnP packages.
- Migrate retained gulp customizations to **Heft** for supported 1.24 builds using the [official migration guide](https://learn.microsoft.com/sharepoint/dev/spfx/toolchain/migrate-gulptoolchain-hefttoolchain). Check whether the CLI report includes this migration; version edits alone are insufficient.
- Follow the [React 18 migration guide](https://learn.microsoft.com/sharepoint/dev/spfx/react-18-upgrade): exact `react` / `react-dom` **18.3.1**, compatible React 18 types, configuration/externals and dependency overrides. Replace owned legacy mounts with one reusable `createRoot` per container and matching unmount/disposal across web parts, extensions/placeholders/cells, dialogs, property controls, tests and Copilot `onTeardown`. Check explicit `children`, batching and effect cleanup; do not add React to non-React solutions.
- Preserve solution/component/app IDs, host declarations, custom code, permissions and localization. Keep deployment versions separate from framework and agent-schema versions. Apply [react-design.md](./react-design.md) to changed UI without rewriting untouched compatible controls.
- Preserve/update the lockfile and relevant pins/CI. Do not routinely delete locks, force peers, copy unexplained overrides or suppress type errors.

## Verify

1. Run `npm install --no-fund --no-audit` synchronously with at least a three-minute timeout to update dependencies and the lockfile. Inspect `npm ls` for the changed packages, including `react react-dom @types/react @types/react-dom` when applicable; resolve invalid peers and stale prerelease resolutions.
2. Verify reproducibility with `npm ci`, then run `npm run build`. Resolve upgrade-induced errors and deprecated/removed APIs. Confirm actual scripts test/build and produce the production `.sppkg`; use [create.md](./create.md#packaging-when-the-user-wants-to-deploy) for custom packaging scripts.
3. Start with the project's `npm start` or installed local tool per the [toolchain decision](../SKILL.md#toolchain-decision-rule). Test web parts/extensions on actual SharePoint pages, not the deprecated Online workbench; use the [Copilot Workbench and real host](./copilot.md#build-test-and-deploy) for Copilot components.
4. Smoke-test declared hosts, React state/rerenders/disposal, UI themes and data/permission failures. Report blocked checks and exact versions/results honestly; a build is not host certification. Review changes and commit both manifest and lockfile only when requested.
