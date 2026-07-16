import type { WoodMaterial } from '../lib/openaiBridge'

export interface CostInput {
  material: WoodMaterial
  /** Desired output length, in feet. */
  lengthFt: number
  /** Desired output width, in inches. Only used for BOARD_FOOT pricing. */
  widthIn: number
  quantity: number
}

export interface CostResult {
  /** Board feet or linear feet, depending on the material's measurementType. */
  units: number
  unitLabel: 'board feet' | 'linear feet'
  totalCost: number
}

/**
 * Parses lumber quarter-inch thickness notation (e.g. "4/4" -> 1, "8/4" -> 2,
 * "5/4" -> 1.25) into inches. Returns 0 for null/unparseable values.
 */
export function parseThicknessInches(thickness: string | null): number {
  if (!thickness) return 0
  const match = /^(\d+)\s*\/\s*4$/.exec(thickness.trim())
  if (!match) return 0
  return Number(match[1]) / 4
}

/**
 * Computes the estimated cost for a woodworking project build from the
 * selected material variant and desired dimensions.
 *
 * - BOARD_FOOT: boardFeet = (length_in * width_in * thickness_in) / 144,
 *   cost = boardFeet * quantity * unitPrice.
 * - LINEAR_FOOT: cost = length_ft * quantity * unitPrice (width/thickness
 *   don't factor in). No LINEAR_FOOT rows exist in the dataset yet, but the
 *   branch is implemented for forward compatibility.
 */
export function calculateCost({
  material,
  lengthFt,
  widthIn,
  quantity,
}: CostInput): CostResult {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0
  const safeLengthFt = Number.isFinite(lengthFt) && lengthFt > 0 ? lengthFt : 0

  if (material.measurementType === 'LINEAR_FOOT') {
    const units = safeLengthFt * safeQuantity
    return {
      units,
      unitLabel: 'linear feet',
      totalCost: units * material.unitPrice,
    }
  }

  const safeWidthIn = Number.isFinite(widthIn) && widthIn > 0 ? widthIn : 0
  const thicknessIn = parseThicknessInches(material.thickness)
  const lengthIn = safeLengthFt * 12
  const boardFeet = (lengthIn * safeWidthIn * thicknessIn) / 144

  const units = boardFeet * safeQuantity
  return {
    units,
    unitLabel: 'board feet',
    totalCost: units * material.unitPrice,
  }
}
