import React from 'react';
import { Shimmer } from './skeletons/Shimmer';
import { HamperCardSkeleton } from './skeletons/HamperCardSkeleton';
import { HamperGridSkeleton } from './skeletons/HamperGridSkeleton';
import {
  DashboardSkeleton,
  AdminDashboardSkeleton,
  OrderCardSkeleton,
  TableSkeleton,
  OrderConfirmationSkeleton,
} from './skeletons/DashboardSkeleton';

export interface LoadingSkeletonProps {
  type?:
    | 'hamper'
    | 'hamper-grid'
    | 'dashboard'
    | 'admin-dashboard'
    | 'order'
    | 'table'
    | 'order-confirmation'
    | 'text'
    | 'banner';
  count?: number;
  className?: string;
  columns?: string;
}

/**
 * Unified, multi-purpose LoadingSkeleton component supporting:
 * - 'hamper': Single luxury hamper card skeleton
 * - 'hamper-grid': Responsive grid of luxury hamper cards with animated shimmer
 * - 'dashboard': Comprehensive customer/vendor account dashboard view
 * - 'admin-dashboard': Admin management analytics, KPIs, and data grids
 * - 'order': Single order tracking card skeleton
 * - 'table': Shimmer skeleton for data rows/moderation lists
 * - 'order-confirmation': Full luxury checkout/order receipt shimmer view
 * - 'banner': Promotional / Hero banner skeleton
 * - 'text': Fluid inline text skeleton placeholder
 */
export function LoadingSkeleton({
  type = 'hamper-grid',
  count = 4,
  className = '',
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}: LoadingSkeletonProps) {
  if (type === 'hamper') {
    return <HamperCardSkeleton />;
  }

  if (type === 'hamper-grid') {
    return <HamperGridSkeleton count={count} columns={columns} />;
  }

  if (type === 'dashboard') {
    return (
      <div className={className}>
        <DashboardSkeleton />
      </div>
    );
  }

  if (type === 'admin-dashboard') {
    return (
      <div className={className}>
        <AdminDashboardSkeleton />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={className}>
        <TableSkeleton rows={count} />
      </div>
    );
  }

  if (type === 'order-confirmation') {
    return <OrderConfirmationSkeleton />;
  }

  if (type === 'order') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === 'banner') {
    return (
      <div className={`overflow-hidden rounded-[2rem] border border-cream-200/80 dark:border-stone-800 bg-white dark:bg-[#1A1317] p-6 sm:p-10 ${className}`}>
        <div className="h-4 w-32 rounded-full bg-wine-800/15 dark:bg-gold-400/20 mb-4" />
        <div className="h-9 w-72 max-w-full rounded-xl bg-wine-800/20 dark:bg-gold-400/25 mb-3" />
        <div className="h-4 w-96 max-w-full rounded bg-wine-800/10 dark:bg-cream-100/10" />
      </div>
    );
  }

  // Generic text placeholder
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="h-4 w-full rounded bg-wine-800/10 dark:bg-cream-100/10" />
      <div className="h-4 w-3/4 rounded bg-wine-800/10 dark:bg-cream-100/10" />
    </div>
  );
}

export default LoadingSkeleton;
export {
  Shimmer,
  HamperCardSkeleton,
  HamperGridSkeleton,
  DashboardSkeleton,
  AdminDashboardSkeleton,
  OrderCardSkeleton,
  TableSkeleton,
  OrderConfirmationSkeleton,
};

