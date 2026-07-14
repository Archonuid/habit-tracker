"use client";

import { motion, AnimatePresence } from "motion/react";
import type { Archetype } from "@/app/lib/constants";

export function RuneOrb({
  archetype,
  isDark,
}: {
  archetype: Archetype;
  isDark: boolean;
}) {
  const ringColor = isDark ? "rgba(139,92,246," : "rgba(91,48,214,";
  const goldColor = isDark ? "rgba(201,168,76," : "rgba(158,106,26,";

  return (
    <div className="relative w-[280px] h-[280px] mx-auto select-none">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${archetype.color}${isDark ? "18" : "22"} 0%, transparent 65%)`,
          filter: "blur(20px)",
        }}
      />

      {/* Outer rotating dashed ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px dashed ${ringColor}0.3)`,
          animation: "spin 28s linear infinite",
        }}
      />

      {/* Cardinal tick marks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <div
          key={angle}
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: "1px",
            height: angle % 90 === 0 ? "10px" : "5px",
            background:
              angle % 90 === 0
                ? `${ringColor}0.45)`
                : `${ringColor}0.22)`,
            transformOrigin: "0 0",
            transform: `rotate(${angle}deg) translateY(-139px)`,
          }}
        />
      ))}

      {/* Middle counter-rotating ring */}
      <div
        className="absolute inset-[22px] rounded-full"
        style={{
          border: `1px solid ${ringColor}0.18)`,
          animation: "spin 18s linear infinite reverse",
        }}
      />

      {/* Inner gold accent ring */}
      <div
        className="absolute inset-[44px] rounded-full"
        style={{
          border: `1px dashed ${goldColor}0.28)`,
          animation: "spin 12s linear infinite",
        }}
      />

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-2 h-2 rounded-full transition-all duration-700"
          style={{
            background: archetype.color,
            boxShadow: `0 0 12px 4px ${archetype.color}60`,
          }}
        />
      </div>

      {/* Center cycling text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={archetype.name}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.08, y: -6 }}
            transition={{ duration: 0.35 }}
            className="text-center space-y-1 px-6"
          >
            <div
              className="text-3xl font-bold tracking-[0.3em]"
              style={{
                fontFamily: "'Cinzel', serif",
                color: archetype.color,
                textShadow: `0 0 20px ${archetype.color}${isDark ? "50" : "40"}`,
              }}
            >
              {archetype.name}
            </div>
            <div
              className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {archetype.tagline}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
