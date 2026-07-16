import type { WoodMaterial } from './openaiBridge'

/**
 * Sample data for the local dev mock bridge (`installMockBridge`) and for
 * offline/Storybook-style previews. Shapes mirror Repo 2's real dataset —
 * swap for a live fetch once the backend is reachable.
 */
export const sampleMaterials: WoodMaterial[] = [
  {
    id: '1',
    species: 'Black Walnut',
    measurementType: 'BOARD_FOOT',
    thickness: '4/4',
    unitPrice: 12.5,
    dimensions: null,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    species: 'Black Walnut',
    measurementType: 'BOARD_FOOT',
    thickness: '8/4',
    unitPrice: 16.95,
    dimensions: null,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    species: 'Maple - Hard Maple',
    measurementType: 'BOARD_FOOT',
    thickness: '4/4',
    unitPrice: 8.25,
    dimensions: null,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    species: 'Acacia',
    measurementType: 'BOARD_FOOT',
    thickness: '4/4',
    unitPrice: 9.0,
    dimensions: null,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '5',
    species: 'Ebony',
    measurementType: 'BOARD_FOOT',
    thickness: '4/4',
    unitPrice: 45.0,
    dimensions: null,
    lastUpdated: new Date().toISOString(),
  },
]
