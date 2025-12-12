import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats karat value to ensure uppercase K
 * Example: "14k" -> "14K", "14" -> "14K", "14K" -> "14K"
 */
export function formatKarat(karat: string | number | null | undefined): string {
  if (!karat) return "14K"

  const karatStr = String(karat).trim()

  // If it already has K/k, just uppercase it
  if (karatStr.toLowerCase().includes("k")) {
    return karatStr.replace(/k/i, "K")
  }

  // Otherwise append K
  return `${karatStr}K`
}

/**
 * Formats gold color and karat info consistently
 * Example: ("blanco", "14") -> "Blanco 14K", ("Amarillo", "18k") -> "Amarillo 18K"
 */
export function formatGoldInfo(color: string | null | undefined, karat: string | number | null | undefined): string {
  const defaultColor = "Amarillo"
  const formattedKarat = formatKarat(karat)

  if (!color) {
    return `${defaultColor} ${formattedKarat}`
  }

  // Capitalize first letter of color
  const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()

  return `${capitalizedColor} ${formattedKarat}`
}

/**
 * Ensures description includes "diamante natural" and uppercase K for karats
 * Handles existing descriptions or generates fallback with proper formatting
 */
export function formatRingDescription(
  description: string | null | undefined,
  code: string,
  diamondPoints: number | null,
  goldColor: string | null,
  goldKarat: string | number | null,
): string {
  if (description && description.trim()) {
    let formatted = description

    // Replace "diamante de" with "diamante natural de" if not already "natural"
    if (formatted.includes("diamante de") && !formatted.includes("diamante natural")) {
      formatted = formatted.replace(/diamante de/gi, "diamante natural de")
    } else if (formatted.includes("diamante") && !formatted.includes("diamante natural")) {
      // Replace standalone "diamante" with "diamante natural"
      formatted = formatted.replace(/\bdiamante\b/gi, "diamante natural")
    }

    // Ensure uppercase K for karats (14k -> 14K, 18k -> 18K)
    formatted = formatted.replace(/(\d+)k\b/gi, "$1K")

    return formatted
  }

  // Generate fallback description
  const diamondInfo = diamondPoints ? `diamante natural de ${diamondPoints} puntos` : "diamante natural"
  const goldInfo = formatGoldInfo(goldColor, goldKarat)

  return (
    `Anillo ${code} - Hermoso anillo de compromiso con ${diamondInfo} en oro ${goldInfo}. ` +
    `Entrega inmediata. Incluye certificado de autenticidad, póliza de garantía, nota de venta y caja de nogal.`
  )
}
