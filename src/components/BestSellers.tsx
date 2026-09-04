import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Heart, ArrowRight, Star, Eye, Zap, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products as fallbackProducts, type Product } from '@/data';
import { supabase } from '@/lib/supabase';
import { useCart, formatPrice } from '@/cart';
import { useReveal } from '@/hooks/useReveal';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import HamperDetailModal from '@/components/HamperDetailModal';
import LazyImage from '@/components/LazyImage';
import { HamperGridSkeleton } from '@/components/skeletons';

const filters = [
  { id: 'all', label: 'All Curations' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'luxury', label: 'Luxury Keepsake' },
  { id: 'festival', label: 'Festival' },
  { id: 'corporate', label: 'Corporate' },
];

function ProductCard({
  product,
  delay,
  onQuickView,
}: {
  product: Product;
  delay: number;
  onQuickView: (p: Product) => void;
}) {
  const { session, openAuthModal } = useAuth();
  const { add } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(product.id || product.slug);

  const discountPercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      openAuthModal();
      return;
    }
    add(product);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      openAuthModal();
      return;
    }
    toggleWishlist(product);
  };

  return (
    <article
      className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-[#1A1317] border border-cream-200 dark:border-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(100,25,41,0.15)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-gold-400/60 dark:hover:border-gold-500/50 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-100 dark:bg-stone-900">
          <LazyImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.tag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-wine-700/95 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cream-50 shadow-md">
                <Sparkles className="h-3 w-3 text-gold-300" />
                {product.tag}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="inline-flex items-center rounded-full bg-gold-500 text-wine-950 font-extrabold px-2.5 py-0.5 text-[10px] uppercase shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Top Right Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-md transition-all hover:scale-110 cursor-pointer ${
              saved ? 'text-wine-600 dark:text-rose-400' : 'text-stone-600 dark:text-stone-300 hover:text-wine-600'
            }`}
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          </button>

          {/* Quick View Button overlay */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex justify-end z-10">
            <button
              onClick={() => onQuickView(product)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/95 dark:bg-stone-900/95 text-wine-800 dark:text-gold-300 px-3.5 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md hover:bg-wine-600 hover:text-white dark:hover:bg-gold-500 dark:hover:text-wine-950 transition-colors cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" /> Quick View
            </button>
          </div>
        </div>

        <div className="flex flex-col p-4 sm:p-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-ink-900 dark:text-gray-100">
              <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
              <span>{(product as any).rating || '4.9'}</span>
              <span className="text-[10px] text-ink-700/50 dark:text-gray-400 font-normal">(124)</span>
            </div>
          </div>

          <h3
            onClick={() => onQuickView(product)}
            className="font-display font-bold text-wine-900 text-base sm:text-lg leading-snug dark:text-white cursor-pointer hover:text-wine-600 dark:hover:text-gold-300 transition-colors line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-ink-700/70 leading-relaxed dark:text-gray-300 line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-0">
        <div className="flex items-baseline gap-2 mb-3.5 pt-3 border-t border-cream-200/80 dark:border-stone-800">
          <span className="font-display font-bold text-lg text-wine-900 dark:text-gold-300">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-ink-700/40 dark:text-gray-400 line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {/* Single Full-Width Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#7F011F] hover:bg-[#680018] text-[#F5EBD0] px-4 text-xs font-bold shadow-md shadow-[#7F011F]/20 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4 text-[#DFB25B]" />
          <span>Add to Cart</span>
        </button>
      </div>
    </article>
  );
}

type BestSellersProps = {
  title?: string;
  eyebrow?: string;
  paginate?: boolean;
  pageSize?: number;
};

export default function BestSellers({
  title = 'Best sellers',
  eyebrow = 'Loved most',
  paginate = false,
  pageSize = 4,
}: BestSellersProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [filter, setFilter] = useState('all');
  const [list, setList] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(fallbackProducts.length);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setLoading(true);
    if (!supabase) {
      const filtered = filter === 'all' ? fallbackProducts : fallbackProducts.filter((product) => product.category === filter);
      setList(filtered.slice((page - 1) * pageSize, page * pageSize));
      setTotal(filtered.length);
      setLoading(false);
      return;
    }
    let mounted = true;
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filter !== 'all') query = query.eq('category', filter);

    query
      .range((page - 1) * pageSize, page * pageSize - 1)
      .then(({ data, count }) => {
        if (!mounted) return;
        if (data && data.length > 0) {
          setList(data as Product[]);
          setTotal(count ?? 0);
        } else {
          const fallback = filter === 'all' ? fallbackProducts : fallbackProducts.filter((product) => product.category === filter);
          setList(fallback.slice((page - 1) * pageSize, page * pageSize));
          setTotal(fallback.length);
        }
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [filter, page, pageSize]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const selectFilter = (nextFilter: string) => {
    setFilter(nextFilter);
    setPage(1);
  };

  return (
    <section id="bestsellers" className="py-20 sm:py-28 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-600">
              {eyebrow}
            </p>
            <h2 className="mt-3 font-display font-semibold text-wine-800 text-3xl sm:text-4xl lg:text-5xl tracking-tight dark:text-white">
              {title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => selectFilter(f.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  filter === f.id
                    ? 'bg-wine-600 text-cream-50 shadow-sm'
                    : 'bg-cream-100 text-ink-700/80 hover:bg-cream-200 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={ref}
          className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 reveal ${
            visible ? 'is-visible' : ''
          }`}
        >
          {loading ? (
            <div className="col-span-full">
              <HamperGridSkeleton count={4} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
            </div>
          ) : list.length === 0 ? (
            <p className="col-span-full text-center text-ink-700/50 py-12 dark:text-gray-400">No hampers in this category yet.</p>
          ) : (
            list.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                delay={i * 60}
                onQuickView={setSelectedProduct}
              />
            ))
          )}
        </div>

        {paginate && !loading && total > pageSize && (
          <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Product pages">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-cream-300 px-4 text-sm font-medium text-wine-700 transition-colors hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-cream-50"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-ink-700/70 dark:text-gray-300">Page {page} of {pageCount}</span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={page === pageCount}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-cream-300 px-4 text-sm font-medium text-wine-700 transition-colors hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-cream-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
        <div className="mt-12 flex justify-center">
          <Link
            to="/best-sellers"
            className="group inline-flex items-center gap-2 rounded-full border border-wine-600/30 bg-cream-50 dark:bg-gray-800 px-7 py-3 text-sm font-semibold text-wine-700 dark:text-gold-300 hover:bg-wine-600 hover:text-white transition-all shadow-sm"
          >
            Explore All Best Sellers & Filters <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {selectedProduct && (
        <HamperDetailModal
          hamper={{
            id: selectedProduct.id,
            vendor_id: 'admin_official',
            vendor_name: 'A_S Hamper Studio',
            vendor_shop_no: 'Studio Main',
            name: selectedProduct.name,
            slug: selectedProduct.slug,
            categories: [selectedProduct.category],
            tags: [selectedProduct.tag || 'Best Seller'],
            description: selectedProduct.description,
            items: [],
            packaging_charge: 150,
            customization_charge: 0,
            total_cost: Math.round(selectedProduct.price * 0.7),
            selling_price: selectedProduct.price,
            original_price: selectedProduct.original_price || undefined,
            images: [selectedProduct.image],
            thumbnail: selectedProduct.image,
            is_enabled: true,
            approval_status: 'approved',
            is_published: true,
            stock: 25,
            created_at: new Date().toISOString(),
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}
