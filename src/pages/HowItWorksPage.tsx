import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Package,
  Heart,
  Gift,
  CheckCircle2,
  Truck,
  Sparkles,
  ShoppingBag,
  FileText,
  Search,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Send,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/cart';

const STEPS = [
  {
    step: '01',
    title: 'Choose Your Basket',
    subtitle: 'Select from our signature handcrafted wicker, velvet noir, or golden keepsake boxes.',
    icon: Package,
    color: 'bg-gold-500/10 text-gold-600 border-gold-400/30',
    details: [
      'Handcrafted natural willow wicker baskets',
      'Matte velvet presentation boxes',
      'Eco-conscious reusable wooden crates',
    ],
    image: 'https://images.pexels.com/photos/8468661/pexels-photo-8468661.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '02',
    title: 'Add What They Love',
    subtitle: 'Browse 100+ gourmet treats, artisan chocolates, aromatic candles, and wellness teas.',
    icon: Gift,
    color: 'bg-wine-600/10 text-wine-600 border-wine-600/30',
    details: [
      'Single-origin Belgian dark chocolates',
      'Soy wax hand-poured aroma candles',
      'Artisan organic green & herbal teas',
    ],
    image: 'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '03',
    title: 'Personalize Your Gift',
    subtitle: 'Add a heartfelt handwritten note, upload a printed photo, and select custom ribbon wraps.',
    icon: Heart,
    color: 'bg-gold-500/10 text-gold-600 border-gold-400/30',
    details: [
      'Calligraphy printed wax-sealed cards',
      'Printed polaroid photograph insert',
      'Custom color satin ribbons & floral tucks',
    ],
    image: 'https://images.pexels.com/photos/6822851/pexels-photo-6822851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '04',
    title: 'Review Your Hamper',
    subtitle: 'Inspect your dynamic live 3D preview, adjust quantities, and review total pricing.',
    icon: FileText,
    color: 'bg-wine-600/10 text-wine-600 border-wine-600/30',
    details: [
      'Real-time weight and price breakdown',
      'Customization preview with custom note text',
      'Add optional greeting add-ons',
    ],
    image: 'https://images.pexels.com/photos/759495/pexels-photo-759495.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '05',
    title: 'Place Your Order',
    subtitle: 'Seamless checkout with Razorpay, UPI, cards, and option for scheduled same-day delivery.',
    icon: ShoppingBag,
    color: 'bg-gold-500/10 text-gold-600 border-gold-400/30',
    details: [
      'Encrypted payment gateway',
      'Specify exact delivery date',
      'Instant WhatsApp order receipt',
    ],
    image: 'https://images.pexels.com/photos/9215406/pexels-photo-9215406.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '06',
    title: 'Hand-Packed With Care',
    subtitle: 'Our studio artisans hand-nest every item in protective wood wool with final quality checks.',
    icon: ShieldCheck,
    color: 'bg-wine-600/10 text-wine-600 border-wine-600/30',
    details: [
      'Triple-inspected item placements',
      'Fragrance sealing & bow tying',
      'Tamper-proof transit outer box',
    ],
    image: 'https://images.pexels.com/photos/6690454/pexels-photo-6690454.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '07',
    title: 'Delivered On Time',
    subtitle: 'Dispatched via priority courier with real-time SMS & WhatsApp tracking updates.',
    icon: Truck,
    color: 'bg-gold-500/10 text-gold-600 border-gold-400/30',
    details: [
      'Live GPS courier tracking',
      'Same-day priority delivery available',
      'Delivery notification with photo proof',
    ],
    image: 'https://images.pexels.com/photos/8887279/pexels-photo-8887279.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

const TRACKING_STAGES = [
  { id: 'placed', label: 'Order Placed', desc: 'Received & confirmed' },
  { id: 'confirmed', label: 'Order Confirmed', desc: 'Items reserved' },
  { id: 'preparing', label: 'Preparing', desc: 'Studio preparation' },
  { id: 'packed', label: 'Hand Packed', desc: 'Ribbon tied & quality checked' },
  { id: 'shipped', label: 'Shipped', desc: 'Handed to courier' },
  { id: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider on the way' },
  { id: 'delivered', label: 'Delivered', desc: 'Handed to recipient' },
];

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  
  // Live Tracking Demo State
  const [orderIdInput, setOrderIdInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundOrder, setFoundOrder] = useState<any | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(4); // Default stage for demo

  useEffect(() => {
    document.title = 'How It Works - Step-by-Step Gift Hampers | A_S Hamper';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Search real order by ID
  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;

    setSearching(true);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`id.eq.${orderIdInput.trim()},tracking_id.eq.${orderIdInput.trim()}`)
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setFoundOrder(data);
          // Map status string to index
          const statusLower = (data.status || 'placed').toLowerCase();
          let idx = 0;
          if (statusLower.includes('confirm')) idx = 1;
          else if (statusLower.includes('prepar')) idx = 2;
          else if (statusLower.includes('pack')) idx = 3;
          else if (statusLower.includes('ship')) idx = 4;
          else if (statusLower.includes('out')) idx = 5;
          else if (statusLower.includes('deliver')) idx = 6;
          setActiveStageIndex(idx);
        } else {
          // Fallback demo order state
          setFoundOrder({
            id: orderIdInput.trim().toUpperCase(),
            customer_name: session?.user?.email ? session.user.email.split('@')[0] : 'Valued Customer',
            total: 3450,
            status: 'Shipped',
            created_at: new Date().toISOString(),
          });
          setActiveStageIndex(4);
        }
      } catch (err) {
        console.error('Error fetching order status:', err);
      }
    } else {
      setFoundOrder({
        id: orderIdInput.trim().toUpperCase(),
        customer_name: 'Valued Customer',
        total: 3450,
        status: 'Shipped',
        created_at: new Date().toISOString(),
      });
      setActiveStageIndex(4);
    }
    setSearching(false);
  };

  return (
    <main className="min-h-screen bg-cream-50 pt-24 pb-20 dark:bg-gray-900 transition-colors">
      {/* Hero Banner Header */}
      <section className="bg-gradient-to-b from-wine-900 via-wine-800 to-wine-900 text-cream-50 py-14 sm:py-20 px-4 sm:px-6 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto relative z-10">
          <nav className="flex items-center justify-center gap-2 text-xs font-medium text-cream-200/70 mb-4 uppercase tracking-wider">
            <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gold-400 font-semibold">How It Works</span>
          </nav>

          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400 uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> The Luxury Gifting Experience
          </span>

          <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-cream-50 tracking-tight leading-tight">
            How Your Hamper Comes To Life
          </h1>

          <p className="mt-4 text-cream-200/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            From picking handcrafted baskets to attaching your handwritten notes and tracking live delivery — here is how we craft effortless, unforgettable gifts.
          </p>
        </div>
      </section>

      {/* Step-By-Step Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="space-y-8 sm:space-y-12">
          {STEPS.map((stepItem, index) => {
            const isEven = index % 2 === 0;
            const StepIcon = stepItem.icon;

            return (
              <article
                key={stepItem.step}
                className="group rounded-3xl bg-white dark:bg-gray-800 p-6 sm:p-10 shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-cream-200/80 dark:ring-gray-700"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                  {/* Left Text */}
                  <div className={`lg:col-span-7 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-3xl sm:text-4xl text-wine-600 dark:text-gold-400">
                        {stepItem.step}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${stepItem.color}`}>
                        <StepIcon className="h-3.5 w-3.5" /> Step {stepItem.step}
                      </span>
                    </div>

                    <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-wine-900 dark:text-cream-50">
                      {stepItem.title}
                    </h2>

                    <p className="mt-3 text-ink-700/80 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                      {stepItem.subtitle}
                    </p>

                    {/* Bullet Highlights */}
                    <ul className="mt-5 space-y-2.5">
                      {stepItem.details.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-ink-800 dark:text-gray-200 font-medium">
                          <CheckCircle2 className="h-4 w-4 text-gold-500 shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Graphic/Card */}
                  <div className={`lg:col-span-5 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream-100 shadow-md ring-1 ring-cream-200">
                      <img
                        src={stepItem.image}
                        alt={stepItem.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-wine-900/60 via-transparent to-transparent flex items-end p-5">
                        <p className="text-cream-50 font-display font-medium text-sm">
                          {stepItem.title} Process
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Live Order Tracking Interactive Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="rounded-3xl bg-gradient-to-br from-wine-900 via-wine-800 to-wine-950 p-8 sm:p-12 text-cream-50 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400 uppercase tracking-widest">
              <Clock className="h-3.5 w-3.5" /> Step 07 Live Status
            </span>

            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold text-cream-50">
              Interactive Order Tracking Simulator
            </h2>

            <p className="mt-2 text-cream-200/80 text-sm sm:text-base leading-relaxed">
              Enter your Order ID below to experience our real-time order tracking timeline, from Studio Packing to Final Delivery.
            </p>

            {/* Input Form */}
            <form onSubmit={handleSearchOrder} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Enter Order ID (e.g. ORD-98421)"
                className="flex-1 px-4 py-3 rounded-full bg-cream-50 text-wine-900 placeholder-wine-900/50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
              <button
                type="submit"
                disabled={searching}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-xs font-bold text-wine-950 hover:bg-gold-400 transition-colors shadow-md"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Track Status
              </button>
            </form>
          </div>

          {/* Interactive Timeline Visualizer */}
          <div className="mt-12 pt-8 border-t border-cream-50/15">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg text-cream-100 flex items-center gap-2">
                <Package className="h-5 w-5 text-gold-400" /> Order Lifecycle Pipeline
              </h3>
              {foundOrder && (
                <span className="text-xs font-mono text-gold-400 font-semibold bg-gold-500/10 px-3 py-1 rounded-full border border-gold-400/30">
                  Tracking ID: {foundOrder.id}
                </span>
              )}
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {TRACKING_STAGES.map((stage, sIdx) => {
                const isCompleted = sIdx <= activeStageIndex;
                const isCurrent = sIdx === activeStageIndex;

                return (
                  <div
                    key={stage.id}
                    onClick={() => setActiveStageIndex(sIdx)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border ${
                      isCurrent
                        ? 'bg-gold-500 text-wine-950 border-gold-400 font-bold scale-105 shadow-xl ring-2 ring-gold-400/50'
                        : isCompleted
                        ? 'bg-cream-50/15 text-cream-50 border-cream-50/30 hover:bg-cream-50/25'
                        : 'bg-wine-950/40 text-cream-200/40 border-cream-50/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono tracking-wider uppercase opacity-80">
                        0{sIdx + 1}
                      </span>
                      {isCompleted && <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-400" />}
                    </div>

                    <p className="text-xs font-semibold line-clamp-1">{stage.label}</p>
                    <p className="text-[10px] opacity-75 mt-1 line-clamp-1">{stage.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Prominent CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center">
        <div className="rounded-3xl bg-cream-100 dark:bg-gray-800 p-10 sm:p-16 ring-1 ring-cream-200 dark:ring-gray-700 shadow-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-wine-600/30 bg-wine-600/10 px-4 py-1.5 text-xs font-semibold text-wine-700 dark:text-gold-400 uppercase tracking-widest">
            Ready to get started?
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold text-wine-900 dark:text-cream-50">
            Build Your Custom Hamper Now
          </h2>
          <p className="mt-2 text-ink-700/70 dark:text-gray-300 max-w-xl mx-auto text-sm sm:text-base">
            Choose your basket, curate items, add custom polaroids, and surprise someone special today.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/build-your-own"
              className="inline-flex items-center gap-2 rounded-full bg-wine-600 px-8 py-4 text-sm font-semibold text-cream-50 shadow-lg hover:bg-wine-700 transition-all hover:-translate-y-0.5"
            >
              Build Your Hamper <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/best-sellers"
              className="inline-flex items-center gap-2 rounded-full border border-wine-600/30 px-8 py-4 text-sm font-semibold text-wine-700 dark:text-cream-100 hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors"
            >
              Browse Best Sellers
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
