import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Phone, UserRound, ArrowRight, Loader2, CheckCircle2, Sparkles, ShoppingBag } from 'lucide-react';
import PasswordField, { isStrongPassword } from '@/components/PasswordField';
import { checkRoleCollision, triggerGoogleSignIn, validateSessionRole } from '@/lib/authHelpers';
import { sanitizeInput, validatePhoneNumber, validateEmailFormat } from '@/lib/security';
import CountryPhoneInput from '@/components/CountryPhoneInput';
import OtpVerificationModal from '@/components/OtpVerificationModal';
import { toast } from 'react-hot-toast';

type Mode = 'login' | 'signup';

export default function UserAuth() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    validateSessionRole().then((roleErr) => {
      if (roleErr) {
        setError(roleErr);
      } else {
        const redirectError = sessionStorage.getItem('a_s_hamper_auth_error');
        if (redirectError) {
          setError(redirectError);
          sessionStorage.removeItem('a_s_hamper_auth_error');
        }
      }
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      await triggerGoogleSignIn('user', '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  if (session) {
    return (
      <div className="rounded-3xl bg-[#FAF6EB] dark:bg-[#240008] border border-[#7F011F]/20 p-8 sm:p-10 shadow-lg">
        <div className="flex items-center gap-3.5">
          <span className="grid place-items-center h-12 w-12 rounded-full bg-[#7F011F]/15 text-[#7F011F] dark:text-[#F5EBD0]">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-xl font-semibold text-[#7F011F] dark:text-[#F5EBD0]">
              You're signed in
            </h3>
            <p className="text-sm text-[#7F011F]/70 dark:text-[#F5EBD0]/70">
              {session.user.email}
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Link
            to="/profile"
            className="rounded-full bg-[#7F011F] text-[#F5EBD0] px-6 py-2.5 text-sm font-semibold hover:bg-[#680018] transition-colors"
          >
            View Account
          </Link>
          <button
            onClick={() => supabase?.auth.signOut()}
            className="rounded-full border border-[#7F011F]/30 px-5 py-2.5 text-sm font-medium text-[#7F011F] dark:text-[#F5EBD0] hover:bg-[#7F011F]/10 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!supabase) {
      setError('Authentication not configured. Please check environment variables.');
      setLoading(false);
      return;
    }

    try {
      if (!validateEmailFormat(email)) {
        throw new Error('Please enter a valid email address (e.g. name@gmail.com).');
      }

      const collisionMsg = await checkRoleCollision(email, 'user');
      if (collisionMsg) {
        setError(collisionMsg);
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        const phoneValidation = validatePhoneNumber(phone, countryCode);
        if (!phoneValidation.valid) {
          throw new Error(phoneValidation.error || 'Please enter a valid mobile number.');
        }
        if (password !== confirmPassword) {
          throw new Error('Password and Confirm Password do not match.');
        }
        if (!isStrongPassword(password)) {
          throw new Error('Use at least 8 characters with uppercase, lowercase, and a number.');
        }

        const cleanName = sanitizeInput(name);

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              account_type: 'user',
              full_name: cleanName,
              phone: phoneValidation.fullPhone,
            },
            emailRedirectTo: `${window.location.origin}/profile`,
          },
        });
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('sending confirmation email') || msg.includes('confirmation email') || msg.includes('smtp')) {
            console.warn('Supabase email notice:', error.message);
          } else {
            throw error;
          }
        }
        if (data.user?.identities?.length === 0) {
          throw new Error('An account with this email already exists. Please log in instead.');
        }

        sessionStorage.setItem('a_s_hamper_verify_email', email);
        sessionStorage.setItem('a_s_hamper_verify_role', 'customer');
        toast.success('Account created! Please enter verification code.');
        navigate(`/verify-email?email=${encodeURIComponent(email)}&role=customer`);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const isEmailConfirmed = !!(data.user.email_confirmed_at);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, email_verified')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!isEmailConfirmed && !profile?.email_verified) {
          await supabase.auth.signOut();
          sessionStorage.setItem('a_s_hamper_verify_email', email);
          sessionStorage.setItem('a_s_hamper_verify_role', 'customer');
          toast.error('Please verify your email address to continue.');
          navigate(`/verify-email?email=${encodeURIComponent(email)}&role=customer`);
          return;
        }

        if (profile?.role && profile.role !== 'user') {
          await supabase.auth.signOut();
          const roleName = profile.role === 'vendor' ? 'Vendor' : 'Admin';
          const portalName = profile.role === 'vendor' ? 'Vendor Portal' : 'Admin Portal';
          throw new Error(`This email is registered as a ${roleName}. Please sign in using the ${portalName}.`);
        }

        toast.success('Welcome back! Signed in successfully.');
        navigate('/', { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl bg-[#FAF6EB] dark:bg-[#240008] border border-[#7F011F]/20 p-8 sm:p-10 text-center shadow-xl">
        <span className="grid place-items-center h-14 w-14 rounded-full bg-[#7F011F]/15 text-[#7F011F] mx-auto">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold text-[#7F011F] dark:text-[#F5EBD0]">
          Account Created
        </h3>
        <p className="mt-2 text-sm text-[#7F011F]/70 dark:text-[#F5EBD0]/70 max-w-sm mx-auto">
          Your customer account was created successfully. Sign in to track orders and save your gift preferences.
        </p>
        <button
          onClick={() => {
            setDone(false);
            setMode('login');
          }}
          className="mt-6 rounded-full bg-[#7F011F] px-7 py-3 text-sm font-semibold text-[#F5EBD0] hover:bg-[#680018] transition-colors shadow-md"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Customer Auth Card */}
      <div className="rounded-3xl bg-[#FAF6EB] dark:bg-[#240008] border border-[#7F011F]/20 p-6 sm:p-8 lg:p-10 shadow-[0_20px_60px_-20px_rgba(127,1,31,0.15)]">
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-[#7F011F]/15">
          <span className="grid place-items-center h-12 w-12 rounded-2xl bg-[#7F011F] text-[#F5EBD0] shadow-sm">
            <UserRound className="h-6 w-6" />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7F011F] dark:text-[#F5EBD0]">
              Customer Account
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
              {mode === 'login' ? 'Sign In to Your Account' : 'Create Customer Account'}
            </h3>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-[#F5EBD0] dark:bg-[#180005] p-1 border border-[#7F011F]/20">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`rounded-full py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              mode === 'login'
                ? 'bg-[#7F011F] text-[#F5EBD0] shadow-sm'
                : 'text-[#7F011F]/70 dark:text-[#F5EBD0]/70 hover:text-[#7F011F]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`rounded-full py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-[#7F011F] text-[#F5EBD0] shadow-sm'
                : 'text-[#7F011F]/70 dark:text-[#F5EBD0]/70 hover:text-[#7F011F]'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
          {mode === 'signup' && (
            <Field icon={<UserRound className="h-4 w-4" />} label="Full Name">
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full h-11 rounded-xl border border-[#7F011F]/30 bg-white dark:bg-[#180005] px-3.5 text-sm text-[#7F011F] dark:text-[#F5EBD0] outline-none focus:border-[#7F011F] focus:ring-2 focus:ring-[#7F011F]/20"
              />
            </Field>
          )}

          {mode === 'signup' && (
            <Field icon={<Phone className="h-4 w-4" />} label="Mobile Number">
              <CountryPhoneInput
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
                phone={phone}
                onPhoneChange={setPhone}
              />
            </Field>
          )}

          <Field icon={<Mail className="h-4 w-4" />} label="Email Address">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className="w-full h-11 rounded-xl border border-[#7F011F]/30 bg-white dark:bg-[#180005] px-3.5 text-sm text-[#7F011F] dark:text-[#F5EBD0] outline-none focus:border-[#7F011F] focus:ring-2 focus:ring-[#7F011F]/20"
            />
          </Field>

          <Field icon={<Lock className="h-4 w-4" />} label="Password">
            <PasswordField
              value={password}
              onChange={setPassword}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              showStrength={mode === 'signup'}
              placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
            />
          </Field>

          {mode === 'signup' && (
            <Field icon={<Lock className="h-4 w-4" />} label="Confirm Password">
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                placeholder="Re-enter password"
              />
            </Field>
          )}

          {mode === 'login' && (
            <div className="flex justify-end pt-0.5">
              <Link
                to="/forgot-password?role=customer"
                className="text-xs font-semibold text-[#7F011F] hover:underline dark:text-[#F5EBD0]"
              >
                Forgot Password?
              </Link>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#7F011F] py-3.5 text-sm font-bold text-[#F5EBD0] transition-all hover:bg-[#680018] shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {mode === 'signup' ? 'Create Customer Account' : 'Sign In'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#7F011F]/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="px-3 bg-[#FAF6EB] dark:bg-[#240008] text-[#7F011F]/60 dark:text-[#F5EBD0]/60 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-[#7F011F]/30 bg-white dark:bg-[#180005] py-3 text-sm font-semibold text-[#7F011F] dark:text-[#F5EBD0] transition-all hover:bg-[#7F011F]/5 disabled:opacity-60 shadow-xs"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Sign In with Google
          </button>

          <OtpVerificationModal
            isOpen={showOtpModal}
            email={email}
            phone={`${countryCode}${phone}`}
            onSuccess={() => {
              setShowOtpModal(false);
              setDone(true);
            }}
            onClose={() => setShowOtpModal(false)}
          />
        </form>
      </div>

      {/* Prominent Below-Card Switch Section */}
      {mode === 'login' ? (
        <div className="rounded-3xl bg-[#F5EBD0] dark:bg-[#180005] border border-[#7F011F]/30 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7F011F] dark:text-[#F5EBD0]">
              <Sparkles className="h-4 w-4" />
              <span>New to A_S Hamper?</span>
            </div>
            <h4 className="font-display text-base sm:text-lg font-bold text-[#7F011F] dark:text-[#F5EBD0]">
              Create Your Customer Account
            </h4>
            <p className="text-xs text-[#7F011F]/70 dark:text-[#F5EBD0]/70 max-w-md">
              Enjoy express checkout, real-time live order tracking, address book saving, and exclusive hamper offers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className="shrink-0 rounded-full border-2 border-[#7F011F] bg-[#7F011F] text-[#F5EBD0] hover:bg-[#680018] px-6 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-sm"
          >
            Create Account
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-[#F5EBD0] dark:bg-[#180005] border border-[#7F011F]/30 p-5 text-center shadow-sm">
          <p className="text-xs sm:text-sm text-[#7F011F]/80 dark:text-[#F5EBD0]/80">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="font-bold text-[#7F011F] dark:text-[#F5EBD0] underline hover:opacity-80 ml-1"
            >
              Sign In here
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#7F011F]/80 dark:text-[#F5EBD0]/80">
        <span className="text-[#7F011F] dark:text-[#F5EBD0]">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}
