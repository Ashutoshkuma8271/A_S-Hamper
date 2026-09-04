import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, ArrowRight, X, KeyRound, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface OtpVerificationModalProps {
  isOpen: boolean;
  email: string;
  phone?: string;
  title?: string;
  onSuccess: () => void;
  onClose: () => void;
}

const MAX_FAILED_ATTEMPTS = 5;

export default function OtpVerificationModal({
  isOpen,
  email,
  phone,
  title = 'Verify Email OTP',
  onSuccess,
  onClose,
}: OtpVerificationModalProps) {
  const [otpToken, setOtpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      setError('Too many failed attempts. Please request a new OTP code.');
      return;
    }

    setLoading(true);

    if (!supabase) {
      setError('Authentication system unavailable.');
      setLoading(false);
      return;
    }

    const cleanToken = otpToken.trim();
    if (cleanToken.length < 6 || cleanToken.length > 8 || !/^\d{6,8}$/.test(cleanToken)) {
      setError('Please enter a valid numeric OTP code (6 to 8 digits).');
      setLoading(false);
      return;
    }

    try {
      // 1. Try Email Signup OTP Verification
      let verifyRes = await supabase.auth.verifyOtp({
        email,
        token: cleanToken,
        type: 'signup',
      });

      // 2. Fallback to Email Magic Link / Magic Code
      if (verifyRes.error) {
        verifyRes = await supabase.auth.verifyOtp({
          email,
          token: cleanToken,
          type: 'email',
        });
      }

      // 3. Fallback to Phone OTP Verification if phone is provided
      if (verifyRes.error && phone) {
        verifyRes = await supabase.auth.verifyOtp({
          phone,
          token: cleanToken,
          type: 'sms',
        });
      }

      if (verifyRes.error) {
        setFailedAttempts((prev) => prev + 1);
        const remaining = MAX_FAILED_ATTEMPTS - (failedAttempts + 1);
        if (remaining <= 0) {
          throw new Error('Maximum incorrect OTP attempts reached. Please click "Resend Code".');
        }
        throw new Error(`Invalid or expired OTP code. (${remaining} attempts remaining)`);
      }

      // Mark email_verified status in database if available
      try {
        if (verifyRes.data?.user?.id) {
          await supabase
            .from('profiles')
            .update({ email_verified: true, account_status: 'active', updated_at: new Date().toISOString() })
            .eq('id', verifyRes.data.user.id);
        }
      } catch (dbErr) {
        console.warn('Profile status update error:', dbErr);
      }

      toast.success('Email & OTP verified successfully! Account is now active.', { icon: '🎉' });
      setFailedAttempts(0);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!supabase || cooldown > 0) return;
    setResending(true);
    setError(null);
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (resendErr) throw resendErr;
      toast.success(`New 6-digit OTP re-sent to ${email}`, { icon: '📩' });
      setCooldown(60); // 60-second cooldown guard
      setFailedAttempts(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-md rounded-3xl bg-cream-50 p-6 sm:p-8 shadow-2xl ring-1 ring-cream-200 dark:bg-gray-800 dark:ring-gray-700">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-cream-200/60 text-ink-700/60 hover:bg-cream-300 dark:bg-gray-700 dark:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-wine-600/10 text-wine-600 dark:bg-gold-500/20 dark:text-gold-300 mx-auto">
            <KeyRound className="h-7 w-7" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold text-wine-800 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-xs text-ink-700/70 dark:text-gray-300 max-w-xs mx-auto">
            We sent a 6-digit OTP verification code to <strong className="text-wine-700 dark:text-gold-300">{email}</strong>.
            {phone && <span> and <strong className="text-wine-700 dark:text-gold-300">{phone}</strong></span>}.
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <label className="block text-center text-xs font-semibold text-ink-700/80 dark:text-gray-300 uppercase tracking-wider mb-2">
              Enter Gmail OTP Verification Code
            </label>
            <input
              required
              type="text"
              maxLength={8}
              value={otpToken}
              onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="Enter OTP code"
              className="w-full text-center tracking-[0.3em] font-mono text-2xl font-bold rounded-2xl border-2 border-wine-600/40 bg-white py-3 text-wine-800 outline-none focus:border-wine-600 dark:border-gold-500/50 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 text-red-700 text-xs px-3.5 py-2.5 dark:bg-red-950/40 dark:text-red-300 text-center font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || otpToken.length < 6 || failedAttempts >= MAX_FAILED_ATTEMPTS}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-wine-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-wine-700 disabled:opacity-60 transition-all"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Verify OTP &amp; Activate Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-ink-700/60 dark:text-gray-400">
          Didn't receive code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="font-bold text-wine-700 hover:underline disabled:opacity-50 dark:text-gold-300"
          >
            {resending
              ? 'Sending...'
              : cooldown > 0
              ? `Resend Code in ${cooldown}s`
              : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
