import { Input } from '../components'
import { useEstimatorStore } from '../store/useEstimatorStore'
import type { MaterialCatalogEntry } from '../lib/openaiBridge'

export interface QuantityInputProps {
  selectedEntry: MaterialCatalogEntry | undefined
}

/**
 * Single quantity field — the backend's `calculate_project_cost` tool wants
 * the raw amount of board feet (or linear feet) directly, not physical
 * board dimensions to convert. Label/suffix adapt to the selected
 * material's `measurementType`.
 */
export function QuantityInput({ selectedEntry }: QuantityInputProps) {
  const quantity = useEstimatorStore((state) => state.quantity)
  const setQuantity = useEstimatorStore((state) => state.setQuantity)

  const isLinearFoot = selectedEntry?.measurementType === 'LINEAR_FOOT'
  const label = isLinearFoot ? 'Linear feet needed' : 'Board feet needed'
  const suffix = isLinearFoot ? 'lf' : 'bf'

  return (
    <Input
      id="quantity"
      type="number"
      min={0}
      step={0.25}
      label={label}
      suffix={suffix}
      value={quantity ?? ''}
      onChange={(event) => setQuantity(event.target.value ? Number(event.target.value) : null)}
    />
  )
}
