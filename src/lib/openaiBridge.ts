import { useSyncExternalStore } from 'react'

/**
 * Minimal client for the `window.openai` globals ChatGPT injects into a
 * widget iframe (the Apps SDK compatibility layer over the MCP Apps
 * `postMessage` bridge).
 *
 * Access to pricing data is **MCP only** — there is no REST API. The widget
 * actively calls two tools on the backend's `woodpricing` MCP server via
 * `window.openai.callTool`:
 *
 * 1. `get_material_catalog` — zero-input, called once on load, returns the
 *    full species/thickness/price catalog.
 * 2. `calculate_project_cost` — called whenever the user finalizes a
 *    species + thickness + quantity, returns the computed `totalCost`.
 *
 * Docs: https://developers.openai.com/apps-sdk/build/chatgpt-ui
 */

export type MeasurementType = 'BOARD_FOOT' | 'LINEAR_FOOT'

export interface MaterialThicknessOption {
  thickness: string
  unitPrice: number
}

export interface MaterialCatalogEntry {
  species: string
  measurementType: MeasurementType
  availableThicknesses: MaterialThicknessOption[]
  lastUpdated: string
}

export interface GetMaterialCatalogOutput {
  materials: MaterialCatalogEntry[]
}

export interface CalculateProjectCostInput {
  species: string
  thickness: string
  quantity: number
}

export interface CalculateProjectCostOutput {
  species: string
  measurementType: MeasurementType
  thickness: string
  quantity: number
  unitPrice: number
  totalCost: number
  lastUpdated: string
}

/** What the user has picked in the widget — persisted as ChatGPT widget state. */
export interface EstimatorSelection {
  species: string | null
  thickness: string | null
  quantity: number | null
}

export type EstimatorWidgetState = EstimatorSelection

interface OpenAiGlobals {
  toolOutput: unknown
  toolInput: Record<string, unknown> | null
  widgetState: EstimatorWidgetState | null
  locale: string | null
}

/** Raw result shape from `window.openai.callTool` — mirrors an MCP tool response. */
export interface ToolCallResult<T> {
  structuredContent?: T
  content?: { type: string; text: string }[]
  isError?: boolean
}

interface OpenAiApi {
  toolOutput: OpenAiGlobals['toolOutput']
  toolInput: OpenAiGlobals['toolInput']
  widgetState: OpenAiGlobals['widgetState']
  locale: OpenAiGlobals['locale']
  setWidgetState?: (state: EstimatorWidgetState) => Promise<void>
  callTool?: (name: string, args: object) => Promise<ToolCallResult<unknown>>
}

declare global {
  interface Window {
    openai?: OpenAiApi
  }
}

const SET_GLOBALS_EVENT_TYPE = 'openai:set_globals'

interface SetGlobalsEvent extends CustomEvent {
  detail: { globals: Partial<OpenAiGlobals> }
}

/** Subscribes to a single `window.openai` global, re-rendering on `openai:set_globals`. */
export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(
  key: K,
): OpenAiGlobals[K] | null {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: Event) => {
        const globals = (event as SetGlobalsEvent).detail?.globals
        if (!globals || !(key in globals)) return
        onChange()
      }

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      })
      return () =>
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal)
    },
    () => window.openai?.[key] ?? null,
  )
}

/**
 * Thrown when a tool call succeeds at the RPC level but the tool itself
 * reports `isError: true` (e.g. "No pricing found for ..."). Per the
 * backend contract this should never happen if the UI only ever sends
 * species/thickness pairs sourced from `get_material_catalog` — treat it as
 * a bug/stale-cache signal, not a normal user-facing state.
 */
export class ToolError extends Error {}

/** Calls an MCP tool through the host bridge and unwraps `structuredContent`. */
export async function callTool<T>(name: string, args: object): Promise<T> {
  if (!window.openai?.callTool) {
    throw new Error(`window.openai.callTool is unavailable — cannot call "${name}"`)
  }
  const result = await window.openai.callTool(name, args)
  if (result.isError) {
    const message = result.content?.map((c) => c.text).join(' ') ?? `"${name}" failed`
    throw new ToolError(message)
  }
  return result.structuredContent as T
}

/**
 * Persists estimator selections into ChatGPT's widget state so they survive
 * widget remounts across the conversation. No-ops safely outside ChatGPT.
 */
export async function setWidgetState(state: EstimatorWidgetState): Promise<void> {
  await window.openai?.setWidgetState?.(state)
}

export function getWidgetState(): EstimatorWidgetState | null {
  return window.openai?.widgetState ?? null
}

/**
 * Installs a stand-in `window.openai` so the widget renders correctly in a
 * plain browser tab during `vite dev`, without needing ChatGPT or a tunnel.
 * `callTool` fakes both `get_material_catalog` and `calculate_project_cost`
 * against the sample catalog, mirroring the real tool contracts (including
 * the "not found" error case). Only ever called in development (see
 * `src/main.tsx`).
 */
export function installMockBridge(sampleCatalog: MaterialCatalogEntry[]): void {
  if (window.openai) return

  window.openai = {
    toolOutput: null,
    toolInput: null,
    widgetState: null,
    locale: 'en-US',
    async setWidgetState(state) {
      this.widgetState = state
      window.dispatchEvent(
        new CustomEvent(SET_GLOBALS_EVENT_TYPE, {
          detail: { globals: { widgetState: state } },
        }),
      )
    },
    async callTool(name, args) {
      if (name === 'get_material_catalog') {
        return { structuredContent: { materials: sampleCatalog } as GetMaterialCatalogOutput }
      }

      if (name === 'calculate_project_cost') {
        const { species, thickness, quantity } = args as unknown as CalculateProjectCostInput
        const entry = sampleCatalog.find((material) => material.species === species)
        const option = entry?.availableThicknesses.find((t) => t.thickness === thickness)

        if (!entry || !option) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `No pricing found for "${species}" at thickness "${thickness}". Call get_material_catalog to see valid species/thickness combinations.`,
              },
            ],
          }
        }

        const output: CalculateProjectCostOutput = {
          species,
          measurementType: entry.measurementType,
          thickness,
          quantity,
          unitPrice: option.unitPrice,
          totalCost: Math.round(option.unitPrice * quantity * 100) / 100,
          lastUpdated: entry.lastUpdated,
        }
        return { structuredContent: output }
      }

      return { isError: true, content: [{ type: 'text', text: `Unknown tool "${name}"` }] }
    },
  }
}
