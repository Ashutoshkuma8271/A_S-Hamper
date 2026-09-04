import { useReveal } from '@/hooks/useReveal';
import { Link } from 'react-router-dom';
import {
  Package,
  Heart,
  Gift,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const HOMEPAGE_STEPS = [
  {
    step: '01',
    title: 'Choose Your Basket',
    subtitle: 'Select from handcrafted natural wicker, velvet presentation boxes, or keepsake wooden crates.',
    icon: Package,
    color: 'bg-gold-500/10 text-gold-600 border-gold-400/30',
    details: [
      'Handcrafted natural willow wicker',
      'Matte velvet presentation boxes',
      'Eco-conscious reusable crates',
    ],
    image: 'https://images.pexels.com/photos/8468661/pexels-photo-8468661.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '02',
    title: 'Add What They Love',
    subtitle: 'Fill your hamper with single-origin dark chocolates, soy candles, and artisan teas.',
    icon: Gift,
    color: 'bg-wine-600/10 text-wine-600 border-wine-600/30',
    details: [
      'Single-origin Belgian chocolates',
      'Hand-poured aromatic candles',
      'Artisan organic tea blends',
    ],
    image: 'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    step: '03',
    title: 'Personalize & Deliver',
    subtitle: 'Add a handwritten wax-sealed note, attach a printed polaroid, and we deliver on the day that matters.',
    icon: Heart,
    color: 'bg-gold-500/10 text-gold-600 border-gold-400/30',
    details: [
      'Calligraphy printed wax-sealed note',
      'Polaroid photo printing insert',
      'Guaranteed on-the-day delivery',
    ],
    image: 'https://images.pexels.com/photos/6822851/pexels-photo-6822851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export default function Steps() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="how" className="py-20 sm:py-28 bg-cream-100/50 dark:bg-gray-900/80 border-y border-cream-200 dark:border-gray-800 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1 text-xs font-semibold text-gold-600 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> How It Works
            </span>
            <h2 className="mt-3 font-display font-semibold text-wine-800 text-3xl sm:text-4xl lg:text-5xl tracking-tight dark:text-cream-50">
              How Your Hamper Comes To Life
            </h2>
            <p className="mt-2 text-sm sm:text-base text-ink-700/70 dark:text-gray-300">
              Create a personalized gift hamper in three effortless steps. Hand-packed and delivered with care.
            </p>
          </div>

          <Link
            to="/how-it-works"
            className="group inline-flex items-center gap-2 rounded-full border border-wine-600/30 bg-cream-50 dark:bg-gray-800 px-6 py-3 text-xs font-semibold text-wine-700 dark:text-gold-300 hover:bg-wine-600 hover:text-white transition-all self-start md:self-end shrink-0 shadow-sm"
          >
            Full 7-Step Guide & Tracking <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3 Step Cards */}
        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 reveal ${
            visible ? 'is-visible' : ''
          }`}
        >
          {HOMEPAGE_STEPS.map((stepItem, i) => {
            const StepIcon = stepItem.icon;
            return (
              <article
                key={stepItem.step}
                className="group flex flex-col justify-between rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-cream-200/80 dark:ring-gray-700 hover:-translate-y-1"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream-100 mb-5">
                    <img
                      src={stepItem.image}
                      alt={stepItem.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
                      }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="font-display font-bold text-2xl text-white drop-shadow-md">
                        {stepItem.step}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${stepItem.color}`}>
                      <StepIcon className="h-3 w-3" /> Step {stepItem.step}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-xl text-wine-900 dark:text-cream-50">
                    {stepItem.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-ink-700/75 dark:text-gray-300 leading-relaxed">
                    {stepItem.subtitle}
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {stepItem.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2 text-[11px] text-ink-800 dark:text-gray-200 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-12 text-center">
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-2 rounded-full bg-wine-600 px-8 py-3.5 text-xs font-semibold text-cream-50 shadow-md hover:bg-wine-700 transition-all hover:-translate-y-0.5"
          >
            Explore Full 7-Step Process & Live Order Tracking <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
