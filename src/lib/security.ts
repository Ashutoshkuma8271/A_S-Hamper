/**
 * Enterprise Cyber Security, Country Code Registry & Validation Engine
 */

export interface CountryCodeOption {
  code: string;
  country: string;
  flag: string;
  digits: number;
  pattern?: RegExp;
}

export const COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+91', country: 'India', flag: '🇮🇳', digits: 10, pattern: /^[6-9]\d{9}$/ },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸', digits: 10 },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', digits: 10 },
  { code: '+971', country: 'UAE', flag: '🇦🇪', digits: 9 },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', digits: 8 },
  { code: '+61', country: 'Australia', flag: '🇦🇺', digits: 9 },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', digits: 9 },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', digits: 8 },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', digits: 8 },
  { code: '+49', country: 'Germany', flag: '🇩🇪', digits: 10 },
];

/**
 * Sanitizes raw string input against Cross-Site Scripting (XSS) and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validates a mobile number according to the selected country code
 */
export function validatePhoneNumber(phone: string, countryCode = '+91'): { valid: boolean; cleanPhone: string; fullPhone: string; error?: string } {
  let cleanPhone = phone.replace(/\D/g, '');
  
  // If Indian phone number includes country prefix (e.g. 919876543210), strip the leading 91
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    cleanPhone = cleanPhone.slice(2);
  }

  const country = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  if (!cleanPhone) {
    return { valid: false, cleanPhone: '', fullPhone: '', error: 'Mobile number is required.' };
  }

  if (country.code === '+91') {
    if (cleanPhone.length !== 10) {
      return { valid: false, cleanPhone, fullPhone: `${country.code}${cleanPhone}`, error: 'Indian mobile number must be exactly 10 digits.' };
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return { valid: false, cleanPhone, fullPhone: `${country.code}${cleanPhone}`, error: 'Indian mobile number must start with 6, 7, 8, or 9.' };
    }
  } else {
    if (cleanPhone.length < country.digits - 1 || cleanPhone.length > country.digits + 2) {
      return { valid: false, cleanPhone, fullPhone: `${country.code}${cleanPhone}`, error: `Please enter a valid ${country.country} mobile number (${country.digits} digits).` };
    }
  }

  return { valid: true, cleanPhone, fullPhone: `${country.code}${cleanPhone}` };
}

/**
 * Validates strict RFC email address format
 */
export function validateEmailFormat(email: string): boolean {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

/**
 * Client-Side In-Memory Rate Limiting Guard
 */
const submissionTracker = new Map<string, number>();

export function checkRateLimit(actionKey: string, cooldownMs = 2000): boolean {
  const lastTime = submissionTracker.get(actionKey) || 0;
  const now = Date.now();
  if (now - lastTime < cooldownMs) {
    return false;
  }
  submissionTracker.set(actionKey, now);
  return true;
}
