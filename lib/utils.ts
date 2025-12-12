import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKarat(karat: string | null | undefined): string {
  if (!karat) return "14k"

  const karatStr = karat.toString().trim()
  // Check if 'k' already exists (case-insensitive)
  if (/k$/i.test(karatStr)) {
    return karatStr
  }

  return `${karatStr}k`
}

export function formatGoldInfo(metalType: string | null | undefined, metalKarat: string | null | undefined): string {
  const type = metalType || "amarillo"
  const karat = formatKarat(metalKarat)

  return `${type} ${karat}`
}
