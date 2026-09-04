import { categories } from '@/data';
import { useReveal } from '@/hooks/useReveal';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Categories() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="occasions" className="py-20 sm:py-28 bg-[#FAF6EB]/40 dark:bg-[#120005] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8B6514] dark:text-[#DFB25B]">
              <Sparkles className="h-3.5 w-3.5 text-[#DFB25B]" /> Curated by Occasion
            </span>
            <h2 className="mt-3 font-display font-semibold text-[#7F011F] text-3xl sm:text-4xl lg:text-5xl tracking-tight dark:text-[#F5EBD0]">
              Every Occasion, Beautifully Wrapped
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            From heartfelt birthdays to grand wedding celebrations, find thoughtfully tailored artisan hampers for every cherished milestone.
          </p>
        </div>

        {/* 8-Card Responsive Grid */}
        <div
          ref={ref}
          className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 reveal ${
            visible ? 'is-visible' : ''
          }`}
        >
          {categories.map((c, i) => (
            <Link
              key={c.id}
              to={`/all-hampers?cat=${c.id}`}
              className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-[#7F011F]/15 dark:border-[#7F011F]/30 shadow-md hover:shadow-2xl hover:border-[#DFB25B] transition-all duration-500 hover:-translate-y-1.5 bg-[#FAF6EB] dark:bg-[#180005]"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                width={940}
                height={1253}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#DFB25B] mb-1">
                  Artisan Edit
                </span>
                <h3 className="font-display font-bold text-white text-base sm:text-lg lg:text-xl leading-tight">
                  {c.name}
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs text-stone-200/90 line-clamp-1">
                  {c.tagline}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#DFB25B] opacity-90 transition-all duration-300 group-hover:translate-x-1">
                  Explore Gifts <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
