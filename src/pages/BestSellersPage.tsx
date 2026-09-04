import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Eye,
  Star,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  ArrowUp,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { products as localProducts, categories, type Product } from '@/data';
import { useCart, formatPrice } from '@/cart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import HamperDetailModal from '@/components/HamperDetailModal';
import LazyImage from '@/components/LazyImage';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { HamperGridSkeleton } from '@/components/skeletons';

export default function BestSellersPage() {
  const navigate = useNavigate();
  const { add, open: openCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  // State
  const [productsList, setProductsList] = useState<Product[]>(localProducts);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc' | 'newest' | 'rating'>('popularity');

  // Mobile filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = 'Best Selling Gift Hampers | A_S Hamper';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch products from Supabase if available
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      if (supabase) {
        try {
          const { data, error } = await supabase.from('products').select('*');
          if (!error && data && data.length > 0) {
            setProductsList(data as Product[]);
          }
        } catch (e) {
          console.warn('Using default fallback products list:', e);
        }
      }
      setLoading(false);
    }
    void loadProducts();
  }, []);

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((product) => {
        // Must match Best Seller or Popular criteria unless searching
        const isBestSellerOrPopular =
          product.tag?.toLowerCase().includes('best') ||
          product.tag?.toLowerCase().includes('popular') ||
          product.is_offer ||
          product.price > 1500;

        if (!isBestSellerOrPopular && !searchQuery) return false;

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(query);
          const matchesDesc = product.description.toLowerCase().includes(query);
          const matchesCat = product.category.toLowerCase().includes(query);
          if (!matchesName && !matchesDesc && !matchesCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        // Price range filter
        if (product.price > priceRange) return false;

        // Rating filter (synthetic rating check if rating property exists, default 4.8)
        const itemRating = (product as any).rating || 4.8;
        if (itemRating < minRating) return false;

        // In stock filter
        if (onlyInStock && (product as any).stock === 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return (b.id > a.id ? 1 : -1);
        if (sortBy === 'rating') return ((b as any).rating || 4.9) - ((a as any).rating || 4.8);
        // Default popularity
        return a.price > b.price ? -1 : 1;
      });
  }, [
    productsList,
    searchQuery,
    selectedCategory,
    priceRange,
    minRating,
    onlyInStock,
    sortBy,
  ]);

  const { session, openAuthModal } = useAuth();

  const handleAddToCart = (product: Product) => {
    if (!session) {
      openAuthModal();
      return;
    }
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.original_price,
      image: product.image,
      description: product.description,
      tag: product.tag,
    });
    toast.success(`Added ${product.name} to cart!`, { icon: '🎁' });
  };

  const handleWishlistToggle = (product: Product) => {
    if (!session) {
      openAuthModal();
      return;
    }
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.original_price,
      image: product.image,
      description: product.description,
      tag: product.tag,
    });
  };

  return (
    <main className="min-h-screen bg-cream-50 pt-24 pb-20 dark:bg-gray-900 transition-colors">
      {/* Hero Banner Header */}
      <section className="bg-gradient-to-b from-wine-900 via-wine-800 to-wine-900 text-cream-50 py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-medium text-cream-200/70 mb-4 uppercase tracking-wider">
            <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gold-400 font-semibold">Best Sellers</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400 uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" /> Most Loved Gift Hampers
              </span>
              <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream-50 tracking-tight">
                Shop Best Sellers
              </h1>
              <p className="mt-3 text-cream-200/80 max-w-xl text-sm sm:text-base leading-relaxed">
                Discover our highest-rated gift baskets, loved for their luxurious packaging, artisan chocolates, hand-poured candles, and personalized notes.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="rounded-2xl bg-cream-50/10 backdrop-blur-md px-4 py-3 border border-cream-50/15">
                <p className="text-gold-400 font-semibold text-base sm:text-lg">12,400+</p>
                <p className="text-cream-200/70 text-xs">Hampers Shipped</p>
              </div>
              <div className="rounded-2xl bg-cream-50/10 backdrop-blur-md px-4 py-3 border border-cream-50/15">
                <p className="text-gold-400 font-semibold text-base sm:text-lg">4.9 ★★★★★</p>
                <p className="text-cream-200/70 text-xs">Average Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search & Sort Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm ring-1 ring-cream-200/60 dark:ring-gray-700 mb-8">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-700/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hampers, candles, chocolates..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-cream-50 dark:bg-gray-700 border border-cream-200 dark:border-gray-600 text-sm text-ink-900 dark:text-cream-100 placeholder-ink-700/40 focus:outline-none focus:ring-2 focus:ring-wine-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-700/50 hover:text-wine-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Mobile Filter Trigger Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="lg:hidden inline-flex items-center gap-2 rounded-full border border-cream-300 dark:border-gray-600 px-4 py-2 text-xs font-semibold text-wine-700 dark:text-cream-100 bg-cream-50 dark:bg-gray-700"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-700/60 dark:text-gray-400 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-full bg-cream-50 dark:bg-gray-700 border border-cream-200 dark:border-gray-600 text-xs font-semibold text-wine-800 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-wine-600 cursor-pointer"
              >
                <option value="popularity">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className={`lg:block ${isFilterOpen ? 'block' : 'hidden'} lg:col-span-1 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm ring-1 ring-cream-200/60 dark:ring-gray-700 self-start`}>
            <div className="flex items-center justify-between pb-4 border-b border-cream-200 dark:border-gray-700">
              <h2 className="font-display font-semibold text-lg text-wine-800 dark:text-cream-100 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-gold-600" /> Filters
              </h2>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange(10000);
                  setMinRating(0);
                  setOnlyInStock(false);
                  setSearchQuery('');
                }}
                className="text-xs font-medium text-wine-600 dark:text-gold-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Reset
              </button>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-700/60 dark:text-gray-400 mb-3">
                Category
              </h3>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-wine-600 text-white font-semibold'
                      : 'text-ink-700 dark:text-gray-300 hover:bg-cream-100 dark:hover:bg-gray-700'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-wine-600 text-white font-semibold'
                        : 'text-ink-700 dark:text-gray-300 hover:bg-cream-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="pt-4 border-t border-cream-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-700/60 dark:text-gray-400">
                  Max Price
                </h3>
                <span className="text-xs font-bold text-wine-700 dark:text-gold-400">
                  Up to {formatPrice(priceRange)}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-wine-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-700/50 dark:text-gray-400 mt-1">
                <span>{formatPrice(1000)}</span>
                <span>{formatPrice(10000)}</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="pt-4 border-t border-cream-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-700/60 dark:text-gray-400 mb-3">
                Minimum Rating
              </h3>
              <div className="space-y-1 text-xs">
                {[0, 4.0, 4.5, 4.8].map((ratingVal) => (
                  <button
                    key={ratingVal}
                    onClick={() => setMinRating(ratingVal)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl font-medium flex items-center justify-between ${
                      minRating === ratingVal
                        ? 'bg-wine-100 dark:bg-gray-700 text-wine-800 dark:text-gold-400 font-bold'
                        : 'text-ink-700 dark:text-gray-300 hover:bg-cream-100'
                    }`}
                  >
                    <span>{ratingVal === 0 ? 'All Ratings' : `${ratingVal} Stars & Above`}</span>
                    {ratingVal > 0 && <span className="text-gold-500">★★★★☆</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-4 border-t border-cream-200 dark:border-gray-700">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-ink-800 dark:text-gray-200">Only Show In Stock</span>
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded accent-wine-600 h-4 w-4"
                />
              </label>
            </div>
          </aside>

          {/* Product Grid Container */}
          <div className="lg:col-span-3">
            {loading ? (
              <HamperGridSkeleton count={6} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const discountPercent =
                    product.original_price && product.original_price > product.price
                      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                      : 0;

                  const wishlisted = isWishlisted(product.id || product.slug);

                  return (
                    <article
                      key={product.id}
                      className="group relative flex flex-col justify-between rounded-[1.75rem] bg-white dark:bg-[#1A1317] p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(100,25,41,0.15)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 border border-cream-200 dark:border-stone-800 hover:border-gold-400/60 dark:hover:border-gold-500/50 hover:-translate-y-1 overflow-hidden"
                    >
                      <div>
                        {/* Image & Overlay Controls */}
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-cream-100 dark:bg-stone-900">
                          <LazyImage
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                            {product.tag && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-wine-700/95 text-cream-50 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                <Sparkles className="h-3 w-3 text-gold-300" /> {product.tag}
                              </span>
                            )}
                            {discountPercent > 0 && (
                              <span className="inline-flex items-center rounded-full bg-gold-500 text-wine-950 font-extrabold px-2 py-0.5 text-[10px] uppercase shadow-sm">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          {/* Wishlist Button */}
                          <button
                            onClick={() => handleWishlistToggle(product)}
                            className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 dark:bg-stone-900/90 text-wine-700 dark:text-cream-100 shadow-md backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
                            aria-label="Add to wishlist"
                          >
                            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-wine-600 text-wine-600 dark:text-rose-400' : ''}`} />
                          </button>

                          {/* Quick View Button overlay */}
                          <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex gap-2 z-10">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-white/95 dark:bg-stone-900/95 text-wine-800 dark:text-gold-300 py-2 text-xs font-bold shadow-lg backdrop-blur-md hover:bg-wine-600 hover:text-white dark:hover:bg-gold-500 dark:hover:text-wine-950 transition-colors cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" /> Quick View
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="mt-3.5 px-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                              {product.category}
                            </span>
                            {/* Rating */}
                            <div className="flex items-center gap-1 text-xs font-bold text-ink-900 dark:text-gray-100">
                              <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                              <span>{(product as any).rating || '4.9'}</span>
                              <span className="text-[10px] text-ink-700/50 dark:text-gray-400 font-normal">(124)</span>
                            </div>
                          </div>

                          <h3
                            onClick={() => setSelectedProduct(product)}
                            className="mt-1 font-display font-bold text-base text-wine-900 dark:text-cream-100 hover:text-wine-600 dark:hover:text-gold-300 cursor-pointer transition-colors line-clamp-1"
                          >
                            {product.name}
                          </h3>

                          <p className="mt-1 text-xs text-ink-700/70 dark:text-gray-300 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      {/* Pricing & Actions */}
                      <div className="mt-4 pt-3 border-t border-cream-200/80 dark:border-stone-800">
                        <div className="flex items-baseline gap-2 mb-3">
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
                          onClick={() => handleAddToCart(product)}
                          className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#7F011F] hover:bg-[#680018] text-[#F5EBD0] px-4 text-xs font-bold shadow-md shadow-[#7F011F]/20 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                          <ShoppingBag className="h-4 w-4 text-[#DFB25B]" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center ring-1 ring-cream-200 dark:ring-gray-700">
                <XCircle className="mx-auto h-12 w-12 text-wine-600/40 mb-3" />
                <h3 className="font-display text-xl font-semibold text-wine-800 dark:text-cream-100">
                  No products match your filters
                </h3>
                <p className="mt-2 text-sm text-ink-700/60 dark:text-gray-400 max-w-sm mx-auto">
                  Try clearing your search query or adjusting your price slider to see more luxury gift hampers.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange(10000);
                    setMinRating(0);
                    setOnlyInStock(false);
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-wine-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-wine-700 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
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

      {/* Floating Back-To-Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 z-40 grid h-11 w-11 place-items-center rounded-full bg-wine-700 text-white shadow-xl hover:bg-wine-800 transition-transform hover:scale-110 active:scale-95"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </main>
  );
}
