import { Eye, EyeOff, Check, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function isStrongPassword(value: string) {
  return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
}

export default function PasswordField({
  value,
  onChange,
  autoComplete,
  showStrength = false,
  placeholder = 'Password',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  showStrength?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  const hasLength = value.length >= 8;
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);

  const passedCount = [hasLength, hasLower, hasUpper, hasNumber].filter(Boolean).length;

  const shouldDisplayStrength = showStrength || (autoComplete === 'new-password' && value.length > 0);

  const getStrengthLabel = () => {
    if (passedCount === 4) return { label: 'Strong & Secure Password', color: 'text-emerald-600 dark:text-emerald-400' };
    if (passedCount === 3) return { label: 'Good Password (Add missing requirements)', color: 'text-[#C99738] dark:text-gold-300' };
    if (passedCount === 2) return { label: 'Moderate Password', color: 'text-amber-600 dark:text-amber-400' };
    return { label: 'Weak Password', color: 'text-red-600 dark:text-red-400' };
  };

  const strengthInfo = getStrengthLabel();

  return (
    <div className="w-full font-sans">
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          required
          autoComplete={autoComplete}
          minLength={autoComplete === 'new-password' ? 8 : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`input pr-12 font-mono ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-700/50 hover:text-wine-700 dark:text-gray-400 dark:hover:text-gold-300 transition-colors"
          aria-label={visible ? 'Hide password' : 'Show password'}
          title={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {shouldDisplayStrength && (
        <div className="mt-2 space-y-2 animate-fade-in">
          {/* Progress Segment Bar */}
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((step) => {
              let bg = 'bg-cream-200 dark:bg-gray-700';
              if (passedCount >= step) {
                if (passedCount === 4) bg = 'bg-emerald-500';
                else if (passedCount === 3) bg = 'bg-[#C99738]';
                else if (passedCount === 2) bg = 'bg-amber-500';
                else bg = 'bg-red-500';
              }
              return (
                <span
                  key={step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${bg}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className={`font-semibold flex items-center gap-1 ${strengthInfo.color}`}>
              {passedCount === 4 && <ShieldCheck className="h-3.5 w-3.5" />}
              {strengthInfo.label}
            </span>
            <span className="text-gray-400">{passedCount}/4</span>
          </div>

          {/* Requirement Chips Checklist */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
            <span
              className={`flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-colors ${
                hasLength
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-cream-100/60 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {hasLength ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-gray-400" />}
              8+ characters
            </span>
            <span
              className={`flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-colors ${
                hasUpper
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-cream-100/60 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {hasUpper ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-gray-400" />}
              Uppercase (A-Z)
            </span>
            <span
              className={`flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-colors ${
                hasLower
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-cream-100/60 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {hasLower ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-gray-400" />}
              Lowercase (a-z)
            </span>
            <span
              className={`flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-colors ${
                hasNumber
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-cream-100/60 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {hasNumber ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-gray-400" />}
              One number (0-9)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
