import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Search,
  Zap,
} from 'lucide-react';
import {
  fetchDeliverySettings,
  checkPincodeEligibility,
  type DeliverySettings,
  DEFAULT_DELIVERY_SETTINGS,
} from '@/lib/deliverySettings';
import { formatPrice } from '@/cart';

export default function SameDayDeliveryPage() {
  const [settings, setSettings] = useState<DeliverySettings>(DEFAULT_DELIVERY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [pincodeInput, setPincodeInput] = useState('');
  const [checkResult, setCheckResult] = useState<any | null>(null);

  useEffect(() => {
    document.title = 'Same-Day Delivery & Pincode Checker | A_S Hamper';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadConfig() {
      setLoading(true);
      const data = await fetchDeliverySettings();
      setSettings(data);
      setLoading(false);
    }
    void loadConfig();
  }, []);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;

    const result = checkPincodeEligibility(pincodeInput.trim(), settings);
    setCheckResult(result);
  };

  return (
    <main className="min-h-screen bg-cream-50 pt-24 pb-20 dark:bg-gray-900 transition-colors">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-wine-900 via-wine-800 to-wine-900 text-cream-50 py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto relative z-10">
          <nav className="flex items-center justify-center gap-2 text-xs font-medium text-cream-200/70 mb-4 uppercase tracking-wider">
            <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gold-400 font-semibold">Same-Day Delivery</span>
          </nav>

          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400 uppercase tracking-widest">
            <Zap className="h-3.5 w-3.5" /> Priority Express Service
          </span>

          <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-cream-50 tracking-tight leading-tight">
            Same-Day Gift Delivery
          </h1>

          <p className="mt-4 text-cream-200/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Need a last-minute luxury gift? Order before {settings.cutoffTime} and we will hand-pack and deliver your hamper today.
          </p>
        </div>
      </section>

      {/* Interactive PIN Code Checker Card */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 sm:p-10 shadow-xl ring-1 ring-cream-200 dark:ring-gray-700">
          <div className="text-center max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600 uppercase tracking-wider">
              <MapPin className="h-4 w-4" /> Service Availability Checker
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-wine-900 dark:text-cream-50">
              Check Your PIN Code
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-700/60 dark:text-gray-400">
              Enter your 6-digit delivery PIN code to instantly verify same-day availability, charges, and cutoff timer.
            </p>

            {/* Input Form */}
            <form onSubmit={handleCheckPincode} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-700/40" />
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6-digit PIN (e.g. 400001)"
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-cream-50 dark:bg-gray-700 border border-cream-200 dark:border-gray-600 text-sm font-semibold text-wine-900 dark:text-cream-100 placeholder-ink-700/40 focus:outline-none focus:ring-2 focus:ring-wine-600"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-wine-600 px-7 py-3 text-xs font-bold text-white hover:bg-wine-700 transition-colors shadow-md"
              >
                <Search className="h-4 w-4" /> Check PIN
              </button>
            </form>
          </div>

          {/* Result Output Display */}
          {checkResult && (
            <div className="mt-8 pt-6 border-t border-cream-200 dark:border-gray-700">
              {checkResult.available ? (
                <div className="rounded-2xl bg-sage-500/10 border border-sage-500/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-sage-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-wine-900 dark:text-cream-100 text-base">
                        ✅ Same-Day Delivery Available!
                      </h4>
                      <p className="text-xs text-ink-700/70 dark:text-gray-300 mt-1">
                        {checkResult.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-wine-900 dark:text-cream-100 shrink-0">
                    <div className="text-right">
                      <p className="text-gold-600 font-bold text-sm">{formatPrice(checkResult.fee)}</p>
                      <p className="text-[10px] text-ink-700/60 dark:text-gray-400">Delivery Charge</p>
                    </div>
                    <div className="text-right border-l border-cream-300 dark:border-gray-600 pl-4">
                      <p className="text-wine-700 dark:text-gold-400 font-bold text-sm">{checkResult.expectedTime}</p>
                      <p className="text-[10px] text-ink-700/60 dark:text-gray-400">Expected Delivery</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-gold-500/10 border border-gold-500/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-gold-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-wine-900 dark:text-cream-100 text-base">
                        Standard Express Delivery Available (2-4 Days)
                      </h4>
                      <p className="text-xs text-ink-700/70 dark:text-gray-300 mt-1">
                        {checkResult.message}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs font-semibold text-wine-900 dark:text-cream-100 shrink-0">
                    <p className="text-gold-600 font-bold text-sm">{formatPrice(checkResult.fee || 50)}</p>
                    <p className="text-[10px] text-ink-700/60 dark:text-gray-400">Standard Shipping Fee</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Policy Details Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-cream-200 dark:ring-gray-700">
            <div className="h-10 w-10 rounded-2xl bg-wine-600/10 text-wine-700 flex items-center justify-center mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-wine-900 dark:text-cream-100">
              Cutoff Time ({settings.cutoffTime})
            </h3>
            <p className="mt-2 text-xs text-ink-700/70 dark:text-gray-300 leading-relaxed">
              Place your order before {settings.cutoffTime} to guarantee same-day studio packing and evening courier delivery.
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-cream-200 dark:ring-gray-700">
            <div className="h-10 w-10 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center mb-4">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-wine-900 dark:text-cream-100">
              Delivery Charges & Free Tier
            </h3>
            <p className="mt-2 text-xs text-ink-700/70 dark:text-gray-300 leading-relaxed">
              Same-day priority delivery is {formatPrice(settings.sameDayFee)}. Standard express shipping is {formatPrice(settings.standardFee)}. Orders over {formatPrice(settings.freeDeliveryThreshold)} qualify for free standard shipping!
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-cream-200 dark:ring-gray-700">
            <div className="h-10 w-10 rounded-2xl bg-wine-600/10 text-wine-700 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-wine-900 dark:text-cream-100">
              Hand-Packed Quality Protection
            </h3>
            <p className="mt-2 text-xs text-ink-700/70 dark:text-gray-300 leading-relaxed">
              All same-day hampers are packaged in temperature-safe insulated containers with hand-written cards.
            </p>
          </div>
        </div>
      </section>

      {/* Prominent CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center">
        <div className="rounded-3xl bg-wine-900 p-10 sm:p-16 text-cream-50 shadow-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400 uppercase tracking-widest">
            Ready for same-day delivery?
          </span>

          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold text-cream-50">
            Shop Same-Day Delivery Hampers
          </h2>

          <p className="mt-2 text-cream-200/80 max-w-xl mx-auto text-sm sm:text-base">
            Browse our best sellers and order now for guaranteed priority delivery.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/best-sellers"
              className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-8 py-4 text-sm font-bold text-wine-950 shadow-lg hover:bg-gold-400 transition-all hover:-translate-y-0.5"
            >
              Shop Same-Day Delivery → <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
