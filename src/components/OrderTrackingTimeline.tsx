import React from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  Home,
  Clock,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export interface OrderTrackingTimelineProps {
  status: string;
  orderNumber?: string;
  createdAt?: string;
  estimatedDelivery?: string;
  courierPartner?: string;
  trackingNumber?: string;
  compact?: boolean;
}

export function OrderTrackingTimeline({
  status = 'placed',
  orderNumber,
  createdAt,
  estimatedDelivery,
  courierPartner = 'BlueDart Express',
  trackingNumber,
  compact = false,
}: OrderTrackingTimelineProps) {
  const normStatus = (status || 'placed').toLowerCase();

  const isCancelled = normStatus.includes('cancel');
  const isReturned = normStatus.includes('return') || normStatus.includes('refund');

  // Step calculations: 1 (Ordered/Placed), 2 (Packed/Processing), 3 (Shipped), 4 (Delivered)
  let currentStep = 1;
  if (normStatus.includes('deliver')) {
    currentStep = 4;
  } else if (normStatus.includes('ship') || normStatus.includes('transit') || normStatus.includes('out')) {
    currentStep = 3;
  } else if (normStatus.includes('pack') || normStatus.includes('process') || normStatus.includes('prepar')) {
    currentStep = 2;
  } else {
    currentStep = 1;
  }

  const steps = [
    {
      step: 1,
      title: 'Order Confirmed',
      desc: 'Order verified & payment confirmed',
      icon: Clock,
      done: currentStep >= 1,
      active: currentStep === 1,
    },
    {
      step: 2,
      title: 'Artisan Packed',
      desc: 'Hand-packed with ribbon & keepsake card',
      icon: Package,
      done: currentStep >= 2,
      active: currentStep === 2,
    },
    {
      step: 3,
      title: 'In Transit / Shipped',
      desc: courierPartner ? `Dispatched via ${courierPartner}` : 'Out for delivery to address',
      icon: Truck,
      done: currentStep >= 3,
      active: currentStep === 3,
    },
    {
      step: 4,
      title: 'Delivered',
      desc: 'Delivered safely with gift presentation',
      icon: Home,
      done: currentStep >= 4,
      active: currentStep === 4,
    },
  ];

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-500/10 p-4 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
          <AlertCircle className="h-4 w-4" /> Order Cancelled
        </div>
        <p className="mt-1 text-xs text-red-700/80 dark:text-red-300/80">
          This order has been cancelled and any paid amount has been credited to your Refund Wallet.
        </p>
      </div>
    );
  }

  if (isReturned) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-500/10 p-4 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <RotateCcw className="h-4 w-4" /> Return / Refund in Progress
        </div>
        <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">
          Return status: {status.toUpperCase()}. Our team is coordinating the reverse pickup and wallet settlement.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      {/* Meta Courier Bar */}
      {(trackingNumber || courierPartner) && !compact && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#57222C]/5 dark:bg-white/5 border border-[#E5C57B]/30 dark:border-[#461C25] p-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-[#44040F] dark:text-[#FAF5E8]">
              Courier: <span className="font-bold text-[#57222C] dark:text-[#FBDE9C]">{courierPartner}</span>
            </span>
          </div>
          {trackingNumber && (
            <span className="font-mono text-[11px] text-[#44040F]/70 dark:text-[#FAF5E8]/70">
              Tracking AWB: <span className="font-bold text-[#57222C] dark:text-[#FBDE9C]">{trackingNumber}</span>
            </span>
          )}
        </div>
      )}

      {/* Desktop Horizontal Progress Stepper */}
      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          {/* Progress Connecting Line */}
          <div className="absolute top-5 left-8 right-8 h-1 bg-gray-200 dark:bg-gray-700 z-0">
            <div
              className="h-full bg-gradient-to-r from-[#57222C] via-[#7F011F] to-emerald-600 transition-all duration-500"
              style={{
                width: `${((Math.max(1, currentStep) - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Stepper Nodes */}
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative z-10 flex flex-col items-center text-center max-w-[140px]">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold transition-all shadow-sm ${
                    s.done
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20'
                      : s.active
                      ? 'bg-[#57222C] text-[#FBDE9C] ring-4 ring-[#57222C]/20 animate-pulse'
                      : 'bg-white text-gray-400 border border-gray-300 dark:bg-[#1A1115] dark:border-gray-700 dark:text-gray-500'
                  }`}
                >
                  {s.done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                </div>

                <p
                  className={`mt-2.5 text-xs font-bold leading-snug ${
                    s.done || s.active
                      ? 'text-[#44040F] dark:text-[#FAF5E8]'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {s.title}
                </p>

                {!compact && (
                  <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                    {s.desc}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Vertical Progress Stepper */}
      <div className="sm:hidden space-y-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isLast = idx === steps.length - 1;
          return (
            <div key={s.step} className="relative flex items-start gap-3">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={`absolute left-4 top-8 -bottom-4 w-0.5 z-0 ${
                    s.done ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}

              <div
                className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold shadow-sm ${
                  s.done
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/20'
                    : s.active
                    ? 'bg-[#57222C] text-[#FBDE9C] ring-2 ring-[#57222C]/20'
                    : 'bg-white text-gray-400 border border-gray-300 dark:bg-[#1A1115] dark:border-gray-700'
                }`}
              >
                {s.done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>

              <div className="pt-0.5 min-w-0 flex-1">
                <p
                  className={`text-xs font-bold ${
                    s.done || s.active
                      ? 'text-[#44040F] dark:text-[#FAF5E8]'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {s.title}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderTrackingTimeline;
