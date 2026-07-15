"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme !== "light";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className="w-8 h-8 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
    >
      {mounted ? (
        isDark ? <Sun size={13} /> : <Moon size={13} />
      ) : (
        <span className="w-[13px] h-[13px]" />
      )}
    </button>
  );
}
