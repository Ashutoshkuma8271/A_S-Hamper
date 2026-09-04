import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShoppingBag,
  Store,
  Sparkles,
  ChevronRight,
  Printer,
  ShieldCheck,
  Gift,
  HelpCircle,
  Copy,
  Check,
  Download,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { formatPrice } from '@/cart';
import { supabase } from '@/lib/supabase';
import { subscribeToRealtimeOrders } from '@/lib/orderSync';
import OrderTrackingTimeline from '@/components/OrderTrackingTimeline';
import { toast } from 'react-hot-toast';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

type SavedOrder = {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  delivery_slot?: string;
  gift_card_note?: string;
  items: Array<{
    name: string;
    image: string;
    price: number;
    quantity?: number;
    qty?: number;
    subtotal?: number;
    vendor_name?: string;
    customization?: any;
  }>;
  total: number;
  subtotal?: number;
  discount?: number;
  delivery_charge?: number;
  customization_charge?: number;
  wallet_discount?: number;
  payment_method: string;
  payment_status: string;
  payment_id?: string;
  status: string;
  created_at: string;
  estimated_delivery?: string;
};

export default function OrderConfirmationPage() {
  const { orderId: paramOrderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const queryOrderId = searchParams.get('orderId');
  const effectiveOrderId = paramOrderId || queryOrderId || '';

  const navigate = useNavigate();
  const [order, setOrder] = useState<SavedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchOrder = async () => {
    if (!effectiveOrderId) {
      // Check for most recent order in localStorage
      try {
        const existing = localStorage.getItem('a_s_hamper_orders');
        if (existing) {
          const parsed = JSON.parse(existing);
          if (parsed && parsed.length > 0) {
            setOrder(parsed[0]);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Error fetching recent orders:', e);
      }
      setLoading(false);
      return;
    }

    // 1. Check dedicated localStorage cache
    try {
      const cached = localStorage.getItem(`as_hamper_order_${effectiveOrderId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setOrder(parsed);
        setLoading(false);
        return;
      }

      const allOrders = localStorage.getItem('a_s_hamper_orders');
      if (allOrders) {
        const list = JSON.parse(allOrders) as SavedOrder[];
        const match = list.find((o) => o.order_number === effectiveOrderId);
        if (match) {
          setOrder(match);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error('Error reading local orders:', e);
    }

    // 2. Fetch from Supabase
    if (supabase && effectiveOrderId) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', effectiveOrderId)
          .maybeSingle();

        if (!error && data) {
          setOrder({
            order_number: data.order_number,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
            address: data.address,
            delivery_slot: data.delivery_slot,
            gift_card_note: data.gift_card_note,
            items: data.items || [],
            total: Number(data.total),
            subtotal: data.subtotal ? Number(data.subtotal) : undefined,
            discount: data.discount ? Number(data.discount) : undefined,
            delivery_charge: data.delivery_charge ? Number(data.delivery_charge) : 0,
            customization_charge: data.customization_charge ? Number(data.customization_charge) : 0,
            wallet_discount: data.wallet_discount ? Number(data.wallet_discount) : 0,
            payment_method: data.payment_method || 'Razorpay Online',
            payment_status: data.payment_status || 'paid',
            payment_id: data.payment_id,
            status: data.status || 'placed',
            created_at: data.created_at || new Date().toISOString(),
            estimated_delivery: data.estimated_delivery || '3-4 Business Days',
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error fetching order from database:', err);
      }
    }

    setOrder(null);
    setLoading(false);
  };

  useEffect(() => {
    void fetchOrder();

    const unsub = subscribeToRealtimeOrders(() => {
      void fetchOrder();
    });

    return () => unsub();
  }, [effectiveOrderId]);

  const handleCopyOrderId = () => {
    if (!order?.order_number) return;
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    toast.success('Order Number copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return <LoadingSkeleton type="order-confirmation" />;
  }


  if (!order) {
    return (
      <main className="min-h-screen bg-[#F5EBD0] dark:bg-[#180005] pt-28 pb-20 px-4 flex items-center justify-center text-center font-sans">
        <div className="max-w-md rounded-[2rem] bg-[#FAF6EB] dark:bg-[#240008] p-8 shadow-xl border border-[#7F011F]/20">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#7F011F]/15 text-[#7F011F] dark:text-[#F5EBD0]">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
            Order Reference Not Found
          </h2>
          <p className="mt-2 text-xs text-[#7F011F]/70 dark:text-[#F5EBD0]/70 leading-relaxed">
            We couldn't locate active order #{effectiveOrderId}. If your payment succeeded, your order is recorded and visible in your customer account.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/customer/orders"
              className="rounded-full bg-[#7F011F] px-6 py-2.5 text-xs font-bold text-[#F5EBD0] shadow hover:bg-[#680018] transition-colors"
            >
              My Orders Dashboard
            </Link>
            <Link
              to="/all-hampers"
              className="rounded-full border border-[#7F011F]/30 px-6 py-2.5 text-xs font-bold text-[#7F011F] dark:text-[#F5EBD0] hover:bg-[#7F011F]/10 transition-colors"
            >
              Shop Hampers
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5EBD0] dark:bg-[#180005] pt-24 pb-28 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="mx-auto max-w-4xl space-y-7">
        
        {/* Top Celebratory Header Card */}
        <div className="relative overflow-hidden rounded-[2rem] border border-cream-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-9 text-center shadow-lg">
          {/* Subtle Ambient Gold Radiance */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-gold-400/15 blur-3xl dark:bg-wine-900/30" />

          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sage-500/15 text-sage-600 dark:bg-sage-500/25 dark:text-sage-400 shadow-inner">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sage-500/10 dark:bg-sage-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-sage-800 dark:text-sage-300 border border-sage-500/25">
            <Sparkles className="h-3 w-3 text-gold-500" /> Order Placed &amp; Confirmed
          </span>

          <h1 className="mt-2.5 font-display text-2xl sm:text-3xl font-bold text-wine-900 dark:text-white">
            Thank you, {order.customer_name.split(' ')[0] || 'Valued Customer'}!
          </h1>
          <p className="mt-1.5 text-xs text-ink-700/70 dark:text-stone-300 max-w-lg mx-auto leading-relaxed">
            Your luxury artisan gift hamper has been received and scheduled for handcrafted packaging. A digital receipt has been sent to{' '}
            <strong className="text-wine-800 dark:text-gold-300">{order.customer_email}</strong>.
          </p>

          {/* Quick Metrics Ribbon */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 rounded-2xl bg-cream-50/80 dark:bg-stone-800/80 p-4 border border-cream-200 dark:border-stone-700 text-xs">
            <div className="flex items-center gap-2">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-ink-700/50 dark:text-stone-400 block">
                  Order Number
                </span>
                <span className="font-mono font-bold text-wine-900 dark:text-gold-300 text-sm sm:text-base">
                  #{order.order_number}
                </span>
              </div>
              <button
                onClick={handleCopyOrderId}
                title="Copy Order ID"
                className="rounded-lg p-1.5 text-ink-700/60 hover:bg-cream-200 dark:hover:bg-stone-700 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-sage-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="h-7 w-px bg-cream-300 dark:bg-stone-700 hidden sm:block"></div>

            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-ink-700/50 dark:text-stone-400 block">
                Estimated Delivery
              </span>
              <span className="font-bold text-wine-900 dark:text-white flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-gold-600" /> {order.estimated_delivery || '3-4 Business Days'}
              </span>
            </div>

            <div className="h-7 w-px bg-cream-300 dark:bg-stone-700 hidden sm:block"></div>

            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-ink-700/50 dark:text-stone-400 block">
                Total Paid
              </span>
              <span className="font-extrabold text-wine-900 dark:text-gold-300">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Order Tracking Pipeline Stepper */}
        <div className="rounded-[1.75rem] border border-cream-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-7 shadow-sm">
          <OrderTrackingTimeline
            status={order.status}
            orderNumber={order.order_number}
            estimatedDelivery={order.estimated_delivery}
          />
        </div>

        {/* 2-Column Delivery & Payment Details Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          
          {/* Shipping & Recipient Card */}
          <div className="rounded-[1.75rem] border border-cream-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
            <h3 className="font-display text-sm font-bold text-wine-900 dark:text-white flex items-center gap-2 border-b border-cream-100 dark:border-stone-800 pb-3">
              <MapPin className="h-4 w-4 text-gold-600" /> Shipping Destination
            </h3>
            <div className="mt-3 text-xs text-ink-800 dark:text-stone-300 space-y-1.5">
              <p className="font-bold text-wine-900 dark:text-white text-sm">{order.customer_name}</p>
              <p className="text-ink-700/70 dark:text-stone-400">📞 +91 {order.customer_phone}</p>
              <p className="text-ink-700/70 dark:text-stone-400">✉️ {order.customer_email}</p>
              <div className="pt-2 border-t border-cream-100 dark:border-stone-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-700/50 dark:text-stone-400 block mb-0.5">
                  Delivery Address
                </span>
                <p className="leading-relaxed text-ink-800 dark:text-stone-300 font-medium">
                  {order.address}
                </p>
              </div>

              {order.delivery_slot && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-700/50 dark:text-stone-400 block mb-0.5">
                    Dispatch Slot
                  </span>
                  <p className="text-wine-800 dark:text-gold-300 font-semibold">{order.delivery_slot}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Gift Note Card */}
          <div className="rounded-[1.75rem] border border-cream-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-display text-sm font-bold text-wine-900 dark:text-white flex items-center gap-2 border-b border-cream-100 dark:border-stone-800 pb-3">
                <ShieldCheck className="h-4 w-4 text-gold-600" /> Payment &amp; Security
              </h3>
              <div className="mt-3 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink-700/60 dark:text-stone-400">Payment Mode:</span>
                  <span className="font-bold text-wine-900 dark:text-white">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-700/60 dark:text-stone-400">Payment Status:</span>
                  <span className="font-bold text-sage-600 capitalize bg-sage-50 dark:bg-sage-950/40 px-2.5 py-0.5 rounded-full text-[11px]">
                    ✓ {order.payment_status}
                  </span>
                </div>
                {order.payment_id && (
                  <div className="flex justify-between">
                    <span className="text-ink-700/60 dark:text-stone-400">Razorpay Ref:</span>
                    <span className="font-mono text-[11px] text-ink-700 dark:text-stone-300">{order.payment_id}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-cream-100 dark:border-stone-800 pt-2 font-display text-sm font-bold text-wine-900 dark:text-white">
                  <span>Grand Total Paid:</span>
                  <span className="text-wine-800 dark:text-gold-300 text-base">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Handwritten Gift Message Preview if present */}
            {order.gift_card_note && (
              <div className="rounded-2xl bg-cream-50/80 dark:bg-stone-800/60 p-3.5 border border-cream-200 dark:border-stone-700 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-wine-900 dark:text-gold-300 mb-1">
                  <Gift className="h-3.5 w-3.5 text-gold-600" /> Gift Message Card
                </div>
                <p className="italic text-ink-700/80 dark:text-stone-300 text-[11px] leading-relaxed">
                  "{order.gift_card_note}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Order Items Listing */}
        <div className="rounded-[1.75rem] border border-cream-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between border-b border-cream-100 dark:border-stone-800 pb-3.5">
            <h3 className="font-display text-base font-bold text-wine-900 dark:text-white flex items-center gap-2">
              <Gift className="h-4 w-4 text-gold-600" /> Curated Hamper Items ({order.items.length})
            </h3>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-wine-700 dark:text-gold-300 hover:underline"
            >
              <Printer className="h-3.5 w-3.5" /> Print Tax Invoice
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {order.items.map((item, idx) => {
              const qty = item.quantity || item.qty || 1;
              const subtotal = item.subtotal || item.price * qty;

              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-cream-50/60 p-4 dark:bg-stone-800/50 border border-cream-100 dark:border-stone-800"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
                      }}
                      className="h-16 w-16 rounded-xl object-cover bg-white dark:bg-stone-700 shrink-0 border border-cream-200 dark:border-stone-700"
                    />
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold-600">
                        <Store className="h-3 w-3" /> {item.vendor_name || 'A_S Artisan Gifting'}
                      </span>
                      <h4 className="font-display text-sm font-bold text-wine-900 dark:text-white">
                        {item.name}
                      </h4>

                      {item.customization && (
                        <div className="mt-1 text-[11px] text-ink-700/70 dark:text-stone-400">
                          {item.customization.text && <span>Personalization: "{item.customization.text}"</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-xs text-ink-700/60 dark:text-stone-400 block">
                      Qty: {qty} × {formatPrice(item.price)}
                    </span>
                    <span className="font-display text-sm font-bold text-wine-900 dark:text-gold-300">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons & Customer Support Concierge */}
        <div className="rounded-[1.75rem] bg-wine-900 text-cream-50 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <h4 className="font-display text-base font-bold text-gold-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> 24/7 Gifting Concierge Support
            </h4>
            <p className="text-xs text-cream-100/70 mt-1 max-w-md">
              Need custom modifications, special delivery timing, or immediate assistance? Our dedicated gifting managers are available around the clock.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/customer/orders')}
              className="rounded-full bg-gold-500 hover:bg-gold-400 text-wine-950 px-5 py-2.5 text-xs font-extrabold shadow transition-all"
            >
              Track in Orders Dashboard
            </button>
            <Link
              to="/all-hampers"
              className="rounded-full border border-gold-400/40 text-cream-100 hover:bg-wine-800 px-5 py-2.5 text-xs font-bold transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
