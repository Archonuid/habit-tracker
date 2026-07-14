"use client";

import type { ReactNode } from "react";

export function InputField({
  label,
  type,
  placeholder,
  value,
  onChange,
  suffix,
  isDark,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: ReactNode;
  isDark: boolean;
}) {
  const primaryRgb = isDark ? "124,77,255" : "91,48,214";

  return (
    <div className="space-y-1.5">
      <label
        className="block text-[10px] tracking-[0.22em] uppercase text-accent"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 bg-card/50 rounded-sm transition-all duration-200 outline-none border border-border"
          style={{ fontFamily: "'Outfit', sans-serif" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = `rgba(${primaryRgb},0.55)`;
            e.currentTarget.style.boxShadow = `0 0 0 1px rgba(${primaryRgb},0.2), 0 0 16px rgba(${primaryRgb},0.08)`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}
