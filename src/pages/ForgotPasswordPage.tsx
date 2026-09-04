import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validateEmailFormat } from '@/lib/security';

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role') || 'user'; // 'vendor' | 'admin' | 'user'

  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!validateEmailFormat(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        setErrorMsg('Authentication service unavailable.');
        setLoading(false);
        return;
      }

      // Check if account exists and role matches if vendor or admin requested
      if (requestedRole === 'vendor' || requestedRole === 'admin') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (profile?.role && profile.role !== requestedRole) {
          const roleTitle = profile.role === 'vendor' ? 'Vendor' : profile.role === 'admin' ? 'Admin' : 'Customer';
          throw new Error(`This email belongs to a ${roleTitle} account. Please use the ${roleTitle} portal to reset your password.`);
        }
      }

      const redirectUrl = `${window.location.origin}/reset-password?role=${requestedRole}`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const backLink = requestedRole === 'vendor' ? '/vendor' : requestedRole === 'admin' ? '/admin' : '/profile';
  const roleLabel = requestedRole === 'vendor' ? 'Vendor' : requestedRole === 'admin' ? 'Admin' : 'Customer';

  return (
    <main className="min-h-screen bg-[#FAF6EB] dark:bg-[#1A0006] pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center transition-colors">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to={backLink}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7F011F] hover:text-[#57222C] dark:text-gold-300 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {roleLabel} Login
        </Link>

        <div className="rounded-3xl border border-[#7F011F]/20 bg-white p-6 sm:p-8 shadow-2xl dark:border-gray-800 dark:bg-[#240008]">
          {!submitted ? (
            <div>
              <div className="flex items-center gap-3.5 pb-4 border-b border-[#7F011F]/15 dark:border-gray-700">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#7F011F]/10 text-[#7F011F] dark:bg-[#7F011F]/30 dark:text-gold-300">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F011F] dark:text-[#F5EBD0]">
                    {roleLabel} Recovery
                  </span>
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
                    Forgot Password
                  </h1>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                Enter your registered {roleLabel} email address below. We will send a secure password reset link to your email inbox.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Registered {roleLabel} Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder={`Enter your ${roleLabel.toLowerCase()} email`}
                      className="input pl-10 pr-4"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#7F011F] py-3.5 text-xs font-bold text-[#F5EBD0] shadow-lg shadow-[#7F011F]/25 transition-all hover:bg-[#680018] active:scale-95 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending Reset Link...
                    </>
                  ) : (
                    'Send Password Reset Link'
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-[#7F011F]/15 dark:border-gray-700 pt-4 text-center text-xs">
                <span className="text-gray-500 dark:text-gray-400">Remember your password? </span>
                <Link to={backLink} className="font-bold text-[#7F011F] hover:underline dark:text-gold-300">
                  Back to {roleLabel} Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h2 className="font-display text-xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
                Password Reset Link Sent
              </h2>

              <div className="rounded-2xl bg-[#FAF6EB] p-4 border border-[#7F011F]/20 dark:bg-[#180005] dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 leading-relaxed text-left space-y-2">
                <p className="font-semibold text-[#7F011F] dark:text-gold-300">
                  Password reset link has been dispatched to <strong className="text-[#7F011F] dark:text-gold-300">{email}</strong>.
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Please check your inbox (and spam folder) and click the link to create your new secure password.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full rounded-full border border-[#7F011F]/30 bg-white py-2.5 text-xs font-semibold text-[#7F011F] hover:bg-[#FAF6EB] dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-colors"
                >
                  Didn't receive the email? Resend
                </button>
                <Link
                  to={backLink}
                  className="block w-full rounded-full bg-[#7F011F] py-2.5 text-xs font-bold text-[#F5EBD0] shadow hover:bg-[#680018] text-center transition-colors"
                >
                  Back to {roleLabel} Login
                </Link>
              </div>

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
