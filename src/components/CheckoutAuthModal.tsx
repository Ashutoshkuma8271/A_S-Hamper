import { useState } from 'react';
import { X, Mail, Lock, UserRound, Phone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PasswordField, { isStrongPassword } from '@/components/PasswordField';
import { triggerGoogleSignIn } from '@/lib/authHelpers';
import { sanitizeInput, validatePhoneNumber, validateEmailFormat } from '@/lib/security';
import CountryPhoneInput from '@/components/CountryPhoneInput';

type Mode = 'login' | 'signup';

interface CheckoutAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest?: () => void;
}

export default function CheckoutAuthModal({ isOpen, onClose, onContinueAsGuest }: CheckoutAuthModalProps) {
  const [mode, setMode] = useState<Mode>('signup');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await triggerGoogleSignIn('user', '/checkout');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!supabase) {
      setError('Authentication system not configured.');
      setLoading(false);
      return;
    }

    try {
      if (!validateEmailFormat(email)) {
        throw new Error('Please enter a valid email address (e.g. name@gmail.com).');
      }

      if (mode === 'signup') {
        const phoneValidation = validatePhoneNumber(phone, countryCode);
        if (!phoneValidation.valid) {
          throw new Error(phoneValidation.error || 'Please enter a valid mobile number.');
        }
        if (!isStrongPassword(password)) {
          throw new Error('Password must be at least 8 characters with letters & numbers.');
        }

        const cleanName = sanitizeInput(name);
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { account_type: 'user', full_name: cleanName, phone: phoneValidation.fullPhone },
            emailRedirectTo: `${window.location.origin}/checkout`,
          },
        });

        if (signUpErr) throw signUpErr;

        if (data.user?.identities?.length === 0) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }

        // If email confirmation is off, user is logged in
        onClose();
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-md rounded-3xl bg-[#FAF6EB] p-6 sm:p-8 shadow-2xl border border-[#7F011F]/20 dark:bg-[#240008] dark:border-[#7F011F]/40">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-[#7F011F]/10 text-[#7F011F] hover:bg-[#7F011F]/20 dark:text-[#F5EBD0] transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7F011F]/10 px-3.5 py-1 text-xs font-semibold text-[#7F011F] dark:text-[#F5EBD0]">
            <UserRound className="h-3.5 w-3.5" /> Express Checkout
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
            {mode === 'signup' ? 'Create Account for Checkout' : 'Sign In to Proceed'}
          </h2>
          <p className="mt-1 text-xs text-[#7F011F]/70 dark:text-[#F5EBD0]/70">
            Save delivery addresses, earn wallet rewards & track your hamper order.
          </p>
        </div>

        {/* Google 1-Click Authentication */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#7F011F]/20 bg-white py-3 text-sm font-semibold text-[#7F011F] shadow-sm transition-all hover:bg-[#7F011F]/5 dark:bg-[#180005] dark:text-[#F5EBD0]"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#7F011F]" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.41l3.99-3.14z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
          )}
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#7F011F]/20 dark:bg-[#7F011F]/40"></div>
          <span className="text-[11px] uppercase tracking-wider text-[#7F011F]/60 dark:text-[#F5EBD0]/60">or with email</span>
          <div className="h-px flex-1 bg-[#7F011F]/20 dark:bg-[#7F011F]/40"></div>
        </div>

        {/* Email/Password Sign Up or Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#7F011F] dark:text-[#F5EBD0] mb-1">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-2xl border border-[#7F011F]/25 bg-white px-4 py-2.5 text-sm text-[#7F011F] dark:bg-[#180005] dark:text-[#F5EBD0] outline-none focus:border-[#7F011F]"
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#7F011F] dark:text-[#F5EBD0] mb-1">Mobile Number</label>
              <CountryPhoneInput
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
                phone={phone}
                onPhoneChange={setPhone}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#7F011F] dark:text-[#F5EBD0] mb-1">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-2xl border border-[#7F011F]/25 bg-white px-4 py-2.5 text-sm text-[#7F011F] dark:bg-[#180005] dark:text-[#F5EBD0] outline-none focus:border-[#7F011F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7F011F] dark:text-[#F5EBD0] mb-1">Password</label>
            <PasswordField
              value={password}
              onChange={setPassword}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              showStrength={mode === 'signup'}
              placeholder={mode === 'signup' ? 'Create strong password' : 'Your password'}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 text-red-700 text-xs px-3.5 py-2.5 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#7F011F] py-3 text-sm font-semibold text-[#F5EBD0] shadow-md hover:bg-[#680018] transition-colors cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signup' ? 'Create Account & Checkout' : 'Sign In & Checkout'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            className="font-semibold text-[#7F011F] hover:underline dark:text-[#F5EBD0]"
          >
            {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>

          {onContinueAsGuest && (
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-[#7F011F]/70 hover:text-[#7F011F] underline dark:text-[#F5EBD0]/70"
            >
              Continue as Guest
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
