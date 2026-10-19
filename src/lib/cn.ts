import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes, letting later classes win. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
