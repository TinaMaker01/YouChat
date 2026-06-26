import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names using clsx and tailwind-merge.
 * This utility handles conditional classes and ensures Tailwind CSS classes
 * are correctly merged without conflicts.
 *
 * @param inputs - An array of class names, objects, or arrays to be merged.
 * @returns A string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
