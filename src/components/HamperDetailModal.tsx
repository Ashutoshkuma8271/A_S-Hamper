import { useState } from 'react';
import { VendorStore, type VendorHamper } from '@/lib/vendorStore';
import { formatPrice, useCart } from '@/cart';
import { useWishlist } from '@/hooks/useWishlist';
import { X, Check, Store, ShoppingBag, Heart, AlertTriangle, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazyImage from '@/components/LazyImage';

export default function HamperDetailModal({
  hamper,
  onClose,
}: {
  hamper: VendorHamper;
  onClose: () => void;
}) {
  const { add, open } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(hamper.thumbnail || hamper.images[0]);
  const [personalizationNote, setPersonalizationNote] = useState('');
  const [added, setAdded] = useState(false);

  const productForWishlist = {
    id: hamper.id,
    slug: hamper.slug,
    name: hamper.name,
    category: hamper.categories[0] || 'personalized',
    price: hamper.selling_price,
    original_price: hamper.original_price,
    image: hamper.thumbnail,
    vendor_id: hamper.vendor_id,
    vendor_name: hamper.vendor_name,
    vendor_shop_no: hamper.vendor_shop_no,
  };

  const saved = isWishlisted(hamper.id || hamper.slug);
  const stockCheck = VendorStore.checkHamperStockWarning(hamper);

  const handleAddToCart = () => {
    if (stockCheck.isOut) return;

    add({
      ...productForWishlist,
      description: `${hamper.description} ${personalizationNote ? `(Personalization: ${personalizationNote})` : ''}`,
      tag: hamper.tags[0] || 'Artisan Hamper',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    if (stockCheck.isOut) return;
    handleAddToCart();
    open();
    onClose();
    navigate('/cart');
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 backdrop-blur-md p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="my-6 w-full max-w-4xl rounded-[2rem] bg-[#FAF6F0] dark:bg-[#1A1317] border border-cream-300/80 dark:border-stone-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Header */}
        <div className="flex items-center justify-between border-b border-cream-200 dark:border-stone-800 bg-cream-100/60 dark:bg-stone-900/60 px-6 py-4">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-400">
            <Sparkles className="h-4 w-4" />
            Curated Artisan Hamper
          </span>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="grid place-items-center h-8 w-8 rounded-full text-ink-700/60 hover:bg-cream-200 dark:hover:bg-stone-800 dark:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 grid gap-8 lg:grid-cols-2 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream-100 dark:bg-stone-900 border border-cream-200/80 dark:border-stone-800">
              <LazyImage
                src={activeImage}
                alt={hamper.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => toggleWishlist(productForWishlist)}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 dark:bg-stone-900/90 shadow backdrop-blur-md transition-all hover:scale-110 ${
                  saved ? 'text-wine-600 dark:text-rose-400' : 'text-ink-700 dark:text-gray-300 hover:text-wine-600'
                }`}
              >
                <Heart className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>

            {hamper.images && hamper.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {hamper.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === img ? 'border-wine-600 ring-2 ring-wine-600/30' : 'border-cream-200 dark:border-stone-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details, Includes List, Vendor Info & CTA */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              {/* Category & Tags */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {hamper.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-gold-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-wine-900 dark:text-gold-300 border border-gold-400/40"
                  >
                    {cat}
                  </span>
                ))}
                {hamper.discount_percent && hamper.discount_percent > 0 ? (
                  <span className="rounded-full bg-wine-600 px-2.5 py-1 text-[10px] font-bold text-cream-50">
                    {hamper.discount_percent}% OFF
                  </span>
                ) : null}
              </div>

              {/* Hamper Title */}
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-wine-900 dark:text-white leading-snug">
                {hamper.name}
              </h2>

              {/* Pricing Section */}
              <div className="mt-2.5 flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-wine-900 dark:text-gold-300">
                  {formatPrice(hamper.selling_price)}
                </span>
                {hamper.original_price && hamper.original_price > hamper.selling_price && (
                  <span className="text-base text-ink-700/40 dark:text-gray-400 line-through font-medium">
                    {formatPrice(hamper.original_price)}
                  </span>
                )}
              </div>

              {/* Vendor Information */}
              <div className="mt-3.5 rounded-2xl bg-cream-100/80 dark:bg-stone-900/60 p-3.5 border border-cream-200/80 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-8 w-8 rounded-full bg-wine-600 text-cream-50 text-xs font-bold">
                    <Store className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] text-ink-700/60 dark:text-gray-400 uppercase font-semibold">Artisan Partner</p>
                    <p className="text-xs sm:text-sm font-bold text-wine-900 dark:text-gold-300">
                      {hamper.vendor_name}
                      {hamper.vendor_shop_no && <span className="ml-1.5 font-normal text-xs text-ink-700/60">({hamper.vendor_shop_no})</span>}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sage-600 dark:text-sage-400 bg-sage-500/10 px-2.5 py-1 rounded-full border border-sage-500/20">
                  <ShieldCheck className="h-3.5 w-3.5" /> Studio Verified
                </span>
              </div>

              {/* Stock Warning Banner */}
              {stockCheck.isOut && (
                <div className="mt-3 rounded-2xl bg-red-50 dark:bg-red-950/40 p-3 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Item Temporarily Unavailable</span>
                    {stockCheck.warningMsg}
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm text-ink-700/80 dark:text-gray-300 leading-relaxed">
                {hamper.description}
              </p>

              {/* Includes List */}
              <div className="mt-4 rounded-2xl border border-cream-200/80 dark:border-stone-800 bg-cream-100/50 dark:bg-stone-900/40 p-4">
                <h4 className="font-display font-bold text-wine-900 dark:text-gold-300 text-xs uppercase tracking-wider mb-2.5">
                  Contents included:
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {hamper.items.map((it) => (
                    <li key={it.id} className="flex items-center gap-2 text-ink-800 dark:text-gray-200">
                      <span className="grid place-items-center h-4 w-4 rounded-full bg-sage-500/20 text-sage-600 dark:text-sage-400 shrink-0">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span>
                        <strong className="font-semibold">{it.name}</strong>
                        {it.quantity > 1 && <span className="ml-1 text-wine-700 dark:text-gold-300 font-bold">(×{it.quantity})</span>}
                        {it.customization_details && <span className="ml-2 text-ink-700/50 dark:text-gray-400 italic">({it.customization_details})</span>}
                      </span>
                    </li>
                  ))}
                  {hamper.packaging_charge > 0 && (
                    <li className="flex items-center gap-2 text-ink-800 dark:text-gray-200">
                      <span className="grid place-items-center h-4 w-4 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 shrink-0">
                        <Sparkles className="h-2.5 w-2.5" />
                      </span>
                      <span>
                        <strong className="font-semibold">Keepsake Luxury Box + Hand-Tied Satin Ribbon</strong>
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Personalization Note Input */}
              <div className="mt-3.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-700/70 dark:text-gray-300 mb-1">
                  Complimentary Gift Message Card
                </label>
                <input
                  type="text"
                  value={personalizationNote}
                  onChange={(e) => setPersonalizationNote(e.target.value)}
                  placeholder="e.g. Happy Birthday Ananya! Wishing you all the joy. - Rohan"
                  className="input text-xs"
                />
              </div>
            </div>

            {/* Notification */}
            {added && (
              <p className="rounded-xl bg-sage-500/15 p-2.5 text-center text-xs font-bold text-sage-700 dark:text-sage-300 border border-sage-500/30 animate-fade-in">
                ✓ Added hamper to your cart!
              </p>
            )}

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={stockCheck.isOut}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-wine-600/40 bg-white dark:bg-stone-800 py-3 text-xs sm:text-sm font-bold text-wine-800 dark:text-cream-100 hover:bg-wine-600 hover:text-white transition-colors disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={stockCheck.isOut}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-wine-700 to-wine-600 py-3 text-xs sm:text-sm font-bold text-white hover:from-wine-800 hover:to-wine-700 transition-all shadow-md shadow-wine-900/25 disabled:opacity-50"
              >
                <Zap className="h-4 w-4 text-gold-300" />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
