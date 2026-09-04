-- ==============================================================================
-- A_S HAMPER - PRODUCTION MASTER DATABASE SCHEMA & REALTIME SETUP
-- Run this complete script in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP PREVIOUS TABLES (Clean Slate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.delivery_addresses CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.wishlist CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==============================================================================
-- 3. CORE PROFILES TABLE
-- ==============================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'admin')),
  phone TEXT DEFAULT '',
  wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
  email_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT DEFAULT '',
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 4. VENDORS & ARTISAN STUDIOS TABLE
-- ==============================================================================
CREATE TABLE public.vendors (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  shop_id TEXT UNIQUE,
  phone TEXT DEFAULT '',
  gst_number TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  pincode TEXT DEFAULT '',
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  commission_rate NUMERIC(5, 2) DEFAULT 10.00,
  total_sales NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 5. ADMINS TABLE
-- ==============================================================================
CREATE TABLE public.admins (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT 'Store Administrator',
  role TEXT DEFAULT 'admin',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enforce Exactly 1 Admin Limit at Database Level
CREATE OR REPLACE FUNCTION public.check_single_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.admins WHERE id != NEW.id) >= 1 THEN
    RAISE EXCEPTION 'Security Policy: Only one Administrator is permitted on this platform.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_admin
  BEFORE INSERT ON public.admins
  FOR EACH ROW EXECUTE FUNCTION public.check_single_admin();

-- ==============================================================================
-- 6. PRODUCTS & LUXURY HAMPERS TABLE
-- ==============================================================================
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  description TEXT DEFAULT '',
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'all',
  in_stock BOOLEAN DEFAULT TRUE,
  stock_count INTEGER DEFAULT 50,
  rating NUMERIC(3, 2) DEFAULT 4.9,
  review_count INTEGER DEFAULT 18,
  featured BOOLEAN DEFAULT FALSE,
  best_seller BOOLEAN DEFAULT FALSE,
  vendor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vendor_name TEXT DEFAULT 'A_S Artisan Studio',
  items TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 7. ORDERS TABLE
-- ==============================================================================
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_slot TEXT DEFAULT 'Standard Express (3-4 Days)',
  gift_card_note TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2),
  discount NUMERIC(10, 2) DEFAULT 0.00,
  delivery_charge NUMERIC(10, 2) DEFAULT 0.00,
  customization_charge NUMERIC(10, 2) DEFAULT 0.00,
  wallet_discount NUMERIC(10, 2) DEFAULT 0.00,
  payment_method TEXT DEFAULT 'Razorpay Online',
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending_cod', 'failed', 'refunded')),
  payment_id TEXT,
  status TEXT DEFAULT 'placed' CHECK (status IN ('placed', 'preparing', 'packed', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled')),
  estimated_delivery TEXT DEFAULT '3-4 Business Days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 8. ORDER ITEMS (Multi-Vendor Splitting)
-- ==============================================================================
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vendor_name TEXT DEFAULT 'A_S Artisan Studio',
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  image TEXT,
  subtotal NUMERIC(10, 2) NOT NULL,
  item_status TEXT DEFAULT 'confirmed' CHECK (item_status IN ('confirmed', 'preparing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 9. DELIVERY ADDRESSES
-- ==============================================================================
CREATE TABLE public.delivery_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  house_no TEXT NOT NULL,
  street TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  address_type TEXT DEFAULT 'Home' CHECK (address_type IN ('Home', 'Work', 'Other')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 10. WISHLIST
-- ==============================================================================
CREATE TABLE public.wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- ==============================================================================
-- 11. REVIEWS & RATINGS
-- ==============================================================================
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 12. PROMO COUPONS TABLE
-- ==============================================================================
CREATE TABLE public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
  max_discount NUMERIC(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 13. WALLET TRANSACTIONS TABLE
-- ==============================================================================
CREATE TABLE public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id TEXT,
  type TEXT CHECK (type IN ('credit', 'debit', 'refund', 'purchase', 'cashback')) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  balance_before NUMERIC(10, 2) NOT NULL,
  balance_after NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 14. AUTH HOOK TRIGGER (Auto-creates Profiles, Admins, Vendors upon signup)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  full_name_val TEXT;
  avatar_url_val TEXT;
  phone_val TEXT;
  business_name_val TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'account_type', 'user');
  full_name_val := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1));
  avatar_url_val := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '');
  phone_val := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  business_name_val := COALESCE(NEW.raw_user_meta_data->>'business_name', full_name_val);

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, phone, email_verified, account_status)
  VALUES (
    NEW.id,
    NEW.email,
    full_name_val,
    avatar_url_val,
    user_role,
    phone_val,
    (NEW.email_confirmed_at IS NOT NULL OR NEW.raw_app_meta_data->>'provider' = 'google'),
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    avatar_url = CASE WHEN EXCLUDED.avatar_url <> '' THEN EXCLUDED.avatar_url ELSE public.profiles.avatar_url END,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    email_verified = (NEW.email_confirmed_at IS NOT NULL OR NEW.raw_app_meta_data->>'provider' = 'google');

  -- If Admin
  IF user_role = 'admin' THEN
    INSERT INTO public.admins (id, email, full_name, role, status)
    VALUES (NEW.id, NEW.email, full_name_val, 'admin', 'active')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, status = 'active';
  END IF;

  -- If Vendor
  IF user_role = 'vendor' THEN
    INSERT INTO public.vendors (
      id, email, business_name, shop_id, phone,
      gst_number, address, city, state, pincode, status
    )
    VALUES (
      NEW.id,
      NEW.email,
      business_name_val,
      COALESCE(NEW.raw_user_meta_data->>'shop_id', 'SHOP-' || SUBSTRING(NEW.id::text, 1, 6)),
      phone_val,
      COALESCE(NEW.raw_user_meta_data->>'gst_number', ''),
      COALESCE(NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'city', ''),
      COALESCE(NEW.raw_user_meta_data->>'state', ''),
      COALESCE(NEW.raw_user_meta_data->>'pincode', ''),
      'approved'
    )
    ON CONFLICT (id) DO UPDATE
    SET
      business_name = EXCLUDED.business_name,
      phone = EXCLUDED.phone;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins & Vendors Policies
CREATE POLICY "Admins viewable by authenticated users" ON public.admins FOR SELECT USING (true);
CREATE POLICY "Vendors viewable by everyone" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Vendors can update own data" ON public.vendors FOR UPDATE USING (auth.uid() = id);

-- Products Policies
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Vendors and Admins can insert products" ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Vendors and Admins can update products" ON public.products FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Vendors and Admins can delete products" ON public.products FOR DELETE USING (auth.uid() IS NOT NULL);

-- Orders Policies
CREATE POLICY "Orders viewable by customer or vendor or admin" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR
  auth.uid() IN (SELECT id FROM public.admins) OR
  auth.uid() IN (SELECT id FROM public.vendors) OR
  user_id IS NULL
);
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins and Customers can update orders" ON public.orders FOR UPDATE USING (true);

-- Order Items Policies
CREATE POLICY "Order items viewable by all relevant parties" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Order items insertable on order creation" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Vendors and Admins can update order items" ON public.order_items FOR UPDATE USING (true);

-- Delivery Addresses Policies
CREATE POLICY "Users can manage their own addresses" ON public.delivery_addresses FOR ALL USING (auth.uid() = user_id);

-- Wishlist Policies
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- Reviews Policies
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Coupons Policies
CREATE POLICY "Coupons viewable by everyone" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (auth.uid() IN (SELECT id FROM public.admins));

-- Wallet Transactions Policies
CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert wallet transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 16. REALTIME REPLICATION ENABLEMENT
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_addresses;

-- ==============================================================================
-- 17. SEED INITIAL LUXURY HAMPERS & PROMO COUPONS
-- ==============================================================================
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, is_active)
VALUES
  ('WELCOME10', 'percentage', 10.00, 1000.00, true),
  ('FESTIVE15', 'percentage', 15.00, 2500.00, true),
  ('LUXURY20', 'percentage', 20.00, 5000.00, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.products (slug, name, price, original_price, description, image, category, in_stock, stock_count, rating, review_count, featured, best_seller, vendor_name, items, tags)
VALUES
  (
    'champagne-trousseau-trunk',
    'Champagne Trousseau Trunk',
    6800.00,
    8300.00,
    'An opulent trousseau trunk layered with imported Belgian pralines, artisanal scented soy candles, organic floral honey, gold-accented champagne flutes, and hand-tied botanical bouquets.',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    'wedding',
    true,
    25,
    4.95,
    42,
    true,
    true,
    'A_S Artisan Studio',
    ARRAY['Handcrafted Velvet Trunk', 'Belgian Praline Assortment', 'Artisan Soy Candle', 'Gold Champagne Flutes', 'Wax Sealed Note'],
    ARRAY['bestseller', 'luxury', 'wedding', 'anniversary']
  ),
  (
    'royal-velvet-festive-hamper',
    'Royal Velvet Festive Hamper',
    4950.00,
    5800.00,
    'A majestic festive collection housed in deep wine velvet casing. Features Kashmiri saffron, slow-roasted Iranian pistachios, silver-leafed sweets, and brass diyas.',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    'festive',
    true,
    40,
    4.90,
    36,
    true,
    true,
    'A_S Artisan Studio',
    ARRAY['Embossed Velvet Box', 'Kashmiri Saffron (1g)', 'Roasted Pistachios (250g)', 'Artisan Brass Diya', 'Silver Delights'],
    ARRAY['festive', 'diwali', 'luxury']
  ),
  (
    'artisan-gourmet-botanical-box',
    'Artisan Gourmet & Botanical Box',
    3450.00,
    4200.00,
    'Hand-curated for the refined palate. Includes organic cold-pressed olive oil, truffle butter crisps, dark cocoa nibs, single-estate Darjeeling tea, and a handmade olivewood spoon.',
    'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=800&auto=format&fit=crop&q=80',
    'gourmet',
    true,
    30,
    4.88,
    28,
    false,
    true,
    'A_S Artisan Studio',
    ARRAY['Pine Wood Sliding Box', 'Single-Estate Darjeeling Tea', 'Artisan Cocoa Nibs', 'Truffle Crisps', 'Olivewood Spoon'],
    ARRAY['gourmet', 'corporate', 'tea']
  ),
  (
    'midnight-elegance-anniversary-hamper',
    'Midnight Elegance Anniversary Hamper',
    5600.00,
    6900.00,
    'A timeless romantic tribute featuring gold foil-stamped keepsakes, artisan Turkish rose delights, silk eye masks, and personalized fragrance diffusers.',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    'anniversary',
    true,
    20,
    4.96,
    51,
    true,
    false,
    'A_S Artisan Studio',
    ARRAY['Matte Black Keepsake Box', 'Turkish Rose Delights', 'Pure Silk Eye Mask', 'Aroma Diffuser', 'Custom Note'],
    ARRAY['anniversary', 'romance', 'bestseller']
  )
ON CONFLICT (slug) DO NOTHING;
