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
