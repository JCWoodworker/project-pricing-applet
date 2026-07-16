import { Select } from '../components'
import { useSpeciesOptions } from '../api/useWoodPrices'
import { useEstimatorStore } from '../store/useEstimatorStore'
import type { WoodMaterial } from '../lib/openaiBridge'

export interface MaterialSelectorProps {
  materials: WoodMaterial[]
}

/**
 * Species dropdown, plus a thickness dropdown that only appears when a
 * species has more than one stock thickness in the price list (several
 * species, e.g. Acacia/Ebony, only have one — the backend tolerates
 * omitting thickness in that case, so we auto-select it and hide the field).
 */
export function MaterialSelector({ materials }: MaterialSelectorProps) {
  const speciesOptions = useSpeciesOptions(materials)
  const species = useEstimatorStore((state) => state.species)
  const thickness = useEstimatorStore((state) => state.thickness)
  const setSpecies = useEstimatorStore((state) => state.setSpecies)
  const setThickness = useEstimatorStore((state) => state.setThickness)

  const selected = speciesOptions.find((option) => option.species === species)
  const showThicknessSelector = (selected?.thicknesses.length ?? 0) > 1

  function handleSpeciesChange(value: string) {
    setSpecies(value || null)
    const option = speciesOptions.find((opt) => opt.species === value)
    if (option?.thicknesses.length === 1) {
      setThickness(option.thicknesses[0])
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
          options={speciesOptions.map((option) => ({
            value: option.species,
            label: option.species,
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
            options={(selected?.thicknesses ?? []).map((value) => ({
              value,
              label: value,
            }))}
          />
        </div>
      )}
    </div>
  )
}
