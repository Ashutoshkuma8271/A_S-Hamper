import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  Heart,
  Home,
  MapPin,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Truck,
  UserRound,
  LogOut,
  Plus,
  X,
  Wallet,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { supabase, type OrderRow } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/cart';
import {
  getWalletBalance,
  getWalletTransactions,
  subscribeToRealtimeWallet,
  subscribeToRealtimeOrders,
  cancelCustomerOrder,
  submitReturnRequest,
  fetchAllReturnRequests,
  type WalletTransaction,
  type ReturnRequest,
} from '@/lib/orderSync';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import OrderTrackingTimeline from '@/components/OrderTrackingTimeline';
import AddressManager from '@/components/AddressManager';
import { toast } from 'react-hot-toast';
import { DashboardSkeleton } from '@/components/skeletons';

type Address = {
  id: string;
  label: string;
  address_line: string;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  is_default: boolean;
};

const quickLinks = [
  { icon: ShoppingBag, title: 'Browse hampers', text: 'Find a gift for every moment', to: '/all-hampers' },
  { icon: Truck, title: 'Track orders', text: 'Follow every delivery', to: '/customer/orders' },
  { icon: Wallet, title: 'Refund Wallet', text: 'Manage account balance & refunds', to: '/customer/wallet' },
  { icon: MapPin, title: 'Saved addresses', text: 'Make checkout effortless', to: '/customer/addresses' },
];

export default function CustomerDashboard() {
  const { session, profile, signOut } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addingAddress, setAddingAddress] = useState(false);
  const [address, setAddress] = useState({ label: 'Home', address_line: '', city: '', state: '', postal_code: '' });
  const [loadingData, setLoadingData] = useState(true);
  
  // Wallet & Returns state
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTxs, setWalletTxs] = useState<WalletTransaction[]>([]);
  const [userReturns, setUserReturns] = useState<ReturnRequest[]>([]);

  const refresh = async () => {
    if (!supabase || !session?.user?.id) {
      setLoadingData(false);
      return;
    }
    try {
      const [{ data: orderData }, { data: addressData }] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('customer_id', session.user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('customer_addresses')
          .select('*')
          .eq('user_id', session.user.id)
          .order('is_default', { ascending: false }),
      ]);
      setOrders((orderData || []) as OrderRow[]);
      setAddresses((addressData || []) as Address[]);

      const bal = await getWalletBalance(session.user.id);
      setWalletBalance(bal);

      const txs = await getWalletTransactions(session.user.id);
      setWalletTxs(txs);

      const rets = await fetchAllReturnRequests();
      setUserReturns(rets.filter((r) => r.customer_id === session.user.id));
    } finally {
      setLoadingData(false);
    }
  };


  useEffect(() => {
    void refresh();

    if (!session?.user?.id) return;

    // Realtime Subscriptions
    const unSubWallet = subscribeToRealtimeWallet(session.user.id, (newBal) => {
      setWalletBalance(newBal);
      void getWalletTransactions(session.user.id).then(setWalletTxs);
    });

    const unSubOrders = subscribeToRealtimeOrders(() => {
      void refresh();
    });

    return () => {
      unSubWallet();
      unSubOrders();
    };
  }, [session?.user?.id]);

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    await supabase.from('customer_addresses').insert({ ...address, is_default: addresses.length === 0 });
    setAddress({ label: 'Home', address_line: '', city: '', state: '', postal_code: '' });
    setAddingAddress(false);
    void refresh();
  }

  const section = location.pathname.split('/')[2] || 'overview';
  const title =
    section === 'orders'
      ? 'Your orders & tracking'
      : section === 'wallet'
      ? 'Refund Wallet & Account Balance'
      : section === 'addresses'
      ? 'Saved addresses'
      : section === 'wishlist'
      ? 'Your wishlist'
      : section === 'settings'
      ? 'Account settings'
      : 'Good to see you';

  const firstName = (profile?.full_name || session?.user?.user_metadata?.full_name || 'there').split(' ')[0];

  return (
    <main className="min-h-screen px-4 pb-20 pt-24 sm:px-7 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Dashboard Header Banner */}
        <div className="mb-8 overflow-hidden rounded-[2rem] bg-wine-700 p-7 text-cream-50 shadow-[0_30px_70px_-35px_rgba(87,34,44,.5)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-gold-300">
            Customer shopping &amp; order dashboard
          </p>
          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold">
                {title}, {firstName}.
              </h1>
              <p className="mt-3 max-w-xl text-cream-200/85 text-xs sm:text-sm">
                Everything for thoughtful gifting, live order tracking, and refund wallet management in one place.
              </p>
            </div>
            <Link
              to="/all-hampers"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-5 py-3 text-sm font-semibold text-wine-800 hover:bg-gold-300 transition-all shrink-0"
            >
              Browse hampers <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[235px_1fr]">
          {/* Navigation Sidebar */}
          <aside className="rounded-3xl bg-cream-50 p-3 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700">
            <nav className="grid gap-1">
              {[
                ['overview', Home, 'Overview'],
                ['orders', Package, 'Orders & tracking'],
                ['wallet', Wallet, 'Refund Wallet'],
                ['wishlist', Heart, 'Wishlist'],
                ['addresses', MapPin, 'Saved addresses'],
                ['settings', Settings, 'Settings'],
              ].map(([key, Icon, label]) => (
                <Link
                  key={key as string}
                  to={key === 'overview' ? '/customer' : `/customer/${key}`}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    section === key
                      ? 'bg-wine-600 text-cream-50 shadow-sm'
                      : 'text-ink-700/70 hover:bg-cream-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label as string}
                </Link>
              ))}
              <button
                onClick={() => void signOut()}
                className="mt-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-wine-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <section className="min-w-0">
            {loadingData ? (
              <DashboardSkeleton />
            ) : section === 'addresses' ? (
              <div className="rounded-3xl bg-cream-50 p-6 sm:p-8 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700 font-sans shadow-sm">
                <AddressManager userId={session?.user?.id} />
              </div>
            ) : section === 'orders' ? (

              <OrdersTimeline
                orders={orders}
                returns={userReturns}
                onRefresh={refresh}
                userId={session?.user?.id || ''}
              />
            ) : section === 'wallet' ? (
              <WalletSection
                balance={walletBalance}
                transactions={walletTxs}
              />
            ) : section === 'wishlist' ? (
              <Empty
                icon={Heart}
                title="Your wishlist is waiting"
                text="Save hampers you love and return whenever inspiration strikes."
                action="Explore hampers"
              />
            ) : section === 'settings' ? (
              <SettingsPanel />
            ) : (
              <Overview
                orders={orders}
                addresses={addresses}
                walletBalance={walletBalance}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

// --- Overview Sub-Component ---
function Overview({
  orders,
  addresses,
  walletBalance,
}: {
  orders: OrderRow[];
  addresses: Address[];
  walletBalance: number;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map(({ icon: Icon, title, text, to }) => (
          <Link
            key={title}
            to={to}
            className="group rounded-3xl bg-cream-50 p-5 ring-1 ring-cream-200 transition hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800 dark:ring-gray-700"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gold-500/15 text-gold-600 dark:bg-gold-500/20 dark:text-gold-300">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-display text-lg font-semibold text-wine-700 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 text-xs text-ink-700/60 dark:text-gray-400">{text}</p>
          </Link>
        ))}
      </div>

      {/* Wallet Highlights Card */}
      <div className="rounded-3xl bg-gradient-to-r from-wine-900 via-wine-800 to-wine-900 p-6 text-cream-50 shadow-lg border border-gold-500/30 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
            Account Refund Wallet
          </span>
          <h3 className="text-3xl font-display font-bold mt-1 text-white">
            {formatPrice(walletBalance)}
          </h3>
          <p className="text-xs text-cream-200/80 mt-1">
            Available to spend instantly on future checkout orders.
          </p>
        </div>
        <Link
          to="/customer/wallet"
          className="rounded-full bg-gold-500 px-5 py-2.5 text-xs font-bold text-wine-950 hover:bg-gold-400 transition-colors shadow-sm"
        >
          View Wallet →
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <OrdersTimeline
          orders={orders.slice(0, 3)}
          returns={[]}
          onRefresh={() => {}}
          userId=""
          compact
        />
        <div className="rounded-3xl bg-cream-50 p-6 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-wine-700 dark:text-white">
              Delivery details
            </h2>
            <Link to="/customer/addresses" className="text-sm font-semibold text-wine-700 dark:text-gold-300">
              Manage
            </Link>
          </div>
          {addresses.length ? (
            <div className="mt-5 space-y-3">
              {addresses.slice(0, 2).map((a) => (
                <div key={a.id} className="rounded-2xl bg-cream-100/60 p-4 text-sm text-ink-700/70 dark:bg-gray-700/60 dark:text-gray-300">
                  <b className="text-wine-700 dark:text-white">{a.label}</b>
                  <p className="mt-1">
                    {a.address_line}, {a.city}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-ink-700/60 dark:text-gray-400">
              Add an address now for a quicker checkout.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Refund Wallet Section ---
function WalletSection({
  balance,
  transactions,
}: {
  balance: number;
  transactions: WalletTransaction[];
}) {
  return (
    <div className="space-y-6 font-sans">
      {/* Wallet Balance Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-wine-900 via-wine-800 to-wine-950 p-8 text-cream-50 shadow-xl border border-gold-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3.5 py-1 text-xs font-semibold text-gold-400 uppercase tracking-widest border border-gold-400/30">
              <Wallet className="h-3.5 w-3.5" /> Customer Refund Wallet
            </span>
            <p className="text-xs text-cream-200/70 mt-3">Current Available Balance</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mt-1">
              {formatPrice(balance)}
            </h2>
          </div>

          <div className="rounded-2xl bg-cream-50/10 backdrop-blur p-4 border border-cream-50/20 max-w-xs">
            <p className="text-xs text-gold-300 font-semibold">How to use your wallet balance:</p>
            <p className="text-[11px] text-cream-200/80 mt-1 leading-relaxed">
              Toggle "Use Refund Balance" during checkout. Applied balance will automatically deduct from total payable.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Log Table */}
      <div className="rounded-3xl bg-cream-50 p-6 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700">
        <h3 className="font-display text-xl font-semibold text-wine-700 dark:text-white mb-4">
          Transaction History Log
        </h3>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-ink-700/60 dark:text-gray-400">
            <Wallet className="mx-auto h-10 w-10 text-gold-500 mb-2 opacity-50" />
            <p className="text-sm font-medium">No wallet transactions recorded yet.</p>
            <p className="text-xs mt-1 text-ink-700/40">
              Refunds from cancelled or returned orders will automatically reflect here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cream-200 dark:border-gray-700 text-ink-700/60 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200/60 dark:divide-gray-700">
                {transactions.map((tx) => {
                  const isCredit = tx.type === 'refund' || tx.type === 'credit';
                  return (
                    <tr key={tx.id} className="hover:bg-cream-100/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3.5 font-mono text-wine-800 dark:text-gold-300 font-semibold">
                        {tx.transaction_id || tx.id}
                      </td>
                      <td className="py-3.5 text-ink-700/70 dark:text-gray-300">
                        {new Date(tx.created_at).toLocaleDateString('en-IN', {
                          dateStyle: 'medium',
                        })}
                      </td>
                      <td className="py-3.5 font-medium text-wine-900 dark:text-cream-100 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            isCredit
                              ? 'bg-sage-500/15 text-sage-600 dark:bg-sage-500/30 dark:text-sage-300'
                              : 'bg-wine-600/15 text-wine-700 dark:bg-wine-600/30 dark:text-wine-300'
                          }`}
                        >
                          {isCredit ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3.5 text-right font-bold text-sm ${isCredit ? 'text-sage-600 dark:text-sage-400' : 'text-wine-700 dark:text-red-400'}`}>
                        {isCredit ? '+' : '-'}{formatPrice(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Orders & Tracking Section with Visual Timeline ---
function OrdersTimeline({
  orders,
  returns,
  onRefresh,
  userId,
  compact = false,
}: {
  orders: OrderRow[];
  returns: ReturnRequest[];
  onRefresh: () => void;
  userId: string;
  compact?: boolean;
}) {
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<any | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderRow | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    try {
      const ok = await cancelCustomerOrder(orderToCancel.id, userId, 'Customer requested cancellation from dashboard');
      if (ok) {
        toast.success(`Order #${orderToCancel.id.slice(0, 8).toUpperCase()} cancelled. Refund credited to wallet.`);
        onRefresh();
      } else {
        toast.error('Could not cancel order. Please contact customer support.');
      }
    } catch (err) {
      toast.error('Cancellation failed');
    } finally {
      setIsCancelling(false);
      setOrderToCancel(null);
    }
  };

  return (
    <div className="rounded-3xl bg-cream-50 p-6 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700 font-sans">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-wine-700 dark:text-white">
            {compact ? 'Recent orders' : 'Orders & Tracking Pipeline'}
          </h2>
          {!compact && (
            <p className="text-xs text-ink-700/60 dark:text-gray-400 mt-0.5">
              Live visual status timeline, real-time database state, cancellations &amp; returns.
            </p>
          )}
        </div>
        {compact && (
          <Link to="/customer/orders" className="text-sm font-semibold text-wine-700 dark:text-gold-300">
            View all
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="mt-5 text-sm text-ink-700/60 dark:text-gray-400 py-6 text-center">
          No orders yet. Your gift story starts with a beautiful hamper.
        </p>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => {
            const isDelivered = (o.status || '').toLowerCase() === 'delivered';
            const canCancel = ['new', 'placed', 'pending'].includes((o.status || '').toLowerCase());
            const hasReturnReq = returns.some((r) => r.order_id === o.id);

            return (
              <div
                key={o.id}
                className="rounded-2xl bg-white dark:bg-gray-900 p-5 ring-1 ring-cream-200/80 dark:ring-gray-700 shadow-sm space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream-200 dark:border-gray-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-wine-700 dark:text-gold-300">
                      Order #{o.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs text-ink-700/60 dark:text-gray-400 ml-3">
                      {new Date(o.created_at).toLocaleDateString('en-IN', {
                        dateStyle: 'medium',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-wine-800 dark:text-white text-sm">
                      {formatPrice(o.total)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        (o.status || '').toLowerCase().includes('cancel')
                          ? 'bg-red-500/15 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                          : isDelivered
                          ? 'bg-sage-500/15 text-sage-600 dark:bg-sage-950/40 dark:text-sage-400'
                          : 'bg-gold-500/15 text-gold-600 dark:bg-gold-500/30 dark:text-gold-300'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {(o.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="h-8 w-8 rounded-lg object-cover" />
                        )}
                        <span className="font-medium text-wine-900 dark:text-cream-100">{item.name}</span>
                        <span className="text-ink-700/50">x{item.qty || item.quantity || 1}</span>
                      </div>
                      <span className="font-semibold text-wine-700 dark:text-gold-300">
                        {formatPrice((item.price || 0) * (item.qty || item.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Real-time Order Tracking Pipeline Stepper */}
                <div className="pt-2 border-t border-cream-100 dark:border-gray-800">
                  <OrderTrackingTimeline
                    status={o.status}
                    orderNumber={o.id.slice(0, 8).toUpperCase()}
                    compact={compact}
                  />
                </div>

                {/* Actions */}
                {!compact && (
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-cream-200 dark:border-gray-800">
                    {canCancel && (
                      <button
                        onClick={() => setOrderToCancel(o)}
                        className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}

                    {isDelivered && !hasReturnReq && (
                      <button
                        onClick={() => setSelectedReturnOrder(o)}
                        className="inline-flex items-center gap-1 rounded-full bg-wine-600 px-4 py-1.5 text-xs font-semibold text-cream-50 hover:bg-wine-700 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" /> Return Product
                      </button>
                    )}

                    {hasReturnReq && (
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        ✓ Return Request Active
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {selectedReturnOrder && (
        <ReturnModal
          order={selectedReturnOrder}
          onClose={() => setSelectedReturnOrder(null)}
          onSubmitted={onRefresh}
          userId={userId}
        />
      )}

      {/* Confirmation Dialog for Order Cancellation */}
      <ConfirmationDialog
        isOpen={!!orderToCancel}
        title="Cancel This Order?"
        message={`Are you sure you want to cancel Order #${orderToCancel?.id.slice(0, 8).toUpperCase()}? The total amount of ${formatPrice(orderToCancel?.total || 0)} will be refunded instantly to your Customer Refund Wallet.`}
        confirmText="Cancel Order"
        cancelText="Keep Order"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={confirmCancelOrder}
        onCancel={() => setOrderToCancel(null)}
      />
    </div>
  );
}

// --- Product Return Modal Component ---
function ReturnModal({
  order,
  onClose,
  onSubmitted,
  userId,
}: {
  order: OrderRow;
  onClose: () => void;
  onSubmitted: () => void;
  userId: string;
}) {
  const [reason, setReason] = useState('Damaged or Defective Item');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const firstItem = order.items?.[0] || { name: 'Hamper Item', price: order.total };

    await submitReturnRequest({
      orderId: order.id,
      customerId: userId,
      customerName: order.customer_name,
      customerEmail: order.customer_email || undefined,
      customerPhone: order.customer_phone || undefined,
      productId: (firstItem as any).product_id || 'prod-1',
      productName: firstItem.name,
      productImage: (firstItem as any).image,
      vendorId: (firstItem as any).vendor_id,
      quantity: firstItem.qty || 1,
      amount: order.total,
      reason: reason,
      description: description,
    });

    setSubmitting(false);
    onSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in font-sans" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl ring-1 ring-cream-200 dark:ring-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-wine-800 dark:text-white">
            Request Product Return
          </h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full grid place-items-center hover:bg-cream-100 dark:hover:bg-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-ink-700/70 dark:text-gray-300 font-semibold mb-1">Select Return Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-2xl border border-cream-300 bg-cream-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-3 text-xs outline-none"
            >
              <option value="Damaged or Defective Item">Damaged or Defective Item</option>
              <option value="Wrong Item Delivered">Wrong Item Delivered</option>
              <option value="Quality Not Satisfactory">Quality Not Satisfactory</option>
              <option value="Delayed Delivery">Delayed Delivery</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-ink-700/70 dark:text-gray-300 font-semibold mb-1">Detailed Explanation</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue with your item..."
              className="w-full rounded-2xl border border-cream-300 bg-cream-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-3 text-xs outline-none"
            />
          </div>

          <div className="rounded-2xl bg-gold-500/10 border border-gold-500/30 p-3 text-[11px] text-wine-900 dark:text-gold-300">
            ✓ Approved refunds will credit <span className="font-bold">{formatPrice(order.total)}</span> directly to your Refund Wallet Balance.
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-wine-600 py-3 text-xs font-bold text-white hover:bg-wine-700 transition-colors shadow-md disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SettingsPanel() {
  const { session, profile } = useAuth();
  return (
    <div className="rounded-3xl bg-cream-50 p-6 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700 font-sans">
      <h2 className="font-display text-xl font-semibold text-wine-700 dark:text-white">
        Profile &amp; settings
      </h2>
      <div className="mt-5 space-y-3 text-sm">
        <p className="rounded-2xl bg-cream-100/60 p-4 dark:bg-gray-700/60 dark:text-gray-200">
          <b className="text-wine-700 dark:text-white">Name</b>
          <span className="float-right text-ink-700/65 dark:text-gray-300">{profile?.full_name || 'Not set'}</span>
        </p>
        <p className="rounded-2xl bg-cream-100/60 p-4 dark:bg-gray-700/60 dark:text-gray-200">
          <b className="text-wine-700 dark:text-white">Email</b>
          <span className="float-right text-ink-700/65 dark:text-gray-300">{session?.user.email}</span>
        </p>
        <Link to="/profile" className="inline-flex items-center gap-2 font-semibold text-wine-700 dark:text-gold-300">
          Edit account details <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Empty({ icon: Icon, title, text, action }: { icon: any; title: string; text: string; action: string }) {
  return (
    <div className="rounded-3xl bg-cream-50 p-12 text-center ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700 font-sans">
      <Icon className="mx-auto h-9 w-9 text-gold-500" />
      <h2 className="mt-4 font-display text-2xl font-semibold text-wine-700 dark:text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-700/60 dark:text-gray-400">{text}</p>
      <Link to="/all-hampers" className="mt-6 inline-flex rounded-full bg-wine-600 px-5 py-3 text-sm font-semibold text-white">
        {action}
      </Link>
    </div>
  );
}
