import { Card } from '../components'
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
 * Reactive display card: converts the selected dimensions into board feet
 * or linear feet (depending on the material's measurementType) and shows
 * the resulting estimated cost.
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
      <Card className="text-sm text-neutral-500">
        Select a wood species{thickness === null ? ' and thickness' : ''} to see
        an estimate.
      </Card>
    )
  }

  const result = calculateCost({
    material,
    lengthFt: lengthFt ?? 0,
    widthIn: widthIn ?? 0,
    quantity: quantity ?? 0,
  })

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-neutral-500">Estimated cost</span>
        <span className="text-2xl font-semibold text-neutral-900">
          {currencyFormatter.format(result.totalCost)}
        </span>
      </div>
      <div className="flex justify-between text-xs text-neutral-500">
        <span>
          {result.units.toFixed(2)} {result.unitLabel}
        </span>
        <span>
          {currencyFormatter.format(material.unitPrice)} / {material.measurementType === 'BOARD_FOOT' ? 'board foot' : 'linear foot'}
        </span>
      </div>
    </Card>
  )
}
