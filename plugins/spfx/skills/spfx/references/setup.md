# SPFx Environment Setup

Reuse this workflow before creating or upgrading a project. Do not change the machine merely to inspect a solution.

## Select the target first

For new SharePoint Online solutions and upgrades without another requested target, use **SPFx 1.24.1**, **Node.js 26 LTS** and **Heft**. React solutions use exact **React / React DOM 18.3.1** with compatible React 18 types. The 1.24.1 generator corrects 1.24.0's prerelease package pins; installing it does not upgrade existing solutions.

SPFx 1.24.1 supports this Node range:

```text
>=22.14.0 <23.0.0 || >=24.0.0 <25.0.0 || >=26.0.0 <27.0.0
```

Recommend the latest Node **26.x LTS** patch for a new environment; supported existing 22.14+/24.x pins need not change. Do not use an unbounded `>=22` range or a moving `--lts` selector that can later select another major.

For earlier SPFx releases, use their own row in the [compatibility reference](https://learn.microsoft.com/sharepoint/dev/spfx/compatibility). SharePoint Server ceilings are **1.1** for 2016 FP2, **1.4.1** for 2019 and **1.5** for Subscription Edition; they do not support the 1.24.1/Node 26 baseline. An upgrade may require different Node versions for its source and target; build the source first as described in [upgrade.md](./upgrade.md).

## Inspect and select Node in the actual build shell

1. Detect OS/shell and run `node --version` and `npm --version`. Inspect existing `.nvmrc`, `.node-version`, `package.json` engines/Volta settings and CI configuration. Resolve conflicting requirements explicitly rather than ignoring pins.
2. Discover installed managers and versions: fnm, nvm-windows, Unix nvm, NVS or Volta. Use the detected manager's documented commands; Unix nvm is a shell function, not nvm-windows. Prefer a compatible installed version, including installed-but-inactive versions.
3. If switching is needed, activate the selected version in the shell that will install and build. Shell initialization, PATH and environment changes may not persist between terminal/tool calls; initialize/select again when needed. Confirm before installing a runtime/manager or changing global tools. Do not replace the user's manager or create a version pin unconditionally.
4. Re-run `node --version` and `npm --version` **in the build shell**. For an intentional move to Node 26, update existing runtime pins and CI together while preserving the full supported `engines.node` range where appropriate.
5. Recheck global tools after switching; different Node installations can have separate global packages. If a compatible environment cannot be selected, stop and report the exact blocker.

## Verify and install only missing or mismatched tools

Inspect `yo --version`, the generator version (`npm ls --global @microsoft/generator-sharepoint --depth=0`) and, when needed, `m365 version`. Distinguish a missing executable from other command failures; report network/permission errors rather than treating them as absence.

For the default target, verify published metadata:

```console
npm view @microsoft/generator-sharepoint@1.24.1 version engines --json
```

After confirming any global changes, install missing/incompatible prerequisites. Yeoman 7 is a supported option for this baseline:

```console
npm install --global yo@7 @microsoft/generator-sharepoint@1.24.1 --no-fund --no-audit
```

Keep compatible existing tools. For an explicit older target, select that target's generator and prerequisites instead; never substitute `@next` or assume `@latest` means 1.24.1. Verify the selected generator's `--help` before scaffolding. Use project-local Heft after dependency installation; a global Heft install is not required for `npm` scripts.

CLI for Microsoft 365 is needed for upgrade reports and is useful for diagnostics, but is not required merely to run the generator. Published **12.0.0** includes both 1.24.1 upgrade and doctor coverage (verified **2026-11-11**). Check the installed release's coverage/options rather than inferring them from current website or development-branch documentation. If missing or too old, verify a compatible release and confirm before installing, for example:

```console
npm install --global @pnp/cli-microsoft365@12.0.0 --no-fund --no-audit
m365 spfx doctor --spfxVersion 1.24.1 --output json
```

Use the actual selected target for `--spfxVersion`. An unknown target is a **CLI coverage gap**, not proof that Node/SPFx is incompatible. Check Learn and exact-target package metadata; do not blindly apply doctor fixes (especially legacy gulp prerequisites). Resolve genuine failed checks before proceeding.

Run dependency installs synchronously with at least a three-minute timeout. Preserve the package manager and lockfile; do not delete locks, force peers or perform unrelated global updates.

Sources, checked **2026-11-11**: [1.24.1 release](https://learn.microsoft.com/sharepoint/dev/spfx/release-1.24.1), [compatibility](https://learn.microsoft.com/sharepoint/dev/spfx/compatibility), [environment setup](https://learn.microsoft.com/sharepoint/dev/spfx/set-up-your-development-environment), [Node release schedule](https://github.com/nodejs/Release/blob/main/schedule.json), published `@microsoft/generator-sharepoint@1.24.1` metadata/templates and `@pnp/cli-microsoft365@12.0.0` upgrade/doctor matrix. Node 26 entered LTS on **2026-10-28**; lifecycle status and SPFx support are separate checks.
