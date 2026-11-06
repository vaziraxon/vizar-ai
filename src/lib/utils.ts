import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about the custom type scale in tailwind.config.ts.
// Without this it treats e.g. `text-caption` as a text *colour* and drops it
// whenever a `text-ink-*` class is merged after it.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-2xl",
            "display-xl",
            "display-lg",
            "display-md",
            "display-sm",
            "body-lg",
            "body",
            "body-sm",
            "caption",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * After a failed submit, move focus to the first field marked invalid so its
 * error is read out; for a marked group (radios), its first control.
 */
export function focusFirstInvalid(root: ParentNode = document) {
  requestAnimationFrame(() => {
    const invalid = root.querySelector<HTMLElement>('[aria-invalid="true"]');
    const control = invalid?.matches("input, select, textarea, button")
      ? invalid
      : invalid?.querySelector<HTMLElement>("input, select, textarea, button");
    control?.focus();
  });
}
