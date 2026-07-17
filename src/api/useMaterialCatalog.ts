import { useQuery } from '@tanstack/react-query'
import { callTool } from '../lib/openaiBridge'
import type { GetMaterialCatalogOutput, MaterialCatalogEntry } from '../lib/openaiBridge'

/**
 * Calls the zero-input `get_material_catalog` MCP tool once (cached — the
 * catalog "changes rarely, only when someone reseeds pricing data" per the
 * backend contract) and returns the full species/thickness/price list.
 */
export function useMaterialCatalog() {
  return useQuery<MaterialCatalogEntry[]>({
    queryKey: ['material-catalog'],
    queryFn: async () => {
      const output = await callTool<GetMaterialCatalogOutput>('get_material_catalog', {})
      return output.materials
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })
}
