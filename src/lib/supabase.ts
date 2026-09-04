import { createClient } from '@supabase/supabase-js';

const url =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (import.meta.env.SUPABASE_URL as string) ||
  '';

const anonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.SUPABASE_ANON_KEY as string) ||
  (import.meta.env.SUPABASE_PUBLISHABLE_KEY as string) ||
  '';

export const supabase = url && anonKey && !url.includes('your_supabase_url')
  ? createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  : null;

export type Profile = {
  id: string;
  email?: string | null;
  role: 'admin' | 'vendor' | 'user';
  full_name: string | null;
  business_name: string | null;
  shop_no: string | null;
  gst_no: string | null;
  phone: string | null;
  avatar_url?: string | null;
  email_verified?: boolean;
  account_status?: string;
  admin_requested?: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  vendor_id: string | null;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string | null;
  tag: string | null;
  is_offer: boolean;
  original_price: number | null;
  stock: number;
  is_featured?: boolean;
  is_best_seller?: boolean;
  personalization_options?: string[];
  created_at: string;
};

export type OrderRow = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  address: string | null;
  items: Array<{ slug: string; name: string; price: number; qty: number }>;
  total: number;
  status: 'new' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
};
