import { useCalculateProjectCost } from '../api/useCalculateProjectCost'
import { currencyFormatter } from '../lib/currency'
import { useEstimatorStore } from '../store/useEstimatorStore'

/**
 * Calls `calculate_project_cost` whenever species + thickness + quantity are
 * all set (debounced — see `useCalculateProjectCost`) and displays the
 * resulting `totalCost`. All pricing math happens server-side; this
 * component only renders the response. `aria-live` so screen readers
 * announce recalculations as the user edits the form.
 */
export function CostBreakdown() {
  const species = useEstimatorStore((state) => state.species)
  const thickness = useEstimatorStore((state) => state.thickness)
  const quantity = useEstimatorStore((state) => state.quantity)

  const { data, isLoading, isError, isNotFoundError } = useCalculateProjectCost({
    species,
    thickness,
    quantity,
  })

  if (!species || !thickness || !quantity || quantity <= 0) {
    return (
      <p className="text-center text-sm text-muted-foreground" aria-live="polite">
        Select a wood species, thickness, and quantity to see an estimate.
      </p>
    )
  }

  if (isLoading) {
    return (
      <p className="text-center text-sm text-muted-foreground" role="status" aria-live="polite">
        Calculating…
      </p>
    )
  }

  if (isError) {
    return (
      <p className="text-center text-sm text-destructive" role="alert" aria-live="polite">
        {isNotFoundError
          ? "That species/thickness combination isn't priced right now."
          : "Couldn't calculate a price. Please try again."}
      </p>
    )
  }

  if (!data) return null

  const unitNoun = data.measurementType === 'BOARD_FOOT' ? 'board foot' : 'linear foot'

  return (
    <div className="flex flex-col items-center gap-1 text-center" aria-live="polite">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Estimated cost
      </span>
      <span className="text-3xl font-semibold tracking-tight text-primary">
        {currencyFormatter.format(data.totalCost)}
      </span>
      <span className="text-xs text-muted-foreground">
        {data.quantity} {data.measurementType === 'BOARD_FOOT' ? 'board feet' : 'linear feet'} ·{' '}
        {currencyFormatter.format(data.unitPrice)}/{unitNoun}
      </span>
    </div>
  )
}
