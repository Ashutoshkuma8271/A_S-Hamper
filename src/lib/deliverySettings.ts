import { supabase } from '@/lib/supabase';

export type DeliverySettings = {
  enabled: boolean;
  cutoffTime: string; // e.g. "14:00"
  sameDayFee: number; // e.g. 150
  standardFee: number; // e.g. 50
  freeDeliveryThreshold: number; // e.g. 2999
  eligiblePincodes: string[];
};

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  enabled: true,
  cutoffTime: '14:00',
  sameDayFee: 150,
  standardFee: 50,
  freeDeliveryThreshold: 2999,
  eligiblePincodes: [
    '400001', '400002', '400003', '400050', '400053',
    '110001', '110002', '110020', '110092',
    '560001', '560002', '560034', '560100',
    '700001', '600001', '500001', '380001',
    '226001', '302001', '160017', '201301', '122001',
    '638625'
  ],
};

const STORAGE_KEY = 'as_hamper_delivery_settings_v1';

export async function fetchDeliverySettings(): Promise<DeliverySettings> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_resources')
        .select('*')
        .eq('kind', 'delivery_config')
        .limit(1)
        .maybeSingle();

      if (!error && data?.data) {
        return {
          ...DEFAULT_DELIVERY_SETTINGS,
          ...data.data,
        };
      }
    } catch (e) {
      console.warn('Failed to load delivery settings from Supabase, using local fallback:', e);
    }
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_DELIVERY_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {}

  return DEFAULT_DELIVERY_SETTINGS;
}

export async function saveDeliverySettings(settings: DeliverySettings): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}

  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from('admin_resources')
        .select('id')
        .eq('kind', 'delivery_config')
        .limit(1)
        .maybeSingle();

      const payload = {
        kind: 'delivery_config',
        title: 'Same-Day Delivery Configuration',
        active: settings.enabled,
        data: settings,
      };

      if (existing?.id) {
        await supabase.from('admin_resources').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('admin_resources').insert(payload);
      }
      return true;
    } catch (e) {
      console.error('Error saving delivery settings to Supabase:', e);
    }
  }
  return true;
}

export function checkPincodeEligibility(pincode: string, settings: DeliverySettings) {
  const cleanCode = pincode.replace(/[^0-9]/g, '');
  if (cleanCode.length !== 6) {
    return {
      valid: false,
      available: false,
      message: 'Please enter a valid 6-digit PIN code.',
    };
  }

  if (!settings.enabled) {
    return {
      valid: true,
      available: false,
      fee: settings.standardFee,
      expectedTime: '2-3 Business Days',
      message: 'Same-day delivery is currently paused. Standard express shipping is available!',
    };
  }

  const isEligible = settings.eligiblePincodes.includes(cleanCode);

  if (isEligible) {
    // Check cutoff time
    const now = new Date();
    const [cutoffHour, cutoffMinute] = settings.cutoffTime.split(':').map(Number);
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffHour || 14, cutoffMinute || 0, 0, 0);

    const isBeforeCutoff = now < cutoffDate;
    const expectedTime = isBeforeCutoff ? 'Today by 8:00 PM' : 'Tomorrow by 1:00 PM';

    return {
      valid: true,
      available: true,
      fee: settings.sameDayFee,
      expectedTime,
      isBeforeCutoff,
      cutoffFormatted: `${(cutoffHour % 12) || 12}:${cutoffMinute.toString().padStart(2, '0')} ${cutoffHour >= 12 ? 'PM' : 'AM'}`,
      message: isBeforeCutoff
        ? `Same-day delivery is available! Order before ${settings.cutoffTime} for guaranteed delivery today.`
        : `Order cutoff time (${settings.cutoffTime}) has passed for today. Guaranteed priority delivery tomorrow morning!`,
    };
  } else {
    return {
      valid: true,
      available: false,
      fee: settings.standardFee,
      expectedTime: '2-4 Business Days',
      message: `Same-day delivery is not currently available for PIN ${cleanCode}. Standard express delivery is available (2-4 days).`,
    };
  }
}
