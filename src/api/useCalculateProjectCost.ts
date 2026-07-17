import { useQuery } from '@tanstack/react-query'
import { callTool, ToolError } from '../lib/openaiBridge'
import type { CalculateProjectCostInput, CalculateProjectCostOutput } from '../lib/openaiBridge'
import { useDebouncedValue } from '../lib/useDebouncedValue'

export interface UseCalculateProjectCostArgs {
  species: string | null
  thickness: string | null
  quantity: number | null
}

/**
 * Calls `calculate_project_cost` whenever the user has a complete
 * species + thickness + quantity selection. `quantity` is debounced so
 * typing a number doesn't fire a tool call per keystroke (the endpoint is
 * rate-limited to 60 requests/60s per IP).
 */
export function useCalculateProjectCost({
  species,
  thickness,
  quantity,
}: UseCalculateProjectCostArgs) {
  const debouncedQuantity = useDebouncedValue(quantity, 400)
  const hasCompleteSelection = Boolean(species && thickness && quantity && quantity > 0)
  const isDebouncePending = quantity !== debouncedQuantity

  const query = useQuery<CalculateProjectCostOutput>({
    queryKey: ['calculate-project-cost', species, thickness, debouncedQuantity],
    queryFn: async () => {
      const args: CalculateProjectCostInput = {
        species: species as string,
        thickness: thickness as string,
        quantity: debouncedQuantity as number,
      }
      return callTool<CalculateProjectCostOutput>('calculate_project_cost', args)
    },
    enabled: Boolean(species && thickness && debouncedQuantity && debouncedQuantity > 0),
    retry: false,
  })

  return {
    ...query,
    // Debounce means the UI can look "settled" for a moment after a change
    // before the new request kicks off — surface that as loading too.
    isLoading: query.isLoading || (hasCompleteSelection && isDebouncePending),
    isNotFoundError: query.error instanceof ToolError,
  }
}
