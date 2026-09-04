import { Sparkles, Heart, Gift, Truck, ShieldCheck } from 'lucide-react';

const marqueeItems = [
  { text: 'Hand-Packed in Artisan Studio Batches', icon: Sparkles },
  { text: 'Personalised Handwritten Wax-Sealed Notes', icon: Heart },
  { text: 'Guaranteed Same-Day Metro Dispatch', icon: Truck },
  { text: 'Custom Branded Ribbons for Corporate Gifts', icon: Gift },
  { text: '18% GST Invoicing & Input Tax Credit', icon: ShieldCheck },
  { text: 'Multi-Address Doorstep Dispatch Across India', icon: Truck },
];

export default function Marquee() {
  const row = [...marqueeItems, ...marqueeItems];
  return (
    <div className="border-y border-[#7F011F]/15 dark:border-[#7F011F]/30 bg-[#FAF6EB] dark:bg-[#180005] py-3.5 sm:py-4 overflow-hidden select-none">
      <div className="flex w-max animate-marquee gap-8 sm:gap-12 whitespace-nowrap">
        {row.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-8 sm:gap-12">
              <span className="font-display font-medium italic text-[#7F011F] dark:text-[#DFB25B] text-xs sm:text-sm tracking-wide flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-[#DFB25B] shrink-0" />
                {item.text}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#DFB25B]/80 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
