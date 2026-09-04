import { useState } from 'react';
import {
  VendorStore,
  HAMPER_CATEGORIES,
  type VendorProduct,
  type VendorHamper,
  type HamperItem,
} from '@/lib/vendorStore';
import { formatPrice } from '@/cart';
import {
  Plus,
  Trash2,
  ImagePlus,
  Package,
  Sparkles,
  Check,
  Eye,
  Save,
  Tag,
  Calculator,
  X,
  Layers,
  Upload,
  AlertCircle,
} from 'lucide-react';
import HamperPreviewModal from './HamperPreviewModal';
import { toast } from 'react-hot-toast';

export default function HamperBuilder({
  vendorId,
  vendorName,
  vendorShopNo,
  existingHamper,
  onSaved,
  onCancel,
}: {
  vendorId: string;
  vendorName: string;
  vendorShopNo?: string;
  existingHamper?: VendorHamper | null;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  // Available component products from vendor inventory
  const vendorProducts = VendorStore.getHamperComponents(vendorId);

  // Form State
  const [name, setName] = useState(existingHamper?.name || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    existingHamper?.categories || ['birthday']
  );
  const [description, setDescription] = useState(existingHamper?.description || '');
  const [tagsInput, setTagsInput] = useState(existingHamper?.tags?.join(', ') || 'Birthday, Festival');
  const [thumbnail, setThumbnail] = useState(
    existingHamper?.thumbnail || 'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    existingHamper?.images || ['https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']
  );
  const [stock, setStock] = useState<number>(existingHamper?.stock ?? 25);
  const [isEnabled, setIsEnabled] = useState<boolean>(existingHamper?.is_enabled ?? true);

  // Charges
  const [packagingCharge, setPackagingCharge] = useState<number>(existingHamper?.packaging_charge ?? 100);
  const [customizationCharge, setCustomizationCharge] = useState<number>(existingHamper?.customization_charge ?? 50);
  const [sellingPrice, setSellingPrice] = useState<number>(existingHamper?.selling_price ?? 1299);
  const [originalPriceInput, setOriginalPriceInput] = useState<number>(existingHamper?.original_price ?? 1599);

  // Selected Hamper Items
  const [items, setItems] = useState<HamperItem[]>(
    existingHamper?.items || [
      {
        id: `hi-${Date.now()}-1`,
        product_id: vendorProducts[0]?.id,
        is_custom: false,
        name: vendorProducts[0]?.name || 'Chocolate Box',
        price: vendorProducts[0]?.price || 299,
        quantity: 1,
        category: vendorProducts[0]?.category || 'Chocolates',
      },
      {
        id: `hi-${Date.now()}-2`,
        product_id: vendorProducts[1]?.id,
        is_custom: false,
        name: vendorProducts[1]?.name || 'Teddy Bear',
        price: vendorProducts[1]?.price || 499,
        quantity: 1,
        category: vendorProducts[1]?.category || 'Toys',
      },
      {
        id: `hi-${Date.now()}-3`,
        product_id: vendorProducts[2]?.id,
        is_custom: false,
        name: vendorProducts[2]?.name || 'Greeting Card',
        price: vendorProducts[2]?.price || 99,
        quantity: 1,
        category: vendorProducts[2]?.category || 'Cards',
      },
    ]
  );

  // Custom Item Modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customItemForm, setCustomItemForm] = useState({
    name: '',
    description: '',
    image: '',
    price: 199,
    quantity: 1,
    category: 'Custom Specialty',
    customizationDetails: '',
    saveAsRegularProduct: false,
  });

  // Preview Modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHamperObj, setPreviewHamperObj] = useState<VendorHamper | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate items sum
  const itemsTotalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculatedTotalCost = itemsTotalCost + (packagingCharge || 0) + (customizationCharge || 0);

  // Handle inventory checkbox toggle
  const toggleInventoryProduct = (prod: VendorProduct) => {
    const existingIndex = items.findIndex((i) => i.product_id === prod.id);
    if (existingIndex >= 0) {
      setItems((prev) => prev.filter((i) => i.product_id !== prod.id));
      toast.success(`Removed "${prod.name}" from hamper`);
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `hi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product_id: prod.id,
          is_custom: false,
          name: prod.name,
          price: prod.price,
          quantity: 1,
          category: prod.category,
        },
      ]);
      toast.success(`Added "${prod.name}" to hamper`);
    }
  };

  // Handle quantity update
  const updateItemQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  };

  // Remove item
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success('Item removed from hamper');
  };

  // Toggle Category selection
  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId)
        ? prev.length > 1
          ? prev.filter((c) => c !== catId)
          : prev
        : [...prev, catId]
    );
  };

  // Add Custom Item
  const handleAddCustomItem = () => {
    if (!customItemForm.name.trim()) return;

    if (customItemForm.saveAsRegularProduct) {
      // Save as regular product first
      VendorStore.saveVendorProduct({
        vendor_id: vendorId,
        vendor_name: vendorName,
        name: customItemForm.name,
        price: customItemForm.price,
        description: customItemForm.description,
        image: customItemForm.image || 'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        category: customItemForm.category,
        stock: 50,
        is_available_for_hamper: true,
      });
    }

    const newItem: HamperItem = {
      id: `hi-custom-${Date.now()}`,
      is_custom: true,
      name: customItemForm.name,
      description: customItemForm.description,
      image: customItemForm.image || 'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      price: customItemForm.price,
      quantity: customItemForm.quantity,
      category: customItemForm.category,
      customization_details: customItemForm.customizationDetails,
    };

    setItems((prev) => [...prev, newItem]);
    setShowCustomModal(false);
    toast.success(`Custom product "${customItemForm.name}" added to hamper`);
    setCustomItemForm({
      name: '',
      description: '',
      image: '',
      price: 199,
      quantity: 1,
      category: 'Custom Specialty',
      customizationDetails: '',
      saveAsRegularProduct: false,
    });
  };

  // Generate Hamper object for saving/previewing
  const buildHamperObject = (isPublished: boolean): VendorHamper => {
    const tagsArr = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const origPrice = originalPriceInput > sellingPrice ? originalPriceInput : Math.ceil(sellingPrice * 1.2 / 50) * 50;
    const discount = Math.round(((origPrice - sellingPrice) / origPrice) * 100);

    return {
      id: existingHamper?.id || `vh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      vendor_id: vendorId,
      vendor_name: vendorName,
      vendor_shop_no: vendorShopNo || 'SHOP-100',
      name: name || 'Personalized Gift Hamper',
      slug: (name || 'personalized-gift-hamper').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categories: selectedCategories,
      tags: tagsArr.length ? tagsArr : ['Gift Hamper'],
      description,
      thumbnail,
      images: galleryImages,
      items,
      packaging_charge: packagingCharge,
      customization_charge: customizationCharge,
      total_cost: calculatedTotalCost,
      selling_price: sellingPrice,
      original_price: origPrice,
      discount_percent: discount > 0 ? discount : 0,
      stock,
      is_enabled: isEnabled,
      approval_status: existingHamper?.approval_status || 'approved',
      is_published: isPublished,
      created_at: existingHamper?.created_at || new Date().toISOString(),
    };
  };

  // Open Preview Modal
  const handleOpenPreview = () => {
    if (!name.trim()) {
      setError('Please enter a hamper name.');
      toast.error('Please enter a hamper name.');
      return;
    }
    if (items.length === 0) {
      setError('Please select or add at least one product for the hamper.');
      toast.error('Please select or add at least one product for the hamper.');
      return;
    }
    setError(null);
    const hamperObj = buildHamperObject(true);
    setPreviewHamperObj(hamperObj);
    setShowPreviewModal(true);
  };

  // Save Draft or Publish
  const handleSave = (isPublished: boolean) => {
    if (!name.trim()) {
      setError('Please enter a hamper name.');
      toast.error('Please enter a hamper name.');
      return;
    }
    if (items.length === 0) {
      setError('Please select or add at least one product for the hamper.');
      toast.error('Please select or add at least one product for the hamper.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const hamperObj = buildHamperObject(isPublished);
      VendorStore.saveVendorHamper(hamperObj);
      setSaving(false);
      setShowPreviewModal(false);
      toast.success(isPublished ? 'Hamper published live to store!' : 'Hamper draft saved successfully!');
      onSaved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save hamper.';
      setError(msg);
      toast.error(msg);
      setSaving(false);
    }
  };

  const adminSettings = VendorStore.getAdminSettings();

  return (
    <div className="rounded-3xl bg-cream-50 ring-1 ring-cream-200 p-6 sm:p-8 lg:p-10 shadow-lg dark:bg-gray-800 dark:ring-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6 dark:border-gray-700">
        <div>
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold-600">
            <Sparkles className="h-4 w-4" />
            Hamper Studio
          </span>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-wine-800 dark:text-white">
            {existingHamper ? 'Edit Personalized Gift Hamper' : 'Create Personalized Gift Hamper'}
          </h2>
          <p className="mt-1 text-sm text-ink-700/60 dark:text-gray-300">
            Build a complete gift hamper with inventory components, custom items, charges & custom pricing.
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-full border border-cream-300 px-5 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-100 dark:border-gray-600 dark:text-gray-200"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          {error}
        </div>
      )}

      {/* Main Builder Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hamper Name & Description */}
          <div className="space-y-4 rounded-2xl bg-cream-100/50 p-5 ring-1 ring-cream-200 dark:bg-gray-900/50 dark:ring-gray-700">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-700/70 dark:text-gray-300">
                Hamper Name <span className="text-wine-600">*</span>
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Birthday Hamper"
                className="input"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-700/70 dark:text-gray-300">
                Detailed Description
              </span>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter rich description of what makes this hamper special..."
                className="input resize-none"
              />
            </label>
          </div>

          {/* Categories & Tags */}
          <div className="rounded-2xl bg-cream-100/50 p-5 ring-1 ring-cream-200 dark:bg-gray-900/50 dark:ring-gray-700 space-y-4">
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700/70 dark:text-gray-300">
                Select Product Categories (Multi-select)
              </span>
              <div className="flex flex-wrap gap-2">
                {HAMPER_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-wine-600 text-cream-50 shadow-sm'
                          : 'bg-cream-50 text-ink-700/70 ring-1 ring-cream-300 hover:bg-cream-200 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-700/70 dark:text-gray-300">
                Occasion Tags (Comma separated)
              </span>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Birthday, Anniversary, Wedding, Corporate, Festival"
                className="input text-xs"
              />
            </div>
          </div>

          {/* Product Selection List */}
          <div className="rounded-2xl bg-cream-100/50 p-5 ring-1 ring-cream-200 dark:bg-gray-900/50 dark:ring-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-wine-800 dark:text-gold-300 text-base">
                  Select Products from Inventory
                </h3>
                <p className="text-xs text-ink-700/60 dark:text-gray-400">
                  Products marked "Available for Gift Hampers" from your shop.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3.5 py-1.5 text-xs font-semibold text-ink-900 hover:bg-gold-400 shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                + Add Custom Item
              </button>
            </div>

            {/* Inventory Products Checklist */}
            {vendorProducts.length === 0 ? (
              <p className="rounded-xl bg-cream-50 p-4 text-center text-xs text-ink-700/60 dark:bg-gray-800">
                No component products marked "Available for Gift Hampers" yet. Upload products or add custom items below.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {vendorProducts.map((prod) => {
                  const selectedItem = items.find((i) => i.product_id === prod.id);
                  const isChecked = Boolean(selectedItem);
                  return (
                    <div
                      key={prod.id}
                      className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                        isChecked
                          ? 'border-wine-600/60 bg-wine-600/5'
                          : 'border-cream-300 bg-cream-50 hover:border-gold-400 dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleInventoryProduct(prod)}
                          className="h-4 w-4 rounded accent-wine-600 cursor-pointer"
                        />
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="h-9 w-9 rounded-lg object-cover ring-1 ring-cream-200"
                        />
                        <div>
                          <span className="font-semibold text-wine-800 dark:text-white block">
                            {prod.name}
                          </span>
                          <span className="text-[11px] text-ink-700/55 dark:text-gray-400">
                            {prod.category} · Stock: {prod.stock} · {formatPrice(prod.price)}
                          </span>
                        </div>
                      </label>

                      {isChecked && selectedItem && (
                        <div className="flex items-center gap-2 pl-2">
                          <span className="text-[11px] text-ink-700/60">Qty:</span>
                          <input
                            type="number"
                            min={1}
                            max={prod.max_quantity_per_hamper || 10}
                            value={selectedItem.quantity}
                            onChange={(e) => updateItemQty(selectedItem.id, Number(e.target.value))}
                            className="h-8 w-14 rounded-lg border border-cream-300 text-center text-xs outline-none focus:border-wine-600 dark:bg-gray-900"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Items Summary Table */}
          <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="font-display font-semibold text-wine-800 dark:text-gold-300 text-sm uppercase tracking-wider mb-3">
              Included Hamper Items ({items.length})
            </h4>

            {items.length === 0 ? (
              <p className="text-xs text-ink-700/50">No items added to hamper yet.</p>
            ) : (
              <div className="divide-y divide-cream-200 dark:divide-gray-800 text-xs">
                {items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-wine-800 dark:text-white">{item.name}</span>
                      {item.is_custom && (
                        <span className="rounded bg-gold-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-gold-700 dark:text-gold-300">
                          Custom Item
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-ink-700/60">Qty:</span>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItemQty(item.id, Number(e.target.value))}
                          className="h-7 w-12 rounded border border-cream-300 text-center text-xs"
                        />
                      </div>
                      <span className="font-semibold text-wine-800 dark:text-gold-300 w-16 text-right">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Financial & Media Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pricing & Fee Breakdown Card */}
          <div className="rounded-2xl bg-cream-100/60 p-5 ring-1 ring-cream-200 dark:bg-gray-900/60 dark:ring-gray-700 space-y-4">
            <h3 className="font-display font-semibold text-wine-800 dark:text-gold-300 text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-gold-600" />
              Cost & Price Calculator
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-cream-200 dark:border-gray-800">
                <span className="text-ink-700/70 dark:text-gray-300">Component Products Cost</span>
                <span className="font-semibold text-wine-800 dark:text-white">{formatPrice(itemsTotalCost)}</span>
              </div>

              <label className="block">
                <span className="mb-1 block text-ink-700/70 dark:text-gray-300">Packaging Charges (₹)</span>
                <input
                  type="number"
                  min={0}
                  value={packagingCharge}
                  onChange={(e) => setPackagingCharge(Number(e.target.value))}
                  className="input text-xs"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-ink-700/70 dark:text-gray-300">Customization Charges (₹)</span>
                <input
                  type="number"
                  min={0}
                  value={customizationCharge}
                  onChange={(e) => setCustomizationCharge(Number(e.target.value))}
                  className="input text-xs"
                />
              </label>

              <div className="flex justify-between items-center py-2 bg-cream-50 px-3 rounded-xl ring-1 ring-cream-200 dark:bg-gray-800 font-semibold text-wine-800 dark:text-gold-300">
                <span>Calculated Total Cost:</span>
                <span>{formatPrice(calculatedTotalCost)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="block">
                  <span className="mb-1 block font-semibold text-wine-700 dark:text-gold-300">
                    Selling Price (₹) <span className="text-wine-600">*</span>
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="input text-sm font-bold text-wine-800"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-ink-700/60 dark:text-gray-400">Original Price (₹)</span>
                  <input
                    type="number"
                    min={1}
                    value={originalPriceInput}
                    onChange={(e) => setOriginalPriceInput(Number(e.target.value))}
                    className="input text-xs"
                  />
                </label>
              </div>

              {originalPriceInput > sellingPrice && (
                <p className="text-[11px] font-semibold text-sage-600 bg-sage-500/10 px-3 py-1.5 rounded-lg text-center">
                  Displaying {Math.round(((originalPriceInput - sellingPrice) / originalPriceInput) * 100)}% OFF on customer storefront
                </p>
              )}
            </div>
          </div>

          {/* Media & Stock Settings */}
          <div className="rounded-2xl bg-cream-100/60 p-5 ring-1 ring-cream-200 dark:bg-gray-900/60 dark:ring-gray-700 space-y-4">
            <h3 className="font-display font-semibold text-wine-800 dark:text-gold-300 text-base flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-gold-600" />
              Images & Stock Availability
            </h3>

            <label className="block text-xs">
              <span className="mb-1.5 block font-medium uppercase tracking-wider text-ink-700/70 dark:text-gray-300">
                Preview Thumbnail URL
              </span>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://..."
                className="input text-xs"
              />
            </label>

            <div className="flex items-center gap-3">
              <img
                src={thumbnail}
                alt="Thumbnail preview"
                className="h-16 w-16 rounded-xl object-cover ring-1 ring-cream-300"
              />
              <div className="text-xs text-ink-700/60 dark:text-gray-400">
                Main hamper image shown in categories & search lists.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="block text-xs">
                <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">Stock Capacity</span>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="input text-xs"
                />
              </label>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-wine-700 dark:text-gold-300">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="h-4 w-4 accent-wine-600 rounded cursor-pointer"
                  />
                  Enable for Customers
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleOpenPreview}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-wine-600 bg-cream-50 py-3.5 text-sm font-semibold text-wine-700 hover:bg-cream-100 shadow-sm transition-all dark:bg-gray-800 dark:text-cream-50"
            >
              <Eye className="h-4 w-4" />
              Preview on Website
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-300 bg-cream-100/70 py-3 text-xs font-semibold text-ink-800 hover:bg-cream-200 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <Save className="h-3.5 w-3.5" />
                Save Draft
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-wine-600 py-3 text-xs font-semibold text-cream-50 hover:bg-wine-700 shadow-md transition-all hover:scale-105"
              >
                <Check className="h-3.5 w-3.5" />
                {adminSettings.require_hamper_approval ? 'Submit for Approval' : 'Publish Hamper'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Item Modal */}
      {showCustomModal && (
        <div
          className="fixed inset-0 z-[110] grid place-items-center bg-ink-900/60 backdrop-blur-sm p-4"
          onClick={() => setShowCustomModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-cream-50 ring-1 ring-cream-300 p-6 shadow-2xl dark:bg-gray-800 dark:ring-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-cream-200 pb-3 mb-4 dark:border-gray-700">
              <h4 className="font-display font-semibold text-lg text-wine-700 dark:text-gold-300">
                + Add Custom Item to Hamper
              </h4>
              <button onClick={() => setShowCustomModal(false)}>
                <X className="h-5 w-5 text-ink-700/60" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <label className="block">
                <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">
                  Item Name <span className="text-wine-600">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={customItemForm.name}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
                  placeholder="e.g. Personalized Wooden Keychain"
                  className="input text-xs"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">Price (₹)</span>
                  <input
                    type="number"
                    min={0}
                    value={customItemForm.price}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, price: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">Quantity</span>
                  <input
                    type="number"
                    min={1}
                    value={customItemForm.quantity}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, quantity: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">Image URL</span>
                <input
                  type="text"
                  value={customItemForm.image}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, image: e.target.value })}
                  placeholder="https://..."
                  className="input text-xs"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-semibold text-ink-700/70 dark:text-gray-300">Customization Details</span>
                <input
                  type="text"
                  value={customItemForm.customizationDetails}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, customizationDetails: e.target.value })}
                  placeholder="e.g. Engraved name: 'Aarav'"
                  className="input text-xs"
                />
              </label>

              <div className="rounded-xl bg-cream-100 p-3 dark:bg-gray-900 mt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-wine-700 dark:text-gold-300 text-xs">
                  <input
                    type="checkbox"
                    checked={customItemForm.saveAsRegularProduct}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, saveAsRegularProduct: e.target.checked })}
                    className="h-4 w-4 accent-wine-600"
                  />
                  Save as regular product in my inventory as well
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="flex-1 rounded-full bg-wine-600 py-3 font-semibold text-cream-50 hover:bg-wine-700 transition-colors"
                >
                  Add Custom Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="rounded-full border border-cream-300 px-5 py-3 font-medium text-ink-700 hover:bg-cream-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Website Preview Modal */}
      {showPreviewModal && previewHamperObj && (
        <HamperPreviewModal
          hamper={previewHamperObj}
          onClose={() => setShowPreviewModal(false)}
          onPublish={() => handleSave(true)}
          isApprovalRequired={adminSettings.require_hamper_approval}
        />
      )}
    </div>
  );
}
