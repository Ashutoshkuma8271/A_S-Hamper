import { Quote, Star, CheckCircle2, HeartHandshake } from 'lucide-react';
import { testimonials } from '@/data';
import { useReveal } from '@/hooks/useReveal';

export default function Testimonials() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="py-20 sm:py-28 bg-[#FAF6EB]/40 dark:bg-[#120005] border-y border-[#7F011F]/15 dark:border-[#7F011F]/30 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8B6514] dark:text-[#DFB25B]">
              <HeartHandshake className="h-3.5 w-3.5 text-[#DFB25B]" /> Verified Customer Stories
            </span>
            <h2 className="mt-3 font-display font-semibold text-[#7F011F] text-3xl sm:text-4xl lg:text-5xl tracking-tight dark:text-[#F5EBD0]">
              Loved by Gift Givers Across India
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              Read real impressions from thousands of delivered surprises and corporate hampers.
            </p>
          </div>
        </div>

        {/* Testimonials 3-Card Grid */}
        <div
          ref={ref}
          className={`grid sm:grid-cols-2 md:grid-cols-3 gap-6 reveal ${visible ? 'is-visible' : ''}`}
        >
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="relative flex flex-col justify-between rounded-3xl bg-white dark:bg-[#1f0007] p-7 sm:p-8 border border-[#7F011F]/15 dark:border-[#7F011F]/30 shadow-md transition-all duration-500 hover:-translate-y-1.5 hover:border-[#DFB25B]/60 hover:shadow-xl"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div>
                {/* 5-Star Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#DFB25B]">
                    {[...Array(5)].map((_, sIdx) => (
                      <Star key={sIdx} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-7 w-7 text-[#DFB25B]/40" fill="currentColor" />
                </div>

                <blockquote className="font-display text-base sm:text-lg text-[#7F011F] dark:text-[#F5EBD0] leading-relaxed italic">
                  "{t.quote}"
                </blockquote>
              </div>

              <figcaption className="mt-6 pt-5 border-t border-[#7F011F]/10 dark:border-[#7F011F]/25 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-10 w-10 rounded-full bg-[#7F011F] text-[#F5EBD0] font-display font-bold text-sm shadow-sm">
                    {t.author.charAt(0)}
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">{t.author}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">{t.location}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" /> Verified Order
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
