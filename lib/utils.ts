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
