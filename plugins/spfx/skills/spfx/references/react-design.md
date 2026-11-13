# React SPFx Design Guidelines

**MUST use Fluent UI v9 wherever compatible components are available** for new/changed React + TypeScript UI. This applies to a single control, a composite or a full page; do not turn every request into an app shell. For Copilot lifecycle and bridge operations, load [copilot.md](./copilot.md).

The default target is **SPFx 1.24.1 / React 18.3.1**; follow [setup.md](./setup.md) for Node/tool prerequisites. Preserve an explicitly older target's React contract rather than upgrading React independently.

## Packages and composition

- Use `@fluentui/react-components`, compatible `@fluentui/react-icons`, `makeStyles` and tokens. Compose existing primitives and anatomy (`Card`, `CardHeader`, `Button`, `Text`) before custom UI.
- The 1.24 Copilot React template includes v9; ordinary React web parts still scaffold v8. That dependency is not a reason to choose v8 for new UI. Do not mix v8/v9 APIs or add a second React runtime.
- Inspect declared and resolved packages; verify React/types peers for the selected v9 release before installing. Do not force peers or copy sample resolutions/overrides. Keep existing compatible dependencies unless a change is needed.
- Use v8 or semantic HTML only for an unavailable/incompatible v9 equivalent, and explain the constraint. Untouched v8 UI need not be rewritten. Keep output minimal and implementation-ready.

## Theme comes from the actual host

Accessibility/legibility takes precedence over host integration, then brand expression. Pass the current theme through props/context and update it when the host changes.

| Host | Theme model |
| --- | --- |
| SharePoint web part | Observe the SPFx theme through the existing theme lifecycle. Map its palette/semantic colors into v9 tokens; a v8/SPFx theme is not a v9 `Theme` and must not be cast to one. Generic light/dark themes do not reproduce site branding. |
| Copilot UX component | Read the latest optional `hostContext.theme`: `dark` -> `webDarkTheme`, otherwise `webLightTheme`. The host supplies no SharePoint palette or v9 design tokens. |
| Other declared host | Use its documented theme adapter. Use Fluent defaults only when the host supplies no theme. |

Use Fluent theme tokens for foregrounds, surfaces, borders, spacing and typography, not hardcoded color systems. Preserve existing host integration for a justified v8 fallback. Validate contrast and forced-colors behavior rather than assuming a dark theme covers them.

## Provider and document ownership

For Copilot/other-document hosts, pass the container's `ownerDocument` to both Griffel and Fluent; parent-document styles do not style an iframe. This boundary uses exports from `@fluentui/react-components`:

```tsx
import * as React from 'react';
import {
  createDOMRenderer, FluentProvider, RendererProvider, type Theme
} from '@fluentui/react-components';

export function FluentBoundary(props: {
  targetDocument: Document;
  theme: Theme;
  children: React.ReactNode;
}): React.ReactElement {
  const renderer = React.useMemo(
    () => createDOMRenderer(props.targetDocument),
    [props.targetDocument]
  );
  return (
    <RendererProvider renderer={renderer} targetDocument={props.targetDocument}>
      <FluentProvider theme={props.theme} targetDocument={props.targetDocument}>
        {props.children}
      </FluentProvider>
    </RendererProvider>
  );
}
```

Define `makeStyles` factories at module scope, but call the resulting hooks in **children inside** this boundary. A hook in the function that returns the provider still uses the outer renderer. Keep portal/overlay styles and focus in the same document. If using `IdPrefixProvider`, choose a stable per-instance prefix, not one shared by independent roots.

For React 18 targets, retain one root per container; host/theme changes re-render that root rather than remount it. Unmount and clear it on web-part disposal or Copilot `onTeardown`, and remove observers/listeners. Older supported targets retain their compatible rendering APIs until the framework is upgraded.

## Layout and interaction

- Inline/conversational: one focused, scannable column. Embedded/web-part: constrained fluid width, compact spacing/elevation, no full-screen assumptions. Fullscreen/full-page may add regions, but must stack when narrow.
- Use CSS grid/flex, `minWidth: 0` and container-aware layout instead of fixed demo dimensions or viewport-only breakpoints. Measure the container when host dimensions are absent; clean up `ResizeObserver`. Keep selection/form state above mode-specific views.
- Use consistent icon variants and hover/active/focus states. Do not hide essential actions behind hover. Avoid dense toolbars, excessive nesting and heavy components without a scenario need.
- Use semantic headings, visible focus, accessible names (including icon-only buttons), logical tab order and managed/restored overlay focus. Status must have text, not color alone.
- Localize labels/errors and format dates, numbers and currency with the user's locale; honor RTL layout. Keep units and totals' scope explicit.

## Data and feedback

Keep data in typed services/hooks, not render. Prefer [PnPjs](./pnpjs.md) for ordinary SharePoint/Graph work; preserve its [Copilot brokered-client exception](./copilot.md#data-access).

Expose loading, empty, error and mutation-pending states with appropriate announcements and retry actions. Ignore stale requests and never make failures look like successful placeholder data. For Copilot, publish context matching these visible states; follow [the context and 10 KB guidance](./copilot.md#keep-copilot-informed-about-the-rendered-view).

## Validation

Run the project's `npm run build` and resolve errors; see the [toolchain decision](../SKILL.md#toolchain-decision-rule). Test each declared host with light/dark/branded/forced-colors themes, narrow containers (including approximately 320 CSS pixels for inline UI), zoom, localized/RTL text, keyboard/focus, portals, multiple instances and disposal/reopen. Verify state survives host/theme/mode rerenders. A build or sample render alone is not host certification; report blocked checks.

Source: [GA Copilot theme/design guidance](https://github.com/VesaJuvonen/sp-dev-docs/blob/af6397f04c3132eb7c4a67cdd8ff72b8ad8f013e/docs/spfx/copilot/theme-and-design.md), cross-checked against the published 1.24.0 template and supplied GA samples on **2026-10-28**.

The published **1.24.1** generator dependency groups were checked on **2026-11-11**: React remains 18.3.1, the Copilot React template includes Fluent UI v9, and standard React web parts still include v8. This dependency check does not replace host validation.
