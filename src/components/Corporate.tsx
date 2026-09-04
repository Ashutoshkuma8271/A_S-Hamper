import { useState, type FormEvent } from 'react';
import { Check, Send, Sparkles, Building2, ShieldCheck, Truck, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useReveal } from '@/hooks/useReveal';

const corporatePerks = [
  {
    icon: Building2,
    title: 'Custom Branded Ribbons & Box Sleeves',
    desc: 'Emboss your company logo, foil-stamped greeting cards, and bespoke brand colors.',
  },
  {
    icon: Truck,
    title: 'Multi-Address Direct Pan-India Dispatch',
    desc: 'Send us an Excel/CSV of employee or client addresses — we handle simultaneous doorstep delivery.',
  },
  {
    icon: FileText,
    title: 'GST Invoicing & Volume Tier Pricing',
    desc: 'Official 18% GST input tax credit invoices with special discounts starting at 25+ hampers.',
  },
  {
    icon: ShieldCheck,
    title: 'Pre-Production Physical Sample Box',
    desc: 'Inspect and approve your custom hamper sample at your office before confirming the full bulk order.',
  },
];

export default function Corporate() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    phone: '',
    quantity: '50',
    budget: '₹1,500 - ₹2,500 per hamper',
    details: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Corporate inquiry received! Our gifting team will contact you within 2 business hours.', {
        icon: '🏢',
        duration: 4000,
      });
    }, 600);
  };

  return (
    <section id="corporate" className="py-20 sm:py-28 bg-[#FAF6EB]/70 dark:bg-[#180005]/80 border-y border-[#7F011F]/15 dark:border-[#7F011F]/30 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DFB25B]/40 bg-[#DFB25B]/15 px-4 py-1 text-xs font-semibold text-[#8B6514] dark:text-[#DFB25B] uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 text-[#DFB25B]" /> B2B & Executive Gifting
            </span>
            <h2 className="mt-3 font-display font-semibold text-[#7F011F] text-3xl sm:text-4xl lg:text-5xl tracking-tight dark:text-[#F5EBD0]">
              Corporate & Bespoke Bulk Gifting
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-700/80 dark:text-stone-300">
              Delight your team, executives, and high-value clients with handcrafted, branded luxury gift hampers.
            </p>
          </div>
        </div>

        {/* 2-Column Corporate Showcase & Form */}
        <div
          ref={ref}
          className={`grid gap-10 lg:grid-cols-12 lg:gap-12 items-start reveal ${
            visible ? 'is-visible' : ''
          }`}
        >
          {/* Left Column: Visuals & Perks (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-xl border border-[#7F011F]/20">
              <img
                src="https://images.pexels.com/photos/6690454/pexels-photo-6690454.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200"
                alt="Corporate luxury gift hampers with custom packaging"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white max-w-md">
                <span className="inline-block px-3 py-1 rounded-full bg-[#7F011F]/90 text-[11px] font-bold tracking-wide uppercase mb-1">
                  Trusted by 150+ Enterprises
                </span>
                <p className="text-xs sm:text-sm text-stone-200">
                  Custom hampers for Diwali, New Year, Employee Welcoming, and Annual Conferences.
                </p>
              </div>
            </div>

            {/* Corporate Perks Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {corporatePerks.map((perk, idx) => {
                const IconComponent = perk.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-[#240008] border border-[#7F011F]/15 dark:border-[#7F011F]/30 shadow-sm"
                  >
                    <div className="h-9 w-9 rounded-xl bg-[#7F011F]/10 dark:bg-[#DFB25B]/20 text-[#7F011F] dark:text-[#DFB25B] flex items-center justify-center mb-3">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#7F011F] dark:text-[#F5EBD0] leading-snug">
                      {perk.title}
                    </h4>
                    <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      {perk.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Quote Request Form (5 cols) */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white dark:bg-[#240008] p-6 sm:p-8 border border-[#7F011F]/20 dark:border-[#7F011F]/40 shadow-xl"
            >
              <div className="mb-6 border-b border-[#7F011F]/15 dark:border-[#7F011F]/30 pb-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B6514] dark:text-[#DFB25B]">
                  Request Custom Quote
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-[#7F011F] dark:text-[#F5EBD0]">
                  Get Bulk Pricing & Catalog
                </h3>
                <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                  Fast response with digital mockups & quotation within 2 hours.
                </p>
              </div>

              {submitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                    <Check className="h-7 w-7" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-[#7F011F] dark:text-[#F5EBD0]">
                    Inquiry Successfully Received!
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xs mx-auto leading-relaxed">
                    Our corporate gifting manager is preparing your bespoke catalog and will reach out shortly at{' '}
                    <span className="font-bold text-[#7F011F] dark:text-[#DFB25B]">{formData.email}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-[#7F011F] dark:text-[#DFB25B] underline hover:opacity-80 pt-2"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Company Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Infosys, TCS, Razorpay..."
                      className="w-full h-10 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#180005] text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7F011F] dark:focus:ring-[#DFB25B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Work Email *
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@company.com"
                        className="w-full h-10 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#180005] text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7F011F] dark:focus:ring-[#DFB25B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full h-10 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#180005] text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7F011F] dark:focus:ring-[#DFB25B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Hamper Quantity *
                      </label>
                      <input
                        required
                        type="number"
                        min="10"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="50"
                        className="w-full h-10 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#180005] text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7F011F] dark:focus:ring-[#DFB25B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Budget Range *
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#180005] text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7F011F] dark:focus:ring-[#DFB25B]"
                      >
                        <option value="₹1,000 - ₹1,500">₹1,000 - ₹1,500 / box</option>
                        <option value="₹1,500 - ₹2,500">₹1,500 - ₹2,500 / box</option>
                        <option value="₹2,500 - ₹5,000">₹2,500 - ₹5,000 / box</option>
                        <option value="₹5,000+ Luxury">₹5,000+ Luxury / box</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Event Details / Customization Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      placeholder="e.g. Diwali hampers for 75 executives, need logo branding on wooden box and delivery by Oct 15."
                      className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#180005] text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7F011F] dark:focus:ring-[#DFB25B] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#7F011F] hover:bg-[#680018] text-[#F5EBD0] py-3.5 text-xs font-bold shadow-lg shadow-[#7F011F]/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 text-[#DFB25B]" />
                    {loading ? 'Submitting...' : 'Request Instant Corporate Quote'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
