# SPFx Development Environment Setup & Validation

Set up a local machine for SharePoint Framework development from scratch, or validate an existing environment. This reference covers Node.js version management, global dependencies, and SPFx version detection.

**Use this reference when asked about:** setting up, prerequisites, environment check, "getting started", installing prerequisites, compatible versions, Node.js, nvm, Yeoman, Gulp, Heft, CLI for Microsoft 365.

---

## 1. Detect installed Node.js

Before installing anything, check what Node.js is currently available:

```shell
node --version
npm --version
```

**If Node.js is not installed** → tell the user to install it manually from [nodejs.org](https://nodejs.org/) or via a version manager (see §2). Do not attempt to install Node.js through the agent — system-level installs require user intervention.

**If Node.js is installed** → check the version against the SPFx compatibility matrix:

| SPFx version | Node.js version | NPM version |
|---|---|---|
| **v1.20 – v1.21.1** | **Node.js v18** | npm v9 – v10 |
| **v1.22.0+** | **Node.js v18 or v20** | npm v9 – v10 |
| **v1.23.0+** | **Node.js v20 or v22** | npm v10 – v11 |

> Source: [Microsoft Learn — SPFx compatibility matrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)

**If no SPFx version is specified** → assume the **latest stable** (currently v1.23.x) and check against Node.js v20/v22.

**If a specific SPFx version is given** (e.g. "SPFx v1.18" or "the first version with form customizers") → look up which SPFx version introduced the feature:

| Feature | First SPFx version |
|---|---|
| Web parts | v1.0 |
| Extensions (field customizers, list view commands) | v1.4 |
| **Form customizers** | **v1.6** |
| Adaptive Card Extensions (ACEs) | v1.13 |
| Heft toolchain | v1.22 |

Resolve user descriptions like "the last SPFx I can use with SP OnPrem 2019" using the [compatibility matrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility).

---

## 2. Node.js Version Manager (nvm)

If the installed Node.js version doesn't match the required version, check for a Node Version Manager:

### macOS / Linux

```shell
# Check if nvm is installed
command -v nvm

# If nvm is installed — list available versions
nvm ls

# Install and use the required version
nvm install 20
nvm use 20

# Set as default
nvm alias default 20
```

### Windows

```shell
# Check if nvm-windows is installed
nvm version

# Install and use the required version
nvm install 20
nvm use 20
```

**If no version manager is installed** → guide the user to install one:
- **macOS/Linux:** `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`
- **Windows:** Download from [github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows/releases)

> ⚠️ **Confirm with the user before installing nvm.** System-level tool installation is not automatic.

---

## 3. Global dependencies

Check which global packages are installed:

```shell
npm list --global --depth=0
```

**Required global dependencies for SPFx development:**

| Package | Latest | Notes |
|---|---|---|
| **Yeoman** (`yo`) | v5.x | Project scaffolding |
| **`@microsoft/generator-sharepoint`** | v1.23.x | SPFx project generator |
| **Gulp CLI** (`gulp-cli`) | v3.x | Required for SPFx ≤ v1.21.1 |
| **CLI for Microsoft 365** (`@pnp/cli-microsoft365`) | latest | Recommended for upgrades and tenant operations |

### Install missing global dependencies

```shell
npm install --global yo @microsoft/generator-sharepoint gulp-cli
```

> ℹ️ **Gulp vs Heft**: SPFx v1.22+ uses Heft by default (no global `gulp-cli` needed). However, keeping `gulp-cli` installed globally is harmless and covers legacy projects.

---

## 4. CLI for Microsoft 365 (optional but recommended)

CLI for Microsoft 365 is not required for basic SPFx development but is needed for:
- Project upgrades (`m365 spfx project upgrade`)
- Tenant operations (sites, apps, permissions)
- Environment validation

```shell
npm install --global @pnp/cli-microsoft365
```

---

## 5. Environment validation

### Quick check with `spfx doctor`

If CLI for Microsoft 365 is installed, run the environment validator:

```shell
m365 spfx doctor
```

This checks Node.js version, global dependencies, and reports compatibility issues.

### Manual validation checklist

If `spfx doctor` is not available, verify:

1. **Node.js version** matches the required SPFx version (see §1 table)
2. **npm version** is compatible
3. **Yeoman** (`yo --version`) responds
4. **SPFx generator** is installed: `npm list --global @microsoft/generator-sharepoint`
5. **Git** is installed and configured: `git --version` and `git config user.name`
6. **Code editor** (VS Code) is available: `code --version`

---

## 6. Project-specific validation

If the user is already inside an SPFx project directory:

1. **Detect SPFx version** from project files:

   ```shell
   # From .yo-rc.json (most reliable)
   grep -o '"@microsoft/generator-sharepoint": "[^"]*"' .yo-rc.json

   # From package.json (fallback)
   grep -o '"@microsoft/sp-core-library": "[^"]*"' package.json
   ```

2. **Validate global dependencies against project version:**
   - SPFx ≥ 1.22 → ensure Heft toolchain (check for `config/rig.json`)
   - SPFx ≤ 1.21.1 → ensure Gulp is available globally and `gulpfile.js` exists

3. **Check for common issues:**
   - Missing `node_modules`: run `npm install` (allow at least 3 minutes)
   - Outdated dependencies: compare with latest generator output
   - Heft-to-Gulp transition: if project was recently upgraded across v1.21.1 → v1.22, check that the toolchain was migrated (see [upgrade.md](./upgrade.md))

---

## 7. Setup from scratch (no environment)

For a completely fresh machine:

1. **Install Node.js** — guide user to install manually (v20 or v22 for latest SPFx)
2. **Install nvm** — confirm with user, then: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`
3. **Install Node via nvm:** `nvm install 20 && nvm alias default 20`
4. **Install global tools:** `npm install --global yo @microsoft/generator-sharepoint`
5. **Install Git** — guide user to [git-scm.com](https://git-scm.com/) if not present
6. **Install VS Code** (optional) — guide user to [code.visualstudio.com](https://code.visualstudio.com/)
7. **Validate:** run `node --version && npm --version && yo --version` to confirm
8. **Ready to scaffold:** proceed to [create.md](./create.md)

> ⚠️ Every install step should **confirm with the user** before proceeding. System-level tool installation is not automatic.

---

## 8. Edge cases

| Situation | Guidance |
|---|---|
| **Multiple Node versions (nvm)** | Use `nvm ls` to list; `nvm use <version>` to switch; fallback to the compatibility matrix |
| **nvm not installed** | Guide user to install nvm manually; do not attempt workaround |
| **No SPFx version specified** | Assume latest (v1.23.x currently) and validate against Node v20/v22 |
| **User asks for "latest"** | Check the SPFx generator's latest published version: `npm view @microsoft/generator-sharepoint version` |
| **User mentions on-premises** | SPFx v1.17.3 max for SP On-Prem 2022; v1.4.0 for SP On-Prem 2019. Reference [Microsoft Learn compatibility matrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility) |
| **Permission errors during `npm install --global`** | Suggest `sudo` on macOS/Linux or running terminal as Administrator on Windows |
