# SPFx Toolchain: Heft vs gulp

SPFx changed its build toolchain at **v1.22**. Always determine the toolchain from the installed SPFx version **before** running any build, serve, or package command.

## Decide the toolchain

Read the version from `.yo-rc.json` (`@microsoft/generator-sharepoint.version`) or the `@microsoft/sp-*` packages in `package.json`:

| Installed SPFx version | Toolchain |
| --- | --- |
| **v1.22.0 and newer** | **Heft** (default for new projects) |
| **v1.0 – v1.21.1** | **gulp** (legacy) |

Support timeline: gulp remains usable on upgraded projects through v1.23 and becomes **officially unsupported at v1.24**. New projects from v1.22 use Heft by default.

## Command mapping

| Task | Heft (v1.22+) | gulp (≤ v1.21.1) |
| --- | --- | --- |
| Build (compile + bundle) | `npm run build` or `heft build --clean` | `gulp build` then `gulp bundle` |
| Production bundle | `heft build --production` | `gulp bundle --ship` |
| Clean | `heft clean` | `gulp clean` |
| Test | `heft test` | `gulp test` |
| Serve / local workbench | `heft start` | `gulp serve` |
| Package solution | `heft package-solution` | `gulp package-solution` |
| Production package | `heft package-solution --production` | `gulp package-solution --ship` |
| Trust dev certificate | `heft trust-dev-cert` | `gulp trust-dev-cert` |
| Deploy to test site (new) | `heft dev-deploy` | _(not available)_ |

Notes:
- Heft has **no separate `bundle` step** — compile and bundle both happen in `build`.
- The gulp `--ship` flag is replaced by `--production` in Heft.

## Heft npm scripts

SPFx v1.22+ projects define Heft-backed scripts in `package.json`. Prefer `npm run <script>` so you always use the project's intended commands:

```json
{
  "scripts": {
    "build": "heft build --clean",
    "clean": "heft clean",
    "test": "heft test",
    "start": "heft start --clean"
  }
}
```

Optionally install the Heft CLI globally to run `heft <action>` directly:

```
npm install @rushstack/heft --global
```

## Heft rig

Heft projects reference a shared build "rig" via `./config/rig.json`:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/rig-package/rig.schema.json",
  "rigPackageName": "@microsoft/spfx-web-build-rig"
}
```

Webpack is still the underlying bundler — it is now orchestrated by Heft instead of gulp. Use `heft eject-webpack` only when deep webpack customization is required.
