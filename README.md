# Wood Pricing Estimator — ChatGPT App Widget

A React component bundle for a woodworking project cost estimator, built for
OpenAI's [Apps SDK](https://developers.openai.com/apps-sdk). This repo does
**not** ship a standalone web app — it compiles to a single JS file
(`dist/pricing-widget.js`) that a separate NestJS/MCP server repo embeds as an
`ui://widget/...` resource and renders inside a ChatGPT iframe.

## Architecture

- **This repo**: the widget UI. TanStack Query + Zustand + Tailwind, built
  with Vite into one self-contained ESM bundle (CSS inlined via
  `vite-plugin-css-injected-by-js`).
- **Repo 2 (separate, in progress)**: NestJS backend exposing both an MCP
  server (for ChatGPT's model to call tools) and a plain REST API (for this
  widget to browse/list pricing data directly).
- **Local dev**: `npm run dev` renders the widget in a normal browser tab. A
  mock `window.openai` bridge (`src/lib/openaiBridge.ts`) stands in for the
  ChatGPT host so widget-state calls no-op safely, and `useWoodPrices` falls
  back to sample data if the REST API isn't reachable.

## Backend contract (Repo 2)

This widget expects a `WoodMaterial` REST API with the following shape:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | primary key |
| `species` | string | free-text, may include sub-type, e.g. `"Maple - Hard Maple"` |
| `measurementType` | `'BOARD_FOOT' \| 'LINEAR_FOOT'` | |
| `thickness` | string, nullable | quarter-inch lumber notation, e.g. `"4/4"` = 1in, `"8/4"` = 2in; part of the unique key |
| `unitPrice` | number | price per unit of `measurementType` |
| `dimensions` | JSON, nullable | reserved, unused by this widget |
| `lastUpdated` | timestamp | |

Unique key: `(species, measurementType, thickness)`.

Endpoints used by this widget:

- `GET /api/v1/subapps/woodpricing` — full material list. Used directly by
  `useWoodPrices` (`src/api/useWoodPrices.ts`) via TanStack Query — this is a
  plain REST call, not an MCP tool call.

### Environment

Copy `.env.example` to `.env` and point it at a running instance of Repo 2:

```
VITE_WOODPRICING_API_BASE_URL=http://localhost:3000
```

This must be an **absolute URL** — the widget renders inside a ChatGPT
iframe with its own origin, so relative fetches won't reach the backend. When
Repo 2 registers the render tool for this widget, it must allow-list this
origin in `_meta.ui.csp.connectDomains`, or ChatGPT will block the request.

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
into `dist/pricing-widget.js` — bundle grew from ~212KB to ~268KB gzipped
after wiring it in, even though this widget only uses `Button`/`Card`/
`Label`/`Input`. Worth revisiting (e.g. per-component subpath exports in the
package) if widget load time becomes a concern.

## Scripts

- `npm run dev` — local dev server with HMR (mock ChatGPT bridge + sample
  data fallback).
- `npm run build` — type-checks, then builds `dist/pricing-widget.js`, the
  single-file bundle to hand off to Repo 2.
- `npm run lint` — ESLint.

## Cursor AI dev tooling

`vite-plugin-mcp` is wired into `vite.config.ts` purely for local Cursor
context (exposes this app's module graph/dev state at
`http://localhost:5173/__mcp/sse`). This is unrelated to the ChatGPT-facing
MCP server in Repo 2 and never ships in the production widget bundle.

## Open follow-ups

- Confirm the live REST base URL once Repo 2 is deployed/tunneled, and that
  CORS + `connectDomains` are configured on that side.
- Decide the hand-off mechanism for `dist/pricing-widget.js` into Repo 2
  (copy, shared workspace, or published artifact).
- Revisit `@jfc3303/jafracore-ui` bundle size (see above) if widget load time
  becomes a concern.
