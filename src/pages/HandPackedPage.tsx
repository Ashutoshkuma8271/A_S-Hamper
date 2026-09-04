import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Heart,
  Package,
  CheckCircle2,
  ArrowRight,
  Ribbon,
  Eye,
  Award,
  Layers,
  Send,
  Camera,
} from 'lucide-react';

const TIMELINE_STAGES = [
  {
    step: '01',
    title: 'Select',
    subtitle: 'Artisan Product Curation',
    icon: Sparkles,
    desc: 'Each item is hand-selected from vetted luxury artisans — single-origin chocolates, soy candles, and premium organic botanicals.',
    details: 'Only 1 in 10 candidate items meet our strict sensory and quality benchmarks.',
    image: 'https://images.pexels.com/photos/8468661/pexels-photo-8468661.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '02',
    title: 'Check',
    subtitle: 'Batch Quality Checking',
    icon: ShieldCheck,
    desc: 'Inspect expiration dates, seal integrity, and fragrance purity before placing any item near a basket.',
    details: 'Zero-tolerance policy for damaged seals or faded labels.',
    image: 'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '03',
    title: 'Arrange',
    subtitle: 'Aesthetic Hand Arrangement',
    icon: Layers,
    desc: 'Artisans layer shredded eco-wood wool and arrange items at balanced heights so opening the box feels like a grand reveal.',
    details: 'Trained studio stylists build each hamper by hand in small batches.',
    image: 'https://images.pexels.com/photos/6822851/pexels-photo-6822851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '04',
    title: 'Personalize',
    subtitle: 'Handwritten & Wax-Sealed Notes',
    icon: Heart,
    desc: 'Your gift message is printed on archival cotton cardstock, hand-tucked with dried lavender, and wax-stamped.',
    details: 'Optional printed polaroid photographs tied with silk twine.',
    image: 'https://images.pexels.com/photos/759495/pexels-photo-759495.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '05',
    title: 'Pack',
    subtitle: 'Premium Ribbon Wrapping',
    icon: Ribbon,
    desc: 'Double-faced satin ribbons are tied into signature double loops with custom gold foil gift tags.',
    details: 'Silky tissue paper wrapping with custom branded adhesive seals.',
    image: 'https://images.pexels.com/photos/9215406/pexels-photo-9215406.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '06',
    title: 'Quality Check',
    subtitle: 'Final Inspector Sign-Off',
    icon: Award,
    desc: 'A second master packer performs a 12-point inspection covering weight, presentation, note accuracy, and tie firmness.',
    details: 'Each hamper includes a handwritten packer signature stamp.',
    image: 'https://images.pexels.com/photos/6690454/pexels-photo-6690454.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '07',
    title: 'Dispatch',
    subtitle: 'Secure Climate Transit',
    icon: Send,
    desc: 'Nested inside a heavy-duty corrugated shipping box with bubble wrap and tamper-evident security tape for safe travel.',
    details: 'Tracked temperature-monitored courier delivery direct to door.',
    image: 'https://images.pexels.com/photos/8887279/pexels-photo-8887279.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export default function HandPackedPage() {
  useEffect(() => {
    document.title = 'Hand-Packed Small Batches | A_S Hamper';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main className="min-h-screen bg-cream-50 pt-24 pb-20 dark:bg-gray-900 transition-colors">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-wine-900 via-wine-800 to-wine-900 text-cream-50 py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto relative z-10">
          <nav className="flex items-center justify-center gap-2 text-xs font-medium text-cream-200/70 mb-4 uppercase tracking-wider">
            <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gold-400 font-semibold">Hand-Packed Small Batches</span>
          </nav>

          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400 uppercase tracking-widest">
            <Award className="h-3.5 w-3.5" /> Hand-Crafted In Small Batches
          </span>

          <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-cream-50 tracking-tight leading-tight">
            Crafted By Hands, Not Assembly Lines
          </h1>

          <p className="mt-4 text-cream-200/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Every hamper that leaves our studio is hand-packed in small batches with personal care, wax-sealed notes, and strict quality control.
          </p>
        </div>
      </section>

      {/* Visual Timeline Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-xl ring-1 ring-cream-200 dark:ring-gray-700">
          <h2 className="text-center font-display font-semibold text-lg sm:text-xl text-wine-900 dark:text-cream-100 mb-6">
            The 7-Stage Hand-Packing Timeline
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {TIMELINE_STAGES.map((st, i) => {
              const IconComp = st.icon;
              return (
                <div
                  key={st.step}
                  className="flex flex-col items-center text-center p-3 rounded-2xl bg-cream-50 dark:bg-gray-700/50 border border-cream-200 dark:border-gray-600 hover:border-gold-500 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-wine-600 text-cream-50 flex items-center justify-center font-bold text-xs mb-2">
                    <IconComp className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-wine-900 dark:text-cream-100">{st.title}</p>
                  <span className="text-[10px] text-ink-700/60 dark:text-gray-400 mt-0.5">{st.subtitle}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid of Stage Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-12">
        {TIMELINE_STAGES.map((stage, idx) => {
          const isEven = idx % 2 === 0;
          const StageIcon = stage.icon;

          return (
            <article
              key={stage.step}
              className="rounded-3xl bg-white dark:bg-gray-800 p-6 sm:p-10 shadow-sm hover:shadow-lg transition-all ring-1 ring-cream-200 dark:ring-gray-700"
            >
              <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                <div className={`lg:col-span-7 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-3xl text-gold-600">{stage.step}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-wine-600/10 text-wine-700 dark:text-gold-400 border border-wine-600/20 px-3 py-1 text-xs font-semibold">
                      <StageIcon className="h-3.5 w-3.5" /> Stage {stage.step}: {stage.title}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-2xl font-semibold text-wine-900 dark:text-cream-50">
                    {stage.subtitle}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-ink-700/80 dark:text-gray-300 leading-relaxed">
                    {stage.desc}
                  </p>

                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-cream-50 dark:bg-gray-700/60 p-3 border border-cream-200 dark:border-gray-600 text-xs font-medium text-wine-800 dark:text-gold-300">
                    <CheckCircle2 className="h-4 w-4 text-gold-500 shrink-0" />
                    <span>{stage.details}</span>
                  </div>
                </div>

                <div className={`lg:col-span-5 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream-100 shadow-md ring-1 ring-cream-200">
                    <img
                      src={stage.image}
                      alt={stage.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Prominent CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-wine-900 via-wine-800 to-wine-900 p-10 sm:p-16 text-cream-50 shadow-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400 uppercase tracking-widest">
            Experience Studio Quality
          </span>

          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold text-cream-50">
            Send A Hand-Packed Gift Today
          </h2>

          <p className="mt-2 text-cream-200/80 max-w-xl mx-auto text-sm sm:text-base">
            Browse our hand-curated collections or create a personalized custom hamper.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/all-hampers"
              className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-8 py-4 text-sm font-bold text-wine-950 shadow-lg hover:bg-gold-400 transition-all hover:-translate-y-0.5"
            >
              Explore Our Hampers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
