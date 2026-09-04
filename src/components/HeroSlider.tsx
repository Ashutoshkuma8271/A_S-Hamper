import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gift,
  Star,
  Clock,
  ShieldCheck,
  Heart,
  CheckCircle2,
} from 'lucide-react';

export interface BannerSlide {
  id: number;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  features: string[];
  image: string;
  alt: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: 1,
    badge: 'ECO-ARTISAN KEEPSAKE EDIT',
    title: 'Hand-Packed Artisan Treats & Fresh',
    highlight: 'Garden Roses.',
    description:
      'Crafted in natural pine wood crates with rustic burlap sacks filled with dry fruits, paired with fragrant garden roses and personalized handwritten cards.',
    features: ['Handwritten Wax-Sealed Note Included', 'Pan-India Express Safe Delivery'],
    image: '/banners/banner-1.png',
    alt: 'Handcrafted Jute gift sacks with fresh ivory and peach roses in wooden crate',
    primaryCtaText: 'Customize Your Hamper',
    primaryCtaLink: '/build-your-own',
    secondaryCtaText: 'Explore Best Sellers',
    secondaryCtaLink: '/best-sellers',
  },
  {
    id: 2,
    badge: 'SWEET ROMANCE & BOUTIQUE EDIT',
    title: 'Artisan Chocolates & Velvet Long-Stem',
    highlight: 'Red Roses.',
    description:
      'Unwrap pure affection with delicate confectioneries, single-origin chocolate bars, and fresh crimson roses in an illustrated keepsake boutique box.',
    features: ['Illustrated Keepsake Box', 'Temperature-Controlled Dispatch'],
    image: '/banners/banner-2.png',
    alt: 'Boutique storefront gift box with single stem red rose and chocolates',
    primaryCtaText: 'Shop Romantic Hampers',
    primaryCtaLink: '/all-hampers?cat=anniversary',
    secondaryCtaText: 'Same-Day Metro Delivery',
    secondaryCtaLink: '/same-day-delivery',
  },
  {
    id: 3,
    badge: 'LUXURY NEWBORN & MATERNITY',
    title: 'Gentle Care Essentials Woven with',
    highlight: 'White Gerberas.',
    description:
      'Celebrate welcoming new beginnings with pure dermatologically-tested baby care bath collections, nestled in a handmade floral circlet with fresh chrysanthemums.',
    features: ['Dermatologically Safe Products', 'Handcrafted Floral Wreath'],
    image: '/banners/banner-3.png',
    alt: 'Luxury baby care hamper with fresh white gerberas and purple flowers',
    primaryCtaText: 'Explore Baby Hampers',
    primaryCtaLink: '/all-hampers',
    secondaryCtaText: 'Corporate Gifting Deck',
    secondaryCtaLink: '/corporate',
  },
  {
    id: 4,
    badge: 'SWEET SURPRISES & BIRTHDAY JOY',
    title: 'Cadbury Dairy Milk Bouquet with',
    highlight: 'Cuddle Bear.',
    description:
      'Brighten milestone birthdays with rich Cadbury chocolate bars, vibrant garden roses, and a huggable plush teddy bear hand-tied with floral ribbon.',
    features: ['100% Authentic Cadbury Chocolates', 'Signature Gift Wrap & Ribbon'],
    image: '/banners/banner-4.png',
    alt: 'Plush teddy bear with Cadbury Dairy Milk chocolate bouquet and roses',
    primaryCtaText: 'Explore Birthday Bundles',
    primaryCtaLink: '/all-hampers?cat=birthday',
    secondaryCtaText: 'Unlock Festive Offers',
    secondaryCtaLink: '/offers',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const autoPlayTimer = useRef<any>(null);

  const total = SLIDES.length;

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + total) % total);
  };

  // Auto-advance every 5.5 seconds unless user hovers or interacts
  useEffect(() => {
    if (!isPaused) {
      autoPlayTimer.current = setInterval(() => {
        nextSlide();
      }, 5500);
    }
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [current, isPaused]);

  // Touch Swipe Handlers for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="hero-banner"
      className="relative w-full pt-16 sm:pt-20 overflow-hidden font-sans select-none bg-[#120005]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Artisan Gift Hamper Full Screen Hero Banner"
    >
      {/* 100% Full-Bleed Edge-to-Edge Banner Slider */}
      <div className="relative w-full h-[580px] sm:h-[640px] lg:h-[720px] max-h-[850px] overflow-hidden">
        
        {/* Slides with smooth cross-fade */}
        {SLIDES.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Full-bleed Edge-to-Edge Image */}
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover object-center sm:object-right transform scale-100 transition-transform duration-7000 ease-out"
                loading={index === 0 ? 'eager' : 'lazy'}
              />

              {/* Dark Cinematic Gradient Overlay for Maximum Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/30 lg:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 sm:to-transparent" />

              {/* Hero Copy Container */}
              <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col justify-center">
                <div className="max-w-2xl text-left space-y-4 sm:space-y-6">
                  
                  {/* Top Pill Tag */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#DFB25B]/40 bg-[#240008]/85 backdrop-blur-md px-4 py-1.5 text-[11px] sm:text-xs font-bold tracking-wider text-[#F5EBD0] shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[#DFB25B]" />
                    <span>{slide.badge}</span>
                  </div>

                  {/* Headline */}
                  <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                    {slide.title}{' '}
                    <span className="text-[#DFB25B] dark:text-[#DFB25B] drop-shadow-sm italic">
                      {slide.highlight}
                    </span>
                  </h1>

                  {/* Sub-description */}
                  <p className="text-xs sm:text-sm lg:text-base text-stone-200/90 max-w-xl font-normal leading-relaxed">
                    {slide.description}
                  </p>

                  {/* Micro Trust Badges */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {slide.features.map((feat, fIdx) => (
                      <span
                        key={fIdx}
                        className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-stone-300 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#DFB25B]" />
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Primary Button */}
                    <Link
                      to={slide.primaryCtaLink}
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#7F011F] hover:bg-[#950125] text-[#F5EBD0] border border-[#DFB25B]/40 px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold shadow-xl shadow-[#7F011F]/60 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 text-[#DFB25B] group-hover:rotate-12 transition-transform" />
                      <span>{slide.primaryCtaText}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>

                    {/* Secondary Button */}
                    <Link
                      to={slide.secondaryCtaLink}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition-all cursor-pointer shadow-sm"
                    >
                      <Gift className="h-4 w-4 text-[#DFB25B]" />
                      <span>{slide.secondaryCtaText}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-stone-300" />
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {/* Floating Left Arrow Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 grid h-11 w-11 sm:h-14 sm:w-14 place-items-center rounded-full bg-black/40 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>

        {/* Floating Right Arrow Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 grid h-11 w-11 sm:h-14 sm:w-14 place-items-center rounded-full bg-black/40 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-110 active:scale-95"
        >
          <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>

        {/* Centered Progress Indicator Bars (Middle Aligned) */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 sm:gap-3 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrent(idx)}
              aria-label={`Switch to banner slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                current === idx
                  ? 'w-10 sm:w-14 bg-[#DFB25B] shadow-md shadow-[#DFB25B]/60'
                  : 'w-3.5 sm:w-4 bg-white/40 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

      </div>

      {/* 4-Pillar Trust Indicators Below Full Banner */}
      <div className="w-full bg-[#FAF6EB] dark:bg-[#180005] border-y border-[#7F011F]/15 dark:border-[#7F011F]/30 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#7F011F]/10 text-[#7F011F] dark:text-[#DFB25B] grid place-items-center shrink-0 font-bold">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#7F011F] dark:text-[#F5EBD0]">4.95 / 5.0 Rating</p>
              <p className="text-[10px] sm:text-xs text-[#7F011F]/70 dark:text-[#F5EBD0]/70">12,400+ Verified Reviews</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#7F011F]/10 text-[#7F011F] dark:text-[#DFB25B] grid place-items-center shrink-0 font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#7F011F] dark:text-[#F5EBD0]">Same-Day Delivery</p>
              <p className="text-[10px] sm:text-xs text-[#7F011F]/70 dark:text-[#F5EBD0]/70">Available across top metros</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#7F011F]/10 text-[#7F011F] dark:text-[#DFB25B] grid place-items-center shrink-0 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#7F011F] dark:text-[#F5EBD0]">Hand-Packed Quality</p>
              <p className="text-[10px] sm:text-xs text-[#7F011F]/70 dark:text-[#F5EBD0]/70">100% Inspected in Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#7F011F]/10 text-[#7F011F] dark:text-[#DFB25B] grid place-items-center shrink-0 font-bold">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#7F011F] dark:text-[#F5EBD0]">Bespoke Customization</p>
              <p className="text-[10px] sm:text-xs text-[#7F011F]/70 dark:text-[#F5EBD0]/70">Wax-Sealed Greeting Notes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
