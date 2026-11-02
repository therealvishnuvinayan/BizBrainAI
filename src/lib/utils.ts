import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Compose conditional utilities and let the caller override primitive defaults. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
