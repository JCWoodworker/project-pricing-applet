import { Select } from '../components'
import { currencyFormatter } from '../lib/currency'
import { useEstimatorStore } from '../store/useEstimatorStore'
import type { MaterialCatalogEntry } from '../lib/openaiBridge'

export interface MaterialSelectorProps {
  catalog: MaterialCatalogEntry[]
}

/**
 * Species dropdown, plus a thickness dropdown scoped to that species'
 * `availableThicknesses` — each option shows its price inline (e.g.
 * "8/4 — $16.95/bf") per the backend's implementation guidance. The
 * thickness selector is skipped/auto-selected when a species has only one
 * stock thickness.
 */
export function MaterialSelector({ catalog }: MaterialSelectorProps) {
  const species = useEstimatorStore((state) => state.species)
  const thickness = useEstimatorStore((state) => state.thickness)
  const setSpecies = useEstimatorStore((state) => state.setSpecies)
  const setThickness = useEstimatorStore((state) => state.setThickness)

  const selectedEntry = catalog.find((entry) => entry.species === species)
  const showThicknessSelector = (selectedEntry?.availableThicknesses.length ?? 0) > 1
  const unitAbbreviation = selectedEntry?.measurementType === 'LINEAR_FOOT' ? 'lf' : 'bf'

  function handleSpeciesChange(value: string) {
    setSpecies(value || null)
    const entry = catalog.find((opt) => opt.species === value)
    if (entry?.availableThicknesses.length === 1) {
      setThickness(entry.availableThicknesses[0].thickness)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex-1">
        <Select
          id="species"
          label="Wood species"
          placeholder="Select a species"
          value={species ?? ''}
          onChange={(event) => handleSpeciesChange(event.target.value)}
          options={catalog.map((entry) => ({
            value: entry.species,
            label: entry.species,
          }))}
        />
      </div>

      {showThicknessSelector && (
        <div className="flex-1">
          <Select
            id="thickness"
            label="Thickness"
            placeholder="Select a thickness"
            value={thickness ?? ''}
            onChange={(event) => setThickness(event.target.value || null)}
            options={(selectedEntry?.availableThicknesses ?? []).map((option) => ({
              value: option.thickness,
              label: `${option.thickness} — ${currencyFormatter.format(option.unitPrice)}/${unitAbbreviation}`,
            }))}
          />
        </div>
      )}
    </div>
  )
}
