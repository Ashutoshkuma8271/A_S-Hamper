import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Search,
  ShoppingBag,
  Star,
  Store,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { formatPrice, useCart, type CartProduct } from '@/cart';
import { useWishlist } from '@/hooks/useWishlist';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import ConfirmationDialog from '@/components/ConfirmationDialog';

type SortOption = 'recent' | 'price-low' | 'price-high' | 'rating';

export default function WishlistPage() {
  const { items, removeFromWishlist, moveToCart, wishlistCount, loading, error } = useWishlist();
  const { add } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [itemToRemove, setItemToRemove] = useState<CartProduct | null>(null);

  // Filter & Sort Logic (Requirements 11 & 12)
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.vendor_name?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    }

    return result;
  }, [items, searchQuery, sortBy]);

  if (loading) {
    return <WishlistSkeletonView />;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-cream-50/60 dark:bg-gray-900 pt-24 pb-20 px-4 font-sans text-center">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-lg dark:bg-gray-800 border border-cream-200 dark:border-gray-700">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-4 font-display text-xl font-bold text-wine-800 dark:text-white">
            Unable to load your Wishlist
          </h2>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-wine-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-wine-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (wishlistCount === 0) {
    return <EmptyWishlistView />;
  }

  return (
    <main className="min-h-screen bg-cream-50/60 dark:bg-gray-900 pt-24 pb-24 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="mx-auto max-w-7xl">
        {/* Header Section (Requirement 3) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-cream-200 dark:border-gray-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-wine-600 fill-wine-600 dark:text-gold-300 dark:fill-gold-300" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-wine-800 dark:text-white">
                Wishlist
              </h1>
              <span className="rounded-full bg-wine-600/10 px-3 py-1 text-xs font-bold text-wine-700 dark:bg-wine-600/20 dark:text-gold-300">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
              Your saved gift ideas
            </p>
          </div>

          {/* Search & Sort Bar (Requirements 11 & 12) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Instant Search Field */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your wishlist..."
                className="w-full rounded-full border border-cream-300 bg-white pl-9 pr-4 py-2 text-xs text-ink-800 outline-none focus:border-wine-600 focus:ring-1 focus:ring-wine-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-full border border-cream-300 bg-white px-4 py-2 text-xs font-semibold text-wine-800 outline-none focus:border-wine-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="recent">Sort: Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating: Highest</option>
            </select>
          </div>
        </div>

        {/* Wishlist Product Grid (Requirement 4: 4 cols desktop, 2-3 cols tablet, 2 cols mobile) */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-wine-800 dark:text-white">
              No matching hampers found for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-bold text-wine-600 hover:underline dark:text-gold-300"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((product) => {
              const originalPrice =
                product.original_price ||
                product.customization?.original_price ||
                Math.ceil(product.price / 0.82 / 50) * 50;

              const discountPercent = Math.round(
                ((originalPrice - product.price) / originalPrice) * 100
              );

              // Stock Status Mock Check
              const isOutOfStock = product.slug?.includes('out-of-stock');

              return (
                <div
                  key={product.id || product.slug}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-cream-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div>
                    {/* Thumbnail Image Container */}
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream-100 dark:bg-gray-900">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
                        }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Active Heart Icon Button (Requirement 5) */}
                      <button
                        type="button"
                        onClick={() => setItemToRemove(product)}
                        aria-label="Remove from wishlist"
                        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-wine-600 shadow-md backdrop-blur transition-transform active:scale-90 dark:bg-gray-800/95 dark:text-gold-300"
                        title="Remove from Wishlist"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>

                      {/* Discount Badge */}
                      {discountPercent > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                          {discountPercent}% OFF
                        </span>
                      )}

                      {/* Out of Stock Overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-2 text-center">
                          <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Details (Requirement 4) */}
                    <div className="mt-3.5 space-y-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold-600">
                        <Store className="h-3 w-3" /> {product.vendor_name || 'A_S Artisan'}
                      </span>

                      <h3 className="font-display text-sm sm:text-base font-bold text-wine-800 dark:text-white line-clamp-1">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {product.rating || 4.8}
                        </span>
                        <span className="text-[10px] text-gray-400">(48)</span>
                      </div>

                      {/* Pricing */}
                      <div className="pt-1 flex items-baseline gap-2">
                        <span className="font-display text-base font-bold text-wine-800 dark:text-white">
                          {formatPrice(product.price)}
                        </span>
                        {originalPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Stock Status Badge (Requirement 8) */}
                      <div className="pt-1">
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                            Currently Unavailable
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> In Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Add to Cart vs Move to Cart (Requirements 6 & 7) */}
                  <div className="mt-4 space-y-2 pt-2 border-t border-cream-200 dark:border-gray-700">
                    <button
                      onClick={() => add(product)}
                      disabled={isOutOfStock}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-wine-600 py-2.5 text-xs font-bold text-white shadow transition-all hover:bg-wine-700 disabled:opacity-50"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {isOutOfStock ? 'Notify Me' : 'Add to Cart'}
                    </button>

                    {!isOutOfStock && (
                      <button
                        onClick={() => moveToCart(product)}
                        className="w-full inline-flex items-center justify-center gap-1 rounded-2xl border border-cream-300 bg-cream-50 py-2 text-[11px] font-semibold text-wine-700 transition-all hover:bg-cream-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      >
                        Move to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Removing from Wishlist */}
      <ConfirmationDialog
        isOpen={!!itemToRemove}
        title="Remove from Wishlist?"
        message={`Are you sure you want to remove "${itemToRemove?.name}" from your saved wishlist?`}
        confirmText="Remove"
        cancelText="Keep in Wishlist"
        variant="danger"
        itemName={itemToRemove?.name}
        itemImage={itemToRemove?.image}
        onConfirm={() => {
          if (itemToRemove) {
            removeFromWishlist(itemToRemove.id || itemToRemove.slug);
            setItemToRemove(null);
          }
        }}
        onCancel={() => setItemToRemove(null)}
      />
    </main>
  );
}

{/* Empty Wishlist View (Requirement 10) */}
function EmptyWishlistView() {
  return (
    <main className="min-h-screen bg-cream-50/60 dark:bg-gray-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="mx-auto max-w-xl text-center py-16">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-wine-600/10 text-wine-600 dark:bg-wine-600/20 dark:text-gold-300">
          <Heart className="h-12 w-12" />
        </div>

        <h1 className="mt-6 font-display text-2xl sm:text-3xl font-bold text-wine-800 dark:text-white">
          Your Wishlist is Empty
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          Save your favorite gift hampers here and come back to them anytime.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/all-hampers"
            className="rounded-full bg-wine-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-wine-600/30 transition-all hover:bg-wine-700 hover:-translate-y-0.5"
          >
            Explore Gift Hampers
          </Link>
          <Link
            to="/"
            className="rounded-full border border-cream-300 bg-white px-8 py-3.5 text-xs font-semibold text-wine-800 transition-all hover:bg-cream-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

{/* Skeleton Loader View */}
function WishlistSkeletonView() {
  return (
    <main className="min-h-screen bg-cream-50/60 dark:bg-gray-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center gap-3 border-b border-cream-200 dark:border-gray-800 pb-6">
          <div className="h-8 w-44 rounded-xl bg-wine-800/15 dark:bg-cream-100/15" />
          <div className="h-6 w-16 rounded-full bg-gold-500/20" />
        </div>
        <LoadingSkeleton type="hamper-grid" count={4} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
      </div>
    </main>
  );
}

