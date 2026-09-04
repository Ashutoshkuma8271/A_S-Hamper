import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export type CustomizationDetails = {
  text?: string;
  color?: string;
  addOns?: string[];
  vendor_id?: string;
  vendor_name?: string;
  vendor_shop_no?: string;
  original_price?: number;
  packaging_charge?: number;
  customization_charge?: number;
};

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  original_price?: number | null;
  image: string;
  description?: string | null;
  tag?: string | null;
  vendor_id?: string;
  vendor_name?: string;
  vendor_shop_no?: string;
  customization?: CustomizationDetails;
  rating?: number;
};

export type CartItem = {
  product: CartProduct;
  qty: number;
};

export type AppliedCoupon = {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: AppliedCoupon | null;
  add: (product: CartProduct) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  open: () => void;
  close: () => void;
  clear: () => void;
  count: number;
  subtotal: number;
  originalTotal: number;
  discountTotal: number;
  customizationTotal: number;
  couponDiscount: number;
  deliveryCharge: number;
  finalTotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

import { useAuth } from '@/hooks/useAuth';

const CART_STORAGE_BASE = 'as_hamper_cart_v3';
const COUPON_STORAGE_BASE = 'as_hamper_coupon_v3';

function getCartKey(userId?: string): string {
  return userId ? `${CART_STORAGE_BASE}_user_${userId}` : `${CART_STORAGE_BASE}_guest`;
}

function getCouponKey(userId?: string): string {
  return userId ? `${COUPON_STORAGE_BASE}_user_${userId}` : `${COUPON_STORAGE_BASE}_guest`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Sync / load user-scoped cart items on mount & session changes
  useEffect(() => {
    try {
      const key = getCartKey(userId);
      const saved = localStorage.getItem(key);
      setItems(saved ? JSON.parse(saved) : []);
    } catch {
      setItems([]);
    }

    try {
      const couponKey = getCouponKey(userId);
      const savedCoupon = localStorage.getItem(couponKey);
      setAppliedCoupon(savedCoupon ? JSON.parse(savedCoupon) : null);
    } catch {
      setAppliedCoupon(null);
    }
  }, [userId]);

  // Save cart items whenever items state updates
  useEffect(() => {
    try {
      const key = getCartKey(userId);
      localStorage.setItem(key, JSON.stringify(items));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }, [items, userId]);

  // Save coupon whenever appliedCoupon updates
  useEffect(() => {
    try {
      const couponKey = getCouponKey(userId);
      if (appliedCoupon) {
        localStorage.setItem(couponKey, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(couponKey);
      }
    } catch (err) {
      console.error('Error saving coupon to localStorage:', err);
    }
  }, [appliedCoupon, userId]);

  const add = (product: CartProduct) => {
    if (!session) {
      toast.error('Please sign in or create a customer account to add items to your cart.', {
        id: 'auth-required-cart',
        duration: 4000,
      });
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.slug === product.slug);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + 1,
        };
        return updated;
      }
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`Added "${product.name}" to cart`, {
      id: `cart-${product.slug}`,
    });
  };

  const remove = (slug: string) =>
    setItems((prev) => prev.filter((i) => i.product.slug !== slug));

  const setQty = (slug: string, qty: number) =>
    setItems((prev) =>
      prev
        .map((i) => (i.product.slug === slug ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0)
    );

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Please enter a valid coupon code.' };

    // Fallback static coupon validation if offline or demo
    if (cleanCode === 'WELCOME10') {
      const discountVal = 10;
      setAppliedCoupon({
        code: cleanCode,
        discount_type: 'percentage',
        discount_value: discountVal,
        discount_amount: 0, // Calculated dynamically in value
      });
      return { success: true, message: 'Coupon WELCOME10 applied! (10% OFF)' };
    }

    if (cleanCode === 'FESTIVE300') {
      setAppliedCoupon({
        code: cleanCode,
        discount_type: 'fixed',
        discount_value: 300,
        discount_amount: 300,
      });
      return { success: true, message: 'Coupon FESTIVE300 applied! (₹300 OFF)' };
    }

    if (supabase) {
      try {
        const { data: dbCoupon, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', cleanCode)
          .eq('is_active', true)
          .maybeSingle();

        if (!error && dbCoupon) {
          setAppliedCoupon({
            code: dbCoupon.code,
            discount_type: dbCoupon.discount_type as 'percentage' | 'fixed',
            discount_value: Number(dbCoupon.discount_value),
            discount_amount: 0,
          });
          return { success: true, message: `Coupon ${dbCoupon.code} applied successfully!` };
        }
      } catch (err) {
        console.error('Error validating coupon:', err);
      }
    }

    return { success: false, message: 'Invalid or expired coupon code. Try WELCOME10 or FESTIVE300.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    
    // Calculated price metrics
    const subtotal = items.reduce((sum, i) => sum + i.qty * i.product.price, 0);

    const originalTotal = items.reduce((sum, i) => {
      const orig = i.product.original_price || i.product.customization?.original_price || Math.ceil(i.product.price / 0.82 / 50) * 50;
      return sum + i.qty * orig;
    }, 0);

    const customizationTotal = items.reduce((sum, i) => {
      const custFee = (i.product.customization?.packaging_charge || 0) + (i.product.customization?.customization_charge || 0);
      return sum + i.qty * custFee;
    }, 0);

    const discountTotal = Math.max(0, originalTotal - subtotal);

    // Dynamic Coupon calculation
    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === 'percentage') {
        couponDiscount = Math.round((subtotal * appliedCoupon.discount_value) / 100);
      } else {
        couponDiscount = Math.min(subtotal, appliedCoupon.discount_value);
      }
    }

    // Free delivery for orders over ₹999, else ₹99
    const deliveryCharge = count > 0 && subtotal < 999 ? 99 : 0;
    const finalTotal = Math.max(0, subtotal + customizationTotal - couponDiscount + deliveryCharge);

    return {
      items,
      isOpen,
      appliedCoupon,
      add,
      remove,
      setQty,
      applyCoupon,
      removeCoupon,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      clear: () => {
        setItems([]);
        setAppliedCoupon(null);
      },
      count,
      subtotal,
      originalTotal,
      discountTotal,
      customizationTotal,
      couponDiscount,
      deliveryCharge,
      finalTotal,
    };
  }, [items, isOpen, appliedCoupon]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}
