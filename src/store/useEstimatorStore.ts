import { create } from 'zustand'
import { getWidgetState, setWidgetState } from '../lib/openaiBridge'

interface EstimatorState {
  species: string | null
  thickness: string | null
  quantity: number | null
  setSpecies: (species: string | null) => void
  setThickness: (thickness: string | null) => void
  setQuantity: (quantity: number | null) => void
  /** Restores the last persisted widget state, e.g. on a widget remount. */
  hydrateFromWidgetState: () => void
}

let persistTimeout: ReturnType<typeof setTimeout> | undefined

function persistDebounced(state: EstimatorState): void {
  if (persistTimeout) clearTimeout(persistTimeout)
  persistTimeout = setTimeout(() => {
    void setWidgetState({
      species: state.species,
      thickness: state.thickness,
      quantity: state.quantity,
    })
  }, 300)
}

export const useEstimatorStore = create<EstimatorState>((set, get) => ({
  species: null,
  thickness: null,
  quantity: null,

  setSpecies: (species) => {
    set({ species, thickness: null })
    persistDebounced(get())
  },
  setThickness: (thickness) => {
    set({ thickness })
    persistDebounced(get())
  },
  setQuantity: (quantity) => {
    set({ quantity })
    persistDebounced(get())
  },

  hydrateFromWidgetState: () => {
    const saved = getWidgetState()
    if (!saved) return
    set({
      species: saved.species,
      thickness: saved.thickness,
      quantity: saved.quantity,
    })
  },
}))
