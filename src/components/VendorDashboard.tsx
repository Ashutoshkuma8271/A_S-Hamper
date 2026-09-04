import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { subscribeToRealtimeOrders } from '@/lib/orderSync';
import { toast } from 'react-hot-toast';
import {
  VendorStore,
  HAMPER_CATEGORIES,
  type VendorProduct,
  type VendorHamper,
} from '@/lib/vendorStore';
import { formatPrice } from '@/cart';
import HamperBuilder from './HamperBuilder';
import HamperPreviewModal from './HamperPreviewModal';
import HamperDetailModal from './HamperDetailModal';
import ProfileSection from './ProfileSection';
import ConfirmationDialog from './ConfirmationDialog';
import {
  Store,
  Package,
  Layers,
  Sparkles,
  Gift,
  Upload,
  Tag,
  ShoppingBag,
  User,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  LogOut,
  Search,
  Check,
  X,
  FileText,
  Hash,
  Phone,
  Mail,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

type VendorTab =
  | 'overview'
  | 'my-products'
  | 'hamper-components'
  | 'create-hamper'
  | 'my-hampers'
  | 'upload-products'
  | 'categories'
  | 'orders'
  | 'profile';

export default function VendorDashboard({
  onSignOut,
}: {
  onSignOut?: () => void;
}) {
  const { profile, session, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<VendorTab>(() => {
    try {
      const saved = localStorage.getItem('as_hamper_vendor_active_tab') as VendorTab | null;
      if (saved) return saved;
    } catch (e) {
      // ignore
    }
    return 'overview';
  });

  useEffect(() => {
    try {
      localStorage.setItem('as_hamper_vendor_active_tab', activeTab);
    } catch (e) {
      // ignore
    }
  }, [activeTab]);

  const vendorId = profile?.id || session?.user?.id || 'v-demo-01';
  const vendorName = profile?.business_name || 'A_S Artisan Gifting';
  const vendorShopNo = profile?.shop_no || 'SHOP-0142';

  // Products and Hampers state
  const [products, setProducts] = useState<VendorProduct[]>(() =>
    VendorStore.getProductsByVendor(vendorId)
  );
  const [hampers, setHampers] = useState<VendorHamper[]>(() =>
    VendorStore.getHampersByVendor(vendorId)
  );

  // Edit states
  const [editingHamper, setEditingHamper] = useState<VendorHamper | null>(null);
  const [previewHamper, setPreviewHamper] = useState<VendorHamper | null>(null);
  const [customerModalHamper, setCustomerModalHamper] = useState<VendorHamper | null>(null);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);

  // Destructive Action Confirmation Dialog States
  const [hamperToDelete, setHamperToDelete] = useState<VendorHamper | null>(null);
  const [productToDelete, setProductToDelete] = useState<VendorProduct | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Live Vendor Orders State
  const [vendorOrders, setVendorOrders] = useState<any[]>([]);

  const fetchVendorOrders = useCallback(async () => {
    if (supabase) {
      try {
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (data) {
          setVendorOrders(data);
          return;
        }
      } catch (e) {
        console.warn('Supabase vendor orders warning:', e);
      }
    }
    try {
      const raw = localStorage.getItem('as_hamper_orders_list');
      if (raw) setVendorOrders(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const refreshData = useCallback(() => {
    setProducts(VendorStore.getProductsByVendor(vendorId));
    setHampers(VendorStore.getHampersByVendor(vendorId));
    void fetchVendorOrders();
  }, [vendorId, fetchVendorOrders]);

  useEffect(() => {
    void fetchVendorOrders();
    const unSub = subscribeToRealtimeOrders(() => {
      void fetchVendorOrders();
    });
    return () => unSub();
  }, [fetchVendorOrders]);

  // Product Delete Confirmation Handler
  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    try {
      VendorStore.deleteVendorProduct(productToDelete.id, vendorId);
      toast.success(`Product "${productToDelete.name}" deleted successfully.`);
      refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setProductToDelete(null);
    }
  };

  // Hamper Delete Confirmation Handler
  const confirmDeleteHamper = () => {
    if (!hamperToDelete) return;
    try {
      VendorStore.deleteVendorHamper(hamperToDelete.id, vendorId);
      toast.success(`Hamper "${hamperToDelete.name}" deleted successfully.`);
      refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setHamperToDelete(null);
    }
  };

  // Toggle Hamper Published status
  const handleTogglePublished = (hamper: VendorHamper) => {
    try {
      VendorStore.saveVendorHamper({
        ...hamper,
        is_published: !hamper.is_published,
      });
      refreshData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Toggle failed');
    }
  };

  // Toggle Product Hamper Availability
  const handleToggleProductHamperAvailable = (prod: VendorProduct) => {
    try {
      VendorStore.saveVendorProduct({
        ...prod,
        is_available_for_hamper: !prod.is_available_for_hamper,
      });
      refreshData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const hamperComponents = products.filter((p) => p.is_available_for_hamper);
  const outOfStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <div className="mx-auto my-8 max-w-7xl rounded-3xl bg-cream-50 ring-1 ring-cream-200 overflow-hidden shadow-2xl dark:bg-gray-900 dark:ring-gray-800">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-8 border-b border-cream-200 bg-cream-100/50 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3.5">
          <span className="grid place-items-center h-12 w-12 rounded-2xl bg-wine-700 text-gold-300 shadow-md">
            <Store className="h-6 w-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-wine-800 dark:text-white">
                {vendorName}
              </h1>
              <span className="rounded-full bg-wine-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                Vendor Studio Access
              </span>
              <span className="rounded-full bg-sage-500/15 px-2.5 py-0.5 text-[11px] font-bold text-sage-600">
                GST Ready
              </span>
            </div>
            <p className="text-xs text-ink-700/60 dark:text-gray-400">
              Shop #{vendorShopNo} · Vendor Portal &amp; Gifting Studio · <span className="text-wine-700 dark:text-gold-300 font-medium">To shop as a customer, please log in with a customer account.</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingHamper(null);
              setActiveTab('create-hamper');
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-xs font-semibold text-ink-900 hover:bg-gold-400 transition-colors shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            + Create Hamper
          </button>

          <button
            onClick={onSignOut || signOut}
            className="inline-flex items-center gap-1.5 rounded-full border border-wine-600/30 px-4 py-2.5 text-xs font-semibold text-wine-700 hover:bg-wine-600 hover:text-cream-50 transition-colors dark:text-cream-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-cream-200 bg-cream-50 px-6 overflow-x-auto [scrollbar-width:thin] dark:border-gray-800 dark:bg-gray-900">
        <div className="flex space-x-1 py-2 min-w-max">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: <TrendingUp className="h-4 w-4" /> },
            { id: 'my-products', label: 'My Products', icon: <Package className="h-4 w-4" /> },
            { id: 'hamper-components', label: 'Gift Hamper Components', icon: <Layers className="h-4 w-4" /> },
            { id: 'create-hamper', label: 'Create Personalized Hamper', icon: <Sparkles className="h-4 w-4" /> },
            { id: 'my-hampers', label: 'My Gift Hampers', icon: <Gift className="h-4 w-4" /> },
            { id: 'upload-products', label: 'Upload Products', icon: <Upload className="h-4 w-4" /> },
            { id: 'categories', label: 'Product Categories', icon: <Tag className="h-4 w-4" /> },
            { id: 'orders', label: 'Orders', icon: <ShoppingBag className="h-4 w-4" /> },
            { id: 'profile', label: 'Profile/Business Details', icon: <User className="h-4 w-4" /> },
          ].map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as VendorTab)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-wine-600 text-cream-50 shadow-sm'
                    : 'text-ink-700/70 hover:bg-cream-100 hover:text-wine-800 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-6 sm:p-8">
        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-cream-100/60 p-5 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-wine-600/10 text-wine-700">
                  <Package className="h-5 w-5" />
                </span>
                <p className="mt-3 font-display text-2xl font-bold text-wine-800 dark:text-white">
                  {products.length}
                </p>
                <p className="text-xs text-ink-700/60 dark:text-gray-400">Total Shop Products</p>
              </div>

              <div className="rounded-2xl bg-cream-100/60 p-5 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-gold-500/20 text-gold-700">
                  <Layers className="h-5 w-5" />
                </span>
                <p className="mt-3 font-display text-2xl font-bold text-wine-800 dark:text-white">
                  {hamperComponents.length}
                </p>
                <p className="text-xs text-ink-700/60 dark:text-gray-400">Available for Hampers</p>
              </div>

              <div className="rounded-2xl bg-cream-100/60 p-5 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-sage-500/20 text-sage-600">
                  <Gift className="h-5 w-5" />
                </span>
                <p className="mt-3 font-display text-2xl font-bold text-wine-800 dark:text-white">
                  {hampers.length}
                </p>
                <p className="text-xs text-ink-700/60 dark:text-gray-400">Personalized Hampers</p>
              </div>

              <div className="rounded-2xl bg-cream-100/60 p-5 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-wine-600/10 text-wine-700">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <p className="mt-3 font-display text-2xl font-bold text-wine-800 dark:text-white">
                  ₹24,850
                </p>
                <p className="text-xs text-ink-700/60 dark:text-gray-400">Total Sales Revenue</p>
              </div>
            </div>

            {/* Out of Stock Warning Banner */}
            {outOfStockProducts.length > 0 && (
              <div className="rounded-2xl bg-gold-500/10 border border-gold-400/30 p-5 flex items-start gap-3 text-xs text-wine-800 dark:text-gold-300">
                <AlertTriangle className="h-5 w-5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Low Stock Component Alert</h4>
                  <p className="mt-1">
                    {outOfStockProducts.length} product(s) have 5 or fewer items remaining. Replenish stock to prevent hamper purchases from being blocked.
                  </p>
                  <button
                    onClick={() => setActiveTab('my-products')}
                    className="mt-2 text-wine-700 font-semibold underline hover:text-wine-900"
                  >
                    View Low Stock Products →
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions & Recent Hampers */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-cream-100/40 p-6 ring-1 ring-cream-200 dark:bg-gray-800/40 dark:ring-gray-700">
                <h3 className="font-display font-semibold text-wine-800 dark:text-white text-lg mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setEditingHamper(null);
                      setActiveTab('create-hamper');
                    }}
                    className="p-4 rounded-xl bg-cream-50 border border-cream-200 text-left hover:border-gold-400 transition-all dark:bg-gray-900 dark:border-gray-700"
                  >
                    <Sparkles className="h-5 w-5 text-gold-600 mb-2" />
                    <span className="font-semibold text-xs text-wine-800 dark:text-white block">
                      Create Hamper
                    </span>
                    <span className="text-[11px] text-ink-700/50">Build personalized hampers</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('upload-products')}
                    className="p-4 rounded-xl bg-cream-50 border border-cream-200 text-left hover:border-gold-400 transition-all dark:bg-gray-900 dark:border-gray-700"
                  >
                    <Upload className="h-5 w-5 text-wine-600 mb-2" />
                    <span className="font-semibold text-xs text-wine-800 dark:text-white block">
                      Upload Product
                    </span>
                    <span className="text-[11px] text-ink-700/50">Add product to inventory</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-cream-100/40 p-6 ring-1 ring-cream-200 dark:bg-gray-800/40 dark:ring-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-wine-800 dark:text-white text-lg">
                    My Published Hampers ({hampers.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('my-hampers')}
                    className="text-xs text-wine-700 font-semibold hover:underline"
                  >
                    View All →
                  </button>
                </div>

                {hampers.length === 0 ? (
                  <p className="text-xs text-ink-700/50">No hampers created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {hampers.slice(0, 3).map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center justify-between rounded-xl bg-cream-50 p-3 ring-1 ring-cream-200 dark:bg-gray-900 dark:ring-gray-800"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={h.thumbnail}
                            alt={h.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-semibold text-xs text-wine-800 dark:text-white block">
                              {h.name}
                            </span>
                            <span className="text-[11px] text-ink-700/50">
                              {h.items.length} items · Stock: {h.stock}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-xs text-wine-800 dark:text-gold-300">
                          {formatPrice(h.selling_price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: My Products */}
        {activeTab === 'my-products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-wine-800 dark:text-white">
                  My Shop Products ({products.length})
                </h3>
                <p className="text-xs text-ink-700/60 dark:text-gray-400">
                  Manage product details, stock, pricing, and gift hamper availability.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 h-10 w-56 rounded-full border border-cream-300 bg-cream-50 px-3 text-ink-700/60 focus-within:border-gold-500 dark:bg-gray-800 dark:border-gray-700">
                  <Search className="h-4 w-4 shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search product..."
                    className="w-full bg-transparent text-xs outline-none"
                  />
                </label>

                <button
                  onClick={() => setActiveTab('upload-products')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-wine-600 px-4 py-2 text-xs font-semibold text-cream-50 hover:bg-wine-700 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products
                .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-cream-200 bg-cream-50 overflow-hidden shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-cream-100 dark:bg-gray-900">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                      {p.is_available_for_hamper && (
                        <span className="absolute left-3 top-3 rounded-full bg-wine-600 px-2.5 py-1 text-[10px] font-bold text-cream-50">
                          ☑ Gift Hamper Ready
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display font-semibold text-wine-800 text-sm leading-snug dark:text-white">
                          {p.name}
                        </h4>
                        <span className="font-bold text-sm text-wine-700 dark:text-gold-300">
                          {formatPrice(p.price)}
                        </span>
                      </div>

                      <p className="text-xs text-ink-700/60 line-clamp-2 dark:text-gray-400">
                        {p.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-ink-700/60 pt-2 border-t border-cream-200 dark:border-gray-700">
                        <span>Category: {p.category}</span>
                        <span className={p.stock <= 5 ? 'text-red-600 font-semibold' : ''}>
                          Stock: {p.stock}
                        </span>
                      </div>

                      {p.size_weight && (
                        <p className="text-[11px] text-ink-700/50">Size/Weight: {p.size_weight}</p>
                      )}

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleProductHamperAvailable(p)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                            p.is_available_for_hamper
                              ? 'border-sage-500 bg-sage-500/10 text-sage-600'
                              : 'border-cream-300 text-ink-700/50 hover:border-gold-400'
                          }`}
                        >
                          {p.is_available_for_hamper ? 'Available for Hamper' : '+ Allow in Hamper'}
                        </button>

                        <button
                          onClick={() => setProductToDelete(p)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 3: Gift Hamper Components */}
        {activeTab === 'hamper-components' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gold-500/10 border border-gold-400/30 p-5">
              <h3 className="font-display font-semibold text-wine-800 text-lg dark:text-gold-300">
                Gift Hamper Component Products
              </h3>
              <p className="mt-1 text-xs text-ink-700/70 dark:text-gray-300">
                Every vendor product marked "Available for Gift Hampers" automatically appears in your personalized hamper builder.
              </p>
            </div>

            <div className="space-y-3">
              {hamperComponents.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-cream-200 bg-cream-50 p-4 ring-1 ring-cream-200 dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-14 w-14 rounded-xl object-cover ring-1 ring-cream-300"
                    />
                    <div>
                      <h4 className="font-display font-semibold text-wine-800 text-sm dark:text-white">
                        {p.name}
                      </h4>
                      <p className="text-xs text-ink-700/60 dark:text-gray-400">
                        {p.category} · Price: {formatPrice(p.price)} · Stock: {p.stock} units
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-sage-600 bg-sage-500/15 px-2 py-0.5 rounded-md">
                        ☑ Available for Gift Hampers
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-ink-700/60 block">Max Qty / Hamper:</span>
                      <span className="font-bold text-wine-700">{p.max_quantity_per_hamper || 5} units</span>
                    </div>

                    <button
                      onClick={() => handleToggleProductHamperAvailable(p)}
                      className="rounded-full border border-red-200 px-3.5 py-1.5 font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove from Hamper List
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Create Personalized Hamper (Hamper Builder) */}
        {activeTab === 'create-hamper' && (
          <HamperBuilder
            vendorId={vendorId}
            vendorName={vendorName}
            vendorShopNo={vendorShopNo}
            existingHamper={editingHamper}
            onSaved={() => {
              refreshData();
              setEditingHamper(null);
              setActiveTab('my-hampers');
            }}
            onCancel={() => {
              setEditingHamper(null);
              setActiveTab('my-hampers');
            }}
          />
        )}

        {/* Tab 5: My Gift Hampers */}
        {activeTab === 'my-hampers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-wine-800 dark:text-white">
                  My Gift Hampers ({hampers.length})
                </h3>
                <p className="text-xs text-ink-700/60 dark:text-gray-400">
                  Manage published vendor hampers, approval status, stock levels, and website previews.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingHamper(null);
                  setActiveTab('create-hamper');
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-wine-600 px-4 py-2 text-xs font-semibold text-cream-50 hover:bg-wine-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Create New Hamper
              </button>
            </div>

            {hampers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-cream-300 p-12 text-center text-ink-700/60 dark:border-gray-700">
                <Gift className="h-8 w-8 text-gold-600 mx-auto mb-3" />
                <p className="font-display font-semibold text-base">No gift hampers created yet</p>
                <p className="text-xs mt-1">
                  Use our Hamper Builder to combine your products into complete personalized hampers.
                </p>
                <button
                  onClick={() => setActiveTab('create-hamper')}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-xs font-semibold text-ink-900 hover:bg-gold-400"
                >
                  Create Your First Hamper
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {hampers.map((h) => {
                  const stockCheck = VendorStore.checkHamperStockWarning(h);
                  return (
                    <div
                      key={h.id}
                      className="rounded-2xl border border-cream-200 bg-cream-50 overflow-hidden shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[4/3] relative overflow-hidden bg-cream-100 dark:bg-gray-900">
                          <img
                            src={h.thumbnail}
                            alt={h.name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute left-3 top-3 flex gap-1.5 flex-wrap">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                h.approval_status === 'approved'
                                  ? 'bg-sage-500 text-white'
                                  : h.approval_status === 'pending'
                                  ? 'bg-gold-500 text-ink-900'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {h.approval_status.toUpperCase()}
                            </span>

                            {h.is_published ? (
                              <span className="rounded-full bg-wine-600 px-2 py-0.5 text-[10px] font-bold text-cream-50">
                                Live on Website
                              </span>
                            ) : (
                              <span className="rounded-full bg-ink-700/60 px-2 py-0.5 text-[10px] font-bold text-cream-50">
                                Draft
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display font-semibold text-wine-800 text-base leading-snug dark:text-white">
                              {h.name}
                            </h4>
                            <span className="font-bold text-sm text-wine-700 dark:text-gold-300">
                              {formatPrice(h.selling_price)}
                            </span>
                          </div>

                          <p className="text-xs text-ink-700/60 line-clamp-2 dark:text-gray-400">
                            {h.description}
                          </p>

                          <div className="rounded-xl bg-cream-100/60 p-2 text-xs text-ink-700/70 dark:bg-gray-900 space-y-1">
                            <span className="font-semibold block text-wine-700 dark:text-gold-300">
                              Included Products ({h.items.length}):
                            </span>
                            <ul className="list-disc list-inside text-[11px] text-ink-700/60">
                              {h.items.slice(0, 3).map((it) => (
                                <li key={it.id}>{it.name} (×{it.quantity})</li>
                              ))}
                              {h.items.length > 3 && (
                                <li className="italic">+ {h.items.length - 3} more items</li>
                              )}
                            </ul>
                          </div>

                          {stockCheck.isOut && (
                            <p className="text-[11px] font-semibold text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                              {stockCheck.warningMsg}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 border-t border-cream-200 dark:border-gray-700 flex items-center justify-between gap-2 bg-cream-100/30">
                        <button
                          onClick={() => setCustomerModalHamper(h)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-wine-700 hover:underline"
                        >
                          <Eye className="h-3.5 w-3.5" /> Customer View
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingHamper(h);
                              setActiveTab('create-hamper');
                            }}
                            className="p-1.5 rounded-lg border border-cream-300 text-ink-700 hover:bg-cream-100"
                            title="Edit Hamper"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleTogglePublished(h)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                              h.is_published
                                ? 'bg-wine-600 text-cream-50'
                                : 'bg-cream-200 text-ink-700 hover:bg-cream-300'
                            }`}
                          >
                            {h.is_published ? 'Published' : 'Publish'}
                          </button>

                          <button
                            onClick={() => setHamperToDelete(h)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Hamper"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Upload Products */}
        {activeTab === 'upload-products' && (
          <div className="max-w-2xl mx-auto rounded-2xl bg-cream-100/50 p-6 sm:p-8 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700">
            <h3 className="font-display text-xl font-semibold text-wine-800 dark:text-white mb-2">
              Upload New Product to Inventory
            </h3>
            <p className="text-xs text-ink-700/60 dark:text-gray-400 mb-6">
              Add individual items that can be sold standalone or included inside gift hampers.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const name = formData.get('name') as string;
                const price = Number(formData.get('price'));
                const stock = Number(formData.get('stock'));
                const category = formData.get('category') as string;
                const size_weight = formData.get('size_weight') as string;
                const image = formData.get('image') as string;
                const description = formData.get('description') as string;
                const is_available_for_hamper = formData.get('is_available_for_hamper') === 'on';

                VendorStore.saveVendorProduct({
                  vendor_id: vendorId,
                  vendor_name: vendorName,
                  name,
                  price,
                  stock,
                  category,
                  size_weight,
                  image: image || 'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
                  description,
                  is_available_for_hamper,
                });

                refreshData();
                setActiveTab('my-products');
              }}
              className="space-y-4 text-xs"
            >
              <label className="block">
                <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">
                  Product Name <span className="text-wine-600">*</span>
                </span>
                <input required name="name" placeholder="Chocolate Box" className="input text-xs" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">
                    Price (₹) <span className="text-wine-600">*</span>
                  </span>
                  <input type="number" required name="price" defaultValue={299} className="input text-xs" />
                </label>

                <label className="block">
                  <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">
                    Available Stock <span className="text-wine-600">*</span>
                  </span>
                  <input type="number" required name="stock" defaultValue={50} className="input text-xs" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">Category</span>
                  <input name="category" defaultValue="Chocolates" className="input text-xs" />
                </label>

                <label className="block">
                  <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">Size / Weight</span>
                  <input name="size_weight" placeholder="250g / Medium" className="input text-xs" />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">Image URL</span>
                <input
                  name="image"
                  placeholder="https://images.pexels.com/..."
                  className="input text-xs"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">Description</span>
                <textarea name="description" rows={3} className="input text-xs resize-none" placeholder="Product details..." />
              </label>

              <div className="rounded-xl bg-cream-50 p-4 border border-cream-200 dark:bg-gray-900">
                <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-wine-700 dark:text-gold-300">
                  <input
                    type="checkbox"
                    name="is_available_for_hamper"
                    defaultChecked
                    className="h-4 w-4 accent-wine-600 cursor-pointer"
                  />
                  ☑ Available for Gift Hampers
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-wine-600 py-3.5 font-semibold text-cream-50 hover:bg-wine-700 transition-colors shadow-md text-sm"
              >
                Upload Product
              </button>
            </form>
          </div>
        )}

        {/* Tab 7: Product Categories */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-xl font-semibold text-wine-800 dark:text-white">
                Website Product & Hamper Categories
              </h3>
              <p className="text-xs text-ink-700/60 dark:text-gray-400">
                Browse official website categories where your hampers are published for customer discovery.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {HAMPER_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-cream-200 bg-cream-50 p-5 dark:bg-gray-800 dark:border-gray-700"
                >
                  <span className="text-3xl block mb-2">{cat.icon}</span>
                  <h4 className="font-display font-semibold text-wine-800 text-base dark:text-white">
                    {cat.name}
                  </h4>
                  <p className="mt-1 text-xs text-ink-700/60 dark:text-gray-400">
                    {cat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-wine-800 dark:text-white">
                  Vendor Orders &amp; Product Fulfillment
                </h3>
                <p className="text-xs text-ink-700/60 dark:text-gray-400 mt-0.5">
                  View and manage customer orders containing items from <b>{vendorName}</b>.
                </p>
              </div>
              <span className="rounded-full bg-gold-500/15 border border-gold-500/30 px-3.5 py-1 text-xs font-semibold text-gold-700 dark:text-gold-300 self-start sm:self-auto">
                {vendorOrders.length} Total Store Orders
              </span>
            </div>

            {vendorOrders.length === 0 ? (
              <div className="rounded-2xl bg-cream-100/40 p-12 text-center ring-1 ring-cream-200 dark:bg-gray-800">
                <ShoppingBag className="mx-auto h-10 w-10 text-gold-500 opacity-60 mb-2" />
                <p className="font-semibold text-wine-800 dark:text-white text-sm">No incoming vendor orders yet.</p>
                <p className="text-xs text-ink-700/50 dark:text-gray-400 mt-1">
                  Orders placed by customers for your products will automatically show here live.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendorOrders.map((ord) => {
                  const vendorItems = (ord.items || []).filter(
                    (i: any) => !i.vendor_id || i.vendor_id === vendorId || i.vendor_name === vendorName
                  );
                  const displayItems = vendorItems.length ? vendorItems : ord.items || [];

                  return (
                    <div
                      key={ord.id}
                      className="rounded-2xl bg-cream-100/40 p-5 ring-1 ring-cream-200 dark:bg-gray-800/80 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between border-b border-cream-200 dark:border-gray-700 pb-3 gap-2">
                        <div>
                          <span className="font-mono font-bold text-wine-800 dark:text-gold-300 text-sm">
                            #{ord.order_number || ord.id.slice(0, 8)}
                          </span>
                          <span className="text-xs text-ink-700/60 dark:text-gray-400 ml-3">
                            Customer: <b>{ord.customer_name}</b> ({ord.customer_phone || ord.customer_email || 'Verified'})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-wine-800 dark:text-white text-sm">
                            {formatPrice(ord.total)}
                          </span>
                          <span className="rounded-full bg-gold-500/20 px-3 py-1 text-[10px] font-bold uppercase text-gold-700 dark:text-gold-300">
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {displayItems.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-gray-900 border border-cream-200 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                              )}
                              <div>
                                <p className="font-semibold text-wine-900 dark:text-cream-100 text-xs">
                                  {item.name}
                                </p>
                                <p className="text-[11px] text-ink-700/60 dark:text-gray-400">
                                  Qty: <b>{item.quantity || item.qty || 1}</b> · Price: {formatPrice(item.price || 0)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <select
                                defaultValue={item.itemStatus || 'PROCESSING'}
                                onChange={async (e) => {
                                  const nextSt = e.target.value;
                                  if (supabase) {
                                    await supabase
                                      .from('orders')
                                      .update({ status: nextSt.toLowerCase() })
                                      .eq('id', ord.id);
                                  }
                                  toast.success(`Item status updated to ${nextSt}!`);
                                  void fetchVendorOrders();
                                }}
                                className="rounded-full border border-cream-300 bg-cream-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-1 text-[11px] font-semibold outline-none"
                              >
                                <option value="ACCEPTED">ACCEPTED</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="READY TO SHIP">READY TO SHIP</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>

                      {ord.address && (
                        <p className="text-[11px] text-ink-700/60 dark:text-gray-400 pt-1">
                          📍 Delivery Address: <span className="text-ink-800 dark:text-gray-200">{ord.address}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 9: Profile / Business Details */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6 font-sans">
            <ProfileSection />
          </div>
        )}
      </div>

      {/* Customer Detail View Modal */}
      {customerModalHamper && (
        <HamperDetailModal
          hamper={customerModalHamper}
          onClose={() => setCustomerModalHamper(null)}
        />
      )}

      {/* Confirmation Dialog for Deleting Hamper */}
      <ConfirmationDialog
        isOpen={!!hamperToDelete}
        title="Delete Gift Hamper?"
        message={`Are you sure you want to permanently delete "${hamperToDelete?.name}"? This will remove the hamper from your catalog and the live storefront.`}
        confirmText="Delete Hamper"
        cancelText="Keep Hamper"
        variant="danger"
        itemName={hamperToDelete?.name}
        itemImage={hamperToDelete?.thumbnail}
        onConfirm={confirmDeleteHamper}
        onCancel={() => setHamperToDelete(null)}
      />

      {/* Confirmation Dialog for Deleting Product */}
      <ConfirmationDialog
        isOpen={!!productToDelete}
        title="Delete Vendor Product?"
        message={`Are you sure you want to delete "${productToDelete?.name}"? Any active hampers using this product may be affected.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
        itemName={productToDelete?.name}
        itemImage={productToDelete?.image}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
