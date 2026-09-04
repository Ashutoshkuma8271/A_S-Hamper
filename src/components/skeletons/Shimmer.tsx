import React from 'react';

/**
 * Shimmer effect for A_S HAMPER luxury brand aesthetic.
 * Produces a soft champagne gold glint over warm cream/vino surfaces.
 */
export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-cream-100 via-cream-200/50 to-cream-100 dark:from-[#22070E] dark:via-[#361019] dark:to-[#22070E] ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_cubic-bezier(0.4,0,0.2,1)_infinite] bg-gradient-to-r from-transparent via-white/70 dark:via-[#FBDE9C]/15 to-transparent pointer-events-none" />
    </div>
  );
}

