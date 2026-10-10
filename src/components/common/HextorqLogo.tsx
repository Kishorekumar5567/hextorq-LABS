'use client';

import React from 'react';
import Image from 'next/image';

interface HextorqLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
}

const sizeMap = {
  xs: { box: 'w-4 h-4', px: 16, text: 'text-xs', sub: 'text-[9px]' },
  sm: { box: 'w-6 h-6', px: 24, text: 'text-xs', sub: 'text-[10px]' },
  md: { box: 'w-8 h-8', px: 32, text: 'text-sm', sub: 'text-[10px]' },
  lg: { box: 'w-10 h-10', px: 40, text: 'text-base', sub: 'text-xs' },
  xl: { box: 'w-12 h-12', px: 48, text: 'text-lg', sub: 'text-xs' },
};

export function HextorqLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  variant = 'auto',
}: HextorqLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Hexagonal Mark */}
      <div
        className={`relative ${s.box} rounded-md bg-white flex items-center justify-center p-0.5 shadow-xs overflow-hidden shrink-0 border border-white/20`}
        title="HEXTORQ LABS"
      >
        <img
          src="/hextorq-logo.png"
          alt="HEXTORQ LABS"
          width={s.px}
          height={s.px}
          className="w-full h-full object-contain"
        />
      </div>

      {showWordmark && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight text-zinc-100 ${s.text} font-sans`}>
            HEXTORQ
          </span>
          <span className={`px-1.5 py-0.5 rounded font-mono font-semibold tracking-wider text-zinc-400 bg-white/[0.06] border border-white/[0.08] ${s.sub}`}>
            LABS
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Pure Vector SVG icon version of the Hextorq geometric hexagonal mark
 * for lightweight inline rendering anywhere.
 */
export function HextorqIcon({
  size = 24,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-md bg-white p-0.5 inline-flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-white/20 ${className}`}
    >
      <img
        src="/hextorq-logo.png"
        alt="HEXTORQ"
        width={size}
        height={size}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
