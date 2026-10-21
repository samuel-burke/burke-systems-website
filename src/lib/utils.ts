import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the brand color names from globals.css, so that
// e.g. `text-night` is treated as a color and not dropped next to `text-[17px]`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        "burke-blue",
        "burke-blue-hover",
        "night",
        "night-raised",
        "night-line",
        "mist",
        "paper",
        "cloud",
        "periwinkle",
        "status-green",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
