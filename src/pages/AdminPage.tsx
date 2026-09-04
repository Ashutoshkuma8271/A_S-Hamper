import { useAuth } from '@/hooks/useAuth';
import AdminAuth from '@/components/AdminAuth';
import AdminDashboard from '@/components/AdminDashboard';
import { ShieldCheck, ShieldAlert, LogOut, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function AdminPage() {
  const { session, profile, isAdmin, loading, signOut } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto font-sans">
        <LoadingSkeleton type="dashboard" />
      </main>
    );
  }

  const isAuthorizedAdmin = Boolean(session && (profile?.role === 'admin' || isAdmin));
  const isNonAdminAccount = Boolean(session && !isAuthorizedAdmin);

  // Authorized Admin View: Full Control Studio Dashboard
  if (isAuthorizedAdmin) {
    return (
      <main className="min-h-screen pt-20 pb-16 px-4 sm:px-8 font-sans bg-[#F5EBD0] dark:bg-[#180005]">
        <AdminDashboard />
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-16 font-sans bg-[#F5EBD0] dark:bg-[#180005]">
      {/* Header Banner */}
      <header className="border-b border-[#7F011F]/20 bg-[#FAF6EB]/60 dark:bg-[#240008]/60 px-5 py-12 dark:border-[#7F011F]/30 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7F011F]/80 hover:text-[#7F011F] dark:text-[#F5EBD0]/80 dark:hover:text-[#F5EBD0] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to storefront
          </Link>
          <div className="mt-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7F011F] dark:text-[#F5EBD0]">
              Administrative Operations
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#7F011F] dark:text-[#F5EBD0]">
              Store Administrator Portal
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-[#7F011F]/80 dark:text-[#F5EBD0]/80">
              Authorized admin access to manage luxury hampers, catalog inventory, orders, vendor requests, and store analytics.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Notice for Customer/Vendor Account attempting to access Admin Portal */}
        {isNonAdminAccount ? (
          <div className="max-w-2xl mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 p-8 text-center space-y-4 shadow-xl">
            <span className="grid place-items-center h-14 w-14 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </span>
            <h2 className="font-display text-2xl font-semibold text-amber-900 dark:text-amber-100">
              Admin Authorization Required
            </h2>
            <p className="text-sm text-amber-800/80 dark:text-amber-200/80 max-w-md mx-auto">
              You are currently signed in as a <strong className="capitalize">{profile?.role || 'Customer'}</strong> ({session?.user?.email}). Only verified Store Administrators can access the administrative controls.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => void signOut()}
                className="inline-flex items-center gap-2 rounded-full bg-[#7F011F] px-6 py-3 text-sm font-semibold text-[#F5EBD0] hover:bg-[#680018] transition-colors shadow-md"
              >
                <LogOut className="h-4 w-4" />
                Sign Out &amp; Log In as Admin
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-amber-400 dark:border-amber-600 px-6 py-3 text-sm font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                Go to Storefront
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            {/* Admin Benefits / Overview */}
            <div className="rounded-3xl bg-[#7F011F] p-8 text-[#F5EBD0] sm:p-10 shadow-xl border border-[#7F011F]/40 space-y-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F5EBD0]/20 text-[#F5EBD0]">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                  Centralized Store Administration
                </h2>
                <p className="mt-3 text-[#F5EBD0]/85 text-sm leading-relaxed">
                  Manage the full lifecycle of artisan hampers, track pan-India shipments, authorize vendor partners, and monitor sales metrics.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  'Catalog Management & Hamper builder pricing',
                  'Live Order Tracking & dispatch status updates',
                  'Vendor approval, product reviews & commission controls',
                  'Platform analytics, customer support & coupon discounts',
                ].map((item, idx) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-medium text-[#F5EBD0]/90">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#F5EBD0]/20 text-[#F5EBD0] text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Authentication Card */}
            <AdminAuth />
          </div>
        )}
      </main>
    </div>
  );
}
