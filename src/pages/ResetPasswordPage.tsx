import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PasswordField, { isStrongPassword } from '@/components/PasswordField';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role') || 'user';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [userRole, setUserRole] = useState<'customer' | 'vendor' | 'admin'>(
    requestedRole === 'vendor' ? 'vendor' : requestedRole === 'admin' ? 'admin' : 'customer'
  );

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      if (!supabase) return;

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session;

      if (!currentSession && !accessToken && type !== 'recovery') {
        const queryParams = new URLSearchParams(window.location.search);
        if (!queryParams.get('code') && !queryParams.get('token')) {
          if (mounted) setTokenExpired(true);
          return;
        }
      }

      if (currentSession?.user) {
        const metadataRole = currentSession.user.user_metadata?.account_type || currentSession.user.user_metadata?.role;
        if (metadataRole === 'admin') setUserRole('admin');
        else if (metadataRole === 'vendor') setUserRole('vendor');
        else setUserRole('customer');
      }
    }

    checkRecoverySession();

    const { data: authListener } = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTokenExpired(false);
      }
      if (session?.user) {
        const role = session.user.user_metadata?.account_type || session.user.user_metadata?.role;
        if (role === 'admin') setUserRole('admin');
        else if (role === 'vendor') setUserRole('vendor');
        else setUserRole('customer');
      }
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const isPasswordValid = isStrongPassword(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isSubmitDisabled = !isPasswordValid || !passwordsMatch || loading;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isPasswordValid) {
      setErrorMsg('Password does not satisfy all safety requirements (8+ characters, uppercase, lowercase, number).');
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        setErrorMsg('Authentication service unavailable.');
        setLoading(false);
        return;
      }

      const cleanPassword = password.trim();

      const { error } = await supabase.auth.updateUser({
        password: cleanPassword,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (
          msg.includes('same') ||
          msg.includes('previous') ||
          msg.includes('old') ||
          msg.includes('different') ||
          msg.includes('reuse')
        ) {
          setErrorMsg('You cannot use your previous password. Please create a different password.');
        } else if (msg.includes('expire') || msg.includes('invalid') || msg.includes('session')) {
          setErrorMsg('Password reset link expired or invalid. Please request a new link.');
          setTokenExpired(true);
        } else {
          setErrorMsg(error.message || 'Could not update password. Please try again.');
        }
      } else {
        await supabase.auth.signOut();
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred. Please request a new password reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToLogin = () => {
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'vendor') {
      navigate('/vendor');
    } else {
      navigate('/profile');
    }
  };

  if (tokenExpired) {
    return (
      <main className="min-h-screen bg-[#FAF6EB] dark:bg-[#1A0006] pt-28 pb-20 px-4 font-sans flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-[#240008] border border-[#7F011F]/20 dark:border-gray-800">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
            Reset Link Expired or Invalid
          </h1>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            This password reset link has expired or has already been used. Please request a new password reset link.
          </p>

          <Link
            to={`/forgot-password?role=${userRole}`}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#7F011F] px-6 py-3 text-xs font-bold text-[#F5EBD0] shadow hover:bg-[#680018] w-full transition-all"
          >
            Request New Reset Link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF6EB] dark:bg-[#1A0006] pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center transition-colors">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-[#7F011F]/20 bg-white p-6 sm:p-8 shadow-2xl dark:border-gray-800 dark:bg-[#240008]">
          {!isSuccess ? (
            <div>
              <div className="flex items-center gap-3.5 pb-4 border-b border-[#7F011F]/15 dark:border-gray-700">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#7F011F]/10 text-[#7F011F] dark:bg-[#7F011F]/30 dark:text-gold-300">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F011F] dark:text-[#F5EBD0]">
                    {userRole} Security
                  </span>
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
                    Create New Password
                  </h1>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
                {/* New Password Input with live strength & eye toggle */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password *
                  </label>
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                    showStrength={true}
                    placeholder="Min 8 chars (upper, lower, number)"
                  />
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm New Password *
                  </label>
                  <PasswordField
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    autoComplete="new-password"
                    showStrength={false}
                    placeholder="Re-enter your new password"
                  />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                      ⚠️ Passwords do not match.
                    </p>
                  )}
                </div>

                {errorMsg && (
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#7F011F] py-3.5 text-xs font-bold text-[#F5EBD0] shadow-lg shadow-[#7F011F]/25 transition-all hover:bg-[#680018] active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating Password...
                    </>
                  ) : (
                    'Set New Password & Confirm'
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Success After Password Reset */
            <div className="text-center space-y-4 py-2">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h2 className="font-display text-xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
                Password Reset Successful!
              </h2>

              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Your password has been changed successfully. The previous reset link has been invalidated. Please log in with your newly created password.
              </p>

              <button
                onClick={handleContinueToLogin}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#7F011F] py-3 text-xs font-bold text-[#F5EBD0] shadow-lg shadow-[#7F011F]/25 transition-all hover:bg-[#680018]"
              >
                Log In as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-1 text-[10px] text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Protected by Supabase Encrypted Authentication</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
