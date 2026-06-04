# Create SPFx Project

## Gather requirements first

Confirm these inputs before scaffolding. Ask the user only when genuinely ambiguous; otherwise pick the sensible default.

| Input | Flag | Values / default |
| --- | --- | --- |
| Solution name | `--solution-name` | lowercase/kebab-case, unique in the tenant app catalog |
| Framework | `--framework` | `react` (default), `none`, `minimal` |
| Component type | `--component-type` | `webpart` (default), `extension`, `library`, `adaptiveCardExtension` |
| Component name | `--component-name` | PascalCase, e.g. `HelloWorld` |
| Extension type (extensions only) | `--extension-type` | `ApplicationCustomizer`, `FieldCustomizer`, `ListViewCommandSet` |

## Environment check

Run `npx --package @pnp/cli-microsoft365@latest -- m365 spfx doctor` to verify Node version, npm version, and other prerequisites. If Node is incompatible, check for `fnm` or `nvm` and try to switch to a compatible version. If no version manager is available, no compatible version is installed, or other errors remain, **stop and tell the user** what needs fixing before proceeding.

## Scaffold the project

Use the Yeoman generator with `@latest` to avoid npx resolving a stale version. SPFx v1.22+ scaffolds with the **Heft** toolchain by default:

```
npx --package yo --package @microsoft/generator-sharepoint@latest -- yo @microsoft/sharepoint --solution-name "<name>" --framework react --component-type webpart --component-name "<WebPartName>" --skip-install --no-insight
```

For an **extension**, pass `--extension-type` (omit it for web parts):

```
npx --package yo --package @microsoft/generator-sharepoint@latest -- yo @microsoft/sharepoint --solution-name "<name>" --component-type extension --extension-type ApplicationCustomizer --component-name "<Name>" --framework none --skip-install --no-insight
```

**Critical: always use non-interactive mode** with explicit flags as shown above. Interactive mode (arrow-key navigation) is unreliable in agent terminals and causes wrong template selection. Adjust flags based on what the user asks for.

> Only if the user explicitly needs the **legacy gulp** toolchain, opt in via the generator. Do not guess the flag name — run `npx --package @microsoft/generator-sharepoint@latest -- yo @microsoft/sharepoint --help` to find the current option, then pass it explicitly. Otherwise keep the Heft default. See [toolchain.md](./toolchain.md).

## Install dependencies

From the generated project directory, run `npm install --silent --no-fund --no-audit`.

## Trust the developer certificate

Required once per machine for the local workbench. Use the command for the project's toolchain (see [toolchain.md](./toolchain.md)):

- Heft (v1.22+): `npx heft trust-dev-cert`
- gulp (≤ v1.21.1): `npx gulp trust-dev-cert`

If it fails on a locked-down machine, tell the user to trust the certificate manually — do not skip silently.

## Validate the scaffold

Confirm a clean build before handing back:

```
npm run build
```

Resolve any errors. To debug interactively, tell the user to run `npx heft start` (v1.22+) or `npx gulp serve` (legacy) to open the local workbench. Web parts that call SharePoint data need the hosted workbench at `https://<tenant>.sharepoint.com/_layouts/15/workbench.aspx`.

## Data access

If the component reads or writes SharePoint or Microsoft Graph data, wire up **PnPjs by default** — see [pnpjs.md](./pnpjs.md).

## Packaging (when the user wants to deploy)

Produce the deployable `.sppkg` in `sharepoint/solution` using the project's toolchain:

- Heft (v1.22+): `npx heft build --production` then `npx heft package-solution --production`
- gulp (≤ v1.21.1): `npx gulp bundle --ship` then `npx gulp package-solution --ship`
