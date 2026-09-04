import React from 'react';
import { COUNTRY_CODES } from '@/lib/security';
import { ChevronDown } from 'lucide-react';

interface CountryPhoneInputProps {
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  required?: boolean;
  className?: string;
}

export default function CountryPhoneInput({
  countryCode,
  onCountryCodeChange,
  phone,
  onPhoneChange,
  required = true,
  className = '',
}: CountryPhoneInputProps) {
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <div
      className={`flex items-center rounded-2xl border border-cream-300 bg-white transition-all focus-within:border-wine-600 focus-within:ring-2 focus-within:ring-wine-500/20 dark:border-gray-700 dark:bg-gray-800 dark:focus-within:border-wine-400 ${className}`}
    >
      {/* Compact & Sleek Country Code Trigger Box */}
      <div className="relative flex items-center gap-1.5 px-3 py-3 bg-cream-100/70 border-r border-cream-300 dark:bg-gray-700/60 dark:border-gray-600 shrink-0 select-none cursor-pointer">
        <span className="text-base leading-none select-none">{selectedCountry.flag}</span>
        <span className="font-bold text-xs text-wine-800 dark:text-gold-300 select-none">
          {selectedCountry.code}
        </span>
        <ChevronDown className="h-3 w-3 text-wine-700/60 dark:text-gray-400 pointer-events-none" />

        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer bg-transparent"
          aria-label="Select Country Code"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code} className="dark:bg-gray-800 dark:text-white">
              {c.flag} {c.code} ({c.country})
            </option>
          ))}
        </select>
      </div>

      {/* Clean Phone Number Input Field */}
      <input
        type="tel"
        required={required}
        maxLength={12}
        autoComplete="tel-national"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, '').slice(0, 12))}
        placeholder=""
        className="w-full bg-transparent px-4 py-3 text-sm font-medium text-ink-800 outline-none dark:text-white"
      />
    </div>
  );
}
