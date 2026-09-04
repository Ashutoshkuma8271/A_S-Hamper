import { useAuth } from '@/hooks/useAuth';
import VendorAuth from '@/components/VendorAuth';
import VendorDashboard from '@/components/VendorDashboard';
import { Check, Store, ShieldAlert, LogOut, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const benefits = [
  'Reach gifting customers across India with curated hampers',
  'Mark products as available for gift hampers with maximum quantities',
  'Create complete personalized gift hampers with custom packaging fees',
  'Receive & process orders live in a dedicated vendor dashboard',
  'GST-ready business registration and verified vendor payouts',
];

export default function VendorPage() {
  const { session, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto font-sans">
        <LoadingSkeleton type="dashboard" />
      </main>
    );
  }

  const isAuthorizedVendor = Boolean(session && (profile?.role === 'vendor' || profile?.role === 'admin'));
  const isCustomerAccount = Boolean(session && profile?.role === 'user');

  // ONLY authorized vendors (or admins) can access & manage the Vendor Dashboard
  if (isAuthorizedVendor) {
    return (
      <main className="min-h-screen pt-20 pb-16 px-4 sm:px-8 font-sans">
        <VendorDashboard onSignOut={() => void signOut()} />
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-16 font-sans bg-[#F5EBD0] dark:bg-[#180005]">
      <header className="border-b border-[#7F011F]/20 bg-[#FAF6EB]/60 dark:bg-[#240008]/60 px-5 py-12 dark:border-[#7F011F]/30 sm:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7F011F] dark:text-[#F5EBD0]">
              Partner with A_S Hamper
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#7F011F] dark:text-[#F5EBD0]">
              Vendor Zone &amp; Partner Studio
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-[#7F011F]/80 dark:text-[#F5EBD0]/80">
              Sign in with your registered vendor email to manage live hamper products, review inventory, and fulfill customer orders.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Notice for Customer Account attempting to access Vendor Zone */}
        {isCustomerAccount ? (
          <div className="max-w-2xl mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 p-8 text-center space-y-4 shadow-xl">
            <span className="grid place-items-center h-14 w-14 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </span>
            <h2 className="font-display text-2xl font-semibold text-amber-900 dark:text-amber-100">
              Vendor Authorization Required
            </h2>
            <p className="text-sm text-amber-800/80 dark:text-amber-200/80 max-w-md mx-auto">
              You are currently signed in as a <strong className="capitalize">{profile?.role || 'Customer'}</strong> ({session?.user?.email}). Only verified Vendor accounts can access and manage the Vendor Zone.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => void signOut()}
                className="inline-flex items-center gap-2 rounded-full bg-[#7F011F] px-6 py-3 text-sm font-semibold text-[#F5EBD0] hover:bg-[#680018] transition-colors shadow-md"
              >
                <LogOut className="h-4 w-4" />
                Sign Out &amp; Log In as Vendor
              </button>
              <Link
                to="/customer"
                className="inline-flex items-center gap-2 rounded-full border border-amber-400 dark:border-amber-600 px-6 py-3 text-sm font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                Go to Customer Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="rounded-3xl bg-[#7F011F] p-8 text-[#F5EBD0] sm:p-10 shadow-xl border border-[#7F011F]/40">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F5EBD0]/20 text-[#F5EBD0]">
                <Store className="h-6 w-6" />
              </span>
              <h2 className="mt-6 font-display text-2xl sm:text-3xl font-bold leading-tight">
                Grow your gifting business with A_S Hamper
              </h2>
              <p className="mt-4 max-w-lg text-[#F5EBD0]/85 text-sm leading-relaxed">
                Join our curated network of artisan gifting partners. Build complete custom gift hampers, set component quantities, add packaging charges, and fulfill customer orders nationwide in real time.
              </p>

              <ul className="mt-8 space-y-3.5">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-sm items-start">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#F5EBD0]/20 text-[#F5EBD0] mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[#F5EBD0]/90 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <VendorAuth />
          </div>
        )}
      </main>
    </div>
  );
}
