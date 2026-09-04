import { supabase } from '@/lib/supabase';
import { validatePhoneNumber } from '@/lib/security';

export interface DeliveryAddress {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  house_no: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  delivery_instructions?: string;
  address_type: 'Home' | 'Work' | 'Other';
  is_default: boolean;
  created_at?: string;
}

const LOCAL_STORAGE_KEY = 'a_s_hamper_user_addresses_v3';

function getStorageKey(userId?: string): string {
  try {
    // Purge legacy un-scoped storage key
    localStorage.removeItem('a_s_hamper_saved_addresses');
  } catch {}
  return userId ? `${LOCAL_STORAGE_KEY}_user_${userId}` : `${LOCAL_STORAGE_KEY}_guest`;
}

/**
 * Validates a 6-digit Indian Pincode
 */
export function validatePincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

/**
 * Validates full address fields before saving
 */
export function validateAddress(address: Partial<DeliveryAddress>): { valid: boolean; error?: string } {
  if (!address.full_name?.trim()) {
    return { valid: false, error: 'Full Name is required for delivery.' };
  }

  const phoneCheck = validatePhoneNumber(address.phone || '');
  if (!phoneCheck.valid) {
    return { valid: false, error: phoneCheck.error || 'Please enter a valid mobile number for delivery.' };
  }

  if (!address.house_no?.trim()) {
    return { valid: false, error: 'House/Flat/Building number is required.' };
  }

  if (!address.street?.trim()) {
    return { valid: false, error: 'Street/Area address is required.' };
  }

  if (!address.city?.trim()) {
    return { valid: false, error: 'City is required.' };
  }

  if (!address.state?.trim()) {
    return { valid: false, error: 'State is required.' };
  }

  if (!address.pincode?.trim() || !validatePincode(address.pincode)) {
    return { valid: false, error: 'Please enter a valid 6-digit PIN code.' };
  }

  return { valid: true };
}

/**
 * Fetches user saved delivery addresses (with Supabase DB + Local Storage fallback)
 */
export async function getSavedAddresses(userId?: string): Promise<DeliveryAddress[]> {
  if (supabase && userId) {
    try {
      // 1. Try delivery_addresses (standard schema table)
      const { data: delData, error: delError } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (!delError && delData && delData.length > 0) {
        return delData as DeliveryAddress[];
      }

      // 2. Fallback to user_addresses table
      const { data: userData, error: userError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (!userError && userData && userData.length > 0) {
        return userData as DeliveryAddress[];
      }
    } catch (err) {
      console.warn('Database address fetch error:', err);
    }
  }

  // Fallback to user-scoped local storage
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) {
      const addresses = JSON.parse(raw) as DeliveryAddress[];
      return userId ? addresses.filter(a => !a.user_id || a.user_id === userId) : addresses;
    }
  } catch (e) {
    console.error('Local storage address parse error:', e);
  }

  return [];
}

/**
 * Saves or updates a delivery address
 */
export async function saveDeliveryAddress(
  address: Omit<DeliveryAddress, 'id'> & { id?: string },
  userId?: string
): Promise<DeliveryAddress> {
  const validation = validateAddress(address);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid delivery address');
  }

  const id = address.id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanAddress: DeliveryAddress = {
    id,
    user_id: userId,
    full_name: address.full_name.trim(),
    phone: address.phone.trim(),
    house_no: address.house_no.trim(),
    street: address.street.trim(),
    landmark: address.landmark?.trim() || '',
    city: address.city.trim(),
    state: address.state.trim(),
    pincode: address.pincode.trim(),
    country: address.country?.trim() || 'India',
    delivery_instructions: address.delivery_instructions?.trim() || '',
    address_type: address.address_type || 'Home',
    is_default: address.is_default || false,
    created_at: new Date().toISOString(),
  };

  if (supabase && userId) {
    try {
      if (cleanAddress.is_default) {
        // Unset other default addresses for this user
        await Promise.allSettled([
          supabase.from('delivery_addresses').update({ is_default: false }).eq('user_id', userId),
          supabase.from('user_addresses').update({ is_default: false }).eq('user_id', userId),
        ]);
      }

      // Upsert to delivery_addresses
      const { data, error } = await supabase
        .from('delivery_addresses')
        .upsert(cleanAddress)
        .select()
        .maybeSingle();

      if (!error && data) {
        return data as DeliveryAddress;
      }

      // Try fallback to user_addresses
      const { data: uData, error: uError } = await supabase
        .from('user_addresses')
        .upsert(cleanAddress)
        .select()
        .maybeSingle();

      if (!uError && uData) {
        return uData as DeliveryAddress;
      }
    } catch (err) {
      console.warn('Database address upsert warning:', err);
    }
  }

  // Sync to local storage
  const existing = await getSavedAddresses(userId);
  let updatedList: DeliveryAddress[] = [];

  if (cleanAddress.is_default) {
    existing.forEach((a) => (a.is_default = false));
  }

  const index = existing.findIndex((a) => a.id === id);
  if (index >= 0) {
    existing[index] = cleanAddress;
    updatedList = existing;
  } else {
    // If first address, make default automatically
    if (existing.length === 0) {
      cleanAddress.is_default = true;
    }
    updatedList = [cleanAddress, ...existing];
  }

  localStorage.setItem(getStorageKey(userId), JSON.stringify(updatedList));
  return cleanAddress;
}

/**
 * Deletes a saved address
 */
export async function deleteDeliveryAddress(id: string, userId?: string): Promise<void> {
  if (supabase && userId) {
    try {
      await Promise.allSettled([
        supabase.from('delivery_addresses').delete().eq('id', id).eq('user_id', userId),
        supabase.from('user_addresses').delete().eq('id', id).eq('user_id', userId),
      ]);
    } catch (err) {
      console.warn('Database address delete error:', err);
    }
  }

  const existing = await getSavedAddresses(userId);
  const filtered = existing.filter((a) => a.id !== id);
  if (filtered.length > 0 && !filtered.some((a) => a.is_default)) {
    filtered[0].is_default = true;
  }
  localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
}

/**
 * Sets a specific address as default
 */
export async function setDefaultDeliveryAddress(id: string, userId?: string): Promise<void> {
  if (supabase && userId) {
    try {
      await Promise.allSettled([
        supabase.from('delivery_addresses').update({ is_default: false }).eq('user_id', userId),
        supabase.from('delivery_addresses').update({ is_default: true }).eq('id', id).eq('user_id', userId),
        supabase.from('user_addresses').update({ is_default: false }).eq('user_id', userId),
        supabase.from('user_addresses').update({ is_default: true }).eq('id', id).eq('user_id', userId),
      ]);
    } catch (err) {
      console.warn('Database set default address error:', err);
    }
  }

  const existing = await getSavedAddresses(userId);
  existing.forEach((a) => (a.is_default = a.id === id));
  localStorage.setItem(getStorageKey(userId), JSON.stringify(existing));
}
