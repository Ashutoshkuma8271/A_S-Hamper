import { Shimmer } from './Shimmer';

export function HamperCardSkeleton() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-cream-200/80 dark:border-stone-800/80 bg-white dark:bg-[#1A1317] p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      {/* Top Media Image Skeleton */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cream-100 dark:bg-stone-900">
        <Shimmer className="h-full w-full" />
        
        {/* Shimmer Badges Top-Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <div className="h-5 w-20 rounded-full bg-wine-700/30 dark:bg-gold-500/20" />
          <div className="h-4 w-12 rounded-full bg-gold-500/30 dark:bg-gold-500/30" />
        </div>
        
        {/* Wishlist Circle Top-Right */}
        <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/70 dark:bg-black/40 shadow-sm" />
      </div>

      {/* Content Body */}
      <div className="mt-3.5 flex flex-1 flex-col justify-between px-1">
        <div className="space-y-2">
          {/* Category & Rating Pill */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded-full bg-gold-600/25 dark:bg-gold-400/20" />
            <div className="h-3 w-12 rounded-full bg-cream-200 dark:bg-stone-800" />
          </div>
          
          {/* Hamper Title */}
          <div className="h-5 w-4/5 rounded-lg bg-wine-800/20 dark:bg-cream-100/15" />
          
          {/* Description Lines */}
          <div className="space-y-1.5 pt-0.5">
            <div className="h-3 w-full rounded bg-wine-800/10 dark:bg-cream-100/10" />
            <div className="h-3 w-2/3 rounded bg-wine-800/10 dark:bg-cream-100/10" />
          </div>
        </div>

        {/* Pricing & Double Action Button Skeleton */}
        <div className="mt-5 border-t border-cream-200/80 dark:border-stone-800 pt-3">
          <div className="mb-3 flex items-baseline gap-2">
            <div className="h-5 w-24 rounded-md bg-wine-800/25 dark:bg-gold-400/25" />
            <div className="h-3 w-14 rounded bg-cream-200 dark:bg-stone-800" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-9 w-full rounded-full bg-cream-100 dark:bg-stone-800 border border-cream-200 dark:border-stone-700" />
            <div className="h-9 w-full rounded-full bg-wine-700/25 dark:bg-gold-500/25" />
          </div>
        </div>
      </div>
    </div>
  );
}

