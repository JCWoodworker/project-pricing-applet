import { create } from 'zustand'
import { getWidgetState, setWidgetState } from '../lib/openaiBridge'

interface EstimatorState {
  species: string | null
  thickness: string | null
  lengthFt: number | null
  widthIn: number | null
  quantity: number | null
  setSpecies: (species: string | null) => void
  setThickness: (thickness: string | null) => void
  setLengthFt: (lengthFt: number | null) => void
  setWidthIn: (widthIn: number | null) => void
  setQuantity: (quantity: number | null) => void
  hydrateFromWidgetState: () => void
}

let persistTimeout: ReturnType<typeof setTimeout> | undefined

function persistDebounced(state: EstimatorState): void {
  if (persistTimeout) clearTimeout(persistTimeout)
  persistTimeout = setTimeout(() => {
    void setWidgetState({
      species: state.species,
      thickness: state.thickness,
      length: state.lengthFt,
      width: state.widthIn,
      quantity: state.quantity,
    })
  }, 300)
}

export const useEstimatorStore = create<EstimatorState>((set, get) => ({
  species: null,
  thickness: null,
  lengthFt: null,
  widthIn: null,
  quantity: 1,

  setSpecies: (species) => {
    set({ species, thickness: null })
    persistDebounced(get())
  },
  setThickness: (thickness) => {
    set({ thickness })
    persistDebounced(get())
  },
  setLengthFt: (lengthFt) => {
    set({ lengthFt })
    persistDebounced(get())
  },
  setWidthIn: (widthIn) => {
    set({ widthIn })
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
      lengthFt: saved.length,
      widthIn: saved.width,
      quantity: saved.quantity,
    })
  },
}))
