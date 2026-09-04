import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'horizontal' | 'mark' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isDark?: boolean;
}

/**
 * High-fidelity Vector Emblem representing the A_S Hamper luxury brand identity:
 * - Royal Circular Gold Crest
 * - Intertwined 3D Metallic Monogram 'A' & 'S'
 * - Botanical Laurel Sprig & Tied Satin Ribbon
 */
export function BrandEmblem({
  size = 'md',
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-8.5 h-8.5 sm:w-9 sm:h-9',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  return (
    <div className={`relative shrink-0 select-none ${sizeMap[size]} ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_10px_rgba(127,1,31,0.2)]"
      >
        <defs>
          {/* Metallic Gold Gradients */}
          <linearGradient id="asGoldRing" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DFB25B" />
            <stop offset="35%" stopColor="#FFF2BF" />
            <stop offset="70%" stopColor="#B4822B" />
            <stop offset="100%" stopColor="#754708" />
          </linearGradient>

          <linearGradient id="asGoldLetterA" x1="50" y1="20" x2="150" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF3C4" />
            <stop offset="30%" stopColor="#E2B755" />
            <stop offset="65%" stopColor="#A67421" />
            <stop offset="100%" stopColor="#754708" />
          </linearGradient>

          <linearGradient id="asGoldLetterS" x1="160" y1="50" x2="70" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF8DB" />
            <stop offset="40%" stopColor="#E3BA5E" />
            <stop offset="80%" stopColor="#9B6C1D" />
            <stop offset="100%" stopColor="#6E4407" />
          </linearGradient>

          <linearGradient id="asGoldLeaves" x1="15" y1="40" x2="80" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F2D183" />
            <stop offset="50%" stopColor="#C99738" />
            <stop offset="100%" stopColor="#8C5C16" />
          </linearGradient>

          <linearGradient id="asGoldBow" x1="70" y1="140" x2="130" y2="195" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF2BF" />
            <stop offset="40%" stopColor="#DFB25B" />
            <stop offset="70%" stopColor="#B4822B" />
            <stop offset="100%" stopColor="#754708" />
          </linearGradient>

          <filter id="asEmblemShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#330009" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Circular Ring with luxury styling */}
        <circle
          cx="100"
          cy="100"
          r="88"
          stroke="url(#asGoldRing)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="520 18"
          strokeDashoffset="10"
        />

        {/* Inner delicate glow circle */}
        <circle
          cx="100"
          cy="100"
          r="83"
          stroke="url(#asGoldRing)"
          strokeWidth="1"
          strokeOpacity="0.45"
          fill="none"
        />

        {/* Left Laurel Botanical Branch Sprig */}
        <g filter="url(#asEmblemShadow)">
          <path
            d="M50 148 C 30 125, 26 85, 48 50"
            stroke="url(#asGoldLeaves)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Leaf 1 */}
          <path d="M48 50 C 44 40, 52 35, 56 42 C 57 48, 52 51, 48 50 Z" fill="url(#asGoldLeaves)" />
          {/* Leaf 2 */}
          <path d="M40 70 C 32 62, 38 54, 46 60 C 48 66, 44 71, 40 70 Z" fill="url(#asGoldLeaves)" />
          {/* Leaf 3 */}
          <path d="M34 94 C 24 88, 28 78, 38 82 C 40 89, 37 95, 34 94 Z" fill="url(#asGoldLeaves)" />
          {/* Leaf 4 */}
          <path d="M34 118 C 24 114, 26 104, 36 106 C 39 113, 37 119, 34 118 Z" fill="url(#asGoldLeaves)" />
          {/* Leaf 5 */}
          <path d="M42 138 C 34 136, 34 126, 44 126 C 47 132, 46 138, 42 138 Z" fill="url(#asGoldLeaves)" />
        </g>

        {/* 3D Interlaced Monogram: Letter A */}
        <g filter="url(#asEmblemShadow)">
          {/* Left leg of A */}
          <path
            d="M84 48 L60 148 L76 148 L86 106 L114 106 L124 148 L140 148 L116 48 L84 48 Z M91 88 L100 56 L109 88 L91 88 Z"
            fill="url(#asGoldLetterA)"
          />
        </g>

        {/* 3D Interlaced Monogram: Letter S */}
        <g filter="url(#asEmblemShadow)">
          <path
            d="M148 64 C 145 54, 134 46, 118 48 C 96 50, 88 66, 92 84 C 94 92, 100 98, 110 102 C 128 110, 142 118, 142 134 C 142 152, 124 164, 98 162 C 84 161, 74 152, 68 142 L80 134 C 84 142, 90 148, 100 148 C 114 148, 124 142, 124 132 C 124 122, 114 116, 102 110 C 86 102, 74 94, 74 76 C 74 60, 90 44, 116 42 C 132 40, 148 48, 156 60 Z"
            fill="url(#asGoldLetterS)"
          />
          {/* 3D inner ridge highlight for S */}
          <path
            d="M144 62 C 140 52, 128 48, 118 49 C 102 51, 94 64, 96 78 C 98 86, 106 92, 114 96 C 128 102, 138 112, 138 128 C 138 142, 124 154, 104 154 C 92 154, 84 148, 80 140"
            stroke="#FFF4CF"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
        </g>

        {/* Tied Satin Ribbon Bow & Tails at bottom center */}
        <g filter="url(#asEmblemShadow)">
          <path d="M98 158 C 86 150, 72 154, 74 166 C 76 176, 88 174, 98 165 Z" fill="url(#asGoldBow)" />
          <path d="M102 158 C 114 150, 128 154, 126 166 C 124 176, 112 174, 102 165 Z" fill="url(#asGoldBow)" />
          <circle cx="100" cy="161" r="5.5" fill="url(#asGoldLetterA)" stroke="#FFE6A1" strokeWidth="1" />
          <path d="M96 164 Q 86 178, 76 188 Q 84 186, 92 188 Q 96 176, 97 167 Z" fill="url(#asGoldBow)" />
          <path d="M104 164 Q 114 178, 124 188 Q 116 186, 108 188 Q 104 176, 103 167 Z" fill="url(#asGoldBow)" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Premium Luxury A_S Hamper Brand Logo Component
 */
export default function BrandLogo({
  variant = 'horizontal',
  size = 'md',
  className = '',
  isDark = false,
}: BrandLogoProps) {
  if (variant === 'mark') {
    return <BrandEmblem size={size} className={className} />;
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 select-none cursor-default ${className}`}>
        <BrandEmblem size={size === 'lg' ? 'md' : size === 'sm' ? 'xs' : 'sm'} />
        <div className="flex flex-col min-w-0">
          <span
            className={`font-display font-black tracking-[0.16em] text-sm sm:text-base leading-none ${
              isDark ? 'text-[#F5EBD0]' : 'text-[#7F011F] dark:text-[#F5EBD0]'
            }`}
            style={{ fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif" }}
          >
            A_S HAMPER
          </span>
          <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#7F011F]/75 dark:text-[#F5EBD0]/75 mt-0.5 truncate">
            Artisan Hampers
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none cursor-default ${className}`}>
        <BrandEmblem size={size === 'xl' ? 'xl' : 'lg'} className="mb-3.5" />

        {/* Top subtle decorative diamond line */}
        <div className="flex items-center justify-center gap-2 w-48 sm:w-64 my-1.5 opacity-90">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#7F011F] to-[#DFB25B]" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#7F011F]" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#7F011F] to-[#DFB25B]" />
        </div>

        {/* Brand Name */}
        <h1
          className={`font-display font-black tracking-[0.22em] text-2xl sm:text-3xl md:text-4xl uppercase my-1.5 ${
            isDark ? 'text-[#F5EBD0]' : 'text-[#7F011F] dark:text-[#F5EBD0]'
          } drop-shadow-sm`}
          style={{ fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif" }}
        >
          A_S HAMPER
        </h1>

        {/* Tagline */}
        <p className="text-[10px] sm:text-[12px] uppercase tracking-[0.24em] font-semibold text-[#7F011F]/85 dark:text-[#F5EBD0]/85 px-2">
          Personalised Artisan Gift Hampers, Hand-Packed
        </p>

        {/* Bottom Filigree Flourish */}
        <div className="flex items-center justify-center gap-2 w-56 sm:w-80 mt-2.5 opacity-90">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#7F011F] to-[#DFB25B]" />
          <div className="w-2 h-2 rotate-45 bg-[#DFB25B]" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#7F011F] to-[#DFB25B]" />
        </div>
      </div>
    );
  }

  // Default: 'horizontal' (Clean, luxury, non-clickable banner)
  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none cursor-default min-w-0 ${className}`}>
      <BrandEmblem
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'xs' : 'sm'}
        className="shrink-0 transition-transform duration-300"
      />
      <div className="flex flex-col min-w-0 justify-center">
        <span
          className={`font-display font-black text-xs xs:text-sm sm:text-base md:text-lg tracking-[0.16em] uppercase leading-tight whitespace-nowrap ${
            isDark ? 'text-[#F5EBD0]' : 'text-[#7F011F] dark:text-[#F5EBD0]'
          }`}
          style={{ fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif" }}
        >
          A_S HAMPER
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-[#7F011F]/80 dark:text-[#F5EBD0]/80 font-bold block leading-none truncate">
            Artisan Gift Hampers
          </span>
        </div>
      </div>
    </div>
  );
}
