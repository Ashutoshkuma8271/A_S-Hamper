import { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  Building,
  Loader2,
  X,
  Check,
  Phone,
  Navigation,
} from 'lucide-react';
import {
  type DeliveryAddress,
  getSavedAddresses,
  saveDeliveryAddress,
  deleteDeliveryAddress,
  setDefaultDeliveryAddress,
  validatePincode,
} from '@/lib/addressStore';
import CountryPhoneInput from '@/components/CountryPhoneInput';
import { toast } from 'react-hot-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface AddressManagerProps {
  userId?: string;
  selectedAddressId?: string;
  onSelectAddress?: (address: DeliveryAddress) => void;
  isCheckout?: boolean;
}

export default function AddressManager({
  userId,
  selectedAddressId,
  onSelectAddress,
  isCheckout = false,
}: AddressManagerProps) {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<DeliveryAddress | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const list = await getSavedAddresses(userId);
      setAddresses(list);

      // If in checkout mode and no selected address, auto-select default address
      if (isCheckout && onSelectAddress && list.length > 0) {
        if (!selectedAddressId) {
          const defaultAddr = list.find((a) => a.is_default) || list[0];
          onSelectAddress(defaultAddr);
        }
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  const openAddModal = () => {
    setEditingAddress(null);
    setFullName('');
    setCountryCode('+91');
    setPhone('');
    setHouseNo('');
    setStreet('');
    setLandmark('');
    setCity('');
    setState('');
    setPincode('');
    setCountry('India');
    setDeliveryInstructions('');
    setAddressType('Home');
    setIsDefault(addresses.length === 0);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (addr: DeliveryAddress) => {
    setEditingAddress(addr);
    setFullName(addr.full_name);
    setCountryCode('+91');
    setPhone(addr.phone.replace(/^\+91/, '').replace(/\D/g, ''));
    setHouseNo(addr.house_no);
    setStreet(addr.street);
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setCountry(addr.country || 'India');
    setDeliveryInstructions(addr.delivery_instructions || '');
    setAddressType(addr.address_type);
    setIsDefault(addr.is_default);
    setFormError(null);
    setShowModal(true);
  };

  const handlePincodeInput = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Recipient full name is required.');
      return;
    }
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!houseNo.trim()) {
      setFormError('Flat / House No. / Building name is required.');
      return;
    }
    if (!street.trim()) {
      setFormError('Street / Locality / Sector is required.');
      return;
    }
    if (!city.trim()) {
      setFormError('City is required.');
      return;
    }
    if (!state.trim()) {
      setFormError('State is required.');
      return;
    }
    if (!pincode.trim() || !validatePincode(pincode)) {
      setFormError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setSaving(true);
    try {
      const saved = await saveDeliveryAddress(
        {
          id: editingAddress?.id,
          full_name: fullName.trim(),
          phone: `${countryCode}${cleanDigits}`,
          house_no: houseNo.trim(),
          street: street.trim(),
          landmark: landmark.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: country.trim() || 'India',
          delivery_instructions: deliveryInstructions.trim(),
          address_type: addressType,
          is_default: isDefault,
        },
        userId
      );

      toast.success(editingAddress ? 'Address updated successfully!' : 'New delivery address saved!', { icon: '📍' });
      setShowModal(false);
      await loadAddresses();

      if (isCheckout && onSelectAddress) {
        onSelectAddress(saved);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDeliveryAddress(id, userId);
      toast.success('Address removed');
      await loadAddresses();
    } catch (err) {
      toast.error('Failed to remove address');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultDeliveryAddress(id, userId);
      toast.success('Default delivery address updated');
      await loadAddresses();
    } catch (err) {
      toast.error('Failed to set default address');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cream-200 dark:border-stone-800">
        <div>
          <h3 className="font-display text-base font-bold text-wine-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-wine-600 dark:text-gold-300" />
            {isCheckout ? 'Select Delivery Destination' : 'Saved Delivery Addresses'}
          </h3>
          <p className="text-xs text-ink-700/60 dark:text-stone-400 mt-0.5">
            {isCheckout
              ? 'Choose a saved address or add a new recipient location for this hamper order.'
              : 'Manage and update your luxury gifting delivery addresses.'}
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-wine-700 hover:bg-wine-800 text-cream-50 px-4 py-2 text-xs font-semibold shadow transition-all shrink-0 hover:-translate-y-0.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add New Address
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-wine-600 dark:text-gold-300" />
          <p className="text-xs text-ink-700/60 dark:text-stone-400">Loading delivery addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-300 dark:border-stone-700 bg-cream-50/50 dark:bg-stone-800/30 p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-wine-100/60 dark:bg-wine-950/40 text-wine-700 dark:text-gold-300 grid place-items-center mb-3">
            <Navigation className="h-6 w-6" />
          </div>
          <h4 className="font-display text-sm font-bold text-wine-900 dark:text-white">
            No Saved Delivery Addresses
          </h4>
          <p className="text-xs text-ink-700/60 dark:text-stone-400 mt-1 max-w-sm mx-auto">
            You haven't saved any delivery addresses yet. Add your primary home or gifting address below.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-wine-700 hover:bg-wine-800 text-cream-50 px-5 py-2.5 text-xs font-bold shadow transition-all"
          >
            <Plus className="h-4 w-4" /> Add Delivery Address
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => isCheckout && onSelectAddress && onSelectAddress(addr)}
                className={`relative rounded-2xl p-5 transition-all border ${
                  isCheckout ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'border-wine-700 bg-wine-50/50 ring-2 ring-wine-600/30 dark:border-gold-500 dark:bg-stone-800/90 shadow-sm'
                    : 'border-cream-200/90 bg-white hover:border-wine-300 dark:border-stone-700/80 dark:bg-stone-800/60'
                }`}
              >
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream-200/80 dark:bg-stone-700 px-2.5 py-0.5 text-[10px] font-bold text-wine-900 dark:text-gold-300">
                      {addr.address_type === 'Work' ? (
                        <Briefcase className="h-3 w-3" />
                      ) : addr.address_type === 'Other' ? (
                        <Building className="h-3 w-3" />
                      ) : (
                        <Home className="h-3 w-3" />
                      )}
                      {addr.address_type}
                    </span>

                    {addr.is_default && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-wine-700 text-cream-50 dark:bg-gold-500 dark:text-stone-900 px-2.5 py-0.5 text-[10px] font-extrabold shadow-xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" /> Default
                      </span>
                    )}
                  </div>

                  {isCheckout && isSelected && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-wine-700 dark:text-gold-300">
                      <Check className="h-3.5 w-3.5" /> Selected
                    </span>
                  )}
                </div>

                {/* Recipient details */}
                <div className="space-y-1">
                  <h4 className="font-display text-sm font-bold text-wine-950 dark:text-white">
                    {addr.full_name}
                  </h4>
                  <p className="flex items-center gap-1.5 text-xs text-ink-700/70 dark:text-stone-300 font-medium">
                    <Phone className="h-3 w-3 text-gold-600" />
                    {addr.phone.startsWith('+91') ? `+91 ${addr.phone.slice(3)}` : addr.phone}
                  </p>
                  <p className="mt-2 text-xs text-ink-700/80 dark:text-stone-400 leading-relaxed">
                    {addr.house_no}, {addr.street}
                    {addr.landmark ? `, Near ${addr.landmark}` : ''}
                    <br />
                    {addr.city}, {addr.state} - <strong className="text-wine-900 dark:text-gold-300 font-mono">{addr.pincode}</strong>
                    <br />
                    <span className="text-[11px] text-ink-700/60 dark:text-stone-400 font-medium">
                      {addr.country || 'India'}
                    </span>
                  </p>

                  {addr.delivery_instructions && (
                    <div className="mt-2 rounded-xl bg-cream-100/60 dark:bg-stone-700/40 px-2.5 py-1.5 text-[11px] text-wine-900/80 dark:text-stone-300 flex items-start gap-1.5 border border-cream-200/70 dark:border-stone-700">
                      <span className="font-bold shrink-0">Note:</span>
                      <span className="italic">{addr.delivery_instructions}</span>
                    </div>
                  )}
                </div>

                {/* Actions bottom bar */}
                <div className="mt-4 pt-3 border-t border-cream-200/60 dark:border-stone-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(addr);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-wine-700 hover:text-wine-900 dark:text-gold-300 hover:underline"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>

                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(addr.id);
                        }}
                        className="text-[11px] font-semibold text-ink-700/60 hover:text-wine-700 dark:text-stone-400 hover:underline"
                      >
                        Make Default
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={deletingId === addr.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddressToDelete(addr);
                    }}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete address"
                  >
                    {deletingId === addr.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-cream-50 p-6 sm:p-8 shadow-2xl ring-1 ring-cream-200 dark:bg-stone-900 dark:ring-stone-700 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-cream-200/60 text-ink-700/60 hover:bg-cream-300 dark:bg-stone-800 dark:text-stone-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-wine-100 dark:bg-wine-950/60 px-3 py-1 text-[11px] font-bold text-wine-800 dark:text-gold-300">
                <MapPin className="h-3.5 w-3.5" /> Delivery Address
              </span>
              <h3 className="mt-2 font-display text-xl font-bold text-wine-900 dark:text-white">
                {editingAddress ? 'Edit Delivery Destination' : 'Add New Delivery Address'}
              </h3>
              <p className="text-xs text-ink-700/60 dark:text-stone-400 mt-0.5">
                Please provide accurate contact and street details for timely delivery.
              </p>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs font-semibold text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink-700/70 dark:text-stone-300 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs text-wine-900 outline-none focus:border-wine-600 dark:border-stone-600 dark:bg-stone-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink-700/70 dark:text-stone-300 mb-1">
                    10-Digit Mobile Number *
                  </label>
                  <CountryPhoneInput
                    countryCode={countryCode}
                    onCountryCodeChange={setCountryCode}
                    phone={phone}
                    onPhoneChange={setPhone}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-ink-700/70 dark:text-stone-300 mb-1">
                    6-Digit PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => handlePincodeInput(e.target.value)}
                    placeholder="e.g. 110001"
                    className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs text-wine-900 outline-none focus:border-wine-600 dark:border-stone-600 dark:bg-stone-800 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink-700/70 dark:text-stone-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs text-wine-900 outline-none focus:border-wine-600 dark:border-stone-600 dark:bg-stone-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink-700/70 dark:text-stone-300 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs text-wine-900 outline-none focus:border-wine-600 dark:border-stone-600 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink-700/70 dark:text-stone-300 mb-1">
                  Flat / House No. / Building / Floor *
                </label>
                <input
                  type="text"
                  required
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="e.g. Apt 402, Royal Palms Residency"
                  className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs text-wine-900 outline-none focus:border-wine-600 dark:border-stone-600 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-700/70 dark:text-stone-300 mb-1">
                  Street / Locality / Sector / Road *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Near Linking Road, Bandra West"
                  className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs text-wine-900 outline-none focus:border-wine-600 dark:border-stone-600 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-700/70 dark:text-stone-300 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opp. City Grand Hotel"
                  className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs text-wine-900 outline-none focus:border-wine-600 dark:border-stone-600 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-700/70 dark:text-stone-300 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="India"
                  className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs text-wine-900 outline-none focus:border-wine-600 dark:border-stone-600 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-700/70 dark:text-stone-300 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Leave with building security / concierge, Call upon arrival"
                  className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs text-wine-900 outline-none focus:border-wine-600 dark:border-stone-600 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink-700/70 dark:text-stone-300">Type:</span>
                  {(['Home', 'Work', 'Other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressType(type)}
                      className={`rounded-full px-3 py-1 font-bold text-[11px] transition-all ${
                        addressType === type
                          ? 'bg-wine-700 text-white shadow-xs'
                          : 'bg-cream-200 text-ink-700/70 hover:bg-cream-300 dark:bg-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-ink-700/80 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-cream-300 text-wine-700 focus:ring-wine-500"
                  />
                  <span>Make default</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-cream-300 px-5 py-2.5 font-semibold text-ink-700/70 hover:bg-cream-100 dark:border-stone-600 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-wine-700 px-6 py-2.5 font-bold text-white shadow hover:bg-wine-800 disabled:opacity-60 transition-all"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deleting Address */}
      <ConfirmationDialog
        isOpen={!!addressToDelete}
        title="Remove Saved Address?"
        message={`Are you sure you want to remove the address for ${addressToDelete?.full_name}?`}
        confirmText="Remove Address"
        cancelText="Cancel"
        variant="danger"
        isLoading={deletingId === addressToDelete?.id}
        onConfirm={() => {
          if (addressToDelete) {
            handleDelete(addressToDelete.id);
            setAddressToDelete(null);
          }
        }}
        onCancel={() => setAddressToDelete(null)}
      />
    </div>
  );
}
