# Wood Pricing Estimator — ChatGPT App Widget

A React component bundle for a hardwood lumber cost estimator, built for
OpenAI's [Apps SDK](https://developers.openai.com/apps-sdk). This repo does
**not** ship a standalone web app — it compiles to a single JS file
(`dist/pricing-widget.js`) that a separate NestJS/MCP server repo embeds as an
`ui://widget/...` resource and renders inside a ChatGPT iframe.

## Architecture

- **This repo**: the widget UI. Zustand + TanStack Query + Tailwind, built
  with Vite into one self-contained ESM bundle (CSS inlined via
  `vite-plugin-css-injected-by-js`).
- **Backend (separate repo, in progress)**: a NestJS `woodpricing` MCP
  server. Access is **MCP only** — there is no REST API. The widget calls its
  tools directly via `window.openai.callTool`; TanStack Query wraps those
  calls for caching/loading/error state, the same way it'd wrap a `fetch`.
- **Local dev**: `npm run dev` renders the widget in a normal browser tab. A
  mock `window.openai` bridge (`src/lib/openaiBridge.ts`) fakes both tools
  against local sample data, so the widget is fully previewable without
  ChatGPT, MCP Inspector, or a tunnel.

## Backend contract

**MCP endpoint:** `POST https://nestjs-mega-backend-prod-893a099fba68.herokuapp.com/api/v1/subapps/woodpricing/mcp`
(Streamable HTTP, stateless, no auth yet — dev/testing MVP; rate-limited to
60 requests/60s per IP). Two tools, called in sequence:

### `get_material_catalog`

Zero input. Called once on load (`useMaterialCatalog`,
`src/api/useMaterialCatalog.ts`) — cached client-side since it "changes
rarely, only when someone reseeds pricing data."

```ts
interface GetMaterialCatalogOutput {
  materials: MaterialCatalogEntry[]
}

interface MaterialCatalogEntry {
  species: string                               // free text, may fold in a sub-type, e.g. "Maple - Hard Maple" — treat as an opaque identifier, don't parse it
  measurementType: 'BOARD_FOOT' | 'LINEAR_FOOT'  // currently always BOARD_FOOT; don't hardcode "board foot" labels
  availableThicknesses: { thickness: string; unitPrice: number }[]  // unitPrice is per-thickness, not per-species
  lastUpdated: string
}
```

### `calculate_project_cost`

Called whenever the user has a complete species + thickness + quantity
selection (`useCalculateProjectCost`, `src/api/useCalculateProjectCost.ts`,
debounced 400ms so typing a quantity doesn't fire a request per keystroke).

```ts
interface CalculateProjectCostInput {
  species: string      // must exactly match a get_material_catalog species
  thickness: string    // must exactly match one of that species' availableThicknesses
  quantity: number     // > 0 — the raw amount of board/linear feet wanted, NOT physical board dimensions
}

interface CalculateProjectCostOutput {
  species: string
  measurementType: 'BOARD_FOOT' | 'LINEAR_FOOT'
  thickness: string
  quantity: number
  unitPrice: number
  totalCost: number
  lastUpdated: string
}
```

Error case: the tool can return `isError: true` with a text explanation
(e.g. species/thickness not found). The widget only ever sends values
sourced from `get_material_catalog`, so per the contract this "should
essentially never happen" — `useCalculateProjectCost` surfaces it as
`isNotFoundError`, treated as a bug/stale-cache signal, not a normal
user-facing state.

**All pricing math happens server-side.** The widget does no board-foot
conversion — `quantity` is the exact figure sent to and returned from the
tool; `CostBreakdown` just renders `totalCost`.

## Widget flow

1. On mount, call `get_material_catalog` → populate the species dropdown.
2. On species selection, populate the thickness dropdown from that species'
   `availableThicknesses`, showing price inline (e.g. `"8/4 — $16.95/bf"`).
   Skipped/auto-selected when a species has only one thickness.
3. On quantity input (+ species/thickness set), call
   `calculate_project_cost` and display `totalCost`.
4. The user's species/thickness/quantity picks are persisted via
   `window.openai.setWidgetState` so they survive widget remounts within the
   same conversation.

## UI library

[`@jfc3303/jafracore-ui`](https://www.npmjs.com/package/@jfc3303/jafracore-ui)
(Shadcn/Radix + Tailwind v4) is wired in. `src/components/index.ts` is the
single import point:

- `Button`, `Card` (+ `CardHeader`/`CardTitle`/`CardDescription`/
  `CardContent`/`CardFooter`), and `Label` are re-exported directly from the
  package.
- `Input` is a thin local wrapper (`src/components/Input.tsx`) composing the
  package's `Input` + `Label` to add the label-above/suffix-beside layout
  this app's forms use.
- `Select` stays fully local (`src/components/Select.tsx`) — the package has
  no form Select yet (only `DropdownMenu`, which is action-menu-shaped, not a
  controlled form value). It's styled to match the package's `Input` classes
  via its `cn()` helper. Swap it out if the package adds a real Select later.

Setup already done in `src/index.css`, per the package's README:

```css
@import 'tailwindcss';
@source '../node_modules/@jfc3303/jafracore-ui/dist';

@import '@jfc3303/jafracore-ui/theme.css';
```

Feature components never import from the package directly — only from
`src/components/index.ts` — so future swaps (e.g. if the package adds a
Select) stay a one-file change.

### Known follow-up: bundle size

The package ships as one bundled `dist/index.js` (via `tsup`) rather than
per-component entry points, so importing anything from it currently pulls in
its full dependency graph (all Radix primitives, `sonner`, `lucide-react`)
into `dist/pricing-widget.js`. Worth revisiting (e.g. per-component subpath
exports in the package) if widget load time becomes a concern.

## Scripts

- `npm run dev` — local dev server with HMR (mock ChatGPT bridge, fakes both
  MCP tools against local sample data).
- `npm run build` — type-checks, then builds `dist/pricing-widget.js`, the
  single-file bundle to hand off to the backend repo.
- `npm run lint` — ESLint.

## Cursor AI dev tooling

`vite-plugin-mcp` is wired into `vite.config.ts` purely for local Cursor
context (exposes this app's module graph/dev state at
`http://localhost:5173/__mcp/sse`). This is unrelated to the ChatGPT-facing
`woodpricing` MCP server above and never ships in the production widget
bundle.

## Open follow-ups

- Auth: the MCP endpoint has none yet ("dev/testing MVP — OAuth 2.1 required
  before public submission"). No action needed on the widget side unless/
  until the bridge itself needs to pass credentials.
- Decide the hand-off mechanism for `dist/pricing-widget.js` into the backend
  repo (copy, shared workspace, or published artifact).
- Revisit `@jfc3303/jafracore-ui` bundle size (see above) if widget load time
  becomes a concern.
- Real end-to-end testing (actual `window.openai.callTool` against the live
  MCP server) needs to happen via ChatGPT Developer Mode or MCP Inspector,
  not `vite dev` — see "Why MCP-only" below.

## Why MCP-only (no REST fetch)?

Earlier iterations had the widget call a REST endpoint directly. That path
required CORS configured for the widget's origin, a public (or
separately-authed) endpoint, and `_meta.ui.csp.connectDomains`
registration — three things to get right just to read a price list. Calling
tools through the MCP Apps bridge instead removes all three: no CORS, no
public endpoint, no separate auth story, and it's the pattern the Apps SDK
is actually designed around.
