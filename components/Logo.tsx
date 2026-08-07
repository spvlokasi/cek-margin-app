'use client';

import React, { useState } from 'react';
import { Store } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const [hasError, setHasError] = useState(false);

  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }[size];

  if (hasError) {
    return (
      <div className={`${dimensions} rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0 ${className}`}>
        <Store className="w-1/2 h-1/2 stroke-[2.5]" />
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="Logo Basmalah"
      onError={() => setHasError(true)}
      className={`${dimensions} object-contain rounded-xl shrink-0 ${className}`}
    />
  );
}
