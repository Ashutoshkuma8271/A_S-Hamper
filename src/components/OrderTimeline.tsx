import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  Home,
  Clock,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface OrderTimelineProps {
  orderId?: string;
  initialStatus?: string;
  status?: string;
  orderNumber?: string;
  createdAt?: string;
  estimatedDelivery?: string;
  courierPartner?: string;
  trackingNumber?: string;
  compact?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

export function OrderTimeline({
  orderId,
  initialStatus,
  status: propStatus,
  orderNumber,
  createdAt,
  estimatedDelivery,
  courierPartner = 'BlueDart Express',
  trackingNumber,
  compact = false,
  onStatusChange,
}: OrderTimelineProps) {
  const [currentStatus, setCurrentStatus] = useState<string>(
    propStatus || initialStatus || 'placed'
  );
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [orderDetails, setOrderDetails] = useState<{
    status?: string;
    courier?: string;
    tracking?: string;
    estimatedDelivery?: string;
  }>({
    status: propStatus || initialStatus || 'placed',
    courier: courierPartner,
    tracking: trackingNumber,
    estimatedDelivery: estimatedDelivery,
  });

  // Fetch status from Supabase if orderId is provided
  const fetchOrderStatus = useCallback(async () => {
    if (!orderId || !supabase) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, created_at, tracking_number, courier_partner, estimated_delivery')
        .eq('id', orderId)
        .maybeSingle();

      if (!error && data) {
        const fetchedStatus = data.status || 'placed';
        setCurrentStatus(fetchedStatus);
        setOrderDetails({
          status: fetchedStatus,
          courier: data.courier_partner || courierPartner,
          tracking: data.tracking_number || trackingNumber,
          estimatedDelivery: data.estimated_delivery || estimatedDelivery,
        });
        if (onStatusChange) {
          onStatusChange(fetchedStatus);
        }
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Could not fetch latest order status:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId, courierPartner, trackingNumber, estimatedDelivery, onStatusChange]);

  useEffect(() => {
    if (propStatus) {
      setCurrentStatus(propStatus);
    }
  }, [propStatus]);

  useEffect(() => {
    if (orderId) {
      fetchOrderStatus();

      // Setup real-time Supabase subscription for this order
      if (supabase) {
        const channel = supabase
          .channel(`order_status_${orderId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'orders',
              filter: `id=eq.${orderId}`,
            },
            (payload) => {
              const updated = payload.new as any;
              if (updated?.status) {
                setCurrentStatus(updated.status);
                setOrderDetails((prev) => ({
                  ...prev,
                  status: updated.status,
                  courier: updated.courier_partner || prev.courier,
                  tracking: updated.tracking_number || prev.tracking,
                }));
                if (onStatusChange) {
                  onStatusChange(updated.status);
                }
              }
            }
          )
          .subscribe();

        return () => {
          supabase?.removeChannel(channel);
        };
      }
    }
  }, [orderId, fetchOrderStatus, onStatusChange]);

  const normStatus = (currentStatus || 'placed').toLowerCase();
  const isCancelled = normStatus.includes('cancel');
  const isReturned = normStatus.includes('return') || normStatus.includes('refund');

  // Step calculations: 1 (Ordered/Placed), 2 (Packed/Processing), 3 (Shipped/In Transit), 4 (Delivered)
  let stepIndex = 1;
  if (normStatus.includes('deliver')) {
    stepIndex = 4;
  } else if (normStatus.includes('ship') || normStatus.includes('transit') || normStatus.includes('out')) {
    stepIndex = 3;
  } else if (normStatus.includes('pack') || normStatus.includes('process') || normStatus.includes('prepar')) {
    stepIndex = 2;
  } else {
    stepIndex = 1;
  }

  const steps = [
    {
      step: 1,
      title: 'Ordered',
      subtitle: 'Order Confirmed',
      desc: 'Order & payment verified',
      icon: Clock,
      done: stepIndex >= 1,
      active: stepIndex === 1,
    },
    {
      step: 2,
      title: 'Packed',
      subtitle: 'Artisan Packed',
      desc: 'Hand-packed with ribbon & card',
      icon: Package,
      done: stepIndex >= 2,
      active: stepIndex === 2,
    },
    {
      step: 3,
      title: 'Shipped',
      subtitle: 'In Transit',
      desc: orderDetails.courier ? `Dispatched via ${orderDetails.courier}` : 'Out for delivery',
      icon: Truck,
      done: stepIndex >= 3,
      active: stepIndex === 3,
    },
    {
      step: 4,
      title: 'Delivered',
      subtitle: 'Gift Delivered',
      desc: 'Safely handed over to recipient',
      icon: Home,
      done: stepIndex >= 4,
      active: stepIndex === 4,
    },
  ];

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-500/10 p-4 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
          <AlertCircle className="h-4 w-4" /> Order Cancelled
        </div>
        <p className="mt-1 text-xs text-red-700/80 dark:text-red-300/80">
          This order has been cancelled. Any applicable refunds have been initiated to your original payment method.
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
          Return status: {currentStatus.toUpperCase()}. Our team is coordinating the reverse pickup.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      {/* Header bar with Live Status & Refresh Button */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${stepIndex === 4 ? 'bg-emerald-400' : 'bg-[#C99738]'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${stepIndex === 4 ? 'bg-emerald-600' : 'bg-[#7F011F]'}`}></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7F011F] dark:text-[#FBDE9C]">
            Live Tracking: <span className="text-[#44040F] dark:text-[#FAF5E8] capitalize">{currentStatus}</span>
          </span>
        </div>

        {orderId && (
          <button
            type="button"
            onClick={fetchOrderStatus}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7F011F] hover:text-[#57222C] dark:text-[#FBDE9C] dark:hover:text-gold-200 transition-colors disabled:opacity-50"
            title="Refresh order status"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>

      {/* Courier metadata if available */}
      {(orderDetails.tracking || orderDetails.courier) && !compact && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FAF5E8] dark:bg-[#1F090E] border border-[#E5C57B]/40 dark:border-[#461C25] p-3.5 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#7F011F] dark:text-[#FBDE9C]" />
            <span className="font-medium text-[#44040F] dark:text-[#FAF5E8]">
              Carrier: <strong className="font-bold text-[#57222C] dark:text-[#FBDE9C]">{orderDetails.courier}</strong>
            </span>
          </div>
          {orderDetails.tracking && (
            <span className="font-mono text-[11px] text-[#44040F]/80 dark:text-[#FAF5E8]/80">
              AWB: <strong className="font-bold text-[#57222C] dark:text-[#FBDE9C]">{orderDetails.tracking}</strong>
            </span>
          )}
        </div>
      )}

      {/* Visual Progress Bar (Ordered -> Packed -> Shipped -> Delivered) */}
      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          {/* Background Track Line */}
          <div className="absolute top-5 left-8 right-8 h-1 bg-cream-200 dark:bg-gray-700 z-0">
            <div
              className="h-full bg-gradient-to-r from-[#57222C] via-[#7F011F] to-emerald-600 transition-all duration-500"
              style={{
                width: `${((Math.max(1, stepIndex) - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Stepper Nodes */}
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative z-10 flex flex-col items-center text-center max-w-[110px]">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full border-2 transition-all duration-300 shadow-sm ${
                    s.done
                      ? 'border-[#7F011F] bg-[#7F011F] text-white dark:border-[#FBDE9C] dark:bg-[#FBDE9C] dark:text-[#57222C]'
                      : 'border-cream-300 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800'
                  } ${s.active ? 'ring-4 ring-[#FBDE9C]/60 scale-110' : ''}`}
                >
                  {s.done && s.step < stepIndex ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4.5 w-4.5" />
                  )}
                </div>

                <p
                  className={`mt-2 font-display text-xs font-bold leading-tight ${
                    s.done
                      ? 'text-[#57222C] dark:text-[#FAF5E8]'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {s.title}
                </p>

                <p className="mt-0.5 text-[10px] text-ink-700/60 dark:text-gray-400 line-clamp-2">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Vertical Stepper View */}
      <div className="block sm:hidden space-y-3">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isLast = idx === steps.length - 1;
          return (
            <div key={s.step} className="flex gap-3 relative">
              {/* Vertical line between nodes */}
              {!isLast && (
                <div
                  className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                    s.done && stepIndex > s.step ? 'bg-[#7F011F] dark:bg-[#FBDE9C]' : 'bg-cream-200 dark:bg-gray-700'
                  }`}
                />
              )}

              {/* Node Icon */}
              <div
                className={`shrink-0 z-10 grid h-8 w-8 place-items-center rounded-full border-2 ${
                  s.done
                    ? 'border-[#7F011F] bg-[#7F011F] text-white dark:border-[#FBDE9C] dark:bg-[#FBDE9C] dark:text-[#57222C]'
                    : 'border-cream-300 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800'
                } ${s.active ? 'ring-2 ring-[#FBDE9C]' : ''}`}
              >
                {s.done && s.step < stepIndex ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Step info */}
              <div className="pb-3">
                <p
                  className={`text-xs font-bold ${
                    s.done ? 'text-[#57222C] dark:text-[#FAF5E8]' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {s.title} — <span className="font-normal text-[11px] text-ink-700/60 dark:text-gray-400">{s.desc}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderTimeline;
