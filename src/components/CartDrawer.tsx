import { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart, formatPrice, type CartItem } from '@/cart';
import { useNavigate } from 'react-router-dom';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { items, isOpen, close, setQty, remove, subtotal, count } = useCart();
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleGoToCart = () => {
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';
    close();
    navigate('/cart');
  };

  const handleGoToCheckout = () => {
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';
    close();
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-ink-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-cream-50 dark:bg-gray-900 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-wine-600 dark:text-gold-300" strokeWidth={1.6} />
            <h2 className="font-display text-lg font-semibold text-wine-700 dark:text-white">
              Your Basket {count > 0 && <span className="text-ink-700/50 dark:text-gray-400">({count})</span>}
            </h2>
          </div>
          <button
            onClick={close}
            className="grid place-items-center h-9 w-9 rounded-full hover:bg-cream-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="grid place-items-center h-16 w-16 rounded-full bg-cream-100 dark:bg-gray-800">
              <ShoppingBag className="h-7 w-7 text-wine-600/40 dark:text-gold-300/40" strokeWidth={1.4} />
            </div>
            <p className="font-display text-lg text-wine-700 dark:text-white">Your basket is empty</p>
            <p className="text-sm text-ink-700/60 dark:text-gray-400 max-w-xs">
              Add a hamper or two — we'll hand-pack it on the day that matters.
            </p>
            <button
              onClick={close}
              className="mt-2 rounded-full bg-wine-600 px-6 py-2.5 text-sm font-medium text-cream-50 hover:bg-wine-700 transition-colors"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.slug}
                  className="flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-wine-700 dark:text-white text-sm leading-snug truncate">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => setItemToRemove(item)}
                        className="text-ink-700/40 hover:text-wine-600 dark:text-gray-400 dark:hover:text-wine-400 transition-colors p-1 rounded-md"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-ink-700/70 dark:text-gray-300">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-full border border-cream-300 bg-cream-50 dark:border-gray-600 dark:bg-gray-700">
                        <button
                          onClick={() => {
                            if (item.qty <= 1) {
                              setItemToRemove(item);
                            } else {
                              setQty(item.product.slug, item.qty - 1);
                            }
                          }}
                          className="grid place-items-center h-8 w-8 rounded-full hover:bg-cream-200 dark:hover:bg-gray-600 transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium text-wine-800 dark:text-white">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => setQty(item.product.slug, item.qty + 1)}
                          className="grid place-items-center h-8 w-8 rounded-full hover:bg-cream-200 dark:hover:bg-gray-600 transition-colors"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>
                      <span className="ml-auto text-sm font-semibold text-wine-800 dark:text-gold-300">
                        {formatPrice(item.product.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-200 dark:border-gray-800 px-6 py-5 space-y-3 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between text-sm text-ink-700/70 dark:text-gray-300">
                <span>Subtotal</span>
                <span className="font-semibold text-wine-800 dark:text-white">{formatPrice(subtotal)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleGoToCart}
                  className="w-full inline-flex items-center justify-center rounded-full border border-wine-600 py-3 text-xs font-bold text-wine-700 dark:text-gold-300 dark:border-gold-300 transition-all hover:bg-cream-100 dark:hover:bg-gray-700"
                >
                  View Full Cart
                </button>
                <button
                  onClick={handleGoToCheckout}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-wine-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-wine-700"
                >
                  Checkout <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Reusable Confirmation Dialog for Removing Hamper from Basket */}
      <ConfirmationDialog
        isOpen={!!itemToRemove}
        title="Remove from Cart?"
        message={`Are you sure you want to remove "${itemToRemove?.product.name}" from your basket?`}
        confirmText="Remove Item"
        cancelText="Keep in Basket"
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
    </>
  );
}
