import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Plus, Check, Store, Sparkles, Layers, Eye } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { products as fallbackProducts, type Product } from '@/data';
import { VendorStore, HAMPER_CATEGORIES, type VendorHamper } from '@/lib/vendorStore';
import { formatPrice, useCart } from '@/cart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import HamperDetailModal from './HamperDetailModal';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const categoriesList = [
  { id: 'all', label: '✨ All Occasions' },
  { id: 'birthday', label: '🎂 Birthday Gifts' },
  { id: 'anniversary', label: '💍 Anniversary Gifts' },
  { id: 'wedding', label: '💒 Wedding Gifts' },
  { id: 'personalized', label: '🎁 Personalized Gifts' },
  { id: 'corporate', label: '🏢 Corporate Gifts' },
  { id: 'festival', label: '🎉 Festival Gifts' },
  { id: 'couple', label: '❤️ Couple Gifts' },
  { id: 'baby-shower', label: '👶 Baby Gifts' },
  { id: 'luxury', label: '💎 Luxury Hampers' },
];

type Sort = 'featured' | 'price-low' | 'price-high';

const ITEMS_PER_PAGE = 8;

function VendorHamperCard({
  hamper,
  onOpenDetail,
}: {
  hamper: VendorHamper;
  onOpenDetail: (h: VendorHamper) => void;
}) {
  const { session, openAuthModal } = useAuth();
  const { add } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(hamper.id || hamper.slug);
  const stockCheck = VendorStore.checkHamperStockWarning(hamper);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      openAuthModal();
      return;
    }
    if (stockCheck.isOut) return;
    add({
      id: hamper.id,
      slug: hamper.slug,
      name: hamper.name,
      category: hamper.categories[0] || 'personalized',
      price: hamper.selling_price,
      image: hamper.thumbnail,
      description: hamper.description,
      tag: hamper.tags[0] || 'Vendor Hamper',
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      openAuthModal();
      return;
    }
    toggleWishlist({
      id: hamper.id,
      slug: hamper.slug,
      name: hamper.name,
      category: hamper.categories[0] || 'personalized',
      price: hamper.selling_price,
      image: hamper.thumbnail,
      description: hamper.description,
      tag: hamper.tags[0] || 'Vendor Hamper',
    });
  };

  return (
    <article
      onClick={() => onOpenDetail(hamper)}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-cream-200 bg-cream-50 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/80 hover:shadow-[0_25px_50px_-25px_rgba(87,34,44,0.4)] cursor-pointer dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Thumbnail & Badges */}
      <div className="relative aspect-square overflow-hidden bg-cream-100 dark:bg-gray-900">
        <img
          src={hamper.thumbnail}
          alt={hamper.name}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = 'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
          }}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-wine-700/90 px-3 py-1 text-[10px] font-semibold text-gold-300 backdrop-blur">
            <Store className="h-3 w-3" /> {hamper.vendor_name}
          </span>
          {hamper.discount_percent && hamper.discount_percent > 0 ? (
            <span className="rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
              {hamper.discount_percent}% OFF
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow transition-all hover:scale-110 cursor-pointer dark:bg-gray-800/90 ${
            saved ? 'text-wine-600' : 'text-gray-600 hover:text-wine-600'
          }`}
        >
          <Heart className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
        </button>

        {/* Out of Stock Banner */}
        {stockCheck.isOut && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-4 z-10">
            <span className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600">
            {hamper.categories[0] || 'Gift Hamper'}
          </span>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Shop #{hamper.vendor_shop_no || 'MAIN'}
          </span>
        </div>

        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-wine-800 dark:text-white group-hover:text-wine-600 transition-colors">
          {hamper.name}
        </h3>

        {/* Included Items Teaser with Checkmarks */}
        {hamper.items && hamper.items.length > 0 && (
          <div className="mt-3 space-y-1.5 rounded-2xl bg-cream-100/70 p-3 text-xs text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
            <p className="font-semibold text-wine-700 dark:text-gold-300 flex items-center gap-1 text-[11px]">
              <Layers className="h-3 w-3" /> Includes ({hamper.items.length} items):
            </p>
            <ul className="space-y-1 pl-1">
              {hamper.items.slice(0, 3).map((it, idx) => (
                <li key={idx} className="flex items-center gap-1.5 truncate text-[11px]">
                  <Check className="h-3 w-3 text-sage-600 shrink-0" />
                  <span className="truncate">{it.name}</span>
                </li>
              ))}
              {hamper.items.length > 3 && (
                <li className="text-[10px] text-gray-500 font-medium pl-4">
                  +{hamper.items.length - 3} more personalized items
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Pricing & Add to Cart Button - Unified Design */}
        <div className="mt-5 flex flex-col pt-3 border-t border-cream-200 dark:border-gray-700">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-wine-800 dark:text-white">
              {formatPrice(hamper.selling_price)}
            </span>
            {hamper.original_price && hamper.original_price > hamper.selling_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(hamper.original_price)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={stockCheck.isOut}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-wine-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-wine-700 hover:shadow-md active:scale-95 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {stockCheck.isOut ? 'Sold Out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}

function RegularProductCard({ product }: { product: Product }) {
  const { session, openAuthModal } = useAuth();
  const { add } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(product.id || product.slug);
  const originalPrice = product.original_price ?? Math.ceil(product.price / 0.88 / 50) * 50;

  const handleAddToCart = () => {
    if (!session) {
      openAuthModal();
      return;
    }
    add(product);
  };

  const handleWishlistToggle = () => {
    if (!session) {
      openAuthModal();
      return;
    }
    toggleWishlist(product);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-cream-200 bg-cream-50 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-[0_22px_45px_-28px_rgba(87,34,44,0.55)] dark:border-gray-700 dark:bg-gray-800">
      <div className="relative aspect-square overflow-hidden bg-cream-100 dark:bg-gray-900">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = 'https://images.pexels.com/photos/8468661/pexels-photo-8468661.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
          }}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5 z-10">
          {product.is_offer && (
            <span className="rounded-md bg-wine-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream-50">
              Offer
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-cream-50/95 backdrop-blur transition-all hover:scale-110 cursor-pointer dark:bg-gray-800/95 ${
            saved ? 'text-wine-600' : 'text-ink-700 hover:text-wine-600'
          }`}
        >
          <Heart className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-600">
          {product.category}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-wine-800 dark:text-white">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-700/65 dark:text-gray-300">
          {product.description}
        </p>
        <div className="mt-5 flex flex-col pt-3 border-t border-cream-200 dark:border-gray-700">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-wine-800 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.is_offer && (
              <span className="text-xs text-ink-700/45 line-through dark:text-gray-400">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-wine-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-wine-700 hover:shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default function HamperCollection({ offersOnly = false }: { offersOnly?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCat = searchParams.get('cat') || 'all';
  const [category, setCategory] = useState(urlCat);
  const [sort, setSort] = useState<Sort>('featured');
  const [page, setPage] = useState(1);
  const [selectedHamperModal, setSelectedHamperModal] = useState<VendorHamper | null>(null);

  useEffect(() => {
    if (urlCat && urlCat !== category) {
      setCategory(urlCat);
      setPage(1);
    }
  }, [urlCat]);

  // Load published vendor hampers from vendorStore
  const publishedVendorHampers = useMemo(
    () => VendorStore.getPublishedHampers(category),
    [category]
  );

  const fallbackItems = useMemo(() => {
    let list = fallbackProducts;
    if (offersOnly) list = list.filter((p) => p.is_offer);
    if (category !== 'all') list = list.filter((p) => p.category === category);
    return list;
  }, [category, offersOnly]);

  // Combine vendor hampers and regular products
  const combinedItems = useMemo(() => {
    const hampersAsItems = publishedVendorHampers.map((h) => ({
      type: 'hamper' as const,
      id: h.id,
      data: h,
      price: h.selling_price,
    }));
    const productsAsItems = fallbackItems.map((p) => ({
      type: 'product' as const,
      id: p.id,
      data: p,
      price: p.price,
    }));

    let combined = [...hampersAsItems, ...productsAsItems];

    if (sort === 'price-low') {
      combined.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      combined.sort((a, b) => b.price - a.price);
    }

    return combined;
  }, [publishedVendorHampers, fallbackItems, sort]);

  const totalCount = combinedItems.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Slice paginated items for fast performance
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return combinedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [combinedItems, page]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 space-y-8">
      {/* Category Filter Pills */}
      {!offersOnly && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {categoriesList.map((c) => {
              const isActive = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategory(c.id);
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-wine-600 text-cream-50 shadow-md scale-105'
                      : 'bg-cream-100 text-ink-800 hover:bg-cream-200 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-cream-200 dark:border-gray-700">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">
              Showing {paginatedItems.length} of {totalCount} curated hampers
            </span>

            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as Sort);
                  setPage(1);
                }}
                className="h-9 rounded-xl border border-cream-300 bg-cream-50 px-3 text-xs text-ink-800 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <Link
                to="/build-your-own"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gold-500 px-4 text-xs font-semibold text-ink-900 transition-colors hover:bg-gold-400"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Build Your Own
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Paginated Vendor Hampers & Regular Products */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 min-h-[400px]">
        {paginatedItems.map((item) => {
          if (item.type === 'hamper') {
            return (
              <VendorHamperCard
                key={item.id}
                hamper={item.data}
                onOpenDetail={(hamper) => setSelectedHamperModal(hamper)}
              />
            );
          }
          return <RegularProductCard key={item.id} product={item.data} />;
        })}
      </div>

      {/* Interactive Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-center gap-4 pt-8 border-t border-cream-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={page === 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-white text-gray-700 shadow-sm transition-all hover:bg-cream-100 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => {
                  setPage(pageNum);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className={`h-10 w-10 rounded-full font-display text-xs font-semibold transition-all ${
                  page === pageNum
                    ? 'bg-wine-600 text-cream-50 shadow-md scale-105'
                    : 'border border-cream-300 bg-white text-gray-700 hover:bg-cream-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={page === totalPages}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-white text-gray-700 shadow-sm transition-all hover:bg-cream-100 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              aria-label="Next Page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
        </div>
      )}

      {/* Detail View Modal for Customer */}
      {selectedHamperModal && (
        <HamperDetailModal
          hamper={selectedHamperModal}
          onClose={() => setSelectedHamperModal(null)}
        />
      )}
    </section>
  );
}
