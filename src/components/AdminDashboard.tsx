import { useEffect, useState, useCallback } from 'react';
import { supabase, type Product, type OrderRow, type Profile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/cart';
import { VendorStore, type VendorHamper, type HamperItem } from '@/lib/vendorStore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { AdminSettings, BestSellersAdmin, CouponManagement, Customers, Inventory, Notifications, Reports, ResourceManager, ReviewManagement, SameDayDeliveryAdmin, AdminReturnsManager } from '@/components/AdminOperations';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import {
  Package, ShoppingBag, Plus, Pencil, Trash2, X, Loader2, Search, TrendingUp, Save, ShieldCheck, UserPlus, LogOut,
} from 'lucide-react';

const CATEGORIES = [
  'birthday', 'anniversary', 'wedding', 'baby-shower', 'corporate', 'festival', 'valentine', 'luxury',
];
const STATUSES: OrderRow['status'][] = ['new', 'packed', 'shipped', 'delivered', 'cancelled'];

type Tab = 'overview' | 'best-sellers' | 'same-day-delivery' | 'vendor-hampers' | 'orders' | 'returns' | 'products' | 'categories' | 'customers' | 'coupons' | 'inventory' | 'reviews' | 'banners' | 'blogs' | 'notifications' | 'reports' | 'settings';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>(() => {
    try {
      const saved = localStorage.getItem('as_hamper_admin_active_tab') as Tab | null;
      if (saved) return saved;
    } catch (e) {
      // ignore
    }
    return 'overview';
  });

  useEffect(() => {
    try {
      localStorage.setItem('as_hamper_admin_active_tab', tab);
    } catch (e) {
      // ignore
    }
  }, [tab]);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
  }, []);

  const loadOrders = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders((data as OrderRow[]) || []);
  }, []);

  const loadCustomerCount = useCallback(async () => {
    if (!supabase) return;
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin');
    setCustomerCount(count || 0);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    Promise.all([loadProducts(), loadOrders(), loadCustomerCount()]).finally(() => setLoading(false));

    // Real-time live synchronization across orders, products, and customer profiles
    const channel = supabase
      .channel('admin_dashboard_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as OrderRow;
            toast.success(`🔔 New Order #${(newOrder.id || '').slice(0, 8)} received!`, {
              id: `admin-new-order-${newOrder.id}`,
            });
          }
          loadOrders();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          loadProducts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          loadCustomerCount();
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [loadProducts, loadOrders, loadCustomerCount]);

  const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const newCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="mx-auto my-8 max-w-7xl rounded-3xl bg-cream-50 ring-1 ring-cream-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 border-b border-cream-200 bg-cream-100/40">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center h-12 w-12 rounded-full bg-wine-700 text-cream-50 overflow-hidden ring-2 ring-gold-400/40">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Admin Avatar" className="h-full w-full object-cover" />
            ) : (
              <ShoppingBag className="h-5 w-5 text-gold-300" />
            )}
          </span>
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-wine-700">
              Admin dashboard
            </h3>
            <p className="text-sm text-ink-700/60">
              {profile?.business_name || 'Admin'} · manage products, hampers & orders
            </p>
          </div>
        </div>
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-cream-100 p-1 [scrollbar-width:thin]">
          {(['overview', 'best-sellers', 'same-day-delivery', 'vendor-hampers', 'orders', 'returns', 'products', 'categories', 'customers', 'coupons', 'inventory', 'reviews', 'banners', 'blogs', 'notifications', 'reports', 'settings'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all whitespace-nowrap ${
                tab === t ? 'bg-wine-600 text-cream-50 shadow-sm' : 'text-ink-700/70 hover:text-wine-700'
              }`}
            >
              {t === 'vendor-hampers' ? 'Vendor Hampers' : t === 'best-sellers' ? 'Best Sellers' : t === 'same-day-delivery' ? 'Same-Day Delivery' : t}
            </button>
          ))}
        </div>
        <button onClick={() => void signOut()} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-wine-600/25 px-4 py-2 text-sm font-semibold text-wine-700 transition hover:bg-wine-600 hover:text-cream-50"><LogOut className="h-4 w-4" />Log out</button>
      </div>

      <div className="p-6 sm:p-8">
        {loading ? (
          <LoadingSkeleton type="admin-dashboard" />
        ) : (
          <>
            {tab === 'overview' && <Overview products={products} orders={orders} revenue={revenue} newCount={newCount} customerCount={customerCount} />}
            {tab === 'best-sellers' && <BestSellersAdmin products={products} onChanged={loadProducts} />}
            {tab === 'same-day-delivery' && <SameDayDeliveryAdmin />}
            {tab === 'vendor-hampers' && <AdminVendorHampers />}
            {tab === 'products' && <Products products={products} onChanged={loadProducts} />}
            {tab === 'orders' && <Orders orders={orders} onChanged={loadOrders} />}
            {tab === 'returns' && <AdminReturnsManager />}
            {tab === 'categories' && <ResourceManager kind="category" />}
            {tab === 'customers' && <Customers />}
            {tab === 'coupons' && <CouponManagement />}
            {tab === 'inventory' && <Inventory products={products} onChanged={loadProducts} />}
            {tab === 'reviews' && <ReviewManagement />}
            {tab === 'banners' && <ResourceManager kind="banner" />}
            {tab === 'blogs' && <ResourceManager kind="blog" />}
            {tab === 'notifications' && <Notifications />}
            {tab === 'reports' && <Reports products={products} orders={orders} />}
            {tab === 'settings' && <AdminSettings />}
          </>
        )}
      </div>
    </div>
  );
}

function AdminAccounts({ accounts, currentAdminId, onChanged }: { accounts: Profile[]; currentAdminId?: string; onChanged: () => void }) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const pending = accounts.filter((account) => account.admin_requested && account.role !== 'admin');
  const admins = accounts.filter((account) => account.role === 'admin');

  async function setRole(account: Profile, role: 'admin' | 'user') {
    if (!supabase) return;
    setSavingId(account.id);
    await supabase.from('profiles').update({ role, admin_requested: false }).eq('id', account.id);
    setSavingId(null);
    onChanged();
  }

  return <div>
    <div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-wine-600/10 text-wine-700"><ShieldCheck className="h-5 w-5" /></span><div><h4 className="font-display text-lg font-semibold text-wine-700">Admin accounts</h4><p className="text-sm text-ink-700/60">Approve requests to give trusted team members access.</p></div></div>
    <h5 className="mb-3 text-sm font-semibold text-ink-700">Pending requests ({pending.length})</h5>
    {pending.length === 0 ? <p className="rounded-2xl bg-cream-100/40 p-4 text-sm text-ink-700/60">No admin requests waiting for approval.</p> : <div className="space-y-3">{pending.map((account) => <div key={account.id} className="flex flex-col gap-3 rounded-2xl bg-cream-100/40 p-4 ring-1 ring-cream-200 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-wine-700">{account.full_name || 'New administrator'}</p><p className="text-xs text-ink-700/55">Requested {new Date(account.created_at).toLocaleDateString('en-IN')}</p></div><button disabled={savingId === account.id} onClick={() => void setRole(account, 'admin')} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-wine-600 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-wine-700 disabled:opacity-60"><UserPlus className="h-4 w-4" />Approve admin</button></div>)}</div>}
    <h5 className="mb-3 mt-8 text-sm font-semibold text-ink-700">Active administrators ({admins.length})</h5>
    <div className="space-y-3">{admins.map((account) => <div key={account.id} className="flex flex-col gap-3 rounded-2xl bg-cream-100/40 p-4 ring-1 ring-cream-200 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-wine-700">{account.full_name || account.business_name || 'Administrator'} {account.id === currentAdminId && <span className="ml-1 text-xs font-normal text-ink-700/55">(you)</span>}</p><p className="text-xs text-ink-700/55">Administrator since {new Date(account.created_at).toLocaleDateString('en-IN')}</p></div>{account.id !== currentAdminId && <button disabled={savingId === account.id} onClick={() => void setRole(account, 'user')} className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60">Remove access</button>}</div>)}</div>
  </div>;
}

function Overview({
  products, orders, revenue, newCount, customerCount,
}: {
  products: Product[];
  orders: OrderRow[];
  revenue: number;
  newCount: number;
  customerCount: number;
}) {
  const stats = [
    { label: 'Total products', value: products.length, icon: <Package className="h-5 w-5" />, tone: 'wine' },
    { label: 'Total orders', value: orders.length, icon: <ShoppingBag className="h-5 w-5" />, tone: 'gold' },
    { label: 'Total customers', value: customerCount, icon: <ShieldCheck className="h-5 w-5" />, tone: 'sage' },
    { label: 'Revenue', value: formatPrice(revenue), icon: <TrendingUp className="h-5 w-5" />, tone: 'wine' },
  ];
  const toneMap: Record<string, string> = {
    wine: 'bg-wine-600/10 text-wine-700',
    gold: 'bg-gold-500/15 text-gold-600',
    sage: 'bg-sage-500/15 text-sage-500',
  };
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-cream-100/50 ring-1 ring-cream-200 p-5">
            <span className={`grid place-items-center h-10 w-10 rounded-full ${toneMap[s.tone]}`}>
              {s.icon}
            </span>
            <p className="mt-4 font-display text-2xl font-semibold text-wine-800">{s.value}</p>
            <p className="text-sm text-ink-700/60">{s.label}</p>
          </div>
        ))}
      </div>
      <h4 className="mt-8 mb-4 font-display text-lg font-semibold text-wine-700">Recent orders</h4>
      {orders.length === 0 ? (
        <p className="text-sm text-ink-700/50">No orders yet.</p>
      ) : (
        <div className="space-y-2">
          {orders.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-xl bg-cream-100/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink-800">{o.customer_name}</p>
                <p className="text-xs text-ink-700/50">{new Date(o.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                <span className="text-sm font-semibold text-wine-700">{formatPrice(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200"><h4 className="font-display text-lg font-semibold text-wine-700">Order summary</h4><div className="mt-5 grid grid-cols-3 gap-3 text-center"><Metric label="Pending" value={orders.filter(o => ['new','packed','shipped'].includes(o.status)).length} /><Metric label="Completed" value={orders.filter(o => o.status === 'delivered').length} /><Metric label="Cancelled" value={orders.filter(o => o.status === 'cancelled').length} /></div></div>
        <div className="rounded-3xl bg-cream-100/50 p-6 ring-1 ring-cream-200"><h4 className="font-display text-lg font-semibold text-wine-700">Revenue chart</h4><div className="mt-5 flex h-28 items-end gap-2">{[0,1,2,3,4,5,6].map(day => { const amount=orders.filter(o=>new Date(o.created_at).getDay()===day&&o.status!=='cancelled').reduce((sum,o)=>sum+o.total,0); return <div key={day} className="flex-1 rounded-t-md bg-wine-600" style={{height:`${revenue ? Math.max(8,(amount/revenue)*100) : 8}%`}} title={formatPrice(amount)} />; })}</div><p className="mt-3 text-sm text-ink-700/60">Sales analytics · {formatPrice(revenue)} total revenue</p></div>
      </div>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl bg-cream-50 p-3"><p className="font-display text-xl font-semibold text-wine-700">{value}</p><p className="mt-1 text-xs text-ink-700/60">{label}</p></div>; }

function Products({ products, onChanged }: { products: Product[]; onChanged: () => void }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDeleteProduct() {
    if (!productToDelete || !supabase) return;
    setDeleting(true);
    await supabase.from('products').delete().eq('id', productToDelete.id);
    setDeleting(false);
    setProductToDelete(null);
    onChanged();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-display text-lg font-semibold text-wine-700">
          Products ({products.length})
        </h4>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-wine-600 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-wine-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl bg-cream-100/40 ring-1 ring-cream-200 overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h5 className="font-display font-semibold text-wine-700 text-sm leading-snug">{p.name}</h5>
                <span className="shrink-0 text-sm font-semibold text-wine-800">{formatPrice(p.price)}</span>
              </div>
              {p.is_offer && <p className="mt-2 inline-flex rounded-full bg-gold-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-600">Offer{p.original_price ? ` · was ${formatPrice(p.original_price)}` : ''}</p>}
              <p className="mt-1 text-xs text-ink-700/55 capitalize">{p.category} · {p.stock} in stock</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setEditing(p)}
                  className="inline-flex items-center gap-1 rounded-full border border-cream-300 px-3 py-1.5 text-xs font-medium text-ink-700/70 hover:bg-cream-100 transition-colors"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => setProductToDelete(p)}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(editing || creating) && (
        <ProductModal
          product={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            onChanged();
          }}
        />
      )}

      {/* Confirmation Dialog for Deleting Product */}
      <ConfirmationDialog
        isOpen={!!productToDelete}
        title="Delete Product?"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
        itemName={productToDelete?.name}
        itemImage={productToDelete?.image}
        isLoading={deleting}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}

function ProductModal({
  product, onClose, onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    category: product?.category || 'luxury',
    price: product?.price?.toString() || '',
    image: product?.image || '',
    description: product?.description || '',
    tag: product?.tag || '',
    stock: product?.stock?.toString() || '0',
    is_offer: product?.is_offer || false,
    original_price: product?.original_price?.toString() || '',
    is_featured: product?.is_featured || false,
    is_best_seller: product?.is_best_seller || false,
    personalization_options: product?.personalization_options?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File) {
    setUploading(true);
    setError(null);
    try {
      if (supabase) {
        const extension = file.name.split('.').pop() || 'jpg';
        const path = `${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, { upsert: false, contentType: file.type });
        if (!uploadError) {
          const publicUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
          setForm((current) => ({ ...current, image: publicUrl }));
          setUploading(false);
          return;
        }
      }
      // Resilient Cloudinary CDN upload fallback (delivers in auto WebP/AVIF format)
      const cloudRes = await uploadToCloudinary(file);
      if (cloudRes?.secure_url || cloudRes?.url) {
        setForm((current) => ({ ...current, image: cloudRes.secure_url || cloudRes.url }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    if (!supabase) {
      setError('Supabase not configured');
      setSaving(false);
      return;
    }
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      category: form.category,
      price: Number(form.price) || 0,
      image: form.image,
      description: form.description,
      tag: form.tag || null,
      stock: Number(form.stock) || 0,
      is_offer: form.is_offer,
      original_price: form.is_offer && form.original_price ? Number(form.original_price) : null,
      is_featured: form.is_featured,
      is_best_seller: form.is_best_seller,
      personalization_options: form.personalization_options.split(',').map((item) => item.trim()).filter(Boolean),
    };
    const { error } = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink-900/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-cream-50 ring-1 ring-cream-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h4 className="font-display text-xl font-semibold text-wine-700">
            {product ? 'Edit product' : 'Add product'}
          </h4>
          <button onClick={onClose} className="grid place-items-center h-9 w-9 rounded-full hover:bg-cream-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-700/60">Name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-700/60">Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-700/60">Price (₹)</span>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-700/60">Image URL</span>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" placeholder="https://..." />
          </label>
          <label className="block rounded-2xl border border-dashed border-cream-300 p-4 text-sm text-ink-700/70">
            <span className="font-medium text-wine-700">Upload product image</span>
            <input type="file" accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadImage(file); }} className="mt-2 block w-full text-xs" />
            <span className="mt-1 block text-xs text-ink-700/50">{uploading ? 'Uploading image…' : 'Uploads to the secure product-images bucket.'}</span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-700/60">Description</span>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input resize-none" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-700/60">Tag</span>
              <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} className="input" placeholder="Best seller" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-700/60">Stock</span>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" />
            </label>
          </div>
          <div className="rounded-2xl border border-cream-200 bg-cream-100/40 p-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-wine-700">
              <input type="checkbox" checked={form.is_offer} onChange={(e) => setForm({ ...form, is_offer: e.target.checked })} className="h-4 w-4 rounded border-cream-300 accent-wine-600" />
              Show this product in Offers &amp; deals
            </label>
            {form.is_offer && <label className="mt-4 block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-700/60">Original price (₹)</span><input type="number" min="1" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="input" placeholder="Price before the offer" /><span className="mt-1.5 block text-xs text-ink-700/50">Must be higher than the sale price.</span></label>}
          </div>
          <div className="rounded-2xl border border-cream-200 bg-cream-100/40 p-4 space-y-3">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-wine-700"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4 accent-wine-600" />Featured product</label>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-wine-700"><input type="checkbox" checked={form.is_best_seller} onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })} className="h-4 w-4 accent-wine-600" />Best seller</label>
            <input value={form.personalization_options} onChange={(e) => setForm({ ...form, personalization_options: e.target.value })} className="input" placeholder="Personalization options, comma-separated" />
          </div>
          {error && <p className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-wine-600 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-wine-700 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {product ? 'Save changes' : 'Add product'}
            </button>
            <button onClick={onClose} className="rounded-full border border-cream-300 px-6 py-3 text-sm font-medium text-ink-700/70 hover:bg-cream-100 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { toast } from 'react-hot-toast';

function Orders({ orders, onChanged }: { orders: OrderRow[]; onChanged: () => void }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderRow['status']>('all');

  const filtered = orders.filter(
    (o) =>
      (o.customer_name.toLowerCase().includes(query.toLowerCase()) ||
      (o.customer_email || '').toLowerCase().includes(query.toLowerCase()) ||
      (o.customer_phone || '').includes(query) ||
      o.id.toLowerCase().includes(query.toLowerCase())) &&
      (statusFilter === 'all' || o.status === statusFilter)
  );

  async function updateStatus(id: string, status: OrderRow['status'], orderNum?: string) {
    if (supabase) {
      try {
        await supabase.from('orders').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('Supabase order update warning:', err);
      }
    }

    // Sync to local storage for guest/offline resilience
    try {
      const targetNum = orderNum || id.replace('ord-', '');
      const key = `as_hamper_order_${targetNum}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.status = status;
        localStorage.setItem(key, JSON.stringify(parsed));
      }
      const latest = localStorage.getItem('as_hamper_latest_order');
      if (latest) {
        const parsed = JSON.parse(latest);
        if (parsed.order_number === targetNum || parsed.id === id) {
          parsed.status = status;
          localStorage.setItem('as_hamper_latest_order', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.error('Error updating order status in localStorage:', e);
    }

    toast.success(`Order status updated to ${status.toUpperCase()}!`, {
      id: `order-status-${id}`,
    });
    onChanged();
  }

  const trackingSteps: { id: OrderRow['status']; label: string; icon: string }[] = [
    { id: 'new', label: 'Order Placed', icon: '🛒' },
    { id: 'packed', label: 'Packed & Ready', icon: '📦' },
    { id: 'shipped', label: 'In Transit / Shipped', icon: '🚚' },
    { id: 'delivered', label: 'Delivered', icon: '🏁' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-5 gap-4">
        <div>
          <h4 className="font-display text-lg font-semibold text-wine-700">Orders Management ({orders.length})</h4>
          <p className="text-xs text-ink-700/60">Track order delivery lifecycle from placement to delivery.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 h-10 w-56 rounded-full border border-cream-300 bg-cream-50 px-3 text-ink-700/60 focus-within:border-gold-500">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone or #ID..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-700/40"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-10 rounded-full border border-cream-300 bg-cream-50 px-4 text-sm text-ink-700 outline-none"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-cream-100/50 p-8 text-center text-sm text-ink-700/60">
          No orders found matching your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => {
            const currentStepIdx = trackingSteps.findIndex((st) => st.id === o.status);

            return (
              <div
                key={o.id}
                className="rounded-3xl bg-cream-100/40 ring-1 ring-cream-200 p-5 sm:p-6 space-y-4"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-wine-800 text-base">
                        Order #{o.id.slice(0, 8)}
                      </h4>
                      <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-700">
                        {o.customer_name}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-700/65 font-medium">
                      {o.customer_email || 'guest@ashamper.com'} · Mobile: +91 {o.customer_phone || '9876543210'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Placed on: {new Date(o.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {o.address && (
                      <p className="mt-1 text-xs text-ink-700/70 bg-white/70 p-2 rounded-xl border border-cream-200 max-w-xl">
                        📍 <strong>Delivery Address:</strong> {o.address}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-display text-xl font-bold text-wine-800">
                      {formatPrice(o.total)}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                </div>

                {/* E-Commerce Order Tracking Lifecycle Stepper */}
                {o.status !== 'cancelled' ? (
                  <div className="py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-700/60 mb-2">
                      Order Fulfillment Lifecycle Tracker
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {trackingSteps.map((step, idx) => {
                        const isDone = currentStepIdx >= idx;
                        const isCurrent = o.status === step.id;

                        return (
                          <button
                            key={step.id}
                            onClick={() => updateStatus(o.id, step.id)}
                            className={`flex flex-col items-center gap-1 rounded-2xl p-2.5 text-center text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-wine-600 text-white shadow-md ring-2 ring-wine-600/40'
                                : isDone
                                ? 'bg-sage-500/15 text-sage-800 border border-sage-500/30'
                                : 'bg-cream-50 text-gray-400 border border-cream-200 hover:border-wine-600/40 hover:text-wine-700'
                            }`}
                          >
                            <span className="text-base">{step.icon}</span>
                            <span className="text-[11px]">{step.label}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-extrabold uppercase tracking-widest text-gold-300">
                                Current State
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-red-50 p-3 text-xs text-red-700 font-semibold border border-red-200">
                    ❌ This order has been CANCELLED.
                  </div>
                )}

                {/* Ordered Items List */}
                {o.items.length > 0 && (
                  <div className="pt-2 border-t border-cream-200">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-700/60 mb-2">
                      Purchased Items ({o.items.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {o.items.map((it, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-medium text-ink-800 border border-cream-200 shadow-sm"
                        >
                          {(it as any).image && (
                            <img
                              src={(it as any).image}
                              alt={it.name}
                              className="h-7 w-7 rounded-lg object-cover"
                            />
                          )}
                          <span>
                            <strong>{it.name}</strong> × {it.qty} ({formatPrice(it.price)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Status Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-cream-200">
                  <span className="text-xs font-bold text-ink-700/60">Change Status:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(o.id, s)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all ${
                          o.status === s
                            ? 'bg-wine-600 text-white shadow'
                            : 'bg-white text-ink-700 border border-cream-300 hover:bg-cream-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderRow['status'] }) {
  const map: Record<OrderRow['status'], string> = {
    new: 'bg-gold-500/15 text-gold-700 border border-gold-500/30',
    packed: 'bg-wine-600/10 text-wine-800 border border-wine-600/30',
    shipped: 'bg-sage-500/15 text-sage-800 border border-sage-500/30',
    delivered: 'bg-sage-500/25 text-sage-800 border border-sage-500/40 font-bold',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ${map[status]}`}>
      {status === 'new' ? '🛒 Order Placed' : status === 'packed' ? '📦 Packed' : status === 'shipped' ? '🚚 Shipped' : status === 'delivered' ? '🏁 Delivered' : '❌ Cancelled'}
    </span>
  );
}

function AdminVendorHampers() {
  const [settings, setSettings] = useState(VendorStore.getAdminSettings());
  const [hampers, setHampers] = useState(VendorStore.getAllVendorHampers());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [hamperToDelete, setHamperToDelete] = useState<VendorHamper | null>(null);

  const refresh = () => setHampers(VendorStore.getAllVendorHampers());

  const toggleApprovalSetting = () => {
    const updated = { ...settings, require_hamper_approval: !settings.require_hamper_approval };
    VendorStore.saveAdminSettings(updated);
    setSettings(updated);
  };

  const handleApprove = (id: string) => {
    VendorStore.updateHamperStatus(id, 'approved');
    refresh();
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) return;
    VendorStore.updateHamperStatus(id, 'rejected', rejectReason);
    setRejectingId(null);
    setRejectReason('');
    refresh();
  };

  const confirmDeleteHamper = () => {
    if (!hamperToDelete) return;
    VendorStore.deleteVendorHamper(hamperToDelete.id, 'admin');
    setHamperToDelete(null);
    refresh();
  };

  const filteredHampers = hampers.filter(
    (h: VendorHamper) => filter === 'all' || h.approval_status === filter
  );

  const pendingCount = hampers.filter((h: VendorHamper) => h.approval_status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header & Approval Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-cream-100/50 p-5 ring-1 ring-cream-200">
        <div>
          <h4 className="font-display font-semibold text-wine-700 text-lg">
            Vendor Hampers & Approval Workflow
          </h4>
          <p className="text-xs text-ink-700/60 mt-0.5">
            Review vendor-submitted hampers, approve/reject listings & manage approval settings.
          </p>
        </div>

        <div className="rounded-xl bg-cream-50 p-3 ring-1 ring-cream-200 flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-wine-800 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.require_hamper_approval}
              onChange={toggleApprovalSetting}
              className="h-4 w-4 accent-wine-600 rounded cursor-pointer"
            />
            Require Admin Approval for Vendor Hampers
          </label>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-wine-600 text-cream-50'
                  : 'bg-cream-100 text-ink-700/70 hover:bg-cream-200'
              }`}
            >
              {f} {f === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
            </button>
          ))}
        </div>

        <span className="text-xs text-ink-700/50 font-medium">
          Total Vendor Hampers: {hampers.length}
        </span>
      </div>

      {/* Hampers List */}
      {filteredHampers.length === 0 ? (
        <p className="text-xs text-ink-700/50 py-8 text-center">No vendor hampers match this filter.</p>
      ) : (
        <div className="space-y-4">
          {filteredHampers.map((h: VendorHamper) => (
            <div
              key={h.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-cream-100/40 p-4 ring-1 ring-cream-200"
            >
              <div className="flex items-center gap-4">
                <img
                  src={h.thumbnail}
                  alt={h.name}
                  className="h-16 w-16 rounded-xl object-cover ring-1 ring-cream-300"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-display font-semibold text-wine-800 text-sm">{h.name}</h5>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        h.approval_status === 'approved'
                          ? 'bg-sage-500/20 text-sage-600'
                          : h.approval_status === 'pending'
                          ? 'bg-gold-500/20 text-gold-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {h.approval_status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-ink-700/60 mt-0.5">
                    Vendor: <strong className="text-wine-700">{h.vendor_name}</strong> ({h.vendor_shop_no || 'SHOP-100'}) · Price: {formatPrice(h.selling_price)}
                  </p>
                  <p className="text-[11px] text-ink-700/50">
                    Includes: {h.items.map((i: HamperItem) => i.name).join(', ')}
                  </p>
                  {h.rejection_reason && (
                    <p className="text-[11px] text-red-600 mt-1 italic">
                      Rejection Reason: {h.rejection_reason}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {h.approval_status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(h.id)}
                      className="rounded-full bg-sage-600 px-3.5 py-1.5 text-xs font-semibold text-cream-50 hover:bg-sage-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => setRejectingId(h.id)}
                      className="rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </>
                )}

                {h.approval_status === 'approved' && (
                  <button
                    onClick={() => VendorStore.updateHamperStatus(h.id, 'pending')}
                    className="rounded-full border border-cream-300 px-3 py-1 text-xs font-medium text-ink-700 hover:bg-cream-100"
                  >
                    Revoke Approval
                  </button>
                )}

                <button
                  onClick={() => setHamperToDelete(h)}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Deleting Vendor Hamper */}
      <ConfirmationDialog
        isOpen={!!hamperToDelete}
        title="Delete Vendor Hamper?"
        message={`Are you sure you want to permanently delete "${hamperToDelete?.name}" submitted by ${hamperToDelete?.vendor_name}?`}
        confirmText="Delete Hamper"
        cancelText="Cancel"
        variant="danger"
        itemName={hamperToDelete?.name}
        itemImage={hamperToDelete?.thumbnail}
        onConfirm={confirmDeleteHamper}
        onCancel={() => setHamperToDelete(null)}
      />

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-ink-900/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-cream-50 p-5 shadow-xl space-y-4">
            <h4 className="font-display font-semibold text-wine-800 text-base">Reject Vendor Hamper</h4>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason for vendor..."
              className="input text-xs resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleReject(rejectingId)}
                className="flex-1 rounded-full bg-red-600 py-2 text-xs font-semibold text-cream-50 hover:bg-red-700"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setRejectingId(null)}
                className="rounded-full border border-cream-300 px-4 py-2 text-xs font-medium text-ink-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

