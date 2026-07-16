import { Input } from '../components'
import { useEstimatorStore } from '../store/useEstimatorStore'

/**
 * Length/width/quantity inputs for the desired project build. Thickness is
 * deliberately not editable here — it comes from the selected stock variant
 * in `MaterialSelector`, since price is keyed on it.
 */
export function DimensionsInput() {
  const lengthFt = useEstimatorStore((state) => state.lengthFt)
  const widthIn = useEstimatorStore((state) => state.widthIn)
  const quantity = useEstimatorStore((state) => state.quantity)
  const setLengthFt = useEstimatorStore((state) => state.setLengthFt)
  const setWidthIn = useEstimatorStore((state) => state.setWidthIn)
  const setQuantity = useEstimatorStore((state) => state.setQuantity)

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <Input
        id="length"
        type="number"
        min={0}
        step={0.25}
        label="Length"
        suffix="ft"
        value={lengthFt ?? ''}
        onChange={(event) => setLengthFt(event.target.value ? Number(event.target.value) : null)}
      />
      <Input
        id="width"
        type="number"
        min={0}
        step={0.25}
        label="Width"
        suffix="in"
        value={widthIn ?? ''}
        onChange={(event) => setWidthIn(event.target.value ? Number(event.target.value) : null)}
      />
      <Input
        id="quantity"
        type="number"
        min={1}
        step={1}
        label="Quantity"
        value={quantity ?? ''}
        onChange={(event) => setQuantity(event.target.value ? Number(event.target.value) : null)}
      />
    </div>
  )
}
