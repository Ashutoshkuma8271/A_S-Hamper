import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartProduct } from '@/cart';
import { useCart } from '@/cart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

type WishlistContextValue = {
  items: CartProduct[];
  toggleWishlist: (product: CartProduct) => void;
  removeFromWishlist: (idOrSlug: string) => void;
  moveToCart: (product: CartProduct) => void;
  isWishlisted: (idOrSlug: string) => boolean;
  wishlistCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const WISHLIST_STORAGE_BASE = 'as_hamper_wishlist_v3';

function getWishlistKey(userId?: string): string {
  return userId ? `${WISHLIST_STORAGE_BASE}_user_${userId}` : `${WISHLIST_STORAGE_BASE}_guest`;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { add } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User-scoped wishlist state
  const [items, setItems] = useState<CartProduct[]>([]);

  // Load wishlist items whenever user session changes
  useEffect(() => {
    try {
      const key = getWishlistKey(userId);
      const saved = localStorage.getItem(key);
      setItems(saved ? JSON.parse(saved) : []);
    } catch {
      setItems([]);
    }
  }, [userId]);

  // Sync to local storage per user ID
  useEffect(() => {
    try {
      const key = getWishlistKey(userId);
      localStorage.setItem(key, JSON.stringify(items));
    } catch (err) {
      console.error('Error saving wishlist to localStorage:', err);
    }
  }, [items, userId]);

  // Load and merge user wishlist from Supabase upon authentication (Requirements 13 & 14)
  useEffect(() => {
    let mounted = true;

    async function syncUserWishlist() {
      if (!session?.user || !supabase) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch saved user wishlist entries from Supabase
        const { data: remoteData, error: fetchErr } = await supabase
          .from('wishlist')
          .select('product_id, product_data')
          .eq('user_id', session.user.id);

        if (fetchErr) {
          // If table doesn't exist yet, graceful fallback to local storage
          console.warn('Supabase wishlist fetch warning (table missing or RLS):', fetchErr.message);
          if (mounted) setLoading(false);
          return;
        }

        if (remoteData && mounted) {
          const remoteProducts: CartProduct[] = remoteData
            .map((row: any) => row.product_data)
            .filter(Boolean);

          // Merge guest local items with remote items without duplicates (Requirement 13)
          const mergedMap = new Map<string, CartProduct>();
          remoteProducts.forEach((p) => mergedMap.set(p.id || p.slug, p));
          items.forEach((p) => mergedMap.set(p.id || p.slug, p));

          const mergedList = Array.from(mergedMap.values());
          setItems(mergedList);

          // Sync merged items back to Supabase if guest items were added
          if (items.length > 0) {
            const insertRows = mergedList.map((p) => ({
              user_id: session.user.id,
              product_id: p.id || p.slug,
              vendor_id: p.vendor_id || null,
              product_data: p,
            }));

            await supabase.from('wishlist').upsert(insertRows, { onConflict: 'user_id,product_id' });
          }
        }
      } catch (err) {
        console.error('Wishlist Supabase sync error:', err);
        if (mounted) setError('Unable to load your Wishlist from account.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    syncUserWishlist();

    return () => {
      mounted = false;
    };
  }, [session?.user?.id]);

  // Toggle wishlist state with immediate toast (Requirements 2 & 5)
  const toggleWishlist = async (product: CartProduct) => {
    const idOrSlug = product.id || product.slug;
    const exists = items.some((i) => (i.id || i.slug) === idOrSlug);

    if (exists) {
      // Remove from wishlist
      setItems((prev) => prev.filter((i) => (i.id || i.slug) !== idOrSlug));
      toast('Removed from Wishlist', {
        id: `wishlist-${idOrSlug}`,
        icon: '💔',
      });

      if (session?.user && supabase) {
        try {
          await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', session.user.id)
            .eq('product_id', idOrSlug);
        } catch (e) {
          console.error('Supabase wishlist delete error:', e);
        }
      }
    } else {
      if (!session) {
        toast.error('Please sign in or create a customer account to save hampers to your wishlist.', {
          id: 'auth-required-wishlist',
          duration: 4000,
        });
        return;
      }

      // Add to wishlist
      setItems((prev) => [...prev, product]);
      toast.success('Added to Wishlist', {
        id: `wishlist-${idOrSlug}`,
        icon: '❤️',
      });

      if (session?.user && supabase) {
        try {
          await supabase.from('wishlist').upsert([
            {
              user_id: session.user.id,
              product_id: idOrSlug,
              vendor_id: product.vendor_id || null,
              product_data: product,
            },
          ]);
        } catch (e) {
          console.error('Supabase wishlist insert error:', e);
        }
      }
    }
  };

  const removeFromWishlist = async (idOrSlug: string) => {
    const target = items.find((i) => (i.id || i.slug) === idOrSlug);
    setItems((prev) => prev.filter((i) => (i.id || i.slug) !== idOrSlug));
    toast('Removed from Wishlist', {
      id: `wishlist-${idOrSlug}`,
      icon: '💔',
    });

    if (session?.user && supabase) {
      try {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', session.user.id)
          .eq('product_id', idOrSlug);
      } catch (e) {
        console.error('Supabase wishlist remove error:', e);
      }
    }
  };

  // Move product to cart (Adds to cart & removes from wishlist - Requirement 7)
  const moveToCart = (product: CartProduct) => {
    add(product);
    removeFromWishlist(product.id || product.slug);
    toast.success('Moved to Cart', {
      id: `move-${product.id || product.slug}`,
      icon: '📦',
    });
  };

  const isWishlisted = (idOrSlug: string) => {
    return items.some((i) => i.id === idOrSlug || i.slug === idOrSlug);
  };

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      toggleWishlist,
      removeFromWishlist,
      moveToCart,
      isWishlisted,
      wishlistCount: items.length,
      loading,
      error,
      refetch: async () => {},
    }),
    [items, loading, error]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
