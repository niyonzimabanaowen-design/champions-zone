"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

type Listener = () => void;
const listenersByKey = new Map<string, Set<Listener>>();

function getListeners(key: string): Set<Listener> {
  let set = listenersByKey.get(key);
  if (!set) {
    set = new Set();
    listenersByKey.set(key, set);
  }
  return set;
}

function readRaw<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * localStorage-backed state, SSR-safe: server and the initial client render
 * both return `fallback` (via useSyncExternalStore's server snapshot)
 * instead of reading localStorage in an effect, which avoids both a
 * hydration mismatch and a setState-in-effect cascade. Same-tab updates are
 * kept in sync with an in-memory pub-sub, since the browser's `storage`
 * event only fires in *other* tabs.
 */
export function useLocalStorageState<T>(key: string, fallback: T): [T, (value: T) => void] {
  const fallbackRef = useRef(fallback);
  const cacheRef = useRef<T>(fallback);

  const subscribe = useCallback(
    (onChange: Listener) => {
      const listeners = getListeners(key);
      listeners.add(onChange);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) onChange();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    const next = readRaw(key, fallbackRef.current);
    if (JSON.stringify(next) === JSON.stringify(cacheRef.current)) {
      return cacheRef.current;
    }
    cacheRef.current = next;
    return next;
  }, [key]);

  const getServerSnapshot = useCallback(() => fallbackRef.current, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Ignore quota/privacy-mode errors — the prediction just won't persist.
      }
      cacheRef.current = next;
      getListeners(key).forEach((fn) => fn());
    },
    [key],
  );

  return [value, setValue];
}
