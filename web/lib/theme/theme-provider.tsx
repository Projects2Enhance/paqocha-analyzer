"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "paqocha-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readActiveTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function getServerTheme(): Theme {
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Notified by setTheme below; lets every ThemeProvider-consuming
  // component re-read the DOM via useSyncExternalStore when it changes.
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = useCallback((onStoreChange: () => void) => {
    const listeners = listenersRef.current;
    listeners.add(onStoreChange);
    return () => {
      listeners.delete(onStoreChange);
    };
  }, []);

  // useSyncExternalStore, not useState+useEffect, specifically because
  // `theme` reads something SSR can't see (the `data-theme` attribute
  // ThemeScript sets on <html> from localStorage, before hydration, in
  // <head>) — the sanctioned React API for exactly this case. The client
  // snapshot (readActiveTheme) and server snapshot ("light", since
  // `document` doesn't exist server-side) are allowed to differ: React
  // renders the server snapshot first, then re-renders with the real
  // client value right after hydration, with no mismatch warning, no
  // manual effect, and no extra setState-in-effect render pass.
  const theme = useSyncExternalStore(subscribe, readActiveTheme, getServerTheme);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (private mode, blocked storage).
    }
    for (const listener of listenersRef.current) listener();
  }, []);

  // Reads the DOM directly rather than closing over the `theme` value, so
  // this never toggles off a stale snapshot.
  const toggleTheme = useCallback(() => {
    setTheme(readActiveTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
