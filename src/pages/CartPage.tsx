import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Truck,
  RotateCcw,
  Lock,
  Layers,
  Star,
} from 'lucide-react';
import { formatPrice, useCart, type CartItem } from '@/cart';
import { products as fallbackProducts } from '@/data';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    count,
    subtotal,
    originalTotal,
    discountTotal,
    customizationTotal,
    couponDiscount,
    deliveryCharge,
    finalTotal,
    appliedCoupon,
    setQty,
    remove,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [wishlistSaved, setWishlistSaved] = useState<Record<string, boolean>>({});

  // Confirmation dialog state for item removal
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg(null);
    setCouponLoading(true);
    const res = await applyCoupon(couponCode);
    setCouponLoading(false);
    setCouponMsg({ success: res.success, text: res.message });
    if (res.success) {
      setCouponCode('');
    }
  };

  const toggleWishlist = (slug: string) => {
    setWishlistSaved((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const totalSaved = discountTotal + couponDiscount;

  if (items.length === 0) {
    return <EmptyCartView />;
  }

  return (
    <main className="min-h-screen bg-cream-50/60 dark:bg-gray-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="mx-auto max-w-7xl">
        {/* Step Progress Indicator (Requirement 2) */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream-200 dark:border-gray-800 pb-6">
          <div>
            <Link
              to="/all-hampers"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-wine-700 hover:text-wine-800 dark:text-gold-300 dark:hover:text-gold-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-wine-800 dark:text-white">
              Shopping Cart
            </h1>
            <p className="text-xs font-medium text-ink-700/60 dark:text-gray-400 mt-0.5">
              {count} {count === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          {/* Stepper Header */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 rounded-full bg-wine-600 px-3.5 py-1.5 text-white shadow-sm">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-white text-[10px] font-bold text-wine-700">
                1
              </span>
              Cart
            </span>
            <span className="text-gray-300 dark:text-gray-600">→</span>
            <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                2
              </span>
              Delivery
            </span>
            <span className="text-gray-300 dark:text-gray-600">→</span>
            <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                3
              </span>
              Review
            </span>
            <span className="text-gray-300 dark:text-gray-600">→</span>
            <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                4
              </span>
              Confirmed
            </span>
          </div>
        </div>

        {/* 2-Column Desktop Layout (Requirement 3) */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* LEFT COLUMN: Cart Products */}
          <div className="lg:col-span-7 space-y-4">
            {items.map((item) => (
              <CartProductCard
                key={item.product.slug}
                item={item}
                isWishlisted={!!wishlistSaved[item.product.slug]}
                onToggleWishlist={() => toggleWishlist(item.product.slug)}
                onSetQty={(q) => {
                  if (q <= 0) {
                    setItemToRemove(item);
                  } else {
                    setQty(item.product.slug, q);
                  }
                }}
                onRemove={() => setItemToRemove(item)}
              />
            ))}

            {/* Promo Code Section (Requirement 6) */}
            <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-wine-800 dark:text-white flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gold-600" /> Have a coupon code?
                </h3>
                <span className="text-[11px] font-medium text-wine-600 dark:text-gold-300">
                  Try WELCOME10 or FESTIVE300
                </span>
              </div>

              {appliedCoupon ? (
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-sage-500/10 p-3.5 border border-sage-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-sage-600" />
                    <div>
                      <p className="text-xs font-bold text-sage-800 dark:text-sage-300">
                        Coupon {appliedCoupon.code} Applied!
                      </p>
                      <p className="text-[11px] text-sage-700 dark:text-sage-400">
                        You saved {formatPrice(couponDiscount)} on this coupon.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-xs text-ink-800 outline-none focus:border-wine-600 focus:ring-1 focus:ring-wine-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="rounded-full bg-wine-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-wine-700 disabled:opacity-50"
                  >
                    {couponLoading ? 'Checking...' : 'APPLY'}
                  </button>
                </form>
              )}

              {couponMsg && !appliedCoupon && (
                <p
                  className={`mt-2 text-xs font-medium ${
                    couponMsg.success ? 'text-sage-600' : 'text-red-600'
                  }`}
                >
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Back to Shopping Button */}
            <div className="pt-2">
              <Link
                to="/all-hampers"
                className="inline-flex items-center gap-2 text-xs font-semibold text-wine-700 hover:text-wine-800 dark:text-gold-300"
              >
                ← Continue Shopping (Items remain saved)
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary (Requirements 3 & 5) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-[0_20px_50px_-20px_rgba(87,34,44,0.15)] dark:border-gray-700 dark:bg-gray-800">
                <h2 className="border-b border-cream-200 dark:border-gray-700 pb-3 font-display text-lg font-bold text-wine-800 dark:text-white">
                  Price Details
                </h2>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Price ({count} items)</span>
                    <span className="font-semibold">{formatPrice(originalTotal)}</span>
                  </div>

                  {discountTotal > 0 && (
                    <div className="flex justify-between text-sage-700 dark:text-sage-400">
                      <span>Discount</span>
                      <span className="font-semibold">- {formatPrice(discountTotal)}</span>
                    </div>
                  )}

                  {customizationTotal > 0 && (
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Packaging & Customization</span>
                      <span className="font-semibold">+ {formatPrice(customizationTotal)}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sage-700 dark:text-sage-400">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span className="font-semibold">- {formatPrice(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Delivery Charges</span>
                    {deliveryCharge === 0 ? (
                      <span className="font-bold text-sage-600 uppercase tracking-wider">FREE</span>
                    ) : (
                      <span className="font-semibold">{formatPrice(deliveryCharge)}</span>
                    )}
                  </div>

                  <div className="border-t border-dashed border-cream-300 dark:border-gray-700 pt-3 flex justify-between font-display text-base font-bold text-wine-800 dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-lg text-wine-700 dark:text-gold-300">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Savings Alert Banner */}
                {totalSaved > 0 && (
                  <div className="mt-4 rounded-2xl bg-sage-500/10 p-3 text-center text-xs font-bold text-sage-700 dark:text-sage-300 border border-sage-500/20">
                    🎉 You are saving {formatPrice(totalSaved)} on this order!
                  </div>
                )}

                {/* Strongest CTA Button (Requirement 3) */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="group mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-wine-600 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-wine-600/30 transition-all hover:bg-wine-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Trust Badges */}
                <div className="mt-6 border-t border-cream-200 dark:border-gray-700 pt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center gap-1">
                    <Lock className="h-4 w-4 text-sage-600" />
                    <span>100% Secure</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="h-4 w-4 text-gold-600" />
                    <span>Easy Returns</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-wine-600 dark:text-gold-300" />
                    <span>Trusted Shop</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Destructive Remove Action */}
      <ConfirmationDialog
        isOpen={!!itemToRemove}
        title="Remove Item from Cart?"
        message="Are you sure you want to remove this curated hamper from your shopping cart? You can add it back anytime from the catalog."
        confirmText="Remove Item"
        cancelText="Keep Item"
        variant="danger"
        itemName={itemToRemove?.product.name}
        itemImage={itemToRemove?.product.image}
        onConfirm={() => {
          if (itemToRemove) {
            remove(itemToRemove.product.slug);
            setItemToRemove(null);
          }
        }}
        onCancel={() => setItemToRemove(null)}
      />
    </main>
  );
}

{/* Individual Cart Product Card Component (Requirement 4) */}
function CartProductCard({
  item,
  isWishlisted,
  onToggleWishlist,
  onSetQty,
  onRemove,
}: {
  item: CartItem;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onSetQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const { product, qty } = item;
  const originalPrice =
    product.original_price ||
    product.customization?.original_price ||
    Math.ceil(product.price / 0.82 / 50) * 50;

  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Thumbnail Image */}
        <div className="relative aspect-square h-28 sm:h-32 shrink-0 overflow-hidden rounded-2xl bg-cream-100 dark:bg-gray-900">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
            }}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Details & Controls */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold-600">
                  <Sparkles className="h-3 w-3" /> Personalized Gift Hamper
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-wine-800 dark:text-white leading-snug">
                  {product.name}
                </h3>
              </div>

              {/* Vendor Attribution */}
              <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-0.5 text-[10px] font-semibold text-wine-700 dark:bg-gray-700 dark:text-gold-300 shrink-0">
                <Store className="h-3 w-3" /> {product.vendor_name || 'A_S Artisan'}
              </span>
            </div>

            {/* Rating */}
            <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-bold text-gray-700 dark:text-gray-300">4.8</span>
              <span className="text-[10px] text-gray-400">(48 reviews)</span>
            </div>

            {/* Customization Details Tag (Requirement 4) */}
            {product.customization && (
              <div className="mt-2.5 space-y-1 rounded-2xl bg-cream-50 p-2.5 text-xs text-gray-700 dark:bg-gray-700/60 dark:text-gray-300 border border-cream-200 dark:border-gray-600">
                {product.customization.text && (
                  <p className="text-[11px] font-medium">
                    <span className="font-semibold text-wine-700 dark:text-gold-300">Customization:</span> "{product.customization.text}"
                  </p>
                )}
                {product.customization.color && (
                  <p className="text-[11px] font-medium">
                    <span className="font-semibold text-wine-700 dark:text-gold-300">Color:</span> {product.customization.color}
                  </p>
                )}
                {product.customization.addOns && product.customization.addOns.length > 0 && (
                  <p className="text-[11px] font-medium truncate">
                    <span className="font-semibold text-wine-700 dark:text-gold-300">Add-ons:</span> {product.customization.addOns.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Price & MRP */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-lg font-bold text-wine-800 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {originalPrice > product.price && (
                <>
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-sage-600">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Delivery Info */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-sage-700 dark:text-sage-400 font-medium">
              <Truck className="h-3.5 w-3.5" />
              <span>Free Delivery Available</span>
            </div>
          </div>

          {/* Action Row: Quantity Selector & Remove/Wishlist */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-cream-100 dark:border-gray-700">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Qty:</span>
              <div className="flex items-center rounded-full border border-cream-300 bg-cream-50 dark:border-gray-600 dark:bg-gray-700">
                <button
                  onClick={() => onSetQty(qty - 1)}
                  className="grid h-7 w-7 place-items-center text-gray-600 hover:text-wine-700 dark:text-gray-300"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-wine-800 dark:text-white">
                  {qty}
                </span>
                <button
                  onClick={() => onSetQty(qty + 1)}
                  className="grid h-7 w-7 place-items-center text-gray-600 hover:text-wine-700 dark:text-gray-300"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={onToggleWishlist}
                className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                  isWishlisted ? 'text-wine-600' : 'text-gray-500 hover:text-wine-600 dark:text-gray-400'
                }`}
              >
                <Heart className="h-3.5 w-3.5" fill={isWishlisted ? 'currentColor' : 'none'} />
                {isWishlisted ? 'Saved' : 'Move to Wishlist'}
              </button>

              <span className="text-gray-300 dark:text-gray-600">|</span>

              <button
                onClick={onRemove}
                className="inline-flex items-center gap-1 font-semibold text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

{/* Beautiful Empty Cart View (Requirement 8) */}
function EmptyCartView() {
  return (
    <main className="min-h-screen bg-cream-50/60 dark:bg-gray-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="mx-auto max-w-4xl text-center py-12">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-wine-600/10 text-wine-600 dark:bg-wine-600/20 dark:text-gold-300">
          <ShoppingBag className="h-12 w-12" />
        </div>

        <h1 className="mt-6 font-display text-2xl sm:text-3xl font-bold text-wine-800 dark:text-white">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-ink-700/60 dark:text-gray-400 max-w-sm mx-auto">
          Looks like you haven't added any hampers or gifts yet.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/all-hampers"
            className="rounded-full bg-wine-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-wine-600/30 transition-all hover:bg-wine-700 hover:-translate-y-0.5"
          >
            Explore Gift Hampers
          </Link>
          <Link
            to="/build-your-own"
            className="rounded-full border border-cream-300 bg-white px-8 py-3.5 text-sm font-semibold text-wine-800 transition-all hover:bg-cream-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            Build Your Own
          </Link>
        </div>

        {/* Recommended Products Grid */}
        <div className="mt-16 text-left border-t border-cream-200 dark:border-gray-800 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-wine-800 dark:text-white">
              Popular Gift Hampers
            </h2>
            <Link
              to="/all-hampers"
              className="text-xs font-semibold text-wine-600 hover:underline dark:text-gold-300"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fallbackProducts.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-cream-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-cream-100">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 font-display text-sm font-bold text-wine-800 dark:text-white line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-xs font-semibold text-wine-600 dark:text-gold-300 mt-1">
                  {formatPrice(p.price)}
                </p>
                <Link
                  to="/all-hampers"
                  className="mt-3 rounded-full bg-cream-100 py-2 text-center text-xs font-semibold text-wine-700 hover:bg-wine-600 hover:text-white transition-colors dark:bg-gray-700 dark:text-gray-200"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
