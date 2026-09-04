import { supabase } from '@/lib/supabase';

export type VendorProduct = {
  id: string;
  vendor_id: string;
  vendor_name: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  size_weight?: string;
  is_available_for_hamper: boolean;
  max_quantity_per_hamper?: number;
  created_at: string;
};

export type HamperItem = {
  id: string;
  product_id?: string;
  is_custom: boolean;
  name: string;
  description?: string;
  image?: string;
  price: number;
  quantity: number;
  category?: string;
  customization_details?: string;
};

export type VendorHamper = {
  id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_shop_no?: string;
  name: string;
  slug: string;
  categories: string[]; // e.g. ['birthday', 'personalized']
  tags: string[]; // e.g. ['Birthday', 'Best Seller']
  description: string;
  thumbnail: string;
  images: string[];
  items: HamperItem[];
  packaging_charge: number;
  customization_charge: number;
  total_cost: number; // computed items + packaging + customization
  selling_price: number;
  original_price?: number;
  discount_percent?: number;
  stock: number;
  is_enabled: boolean;
  approval_status: 'approved' | 'pending' | 'rejected';
  rejection_reason?: string;
  is_published: boolean;
  is_featured?: boolean;
  created_at: string;
};

export type AdminSettingsState = {
  require_hamper_approval: boolean;
  allow_vendor_direct_publish: boolean;
  max_items_per_hamper: number;
};

export const HAMPER_CATEGORIES = [
  { id: 'birthday', name: 'Birthday Gifts', icon: '🎂', description: 'Confetti, cake, candlelight & birthday surprises' },
  { id: 'anniversary', name: 'Anniversary Gifts', icon: '💍', description: 'For the years worth toasting & celebrating' },
  { id: 'wedding', name: 'Wedding Gifts', icon: '💒', description: 'Trousseau-worthy luxury gifting for couples' },
  { id: 'personalized', name: 'Personalized Gifts', icon: '🎁', description: 'Monogrammed & custom curated keepsake hampers' },
  { id: 'corporate', name: 'Corporate Gifts', icon: '🏢', description: 'Branded, premium, bulk corporate gift sets' },
  { id: 'festival', name: 'Festival Gifts', icon: '🎉', description: 'Diwali, Christmas, Rakhi & festive joy' },
  { id: 'couple', name: 'Couple Gifts', icon: '❤️', description: 'Romance, cocoa, wine glasses & cozy moments' },
  { id: 'baby-shower', name: 'Baby Gifts', icon: '👶', description: 'Soft, sweet, nursery & brand new baby boxes' },
  { id: 'luxury', name: 'Luxury Hampers', icon: '💎', description: 'Extravagant keepsake baskets & artisan boxes' },
];

const INITIAL_VENDOR_PRODUCTS: VendorProduct[] = [
  {
    id: 'vp-101',
    vendor_id: 'v-demo-01',
    vendor_name: 'A_S Artisan Gifting',
    slug: 'artisanal-dark-chocolate-box',
    name: 'Artisanal Dark Chocolate Box',
    category: 'Chocolates',
    price: 299,
    image: 'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Assorted single-origin truffles & dark chocolates handcrafted in micro-batches.',
    stock: 50,
    size_weight: '250g',
    is_available_for_hamper: true,
    max_quantity_per_hamper: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'vp-102',
    vendor_id: 'v-demo-01',
    vendor_name: 'A_S Artisan Gifting',
    slug: 'fluffy-cuddle-teddy-bear',
    name: 'Fluffy Cuddle Teddy Bear',
    category: 'Toys',
    price: 499,
    image: 'https://images.pexels.com/photos/207891/pexels-photo-207891.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Ultra-soft velvet plush teddy bear in cream beige with a silk ribbon.',
    stock: 30,
    size_weight: '10 inches',
    is_available_for_hamper: true,
    max_quantity_per_hamper: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'vp-103',
    vendor_id: 'v-demo-01',
    vendor_name: 'A_S Artisan Gifting',
    slug: 'gold-foil-greeting-card',
    name: 'Gold Foil Birthday Greeting Card',
    category: 'Cards & Stationery',
    price: 99,
    image: 'https://images.pexels.com/photos/172289/pexels-photo-172289.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Hand-pressed gold foil card with custom envelope & wax seal stamp.',
    stock: 100,
    size_weight: 'A5 Size',
    is_available_for_hamper: true,
    max_quantity_per_hamper: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'vp-104',
    vendor_id: 'v-demo-01',
    vendor_name: 'A_S Artisan Gifting',
    slug: 'rose-french-perfume-mist',
    name: 'Rose French Perfume Mist',
    category: 'Perfumes',
    price: 799,
    image: 'https://images.pexels.com/photos/965980/pexels-photo-965980.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Delicate floral perfume spray infused with Damask rose & white musk notes.',
    stock: 20,
    size_weight: '100ml',
    is_available_for_hamper: true,
    max_quantity_per_hamper: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'vp-105',
    vendor_id: 'v-demo-01',
    vendor_name: 'A_S Artisan Gifting',
    slug: 'soy-scented-candle-pot',
    name: 'Soy Scented Candle Pot',
    category: 'Home Fragrance',
    price: 350,
    image: 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Hand-poured lavender & vanilla soy candle in ceramic pot with wood wick.',
    stock: 45,
    size_weight: '200g',
    is_available_for_hamper: true,
    max_quantity_per_hamper: 4,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_VENDOR_HAMPERS: VendorHamper[] = [
  {
    id: 'vh-201',
    vendor_id: 'v-demo-01',
    vendor_name: 'A_S Artisan Gifting',
    vendor_shop_no: 'SHOP-0142',
    name: 'Premium Birthday Hamper',
    slug: 'premium-birthday-hamper',
    categories: ['birthday', 'personalized'],
    tags: ['Birthday', 'Best Seller', 'Gifting Special'],
    description: 'A luxurious birthday surprise box containing gourmet chocolates, a cute cuddle teddy bear, a gold-foiled card, and custom champagne ribbon packaging.',
    thumbnail: 'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    images: [
      'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/207891/pexels-photo-207891.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    items: [
      {
        id: 'hi-1',
        product_id: 'vp-101',
        is_custom: false,
        name: 'Artisanal Dark Chocolate Box',
        price: 299,
        quantity: 1,
        category: 'Chocolates',
      },
      {
        id: 'hi-2',
        product_id: 'vp-102',
        is_custom: false,
        name: 'Fluffy Cuddle Teddy Bear',
        price: 499,
        quantity: 1,
        category: 'Toys',
      },
      {
        id: 'hi-3',
        product_id: 'vp-103',
        is_custom: false,
        name: 'Gold Foil Birthday Greeting Card',
        price: 99,
        quantity: 1,
        category: 'Cards & Stationery',
      },
    ],
    packaging_charge: 100,
    customization_charge: 50,
    total_cost: 1047,
    selling_price: 1299,
    original_price: 1599,
    discount_percent: 19,
    stock: 25,
    is_enabled: true,
    approval_status: 'approved',
    is_published: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'vh-202',
    vendor_id: 'v-demo-01',
    vendor_name: 'A_S Artisan Gifting',
    vendor_shop_no: 'SHOP-0142',
    name: 'Crimson Romance Anniversary Trunk',
    slug: 'crimson-romance-anniversary-trunk',
    categories: ['anniversary', 'couple', 'luxury'],
    tags: ['Anniversary', 'Couple', 'Luxury'],
    description: 'An elegant anniversary gift hamper featuring Damask rose mist, hand-poured lavender soy candle, artisan dark truffles, and velvet ribbon finish.',
    thumbnail: 'https://images.pexels.com/photos/6822851/pexels-photo-6822851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    images: [
      'https://images.pexels.com/photos/6822851/pexels-photo-6822851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/965980/pexels-photo-965980.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    items: [
      {
        id: 'hi-4',
        product_id: 'vp-101',
        is_custom: false,
        name: 'Artisanal Dark Chocolate Box',
        price: 299,
        quantity: 1,
        category: 'Chocolates',
      },
      {
        id: 'hi-5',
        product_id: 'vp-104',
        is_custom: false,
        name: 'Rose French Perfume Mist',
        price: 799,
        quantity: 1,
        category: 'Perfumes',
      },
      {
        id: 'hi-6',
        product_id: 'vp-105',
        is_custom: false,
        name: 'Soy Scented Candle Pot',
        price: 350,
        quantity: 1,
        category: 'Home Fragrance',
      },
    ],
    packaging_charge: 150,
    customization_charge: 100,
    total_cost: 1698,
    selling_price: 1999,
    original_price: 2499,
    discount_percent: 20,
    stock: 15,
    is_enabled: true,
    approval_status: 'approved',
    is_published: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
];

const LOCAL_PRODUCTS_KEY = 'as_hamper_vendor_products_v1';
const LOCAL_HAMPERS_KEY = 'as_hamper_vendor_hampers_v1';
const LOCAL_SETTINGS_KEY = 'as_hamper_admin_settings_v1';

export class VendorStore {
  private static getProductsFromStorage(): VendorProduct[] {
    try {
      const data = localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (!data) {
        localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_VENDOR_PRODUCTS));
        return INITIAL_VENDOR_PRODUCTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_VENDOR_PRODUCTS;
    }
  }

  private static saveProductsToStorage(products: VendorProduct[]) {
    try {
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save vendor products to localStorage', e);
    }
  }

  private static getHampersFromStorage(): VendorHamper[] {
    try {
      const data = localStorage.getItem(LOCAL_HAMPERS_KEY);
      if (!data) {
        localStorage.setItem(LOCAL_HAMPERS_KEY, JSON.stringify(INITIAL_VENDOR_HAMPERS));
        return INITIAL_VENDOR_HAMPERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_VENDOR_HAMPERS;
    }
  }

  private static saveHampersToStorage(hampers: VendorHamper[]) {
    try {
      localStorage.setItem(LOCAL_HAMPERS_KEY, JSON.stringify(hampers));
    } catch (e) {
      console.error('Failed to save vendor hampers to localStorage', e);
    }
  }

  public static getAdminSettings(): AdminSettingsState {
    try {
      const data = localStorage.getItem(LOCAL_SETTINGS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading admin settings', e);
    }
    return {
      require_hamper_approval: false,
      allow_vendor_direct_publish: true,
      max_items_per_hamper: 15,
    };
  }

  public static saveAdminSettings(settings: AdminSettingsState) {
    try {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving admin settings', e);
    }
  }

  // --- Vendor Products ---
  public static getAllVendorProducts(): VendorProduct[] {
    return this.getProductsFromStorage();
  }

  public static getProductsByVendor(vendorId: string): VendorProduct[] {
    return this.getProductsFromStorage().filter((p) => p.vendor_id === vendorId);
  }

  public static getHamperComponents(vendorId?: string): VendorProduct[] {
    const list = this.getProductsFromStorage().filter((p) => p.is_available_for_hamper);
    if (vendorId) {
      return list.filter((p) => p.vendor_id === vendorId);
    }
    return list;
  }

  public static saveVendorProduct(product: Partial<VendorProduct> & { name: string; price: number; vendor_id: string }): VendorProduct {
    const products = this.getProductsFromStorage();
    const existingIndex = products.findIndex((p) => p.id === product.id);

    const fullProduct: VendorProduct = {
      id: product.id || `vp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      vendor_id: product.vendor_id,
      vendor_name: product.vendor_name || 'My Vendor Shop',
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: product.name,
      category: product.category || 'General',
      price: product.price,
      image: product.image || 'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      description: product.description || '',
      stock: product.stock ?? 10,
      size_weight: product.size_weight || 'Standard',
      is_available_for_hamper: product.is_available_for_hamper ?? true,
      max_quantity_per_hamper: product.max_quantity_per_hamper ?? 5,
      created_at: product.created_at || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      if (products[existingIndex].vendor_id !== product.vendor_id && product.vendor_id !== 'admin') {
        throw new Error('Unauthorized: You can only edit your own products.');
      }
      products[existingIndex] = fullProduct;
    } else {
      products.unshift(fullProduct);
    }

    this.saveProductsToStorage(products);

    if (supabase) {
      supabase.from('products').upsert({
        id: fullProduct.id,
        vendor_id: fullProduct.vendor_id,
        slug: fullProduct.slug,
        name: fullProduct.name,
        category: fullProduct.category.toLowerCase(),
        price: fullProduct.price,
        image: fullProduct.image,
        description: fullProduct.description,
        stock: fullProduct.stock,
      }).then();
    }

    return fullProduct;
  }

  public static deleteVendorProduct(productId: string, vendorId: string): boolean {
    const products = this.getProductsFromStorage();
    const existing = products.find((p) => p.id === productId);

    if (!existing) return false;
    if (existing.vendor_id !== vendorId && vendorId !== 'admin') {
      throw new Error('Unauthorized: Vendor A cannot delete Vendor B’s products.');
    }

    const updated = products.filter((p) => p.id !== productId);
    this.saveProductsToStorage(updated);

    if (supabase) {
      supabase.from('products').delete().eq('id', productId).then();
    }

    return true;
  }

  // --- Vendor Hampers ---
  public static getAllVendorHampers(): VendorHamper[] {
    return this.getHampersFromStorage();
  }

  public static getHampersByVendor(vendorId: string): VendorHamper[] {
    return this.getHampersFromStorage().filter((h) => h.vendor_id === vendorId);
  }

  public static getPublishedHampers(categoryFilter?: string, searchQuery?: string): VendorHamper[] {
    let hampers = this.getHampersFromStorage().filter(
      (h) => h.is_published && h.is_enabled && h.approval_status === 'approved'
    );

    if (categoryFilter && categoryFilter !== 'all') {
      hampers = hampers.filter((h) =>
        h.categories.includes(categoryFilter.toLowerCase()) || h.tags.some((t) => t.toLowerCase() === categoryFilter.toLowerCase())
      );
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      hampers = hampers.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.vendor_name.toLowerCase().includes(q) ||
          h.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return hampers;
  }

  public static saveVendorHamper(hamper: Partial<VendorHamper> & { name: string; vendor_id: string; items: HamperItem[] }): VendorHamper {
    const hampers = this.getHampersFromStorage();
    const existingIndex = hampers.findIndex((h) => h.id === hamper.id);
    const settings = this.getAdminSettings();

    const products = this.getProductsFromStorage();
    let minProductStock = hamper.stock ?? 10;
    hamper.items.forEach((item) => {
      if (item.product_id) {
        const prod = products.find((p) => p.id === item.product_id);
        if (prod) {
          const possibleHampers = Math.floor(prod.stock / Math.max(1, item.quantity));
          if (possibleHampers < minProductStock) {
            minProductStock = possibleHampers;
          }
        }
      }
    });

    const isApprovalRequired = settings.require_hamper_approval && hamper.vendor_id !== 'admin';
    const status: 'approved' | 'pending' | 'rejected' = hamper.approval_status || (isApprovalRequired ? 'pending' : 'approved');

    const totalCost = (hamper.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0) +
      (hamper.packaging_charge || 0) +
      (hamper.customization_charge || 0);

    const sellingPrice = hamper.selling_price || totalCost;
    const originalPrice = hamper.original_price || Math.ceil(sellingPrice * 1.2 / 50) * 50;
    const discountPercent = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);

    const fullHamper: VendorHamper = {
      id: hamper.id || `vh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      vendor_id: hamper.vendor_id,
      vendor_name: hamper.vendor_name || 'Vendor Shop',
      vendor_shop_no: hamper.vendor_shop_no || 'SHOP-100',
      name: hamper.name,
      slug: hamper.slug || hamper.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categories: hamper.categories && hamper.categories.length ? hamper.categories : ['personalized'],
      tags: hamper.tags && hamper.tags.length ? hamper.tags : ['Gift Hamper'],
      description: hamper.description || '',
      thumbnail: hamper.thumbnail || (hamper.images && hamper.images[0]) || 'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      images: hamper.images && hamper.images.length ? hamper.images : [hamper.thumbnail || 'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
      items: hamper.items,
      packaging_charge: hamper.packaging_charge || 0,
      customization_charge: hamper.customization_charge || 0,
      total_cost: totalCost,
      selling_price: sellingPrice,
      original_price: originalPrice,
      discount_percent: discountPercent > 0 ? discountPercent : 0,
      stock: minProductStock,
      is_enabled: hamper.is_enabled ?? true,
      approval_status: status,
      is_published: hamper.is_published ?? true,
      is_featured: hamper.is_featured ?? false,
      created_at: hamper.created_at || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      if (hampers[existingIndex].vendor_id !== hamper.vendor_id && hamper.vendor_id !== 'admin') {
        throw new Error('Unauthorized: Vendor A cannot edit Vendor B’s hampers.');
      }
      hampers[existingIndex] = fullHamper;
    } else {
      hampers.unshift(fullHamper);
    }

    this.saveHampersToStorage(hampers);
    return fullHamper;
  }

  public static deleteVendorHamper(hamperId: string, vendorId: string): boolean {
    const hampers = this.getHampersFromStorage();
    const existing = hampers.find((h) => h.id === hamperId);

    if (!existing) return false;
    if (existing.vendor_id !== vendorId && vendorId !== 'admin') {
      throw new Error('Unauthorized: Vendor A cannot delete Vendor B’s hampers.');
    }

    const updated = hampers.filter((h) => h.id !== hamperId);
    this.saveHampersToStorage(updated);
    return true;
  }

  public static updateHamperStatus(hamperId: string, status: 'approved' | 'pending' | 'rejected', reason?: string): VendorHamper | null {
    const hampers = this.getHampersFromStorage();
    const index = hampers.findIndex((h) => h.id === hamperId);
    if (index === -1) return null;

    hampers[index].approval_status = status;
    if (reason) hampers[index].rejection_reason = reason;
    this.saveHampersToStorage(hampers);
    return hampers[index];
  }

  public static checkHamperStockWarning(hamper: VendorHamper): { isOut: boolean; warningMsg?: string } {
    const products = this.getProductsFromStorage();
    for (const item of hamper.items) {
      if (item.product_id) {
        const prod = products.find((p) => p.id === item.product_id);
        if (!prod || prod.stock < item.quantity) {
          return {
            isOut: true,
            warningMsg: `Component "${item.name}" is out of stock (${prod ? prod.stock : 0} available, ${item.quantity} required per hamper).`,
          };
        }
      }
    }
    if (hamper.stock <= 0) {
      return { isOut: true, warningMsg: 'This hamper is currently out of stock.' };
    }
    return { isOut: false };
  }
}
