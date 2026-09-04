import { HamperCardSkeleton } from './HamperCardSkeleton';

export function HamperGridSkeleton({
  count = 8,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div className={`grid gap-5 sm:gap-6 ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <HamperCardSkeleton key={i} />
      ))}
    </div>
  );
}
