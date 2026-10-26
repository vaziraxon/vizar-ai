"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * State mirrored to localStorage (this browser only). Starts from `initial`
 * on the server and the first client render, then loads the saved value —
 * so there is no hydration mismatch. Storage errors (private mode, quota)
 * are ignored and the state simply stays in memory.
 */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      setValue(raw !== null ? (JSON.parse(raw) as T) : initial);
    } catch {
      /* ignore */
    }
    setReady(true);
    // `initial` is intentionally not a dependency: it is only the fallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(v));
        } catch {
          /* ignore */
        }
        return v;
      });
    },
    [key]
  );

  return [value, update, ready] as const;
}

/** One-off read for widgets that only display a saved value. */
export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
