# Copilot UX Components (SPFx 1.24.1)

Use for SPFx-hosted UI in Microsoft 365 Copilot, formerly called SharePoint Copilot Apps. This is not a general agent/bot tutorial. A web part and a Copilot component can share React views, but have different host adapters and lifecycles.

## Scaffold

Follow [setup.md](./setup.md) for **Node.js 26 LTS** and generator **1.24.1**, preserving compatible existing Node 22.14+/24.x pins. Verify the installed generator and its `--help`; do not substitute `@next`. From a new, empty solution directory:

```console
yo @microsoft/sharepoint --solution-name "<solution-name>" --component-type copilotComponent --component-name "<ComponentName>" --framework react --skip-install --no-insight
```

`--framework` selects `react`, `none`, or `minimal`; use the requested template, not a web part with renamed files. For React, **MUST use Fluent UI v9 wherever compatible**, as the Copilot React template already does (`@fluentui/react-components` and icons). A retained v8 dependency is not the UI model. Follow [react-design.md](./react-design.md) for composition, providers and host theming.

Run `npm install` after scaffolding. Verify generated release-coupled runtime, rig, plugin and lint dependencies resolve to exact **1.24.1** in both the manifest and lockfile; generator metadata alone is insufficient. The 1.24.1 generator fixes 1.24.0's `1.24.0-rc.0` package references. For existing projects use [upgrade.md](./upgrade.md); preserve schema references and compatible dependency choices, not prerelease package pins, sample overrides or custom audit scripts.

## Keep the component and agent contract aligned

| Surface | Responsibility |
| --- | --- |
| `src/copilotComponents/<name>` | Component class, UI, manifest and properties schema. |
| Component manifest | `componentType: "CopilotComponent"`, `copilotType: "Ux"`, declared display modes and tools referencing compiled properties schemas. |
| Properties schema | Zod definitions, descriptions and exported JSON Schema; keep inferred TypeScript props aligned. Validate agent-supplied values before using them. |
| `copilot` and `config/copilot-agent.json` | App/declarative-agent definitions, action mappings and component IDs. Preserve generated identities and schema references. |

Use meaningful tool/property descriptions so the agent knows when to invoke the component and what inputs to supply. Never infer a site URL from a display name. In the Copilot host, the default site context may be the tenant root; expose and validate a site parameter when the scenario needs another site.

New 1.24 projects use declarative-agent schema **v1.8**. Keep the schema reference/version aligned; this selects the schema, not a deployment counter. Existing agents are not upgraded automatically. Fix build-time agent validation errors in source configuration, not generated output.

## Host lifecycle and React

- Extend `BaseCopilotComponent<TProperties>` from `@microsoft/sp-copilot-component`; read `this.properties` and `this.hostContext`, and render into `this.context.domElement`.
- Initialize reusable services in `onInit()`. Load data in the view with loading/empty/error states instead of blocking first render on remote calls; ignore stale results and clean up effects.
- With React 18.3.1, store one `createRoot` per container, reuse it on render/host-context updates, then unmount and clear it in `onTeardown()`. Preserve other teardown/base-class cleanup.
- Read the current `this.hostContext` each render; its fields are optional. Declare `capabilities.availableDisplayModes` (`inline`, `fullscreen`); `defaultDisplayMode` must be among them and is only a startup preference. Offer expansion only when available, inspect the mode returned by `requestDisplayModeAsync('fullscreen')`, and follow later host updates. Closing fullscreen must not immediately reopen it; keep shared selection/form state above mode-specific views.
- Prefer fluid layout and the framework's automatic resize observer. If explicit `requestSizeChangeAsync` is needed, measure content instead of copying fixed demo sizes and check its boolean result. The host owns final sizing; missing `containerDimensions` is not a zero-width viewport.
- Use the bridge for `openLinkAsync` and `sendFollowUpMessageAsync`; check `isError` as well as promise rejection. These requests do not authorize writes. Replace starter demo fallbacks with visible loading/empty/error states; do not present failed Graph/REST calls as successful placeholder data.
- For iframe styling, pass `this.context.domElement.ownerDocument` to the Fluent/Griffel boundary in [react-design.md](./react-design.md#provider-and-document-ownership); keep style hooks inside that boundary, not just the JSX it returns.

## Keep Copilot informed about the rendered view

Rendering does not tell Copilot what the user sees; `createCopilotTextContent` creates a block but does not send it. MUST publish a concise snapshot through `this.context.copilotBridge.updateModelContextAsync(...)` after initial rendering and meaningful state changes. Derive it from the same committed UI state: loading/ready/empty/error status, filters/date range/sort, visible values/units/counts/selection, totals' scope, and draft/confirmation/submission status. Send a plain-language summary in `content` and useful machine-readable values in `structuredContent`, not HTML or whole datasets.

Each update **replaces** the previous context; send a self-contained snapshot, not deltas. It supplies context for the next user message without starting a response. Use `sendFollowUpMessageAsync` only for an intentional conversational follow-up, not routine UI synchronization; await the relevant context update first. Check the follow-up result's `isError` as well as rejected promises before reporting success.

**At GA, text context created with `createCopilotTextContent` has a 10 KB maximum; oversized text blocks sending, not silent truncation.** As a stricter application guard, budget **10,000 UTF-8 bytes** for the complete serialized payload, including both context fields; allow for host-counted overhead. This is not a claim about the host's exact byte accounting or non-text limits. Apply the guard to follow-ups too. On overflow, show an actionable error, let the user select fewer items or choose a shorter summary, then rebuild and retry. Never silently alter totals/qualifications, truncate identifiers/JSON, or split a snapshot into replacement updates to evade the limit.

```typescript
import { createCopilotTextContent, type ISPCopilotBridge } from '@microsoft/sp-copilot-component';

async function publishRenderedContext(
  bridge: ISPCopilotBridge,
  summary: string,
  renderedState: Record<string, unknown>
): Promise<void> {
  const modelContext = {
    content: [createCopilotTextContent(summary)],
    structuredContent: renderedState
  };
  if (new TextEncoder().encode(JSON.stringify(modelContext)).byteLength > 10_000) {
    throw new Error('Copilot context exceeds 10 KB; select fewer items or choose a shorter summary.');
  }
  await bridge.updateModelContextAsync(modelContext);
}
```

Call the helper with `this.context.copilotBridge` from a post-render/state-change effect or callback, not during React render. Coalesce/deduplicate rapid changes, prevent stale updates winning, and cancel pending work on teardown. Surface failed/oversized sends as potentially stale context; mark synchronized only after success. Include only authorized visible data, never hidden fields, credentials or internal diagnostics; context does not authorize or prove a backend action. Test byte boundaries, multibyte text, state changes, deliberate reduction/retry, and bridge failures.

## Data access

Use `this.context.spHttpClient` for SharePoint REST and `this.context.msGraphClientFactory.getClient('3')` for Graph. These are the documented brokered SPFx paths; do not assume PnPjs fetch behaviors share their authentication. Use PnPjs here only after verifying integration in the actual host, without context casts or custom token shortcuts.

Check `SPHttpClientResponse.ok` before parsing, select only needed fields, validate input/schema and surface permission/network failures. Declare necessary Graph scopes under `webApiPermissionRequests` in `config/package-solution.json`; an administrator approves them in API access. Ordinary SharePoint calls still depend on the user's access. Never turn failed requests into fabricated successful data.

## Build, test and deploy

1. Configure the tenant/site in generated `config/serve.json`, trust the development certificate when needed, and run `npm start`. Open the configured Copilot Workbench, not the standard web-part workbench.
2. Run `npm run build`; the standard template tests/builds and packages for production. Review generated agent/schema validation errors, not just TypeScript output.
3. Test tool parameters, consent failures, display/theme changes, portals/focus, multiple instances and teardown in the Workbench **and** the real Copilot host. Report checks blocked by tenant access.
4. With authorization, deploy the `.sppkg` through the tenant app catalog, approve required API scopes and initially synchronize the baseline agent using **Add to Teams**.

For updates, rebuild/package/redeploy component code and tool definitions; **re-sync only when the baseline agent changes** (name, icons, instructions, starters, knowledge or additional actions). Dynamic tool discovery can cache definitions for a few minutes; allow for that delay, then test in a new conversation. Re-syncing or starting a conversation does not bypass the cache.

Preserve solution/component/app IDs. Keep the SPFx package version, numeric app version in `copilot/manifest.json`, and declarative-agent schema version separate. The build updates the app version for relevant agent-content changes unless already updated; verify built/deployed versions rather than bumping the agent schema to resolve deployment conflicts. Do not hand-edit generated ZIPs.

## GA availability and limits

- Requires the **Microsoft 365 Copilot add-on user license (USL)** on E3, E5 or E7, **including development and Copilot Workbench testing**; the base license alone is insufficient. The capability has no consumption-based charges; called services may charge separately.
- Supported: Microsoft 365 Copilot and Copilot in Teams, in browser/desktop clients. **No iOS/Android, including Teams mobile, at GA.** Standard-chat plug-in packaging and Cowork are not GA capabilities.
- SharePoint Store distribution and private tenant App Catalog deployment are supported. This does not imply independent Teams Store support or remove agent setup, licensing and consent requirements.
- Combined Copilot UX components and SPFx Teams functionality have an **automatic Sync to Teams packaging mismatch at GA**. Use the documented developer-provided Teams package containing both experiences; do not promise a date for the planned fix.

GA sources, reviewed **2026-10-28**: [context and 10 KB text limit](https://github.com/VesaJuvonen/sp-dev-docs/blob/af6397f04c3132eb7c4a67cdd8ff72b8ad8f013e/docs/spfx/copilot/provide-context-to-copilot.md), [configuration](https://github.com/VesaJuvonen/sp-dev-docs/blob/af6397f04c3132eb7c4a67cdd8ff72b8ad8f013e/docs/spfx/copilot/component-and-agent-configuration.md), [deployment](https://github.com/VesaJuvonen/sp-dev-docs/blob/af6397f04c3132eb7c4a67cdd8ff72b8ad8f013e/docs/spfx/copilot/development-and-deployment.md), [availability](https://github.com/VesaJuvonen/sp-dev-docs/blob/af6397f04c3132eb7c4a67cdd8ff72b8ad8f013e/docs/spfx/copilot/overview-copilot-apps.md#availability).

Implementation guides: [first component](https://learn.microsoft.com/sharepoint/dev/spfx/copilot/get-started/build-your-first-copilot-app), [data and permissions](https://learn.microsoft.com/sharepoint/dev/spfx/copilot/access-data), [React 18 lifecycle](https://learn.microsoft.com/sharepoint/dev/spfx/react-18-upgrade). Template and bridge guidance was cross-checked against the published **1.24.0** generator/SDK and the maintainer's GA sample baseline. The **1.24.1** generator's stable dependency pins and Node 26 support were rechecked on **2026-11-11**, with [maintenance release guidance](https://learn.microsoft.com/sharepoint/dev/spfx/release-1.24.1); neither check is tenant/runtime certification.
