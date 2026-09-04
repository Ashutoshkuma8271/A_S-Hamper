import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, Package, ShoppingBag, Sparkles, Heart, Clock, ShieldCheck } from 'lucide-react';
import ProfileSection from '@/components/ProfileSection';
import UserAuth from '@/components/UserAuth';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import PasswordField, { isStrongPassword } from '@/components/PasswordField';

const customerBenefits = [
  {
    title: 'Live Order Tracking',
    desc: 'Monitor real-time hamper preparation, artisan packing, and courier transit progress.',
    icon: Clock,
  },
  {
    title: 'Personalized Gift Wishlist',
    desc: 'Save your favorite luxury hampers, custom gift combinations, and holiday bundles.',
    icon: Heart,
  },
  {
    title: 'Saved Delivery Addresses',
    desc: 'Store multiple home, office, and recipient addresses for instant 1-click checkout.',
    icon: Package,
  },
  {
    title: 'Exclusive VIP Offers',
    desc: 'Unlock seasonal discounts, early festival access, and priority same-day dispatch.',
    icon: Sparkles,
  },
];

export default function ProfilePage() {
  const { session, profile, isAdmin, loading } = useAuth();
  const [searchParams] = useSearchParams();

  if (searchParams.get('reset') === '1') return <ResetPassword />;
  if (session && !loading && isAdmin) return <Navigate to="/admin" replace />;
  if (session && !loading && profile?.role === 'vendor') return <Navigate to="/vendor" replace />;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 pb-20 pt-20 sm:pt-24 font-sans bg-[#F5EBD0] dark:bg-[#180005]">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7F011F]/80 hover:text-[#7F011F] dark:text-[#F5EBD0]/80 dark:hover:text-[#F5EBD0] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to storefront
        </Link>

        {/* Header Title */}
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7F011F] dark:text-[#F5EBD0]">
            Customer Account &amp; Gifting Hub
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#7F011F] dark:text-[#F5EBD0]">
            {session ? 'Your Account & Orders' : 'Sign In to A_S Hamper'}
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-[#7F011F]/80 dark:text-[#F5EBD0]/80">
            {session
              ? 'Manage your personalized orders, delivery addresses, and gifting preferences.'
              : 'Sign in to access live order tracking, saved recipient addresses, and exclusive member deals.'}
          </p>
        </div>

        {/* Main Section */}
        {session ? (
          <ProfileSection />
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <UserAuth />
            <CustomerBenefitsPanel />
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerBenefitsPanel() {
  return (
    <div className="rounded-3xl bg-[#FAF6EB] dark:bg-[#240008] border border-[#7F011F]/20 p-6 sm:p-8 lg:p-10 shadow-lg space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#7F011F]/15">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#7F011F] text-[#F5EBD0] shadow-sm">
          <Sparkles className="h-6 w-6" />
        </span>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7F011F] dark:text-[#F5EBD0]">
            Member Privileges
          </span>
          <h3 className="font-display text-xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
            Why Join A_S Hamper?
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        {customerBenefits.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex gap-4 p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-[#7F011F]/10 hover:border-[#7F011F]/30 transition-all"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#7F011F]/10 text-[#7F011F] dark:text-[#F5EBD0] font-bold">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h4 className="font-display text-sm font-bold text-[#7F011F] dark:text-[#F5EBD0]">
                  {item.title}
                </h4>
                <p className="text-xs text-[#7F011F]/70 dark:text-[#F5EBD0]/70 mt-0.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <div className="rounded-2xl bg-[#7F011F]/10 dark:bg-[#7F011F]/20 p-4 border border-[#7F011F]/20 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[#7F011F] dark:text-[#F5EBD0] shrink-0" />
          <p className="text-xs font-semibold text-[#7F011F] dark:text-[#F5EBD0]">
            100% Encrypted Transactions &amp; Secure OTP Verification
          </p>
        </div>
      </div>
    </div>
  );
}

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    if (!isStrongPassword(password)) {
      setError('Use at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!supabase) {
      setError('Authentication is not configured.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setComplete(true);
  }

  return (
    <div className="min-h-screen px-5 pb-20 pt-24 sm:px-8 bg-[#F5EBD0] dark:bg-[#180005]">
      <div className="mx-auto max-w-md rounded-3xl bg-[#FAF6EB] dark:bg-[#240008] p-6 sm:p-8 border border-[#7F011F]/20 shadow-xl">
        {complete ? (
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#7F011F]/15 text-[#7F011F]">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
              Password Updated
            </h1>
            <p className="mt-2 text-sm text-[#7F011F]/70 dark:text-[#F5EBD0]/70">
              Your new password is set. Continue to sign in.
            </p>
            <button
              onClick={() => navigate('/profile', { replace: true })}
              className="mt-6 rounded-full bg-[#7F011F] px-7 py-3 text-sm font-semibold text-[#F5EBD0] hover:bg-[#680018]"
            >
              Continue
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#7F011F] text-[#F5EBD0]">
                <Lock className="h-5 w-5" />
              </span>
              <div>
                <h1 className="font-display text-2xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
                  Set New Password
                </h1>
                <p className="text-xs text-[#7F011F]/70 dark:text-[#F5EBD0]/70">
                  Choose a secure password for your account.
                </p>
              </div>
            </div>
            <form onSubmit={savePassword} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase text-[#7F011F]/80 dark:text-[#F5EBD0]/80">
                  New Password
                </span>
                <PasswordField
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  showStrength
                  placeholder="Create a strong password"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase text-[#7F011F]/80 dark:text-[#F5EBD0]/80">
                  Confirm Password
                </span>
                <PasswordField
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                />
              </label>
              {error && (
                <p className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 text-xs px-4 py-3">
                  {error}
                </p>
              )}
              <button
                disabled={loading}
                className="w-full rounded-full bg-[#7F011F] py-3.5 text-sm font-bold text-[#F5EBD0] hover:bg-[#680018] disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save New Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
