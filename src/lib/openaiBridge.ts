import { useSyncExternalStore } from 'react'

/**
 * Minimal client for the MCP Apps host bridge (JSON-RPC 2.0 over
 * `postMessage`) plus the `window.openai` compatibility globals that ChatGPT
 * injects into a widget iframe.
 *
 * This repo only uses the bridge for widget-state persistence
 * (`getWidgetState` / `setWidgetState`) — price data comes from a direct
 * REST call (see `src/api/useWoodPrices.ts`), not from MCP tool calls.
 *
 * Docs: https://developers.openai.com/apps-sdk/build/chatgpt-ui
 */

export interface WoodMaterial {
  id: string
  species: string
  measurementType: 'BOARD_FOOT' | 'LINEAR_FOOT'
  thickness: string | null
  unitPrice: number
  dimensions: unknown
  lastUpdated: string
}

export interface EstimatorWidgetState {
  species: string | null
  thickness: string | null
  length: number | null
  width: number | null
  quantity: number | null
}

interface OpenAiGlobals {
  toolOutput: { materials?: WoodMaterial[] } | null
  toolInput: Record<string, unknown> | null
  widgetState: EstimatorWidgetState | null
  locale: string | null
}

interface OpenAiApi {
  toolOutput: OpenAiGlobals['toolOutput']
  toolInput: OpenAiGlobals['toolInput']
  widgetState: OpenAiGlobals['widgetState']
  locale: OpenAiGlobals['locale']
  setWidgetState?: (state: EstimatorWidgetState) => Promise<void>
  callTool?: (name: string, args: Record<string, unknown>) => Promise<unknown>
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

/**
 * Subscribes to a single `window.openai` global, re-rendering when the host
 * dispatches `openai:set_globals`. Mirrors the helper documented by OpenAI.
 */
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
 * Only ever called in development (see `src/main.tsx`).
 */
export function installMockBridge(sampleMaterials: WoodMaterial[]): void {
  if (window.openai) return

  window.openai = {
    toolOutput: { materials: sampleMaterials },
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
    async callTool() {
      return { structuredContent: { materials: sampleMaterials } }
    },
  }
}
