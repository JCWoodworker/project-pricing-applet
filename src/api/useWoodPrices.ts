import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { WoodMaterial } from '../lib/openaiBridge'
import { sampleMaterials } from '../lib/sampleMaterials'

/**
 * Absolute base URL for Repo 2's REST API. Must be absolute (not relative)
 * because this widget renders inside a ChatGPT iframe with its own origin.
 * Configure via `.env` (see `.env.example`); that origin must also be
 * allow-listed in Repo 2's `_meta.ui.csp.connectDomains` when it registers
 * the render tool.
 */
const API_BASE_URL =
  import.meta.env.VITE_WOODPRICING_API_BASE_URL ?? 'http://localhost:3000'

const WOODPRICING_ENDPOINT = `${API_BASE_URL}/api/v1/subapps/woodpricing`

async function fetchWoodMaterials(): Promise<WoodMaterial[]> {
  try {
    const response = await fetch(WOODPRICING_ENDPOINT)
    if (!response.ok) {
      throw new Error(`Failed to load wood pricing data (${response.status})`)
    }
    return (await response.json()) as WoodMaterial[]
  } catch (error) {
    // Dev-only convenience: if Repo 2 isn't running locally yet, fall back to
    // sample data so the widget UI is still previewable. Never falls back in
    // production builds.
    if (import.meta.env.DEV) {
      console.warn(
        `[useWoodPrices] Falling back to sample data — could not reach ${WOODPRICING_ENDPOINT}.`,
        error,
      )
      return sampleMaterials
    }
    throw error
  }
}

export function useWoodPrices() {
  return useQuery({
    queryKey: ['woodpricing', 'list'],
    queryFn: fetchWoodMaterials,
    staleTime: 5 * 60 * 1000,
  })
}

export interface SpeciesOption {
  species: string
  thicknesses: string[]
}

/**
 * Derives the distinct species + available thickness combos from the full
 * material list, so the UI can drive dropdowns instead of free text entry
 * (species names are free-text strings on the backend, not IDs).
 */
export function useSpeciesOptions(materials: WoodMaterial[] | undefined): SpeciesOption[] {
  return useMemo(() => {
    if (!materials) return []

    const bySpecies = new Map<string, Set<string>>()
    for (const material of materials) {
      const thicknesses = bySpecies.get(material.species) ?? new Set<string>()
      if (material.thickness) thicknesses.add(material.thickness)
      bySpecies.set(material.species, thicknesses)
    }

    return Array.from(bySpecies.entries())
      .map(([species, thicknesses]) => ({
        species,
        thicknesses: Array.from(thicknesses).sort(),
      }))
      .sort((a, b) => a.species.localeCompare(b.species))
  }, [materials])
}

/**
 * Finds the specific priced row for a species + thickness combo. Falls back
 * to the species' only variant when thickness is omitted and unambiguous.
 */
export function findMaterial(
  materials: WoodMaterial[] | undefined,
  species: string | null,
  thickness: string | null,
): WoodMaterial | undefined {
  if (!materials || !species) return undefined

  const variants = materials.filter((material) => material.species === species)
  if (variants.length === 1) return variants[0]
  if (!thickness) return undefined
  return variants.find((material) => material.thickness === thickness)
}
