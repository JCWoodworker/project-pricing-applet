import { calculateCost } from '../utils/calculateCost'
import { findMaterial } from '../api/useWoodPrices'
import { useEstimatorStore } from '../store/useEstimatorStore'
import type { WoodMaterial } from '../lib/openaiBridge'

export interface CostBreakdownProps {
  materials: WoodMaterial[]
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/**
 * Reactive result block: converts the selected dimensions into board feet
 * or linear feet (depending on the material's measurementType) and shows
 * the resulting estimated cost. `aria-live` so screen readers announce
 * recalculations as the user edits dimensions.
 */
export function CostBreakdown({ materials }: CostBreakdownProps) {
  const species = useEstimatorStore((state) => state.species)
  const thickness = useEstimatorStore((state) => state.thickness)
  const lengthFt = useEstimatorStore((state) => state.lengthFt)
  const widthIn = useEstimatorStore((state) => state.widthIn)
  const quantity = useEstimatorStore((state) => state.quantity)

  const material = findMaterial(materials, species, thickness)

  if (!material) {
    return (
      <p className="text-center text-sm text-muted-foreground" aria-live="polite">
        Select a wood species{thickness === null ? ' and thickness' : ''} to see an
        estimate.
      </p>
    )
  }

  const result = calculateCost({
    material,
    lengthFt: lengthFt ?? 0,
    widthIn: widthIn ?? 0,
    quantity: quantity ?? 0,
  })
  const unitNoun = material.measurementType === 'BOARD_FOOT' ? 'board foot' : 'linear foot'

  return (
    <div className="flex flex-col items-center gap-1 text-center" aria-live="polite">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Estimated cost
      </span>
      <span className="text-3xl font-semibold tracking-tight text-primary">
        {currencyFormatter.format(result.totalCost)}
      </span>
      <span className="text-xs text-muted-foreground">
        {result.units.toFixed(2)} {result.unitLabel} · {currencyFormatter.format(material.unitPrice)}/{unitNoun}
      </span>
    </div>
  )
}
