import { Sparkles, ArrowRight, ShieldCheck, Flower2, PenTool } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import BrandLogo from '@/components/BrandLogo';
import { Link } from 'react-router-dom';

const atelierPillars = [
  {
    icon: ShieldCheck,
    title: 'In-House Studio Assembly',
    desc: 'Every basket is assembled and ribbon-tied by our trained artisans in our studio. We never drop-ship third-party items without physical inspection.',
  },
  {
    icon: Flower2,
    title: 'Freshness & Climate-Safe Care',
    desc: 'Fresh garden roses, imported cheeses, and Belgian chocolates travel in insulated packaging to maintain studio-fresh perfection at your doorstep.',
  },
  {
    icon: PenTool,
    title: 'Handwritten Wax-Sealed Notes',
    desc: 'Each custom message is inscribed on heavyweight textured cotton paper, sealed with authentic hot crimson sealing wax and our studio crest.',
  },
];

const studioMilestones = [
  { metric: '2016', label: 'Founded in Studio' },
  { metric: '12,400+', label: 'Hampers Hand-Packed' },
  { metric: '99.4%', label: 'On-Time Metro Dispatch' },
  { metric: '150+', label: 'Corporate Partners' },
];

export default function About() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#FAF6EB]/70 dark:bg-[#180005]/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* Brand Crest Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="mb-6 flex justify-center">
            <BrandLogo variant="full" size="lg" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8B6514] dark:text-[#DFB25B]">
            <Sparkles className="h-3.5 w-3.5 text-[#DFB25B]" /> The Artisan Studio Promise
          </span>
          <h2 className="mt-3 font-display font-semibold text-[#7F011F] dark:text-[#F5EBD0] text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            Crafted with Intention, Sealed with Love
          </h2>
          <p className="mt-4 text-xs sm:text-sm lg:text-base text-stone-700 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto">
            What started as an artisan workshop in 2016 has evolved into a premier luxury gifting atelier. We treat every hamper as an emotional bridge between you and the person who matters most.
          </p>
        </div>

        {/* 3 Distinct Atelier Commitments */}
        <div
          ref={ref}
          className={`grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-16 reveal ${
            visible ? 'is-visible' : ''
          }`}
        >
          {atelierPillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#240008] border border-[#7F011F]/15 dark:border-[#7F011F]/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#7F011F]/10 dark:bg-[#DFB25B]/20 text-[#7F011F] dark:text-[#DFB25B] mb-5">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-[#7F011F] dark:text-[#F5EBD0] text-lg sm:text-xl mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Studio Milestones Bar */}
        <div className="rounded-3xl bg-gradient-to-r from-[#2B040B] via-[#4A0012] to-[#2B040B] p-8 sm:p-12 text-white border border-[#DFB25B]/40 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/15">
            {studioMilestones.map((m, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-4 md:pt-0' : ''}>
                <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#DFB25B] tracking-tight">
                  {m.metric}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-stone-200 font-medium">
                  {m.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-stone-200 text-center sm:text-left">
              Want to experience our custom curation studio in person or create a one-of-a-kind hamper?
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/build-your-own"
                className="inline-flex items-center gap-2 rounded-full bg-[#DFB25B] hover:bg-[#E9C378] text-[#140609] px-6 py-3 text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-105"
              >
                Build Custom Hamper <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white px-6 py-3 text-xs font-semibold transition-all cursor-pointer"
              >
                Our Full Story
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
