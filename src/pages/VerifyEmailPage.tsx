import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, RefreshCw, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryEmail = searchParams.get('email') || sessionStorage.getItem('a_s_hamper_verify_email') || '';
  const queryRole = searchParams.get('role') || sessionStorage.getItem('a_s_hamper_verify_role') || 'customer';

  const [email] = useState(queryEmail);
  const [role] = useState(queryRole);
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']); // Supports up to 8-digit OTP
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 60-second Resend OTP Cooldown Timer
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto focus first OTP digit input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  const handleChangeDigit = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrorMsg(null);

    // Auto-advance to next input
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    if (pasteData) {
      const newOtp = ['', '', '', '', '', '', '', ''];
      for (let i = 0; i < pasteData.length; i++) {
        newOtp[i] = pasteData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pasteData.length, 7);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex]?.focus();
      }
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending || !email) return;

    setResending(true);
    setErrorMsg(null);

    try {
      if (!supabase) throw new Error('Authentication service unavailable.');

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('email rate')) {
          throw new Error('Supabase default email rate limit exceeded (max 3/hour). Please check your Spam folder or enable Custom Gmail SMTP in Supabase Dashboard.');
        }
        throw error;
      }

      toast.success('A new OTP verification code has been dispatched to your Gmail address!', { icon: '📧' });
      setCooldown(60);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to resend OTP. Please check your Gmail Spam folder.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanToken = otp.join('').trim();
    if (cleanToken.length < 6 || cleanToken.length > 8) {
      setErrorMsg('Please enter a valid 6-digit or 8-digit OTP verification code.');
      return;
    }

    if (!email) {
      setErrorMsg('Email address not found. Please try registering again.');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) throw new Error('Authentication service unavailable.');

      // 1. Verify OTP token with Supabase Auth
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanToken,
        type: 'signup',
      });

      if (error) {
        // Fallback check for email confirmation
        const { error: emailCheckErr } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: cleanToken,
          type: 'email',
        });

        if (emailCheckErr) {
          throw new Error('Invalid or expired OTP code. Please check your Gmail inbox or click Resend.');
        }
      }

      // 2. Guarantee user profile record is created and stored in database with email_verified = true
      if (data?.user?.id) {
        const metaData = data.user.user_metadata || {};
        await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              full_name: metaData.full_name || metaData.business_name || 'User',
              business_name: metaData.business_name || null,
              shop_no: metaData.shop_no || null,
              gst_no: metaData.gst_no || null,
              role: metaData.account_type || role || 'user',
              phone: metaData.phone || null,
              email_verified: true,
              account_status: 'active',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
      }

      // 3. Clear temporary verification storage
      sessionStorage.removeItem('a_s_hamper_verify_email');
      sessionStorage.removeItem('a_s_hamper_verify_role');

      // 4. Sign out active session per flowchart requirement so user MUST log in explicitly
      await supabase.auth.signOut();

      setIsVerified(true);
      toast.success('Email verified successfully!', { icon: '✅' });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid OTP code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const loginRoute = role === 'vendor' ? '/vendor' : role === 'admin' ? '/admin' : '/profile';
  const roleTitle = role === 'vendor' ? 'Vendor' : role === 'admin' ? 'Admin' : 'Customer';
  const filledDigitsCount = otp.join('').trim().length;

  return (
    <main className="min-h-screen bg-cream-50/60 dark:bg-gray-900 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center transition-colors">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-cream-200 bg-white p-6 sm:p-8 shadow-xl dark:border-gray-800 dark:bg-gray-800">
          {!isVerified ? (
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-wine-600/10 text-wine-600 dark:bg-wine-600/20 dark:text-gold-300">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-wine-800 dark:text-white">
                    Verify Your Email
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {roleTitle} Account Security
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                We have sent an OTP verification code to <strong className="text-wine-800 dark:text-gold-300">{email || 'your Gmail address'}</strong>.
              </p>

              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2 text-center">
                    Enter OTP Code (6 to 8 Digits)
                  </label>

                  <div className="flex items-center justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChangeDigit(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="h-11 w-9 sm:h-12 sm:w-10 rounded-xl border border-cream-300 bg-cream-50/50 text-center font-mono text-base sm:text-lg font-bold text-wine-800 outline-none focus:border-wine-600 focus:ring-2 focus:ring-wine-600/20 dark:border-gray-700 dark:bg-gray-700 dark:text-white transition-all"
                      />
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl flex items-center gap-1.5 text-center justify-center">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || filledDigitsCount < 6}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-wine-600 py-3 text-xs font-bold text-white shadow-lg shadow-wine-600/30 transition-all hover:bg-wine-700 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying OTP...
                    </>
                  ) : (
                    <>
                      Verify OTP &amp; Activate Account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Resend Cooldown & Troubleshooting Section */}
              <div className="mt-6 border-t border-cream-200 dark:border-gray-700 pt-4 text-center text-xs space-y-3">
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-left text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-wine-800 dark:text-gold-300">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    Receiving 8-digit OTP instead of 6-digit OTP?
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    Our form accepts both 6-digit and 8-digit OTP codes! If you want Supabase to always generate 6-digit codes:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-gray-600 dark:text-gray-300 text-[10.5px] pl-1 font-medium">
                    <li>Go to <strong>Supabase Dashboard</strong> → <strong>Authentication</strong> → <strong>Provider Settings</strong> → <strong>Email</strong>.</li>
                    <li>Set <strong>OTP Length</strong> to <strong>6</strong> and save.</li>
                  </ol>
                </div>

                <p className="text-gray-500 dark:text-gray-400">Didn't receive the OTP code?</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || resending}
                  className="inline-flex items-center gap-1.5 font-bold text-wine-600 hover:underline dark:text-gold-300 disabled:opacity-50 disabled:no-underline"
                >
                  {resending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP via Gmail'}
                </button>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-center gap-1 text-[10px] text-gray-400">
                <ShieldCheck className="h-3 w-3 text-sage-600" />
                <span>Protected by Supabase Encrypted Gmail Verification</span>
              </div>
            </div>
          ) : (
            /* Email Verified Success State */
            <div className="text-center space-y-4 py-2">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage-500/15 text-sage-600 dark:text-sage-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <h2 className="font-display text-2xl font-bold text-wine-800 dark:text-white">
                Email Verified Successfully!
              </h2>

              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Your {roleTitle} account has been activated. Per security requirements, please sign in with your email and password to proceed.
              </p>

              <Link
                to={loginRoute}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-wine-600 py-3 text-xs font-bold text-white shadow-lg shadow-wine-600/30 transition-all hover:bg-wine-700"
              >
                Proceed to {roleTitle} Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
