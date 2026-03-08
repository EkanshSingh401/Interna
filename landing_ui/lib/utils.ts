import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date into a clean, human-readable string.
 * Example: "2026-01-25" -> "Jan 25, 2026"
 */
export function formatDate(date: string | Date | number): string {
  if (!date) return "N/A"
  
  const d = new Date(date)
  
  // Check if date is actually valid
  if (isNaN(d.getTime())) {
    return "Invalid Date"
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}