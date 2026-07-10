import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes using clsx and tailwind-merge.
 * This ensures that conflicting Tailwind classes are resolved correctly.
 *
 * @param inputs - A list of class names, objects, or arrays to be merged.
 * @returns A string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
