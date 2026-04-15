import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats gold color with 14K appended
 * Example: "blanco" -> "Blanco 14K", "Amarillo" -> "Amarillo 14K"
 */
export function formatGoldInfo(color: string | null | undefined): string {
  const defaultColor = "Amarillo"

  if (!color) {
    return `${defaultColor} 14K`
  }

  // Capitalize first letter of color
  const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()

  return `${capitalizedColor} 14K`
}

/**
 * Formats diamond information as a single total (for catalog/quick view)
 * Example: (15, null) -> "15 puntos", (13, 2) -> "15 puntos" (13+2), (13, 0) -> "13 puntos"
 */
export function formatDiamondTotal(
  mainPoints: number | null | undefined,
  sidePoints: number | null | undefined,
): string {
  const main = mainPoints && !isNaN(Number(mainPoints)) ? Number(mainPoints) : 0
  const side = sidePoints && !isNaN(Number(sidePoints)) && Number(sidePoints) > 0 ? Number(sidePoints) : 0

  const total = main + side

  if (total === 0) return "Diamante natural"
  return `${total} puntos`
}

/**
 * Formats diamond information with breakdown (for detail page)
 * Example: (15, null) -> "15 puntos", (13, 2) -> "13 + 2 puntos", (13, 0) -> "13 puntos"
 */
export function formatDiamondInfo(
  mainPoints: number | null | undefined,
  sidePoints: number | null | undefined,
): string {
  const main = mainPoints && !isNaN(Number(mainPoints)) ? Number(mainPoints) : null
  const side = sidePoints && !isNaN(Number(sidePoints)) && Number(sidePoints) > 0 ? Number(sidePoints) : null

  if (!main) return "Diamante natural"
  if (!side) return `${main} puntos`

  return `${main} + ${side} puntos`
}
