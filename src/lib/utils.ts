
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to generate a consistent HSL color from a string name
export function nameToHsl(name: string, index = 0): string {
  // Create a simple hash from the string
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to HSL color
  const h = ((hash % 360) + 360) % 360; // Ensure positive hue
  const s = 70;
  const l = 50;
  
  // Add some variation based on index if provided
  const hue = (h + index * 30) % 360;
  
  return `hsl(${hue}, ${s}%, ${l}%)`;
}
