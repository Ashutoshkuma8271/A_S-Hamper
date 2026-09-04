import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Loader2, LockKeyhole, Mail, ShieldCheck, UserRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import PasswordField, { isStrongPassword } from '@/components/PasswordField';
import { checkRoleCollision, triggerGoogleSignIn, validateSessionRole } from '@/lib/authHelpers';
import { sanitizeInput, validateEmailFormat, checkRateLimit } from '@/lib/security';
import OtpVerificationModal from '@/components/OtpVerificationModal';
import { toast } from 'react-hot-toast';

type Mode = 'login' | 'signup' | 'forgot';

export default function AdminAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  useEffect(() => {
    validateSessionRole().then((roleErr) => {
      if (roleErr) setError(roleErr);
    });

    // Check if an admin is already registered in the system
    async function checkAdminCount() {
      if (!supabase) return;
      try {
        const { count, error } = await supabase
          .from('admins')
          .select('*', { count: 'exact', head: true });

        if (!error && typeof count === 'number') {
          setAdminExists(count > 0);
          if (count > 0) {
            setMode('login');
          }
        }
      } catch (e) {
        console.warn('Admin count check error:', e);
      }
    }
    checkAdminCount();
  }, []);

  async function requestPasswordReset(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!supabase || !email) {
      setError('Please enter your registered Admin email address.');
      return;
    }

    if (!validateEmailFormat(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/profile?reset=1`,
      });
      if (resetError) throw resetError;
      setResetSent(true);
      const msg = 'Password reset instructions sent to your Admin Gmail inbox.';
      setSuccessMsg(msg);
      toast.success(msg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send password reset email.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await triggerGoogleSignIn('admin', '/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!checkRateLimit('admin_auth_submit', 1500)) {
      setError('Please wait a moment before trying again.');
      return;
    }

    if (!supabase) {
      setError('Authentication system unavailable.');
      return;
    }

    const cleanEmail = email.trim();
    if (!validateEmailFormat(cleanEmail)) {
      setError('Please enter a valid Admin email address (e.g. admin@yourdomain.com).');
      return;
    }

    setLoading(true);

    try {
      // Check cross-role collision before attempting login/signup
      const collisionMsg = await checkRoleCollision(cleanEmail, 'admin');
      if (collisionMsg) {
        setError(collisionMsg);
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        // Enforce Single Admin policy
        if (adminExists) {
          throw new Error('Admin registration is closed. Only one primary Administrator account is allowed on this platform. Please sign in instead.');
        }

        // --- 1. ADMIN SIGNUP FLOW ---
        const cleanName = sanitizeInput(name);
        if (!cleanName) {
          throw new Error('Please enter your Full Name.');
        }

        if (password !== confirmPassword) {
          throw new Error('Password and Confirm Password do not match.');
        }

        if (!isStrongPassword(password)) {
          throw new Error('Password must be at least 8 characters with uppercase, lowercase, and a number.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              account_type: 'admin',
              full_name: cleanName,
            },
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });

        if (signUpError) {
          const msg = signUpError.message.toLowerCase();
          if (msg.includes('sending confirmation email') || msg.includes('confirmation email') || msg.includes('smtp')) {
            console.warn('Supabase email notice:', signUpError.message);
          } else {
            throw signUpError;
          }
        }

        if (data.user?.identities?.length === 0) {
          setMode('login');
          throw new Error('An Administrator account with this email already exists. Switched to Sign In mode. Please enter your password or use "Forgot Admin Password" to reset.');
        }

        sessionStorage.setItem('a_s_hamper_verify_email', cleanEmail);
        sessionStorage.setItem('a_s_hamper_verify_role', 'admin');
        toast.success('Admin account created! Please enter verification code.');
        navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}&role=admin`);
      } else {
        // --- 2. DEDICATED ADMIN LOGIN FLOW ---
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (signInError) throw signInError;

        // Fetch server-side role and account status from database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, account_status, email_verified')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // Check if email is verified
        if (!data.user.email_confirmed_at && !profile?.email_verified) {
          await supabase.auth.signOut();
          sessionStorage.setItem('a_s_hamper_verify_email', cleanEmail);
          sessionStorage.setItem('a_s_hamper_verify_role', 'admin');
          toast.error('Please verify your email address to continue.');
          navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}&role=admin`);
          return;
        }

        if (profile?.role !== 'admin') {
          await supabase.auth.signOut();
          const roleName = profile?.role === 'vendor' ? 'Vendor' : 'Customer';
          const portalName = profile?.role === 'vendor' ? 'Vendor Portal' : 'Customer Account';
          throw new Error(`Access Denied: This email is registered as a ${roleName}. Please sign in using the ${portalName}.`);
        }

        if (profile?.account_status === 'inactive' || profile?.account_status === 'suspended') {
          await supabase.auth.signOut();
          throw new Error('Your Admin account is currently inactive. Please contact store management.');
        }

        // Login verified & active -> proceed to Admin Dashboard
        void supabase.functions.invoke('login-alert');
        toast.success('Admin authenticated successfully!');
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong during Admin authentication.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl bg-[#FAF6EB] dark:bg-[#240008] p-6 sm:p-8 lg:p-10 border border-[#7F011F]/20 shadow-[0_20px_60px_-20px_rgba(127,1,31,0.15)] font-sans">
      <div className="mb-6 flex items-center gap-3.5 pb-4 border-b border-[#7F011F]/15">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#7F011F] text-[#F5EBD0] shadow-md">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7F011F] dark:text-[#F5EBD0]">
            Store Control Center
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
            Admin Security Portal
          </h3>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-[#F5EBD0] dark:bg-[#180005] p-1 border border-[#7F011F]/20">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
            setSuccessMsg(null);
          }}
          className={`rounded-full py-2.5 text-xs sm:text-sm font-semibold transition-all ${
            mode === 'login'
              ? 'bg-[#7F011F] text-[#F5EBD0] shadow-sm'
              : 'text-[#7F011F]/70 dark:text-[#F5EBD0]/70 hover:text-[#7F011F]'
          }`}
        >
          Admin Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            if (adminExists) {
              setError('Admin account is already configured. Only primary Administrator login is permitted.');
              toast.error('Only one Administrator is allowed on this platform.');
              return;
            }
            setMode('signup');
            setError(null);
            setSuccessMsg(null);
          }}
          disabled={adminExists === true}
          className={`rounded-full py-2.5 text-xs sm:text-sm font-semibold transition-all ${
            adminExists === true
              ? 'opacity-40 cursor-not-allowed text-gray-400'
              : mode === 'signup'
              ? 'bg-[#7F011F] text-[#F5EBD0] shadow-sm'
              : 'text-[#7F011F]/70 dark:text-[#F5EBD0]/70 hover:text-[#7F011F]'
          }`}
        >
          {adminExists ? 'Setup Closed' : 'Admin Setup'}
        </button>
      </div>

      {mode === 'forgot' ? (
        <form onSubmit={requestPasswordReset} className="space-y-4">
          <p className="text-xs text-ink-700/75 dark:text-gray-300">
            Enter your registered Admin email address to receive password reset instructions via Gmail.
          </p>
          <Field icon={<Mail className="h-4 w-4" />} label="Admin Email">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yourdomain.com"
              className="input"
            />
          </Field>

          {error && <p className="rounded-xl bg-red-50 text-red-700 text-xs px-4 py-3 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
          {successMsg && <p className="rounded-xl bg-emerald-50 text-emerald-800 text-xs px-4 py-3 dark:bg-emerald-950/40 dark:text-emerald-300">{successMsg}</p>}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className="text-xs font-semibold text-wine-700 hover:underline dark:text-gold-300"
            >
              ← Back to Admin Login
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-wine-700 px-6 py-2.5 text-xs font-semibold text-white hover:bg-wine-800 disabled:opacity-60 transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={submit} autoComplete="on" className="space-y-4">
          {mode === 'signup' && (
            <Field icon={<UserRound className="h-4 w-4" />} label="Full Name">
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin Full Name"
                className="input"
              />
            </Field>
          )}

          <Field icon={<Mail className="h-4 w-4" />} label="Admin Email Address">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yourdomain.com"
              className="input"
            />
          </Field>

          <Field icon={<LockKeyhole className="h-4 w-4" />} label="Password">
            <PasswordField
              value={password}
              onChange={setPassword}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="Min 8 chars (uppercase, lowercase, number)"
            />
          </Field>

          {mode === 'signup' && (
            <Field icon={<LockKeyhole className="h-4 w-4" />} label="Confirm Password">
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                placeholder="Re-enter password"
              />
            </Field>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(null); }}
                className="text-xs font-semibold text-wine-700 hover:underline dark:text-gold-300"
              >
                Forgot Admin Password?
              </button>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 text-red-700 text-xs px-4 py-3 dark:bg-red-950/40 dark:text-red-300 font-medium">
              {error}
            </p>
          )}

          {successMsg && (
            <p className="rounded-xl bg-emerald-50 text-emerald-800 text-xs px-4 py-3 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-wine-700 py-3.5 text-sm font-semibold text-cream-50 transition-all hover:bg-wine-800 disabled:opacity-60 shadow-md"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {mode === 'signup' ? 'Create Admin Account & Verify OTP' : 'Sign in to Admin Dashboard'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-[#7F011F]/20 dark:border-gray-700" />
            <span className="absolute bg-[#FAF6EB] dark:bg-[#240008] px-3 text-[11px] font-bold uppercase tracking-wider text-[#7F011F]/60 dark:text-[#F5EBD0]/60">
              OR
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-[#7F011F]/30 bg-white/80 dark:bg-gray-800/80 px-4 py-3 text-xs font-bold text-[#7F011F] dark:text-[#F5EBD0] shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-[0.99] disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#7F011F]" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            Continue with Admin Google
          </button>

          <div className="mt-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-center text-xs text-amber-900 dark:text-amber-200">
            <p className="font-semibold flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-wine-700 dark:text-gold-300" />
              Single-Admin Security Enforcement
            </p>
            <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
              Only one verified Administrator account is permitted across this store. Google and Password logins must match the primary administrator's email.
            </p>
          </div>
        </form>
      )}

      {/* 6-Digit Admin Gmail OTP Verification Screen Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        email={email}
        title="Admin Gmail OTP Verification"
        onSuccess={() => {
          setShowOtpModal(false);
          setSuccessMsg('Email verified successfully! You can now log in to your Admin account.');
          setMode('login');
        }}
        onClose={() => setShowOtpModal(false)}
      />
    </section>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-700/60 dark:text-gray-400">
        <span className="text-gold-600">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}
