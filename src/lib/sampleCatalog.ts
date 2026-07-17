import type { MaterialCatalogEntry } from './openaiBridge'

/**
 * Sample data for the local dev mock bridge (`installMockBridge`). Shape
 * mirrors the real `get_material_catalog` tool response — swap for a live
 * MCP connection once testing against ChatGPT/MCP Inspector.
 */
export const sampleCatalog: MaterialCatalogEntry[] = [
  {
    species: 'Black Walnut',
    measurementType: 'BOARD_FOOT',
    availableThicknesses: [
      { thickness: '4/4', unitPrice: 14.5 },
      { thickness: '5/4', unitPrice: 15.95 },
      { thickness: '6/4', unitPrice: 15.95 },
      { thickness: '8/4', unitPrice: 16.95 },
      { thickness: '12/4', unitPrice: 18.95 },
    ],
    lastUpdated: new Date().toISOString(),
  },
  {
    species: 'Maple - Hard Maple',
    measurementType: 'BOARD_FOOT',
    availableThicknesses: [
      { thickness: '4/4', unitPrice: 8.25 },
      { thickness: '8/4', unitPrice: 9.5 },
    ],
    lastUpdated: new Date().toISOString(),
  },
  {
    species: 'Acacia',
    measurementType: 'BOARD_FOOT',
    availableThicknesses: [{ thickness: '4/4', unitPrice: 11.95 }],
    lastUpdated: new Date().toISOString(),
  },
  {
    species: 'Ebony',
    measurementType: 'BOARD_FOOT',
    availableThicknesses: [{ thickness: '4/4', unitPrice: 45.0 }],
    lastUpdated: new Date().toISOString(),
  },
]
