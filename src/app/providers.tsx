"use client";

import { ThemeProvider } from "next-themes";

/**
 * Global theme provider. `attribute="class"` toggles the `.dark` class on
 * <html>, which the CSS variables in styles/theme.css key off of. Persists to
 * localStorage, so the choice is constant across every page.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
