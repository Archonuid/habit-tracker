'use client';

import { useMemo } from 'react';
import { SIGILS, type Archetype } from './sigils';

const R = 86;
const CIRC = 2 * Math.PI * R;
const MAX_STREAK = 30;

export interface SigilProps {
  archetype: Archetype;
  streak?: number;
  level?: number;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function Sigil({
  archetype,
  streak = 0,
  level = 1,
  size = 220,
  className,
  onClick,
}: SigilProps) {
  const def = SIGILS[archetype];

  const { dash, spin, spinSlow, dead, showOrbit, showOrbit2, pulse } = useMemo(() => {
    const pct = Math.min(streak / MAX_STREAK, 1);
    return {
      dash: `${(CIRC * pct).toFixed(1)} ${CIRC.toFixed(1)}`,
      spin: Math.max(4, 16 - streak * 0.4),
      spinSlow: Math.max(4, 16 - streak * 0.4) * 1.6,
      dead: streak === 0,
      showOrbit: streak >= 5,
      showOrbit2: level >= 10,
      pulse: streak >= 14 ? 1.6 : 3.4,
    };
  }, [streak, level]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      role="img"
      aria-label={`${def.name} sigil, ${streak} day streak, level ${level}`}
      className={className}
      onClick={onClick}
      style={{ color: def.color, cursor: onClick ? 'pointer' : undefined }}
    >
      <style>{`
        @keyframes sigil-rot { to { transform: rotate(360deg); } }
        @keyframes sigil-pulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        @keyframes sigil-crack { 0%,100% { opacity: .25 } 50% { opacity: .5 } }
        @media (prefers-reduced-motion: reduce) {
          .sigil-spin, .sigil-pulse, .sigil-crack { animation: none !important; }
        }
      `}</style>

      <circle cx="110" cy="110" r={R} fill="none" stroke="#2A2540" strokeWidth="2" />

      <circle
        cx="110"
        cy="110"
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={dash}
        transform="rotate(-90 110 110)"
        style={{ transition: 'stroke-dasharray 600ms ease-out' }}
      />

      {showOrbit && (
        <g
          className="sigil-spin"
          dangerouslySetInnerHTML={{ __html: def.orbital }}
          style={{
            transformOrigin: '110px 110px',
            animation: `sigil-rot ${spin}s linear infinite`,
          }}
        />
      )}

      {showOrbit2 && (
        <g
          className="sigil-spin"
          dangerouslySetInnerHTML={{ __html: def.orbital }}
          style={{
            transformOrigin: '110px 110px',
            opacity: 0.45,
            animation: `sigil-rot ${spinSlow}s linear infinite reverse`,
          }}
        />
      )}

      <g
        className="sigil-pulse"
        dangerouslySetInnerHTML={{ __html: def.mark }}
        style={{
          transformOrigin: '110px 110px',
          opacity: dead ? 0.28 : undefined,
          animation: `sigil-pulse ${dead ? 6 : pulse}s ease-in-out infinite`,
        }}
      />

      {dead && (
        <path
          className="sigil-crack"
          d="M76 70 L104 108 L88 132 M144 78 L120 106 M132 140 L112 118"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.35"
          style={{ animation: 'sigil-crack 4s ease-in-out infinite' }}
        />
      )}
    </svg>
  );
}

export default Sigil;
