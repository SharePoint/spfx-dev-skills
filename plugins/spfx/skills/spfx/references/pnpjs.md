# PnPjs Data Access (default)

**Prefer PnPjs for ordinary SharePoint and Microsoft Graph data operations.** Raw clients are appropriate when required by the API, host, user, or dependency constraints. For **Copilot UX components**, use the documented brokered `SPHttpClient` / `MSGraphClientV3` paths in [copilot.md](./copilot.md) unless PnPjs integration is verified in that host.

## Install

Read `package.json` and the lockfile first. Keep compatible existing PnPjs dependencies; otherwise resolve a compatible **stable** release using its Node/TypeScript requirements and package metadata, not an unqualified `@latest` install. The SPFx 1.24.1 / Node 26 baseline is defined in [setup.md](./setup.md); an older/on-premises target needs its own compatible PnPjs track.

For example, **4.22.0** is the published stable v4 candidate checked on **2026-11-11**, not an evergreen pin or a claim of host certification:

```console
npm view @pnp/sp@4.22.0 version engines dependencies peerDependencies --json
npm view @pnp/graph@4.22.0 version engines dependencies peerDependencies --json
npm install @pnp/sp@4.22.0 @pnp/graph@4.22.0 --save-exact
```

- `@pnp/sp` — SharePoint REST (lists, items, files, site, search).
- `@pnp/graph` — Microsoft Graph (users, groups, mail, calendar, Teams).

Install only the packages you actually use to keep the bundle small. Keep related `@pnp/*` packages on coherent versions and inspect resolved dependencies with `npm ls`. PnPjs v4's Node minimum (`>=18.12.0`) is not a recommendation to run SPFx 1.24.1 on Node 18. Optional PnP React/property controls have separate React/SPFx peers; verify those before adding them to a React 18 solution.

## Initialize with SPFx context

Create the PnPjs instance once using the SPFx context so auth, base URL, and telemetry are wired automatically. Do this in `onInit()` and store the instance, rather than re-creating it on every call.

```typescript
import { spfi, SPFx as spSPFx } from "@pnp/sp";
import { graphfi, SPFx as graphSPFx } from "@pnp/graph";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/graph/users";

// In a web part: this.context is WebPartContext
const sp = spfi().using(spSPFx(this.context));
const graph = graphfi().using(graphSPFx(this.context));
```

For extensions, pass the extension `this.context`. For service-scoped usage, create the instance in a service class and pass the context in.

## Selective imports

PnPjs is modular — import only the sub-modules you use so tree-shaking keeps the bundle small. Import the side-effect modules (e.g. `"@pnp/sp/items"`) once where you set up the instance.

## Common operations

```typescript
// Read items from a list (select only needed fields, page with top)
const items = await sp.web.lists
  .getByTitle("Documents")
  .items.select("Id", "Title", "Modified").top(50)();

// Create an item
await sp.web.lists.getByTitle("Tasks").items.add({ Title: "New task" });

// Update an item
await sp.web.lists.getByTitle("Tasks").items.getById(1).update({ Title: "Updated" });

// Delete an item
await sp.web.lists.getByTitle("Tasks").items.getById(1).delete();

// Microsoft Graph: current user
const me = await graph.me();
```

## Permissions for Graph

Microsoft Graph and cross-resource calls require API permissions approved in the **SharePoint admin center → API access**. Declare them in `package-solution.json` under `webApiPermissionRequests`, and tell the user an admin must approve them after deployment.

## Best practices

- Use `.select()` and `.top()` to limit payload size; never fetch all fields/rows blindly.
- Handle errors and loading states in the UI; surface failures rather than swallowing them.
- Keep data logic in a service/helper, not inside React render code.
- Match the PnPjs major version to the project's SPFx and TypeScript versions to avoid type conflicts.
