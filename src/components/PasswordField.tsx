import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function isStrongPassword(value: string) {
  return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
}

export default function PasswordField({
  value, onChange, autoComplete, showStrength = false, placeholder = 'Password',
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  showStrength?: boolean;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  const strength = [value.length >= 8, /[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value)].filter(Boolean).length;
  const label = strength === 4 ? 'Strong password' : strength >= 3 ? 'Almost there' : 'Use 8+ characters, upper/lowercase, and a number';

  return <div>
    <div className="relative">
      <input type={visible ? 'text' : 'password'} required autoComplete={autoComplete} minLength={8} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="input pr-12" />
      <button type="button" onClick={() => setVisible((current) => !current)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-700/55 hover:text-wine-700" aria-label={visible ? 'Hide password' : 'Show password'}>
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    {showStrength && <div className="mt-2"><div className="grid grid-cols-4 gap-1">{[1, 2, 3, 4].map((step) => <span key={step} className={`h-1 rounded-full ${strength >= step ? strength === 4 ? 'bg-sage-500' : 'bg-gold-500' : 'bg-cream-300'}`} />)}</div><p className={`mt-1 text-xs ${strength === 4 ? 'text-sage-600' : 'text-ink-700/55'}`}>{label}</p></div>}
  </div>;
}
