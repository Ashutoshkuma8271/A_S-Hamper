import { Check } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

const promises = [
  'Hand-packed within 24 hours of your order',
  'Photographed before dispatch, so you see exactly what shipped',
  'Replacement or refund on anything damaged in transit',
  'No plastic filler — shredded kraft and cotton only',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-20 pt-16">
      <header className="border-b border-cream-200 bg-cream-100/50 px-5 py-14 dark:border-gray-800 dark:bg-gray-900 sm:px-8 text-center">
        <div className="mx-auto max-w-4xl flex flex-col items-center">
          <BrandLogo variant="full" size="xl" className="mb-4" />
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-wine-800 dark:text-cream-100">
            Gifting that still feels hand-made
          </h2>
          <p className="mt-3 max-w-2xl text-ink-700/80 dark:text-gray-300">
            Founded in 2016. Twelve thousand hampers later, we still hand-pack every basket and tie each ribbon ourselves.
          </p>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-14">
        <img
          src="https://images.pexels.com/photos/6690454/pexels-photo-6690454.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200"
          alt="A_S Hamper packing table with baskets and ribbons"
          className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lg border border-cream-200 dark:border-stone-800"
        />
        <div className="space-y-5 text-ink-700/80 dark:text-gray-300">
          <p>
            We began because store-bought gifting felt anonymous — the same shrink-wrapped basket, the same printed card. So we built a studio where you choose the basket, the contents, the photo, and the words.
          </p>
          <p>
            Every hamper is packed to order. Nothing sits in a warehouse. Fresh flowers are sourced on the morning of dispatch, chocolate comes from makers we know, and cards are written by hand.
          </p>
          <h2 className="pt-2 font-display text-2xl font-semibold text-wine-700 dark:text-white">What we promise</h2>
          <ul className="space-y-3">
            {promises.map((promise) => (
              <li key={promise} className="flex gap-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-600">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {promise}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

