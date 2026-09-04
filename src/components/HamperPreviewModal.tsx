import { useState } from 'react';
import { type VendorHamper } from '@/lib/vendorStore';
import { formatPrice } from '@/cart';
import { X, Check, Store, Package, Tag, AlertCircle, Layers } from 'lucide-react';

export default function HamperPreviewModal({
  hamper,
  onClose,
  onPublish,
  isApprovalRequired,
}: {
  hamper: VendorHamper;
  onClose: () => void;
  onPublish: () => void;
  isApprovalRequired: boolean;
}) {
  const [activeImage, setActiveImage] = useState(hamper.thumbnail || hamper.images[0]);

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-ink-900/60 backdrop-blur-md p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-3xl rounded-3xl bg-cream-50 ring-1 ring-cream-300 shadow-2xl overflow-hidden dark:bg-gray-800 dark:ring-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 bg-cream-100/60 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-wine-700 dark:text-gold-300 font-display font-semibold text-lg">
            <Package className="h-5 w-5 text-gold-600" />
            Website Preview: Hamper Details
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center h-8 w-8 rounded-full text-ink-700/60 hover:bg-cream-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-gold-500/15 border-b border-gold-400/30 px-6 py-3 text-xs text-wine-800 dark:text-gold-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Tag className="h-4 w-4 shrink-0 text-gold-600" />
            Review all details before publishing this hamper to the customer-facing website.
          </span>
          <span className="font-semibold uppercase tracking-wider text-[10px] bg-gold-500/30 px-2 py-0.5 rounded-full">
            {isApprovalRequired ? 'Needs Admin Approval' : 'Direct Publish'}
          </span>
        </div>

        {/* Main Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Gallery */}
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-cream-100 ring-1 ring-cream-200 dark:bg-gray-900">
                <img
                  src={activeImage}
                  alt={hamper.name}
                  className="h-full w-full object-cover transition-all"
                />
              </div>
              {hamper.images && hamper.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {hamper.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`h-14 w-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImage === img ? 'border-wine-600 ring-2 ring-wine-600/30' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Pricing */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {hamper.categories.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-gold-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-wine-800 dark:text-gold-300"
                    >
                      {c}
                    </span>
                  ))}
                  {hamper.discount_percent && hamper.discount_percent > 0 ? (
                    <span className="rounded-full bg-wine-600 px-2.5 py-1 text-[11px] font-bold text-cream-50">
                      {hamper.discount_percent}% OFF
                    </span>
                  ) : null}
                </div>

                <h3 className="font-display text-2xl font-semibold text-wine-800 dark:text-white leading-tight">
                  {hamper.name}
                </h3>

                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-display text-3xl font-bold text-wine-800 dark:text-gold-300">
                    {formatPrice(hamper.selling_price)}
                  </span>
                  {hamper.original_price && hamper.original_price > hamper.selling_price && (
                    <span className="text-base text-ink-700/40 line-through dark:text-gray-400 font-medium">
                      {formatPrice(hamper.original_price)}
                    </span>
                  )}
                </div>

                <div className="mt-4 rounded-xl bg-cream-100/60 p-3 ring-1 ring-cream-200 dark:bg-gray-900/60 dark:ring-gray-700 flex items-center gap-3 text-xs text-ink-700/70 dark:text-gray-300">
                  <Store className="h-4 w-4 text-gold-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-wine-700 dark:text-gold-300">{hamper.vendor_name}</span>
                    {hamper.vendor_shop_no && <span className="ml-1 text-ink-700/50">({hamper.vendor_shop_no})</span>}
                    <p className="text-[11px] text-ink-700/50">Stock Available: {hamper.stock} hampers</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-ink-700/75 dark:text-gray-300 leading-relaxed">
                  {hamper.description || 'No description provided.'}
                </p>
              </div>

              {/* Tags */}
              {hamper.tags && hamper.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {hamper.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-cream-300 bg-cream-50 px-2 py-0.5 text-[11px] text-ink-700/70 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Included Items Section */}
          <div className="rounded-2xl border border-cream-200 bg-cream-100/40 p-5 dark:border-gray-700 dark:bg-gray-900/40">
            <h4 className="font-display font-semibold text-wine-700 dark:text-gold-300 text-sm uppercase tracking-wide flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-gold-600" />
              Products Included in this Gift Hamper ({hamper.items.length})
            </h4>

            <div className="divide-y divide-cream-200 dark:divide-gray-800">
              {hamper.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="grid place-items-center h-5 w-5 rounded-full bg-sage-500/20 text-sage-500 text-xs font-bold">
                      <Check className="h-3 w-3" />
                    </span>
                    <div>
                      <span className="font-medium text-wine-800 dark:text-white">{item.name}</span>
                      {item.is_custom && (
                        <span className="ml-2 rounded bg-gold-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-gold-700 dark:text-gold-300">
                          Custom Item
                        </span>
                      )}
                      {item.customization_details && (
                        <p className="text-xs text-ink-700/55 dark:text-gray-400">{item.customization_details}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-wine-700 dark:text-gold-300">
                      Qty: {item.quantity}
                    </span>
                    <span className="block text-[11px] text-ink-700/50">{formatPrice(item.price)} each</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="mt-4 border-t border-cream-200 pt-3 dark:border-gray-700 text-xs text-ink-700/70 dark:text-gray-300 space-y-1.5">
              <div className="flex justify-between">
                <span>Items Cost Total</span>
                <span>{formatPrice(hamper.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
              </div>
              {hamper.packaging_charge > 0 && (
                <div className="flex justify-between">
                  <span>Packaging Charge</span>
                  <span>{formatPrice(hamper.packaging_charge)}</span>
                </div>
              )}
              {hamper.customization_charge > 0 && (
                <div className="flex justify-between">
                  <span>Customization Fee</span>
                  <span>{formatPrice(hamper.customization_charge)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-wine-800 dark:text-white pt-1 text-sm border-t border-cream-200 dark:border-gray-800">
                <span>Computed Vendor Cost</span>
                <span>{formatPrice(hamper.total_cost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-cream-200 bg-cream-100/60 p-6 dark:border-gray-700 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-full border border-cream-300 bg-cream-50 px-6 py-3 text-sm font-medium text-ink-700 hover:bg-cream-200 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            Back to Edit
          </button>

          <button
            onClick={onPublish}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-wine-600 px-8 py-3.5 text-sm font-semibold text-cream-50 hover:bg-wine-700 shadow-md transition-all hover:scale-105"
          >
            <Check className="h-4 w-4" />
            {isApprovalRequired ? 'Submit for Admin Approval' : 'Publish on Website Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
