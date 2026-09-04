import { Shimmer } from './Shimmer';

export function OrderCardSkeleton() {
  return (
    <div className="rounded-3xl border border-cream-200/80 dark:border-stone-800 bg-white dark:bg-[#1A1317] p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 dark:border-stone-800 pb-4">
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-wine-800/15 dark:bg-gold-400/20" />
          <div className="h-3 w-24 rounded bg-wine-800/10 dark:bg-cream-100/10" />
        </div>
        <div className="h-6 w-24 rounded-full bg-gold-500/20 dark:bg-gold-500/15" />
      </div>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cream-100 dark:bg-stone-900">
          <Shimmer className="h-full w-full" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-wine-800/15 dark:bg-cream-100/15" />
          <div className="h-3 w-1/2 rounded bg-wine-800/10 dark:bg-cream-100/10" />
        </div>
        <div className="h-5 w-16 rounded bg-wine-800/20 dark:bg-gold-400/20" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="h-3 w-32 rounded bg-wine-800/10 dark:bg-cream-100/10" />
        <div className="h-8 w-28 rounded-full bg-wine-700/15 dark:bg-gold-500/20" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-cream-200/80 dark:border-stone-800 bg-white dark:bg-[#1A1317] p-5 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-wine-800/10 dark:bg-gold-400/15 overflow-hidden">
                <Shimmer className="h-full w-full" />
              </div>
              <div className="h-4 w-12 rounded bg-gold-600/20 dark:bg-gold-400/20" />
            </div>
            <div className="h-7 w-24 rounded-lg bg-wine-800/20 dark:bg-gold-400/20" />
            <div className="h-3 w-28 rounded bg-wine-800/10 dark:bg-cream-100/10" />
          </div>
        ))}
      </div>

      {/* Orders List Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-44 rounded-lg bg-wine-800/20 dark:bg-cream-100/20" />
          <div className="h-4 w-20 rounded-full bg-cream-200 dark:bg-stone-800" />
        </div>
        <div className="grid gap-4">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Metric KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-cream-200/80 dark:border-stone-800 bg-white dark:bg-[#1A1317] p-6 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-wine-800/10 dark:bg-gold-400/15 overflow-hidden">
                <Shimmer className="h-full w-full" />
              </div>
              <div className="h-4 w-16 rounded-full bg-sage-500/20" />
            </div>
            <div className="space-y-1">
              <div className="h-8 w-28 rounded-lg bg-wine-800/25 dark:bg-gold-400/25" />
              <div className="h-3 w-36 rounded bg-wine-800/10 dark:bg-cream-100/10" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart & Quick List Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-cream-200/80 dark:border-stone-800 bg-white dark:bg-[#1A1317] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-cream-200/60 dark:border-stone-800">
            <div className="h-5 w-40 rounded bg-wine-800/20 dark:bg-cream-100/20" />
            <div className="h-4 w-24 rounded bg-cream-200 dark:bg-stone-800" />
          </div>
          <div className="h-56 w-full rounded-2xl bg-cream-100/70 dark:bg-stone-900/60 overflow-hidden">
            <Shimmer className="h-full w-full" />
          </div>
        </div>

        <div className="rounded-3xl border border-cream-200/80 dark:border-stone-800 bg-white dark:bg-[#1A1317] p-6 space-y-4 shadow-sm">
          <div className="h-5 w-32 rounded bg-wine-800/20 dark:bg-cream-100/20 pb-2" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-cream-50 dark:bg-stone-900/40">
                <div className="h-10 w-10 rounded-xl bg-cream-200 dark:bg-stone-800 overflow-hidden shrink-0">
                  <Shimmer className="h-full w-full" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-3.5 w-3/4 rounded bg-wine-800/15 dark:bg-cream-100/15" />
                  <div className="h-2.5 w-1/2 rounded bg-wine-800/10 dark:bg-cream-100/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-cream-200/80 dark:border-stone-800 bg-white dark:bg-[#1A1317] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-cream-100 dark:bg-stone-900">
              <Shimmer className="h-full w-full" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-4 w-48 max-w-full rounded bg-wine-800/20 dark:bg-cream-100/20" />
              <div className="h-3 w-64 max-w-full rounded bg-wine-800/10 dark:bg-cream-100/10" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-6 w-20 rounded-full bg-gold-500/20 dark:bg-gold-500/15" />
            <div className="h-8 w-20 rounded-full bg-wine-700/15 dark:bg-gold-500/20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderConfirmationSkeleton() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120D10] pt-28 pb-20 px-4 font-sans">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Top Hero Confirmation Card */}
        <div className="rounded-[2.5rem] bg-white dark:bg-stone-900 p-8 sm:p-12 shadow-xl border border-cream-200 dark:border-stone-800 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-gold-500/20 dark:bg-gold-500/10 overflow-hidden flex items-center justify-center">
            <Shimmer className="h-full w-full" />
          </div>
          <div className="h-7 w-64 mx-auto rounded-lg bg-wine-800/20 dark:bg-cream-100/20" />
          <div className="h-4 w-80 max-w-full mx-auto rounded bg-wine-800/10 dark:bg-cream-100/10" />
          
          <div className="pt-4 flex justify-center gap-3">
            <div className="h-9 w-36 rounded-full bg-cream-100 dark:bg-stone-800" />
            <div className="h-9 w-36 rounded-full bg-wine-700/20 dark:bg-gold-500/20" />
          </div>
        </div>

        {/* Order Details Breakdown Skeleton */}
        <div className="rounded-3xl bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm border border-cream-200 dark:border-stone-800 space-y-4">
          <div className="h-5 w-40 rounded bg-wine-800/20 dark:bg-cream-100/20" />
          <div className="space-y-3 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-cream-100 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-cream-100 dark:bg-stone-800 overflow-hidden">
                    <Shimmer className="h-full w-full" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 w-32 rounded bg-wine-800/15 dark:bg-cream-100/15" />
                    <div className="h-3 w-20 rounded bg-wine-800/10 dark:bg-cream-100/10" />
                  </div>
                </div>
                <div className="h-4 w-16 rounded bg-wine-800/20 dark:bg-gold-400/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

