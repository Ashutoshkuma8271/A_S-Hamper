import HamperCollection from '@/components/HamperCollection';

export default function OffersPage() {
  return <main className="min-h-screen pt-[4.5rem]"><header className="border-b border-cream-200 bg-cream-100/60 px-5 py-14 dark:border-gray-800 dark:bg-gray-900 sm:px-8"><div className="mx-auto max-w-7xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Limited time</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-wine-800 sm:text-5xl dark:text-white">Offers &amp; deals</h1><p className="mt-3 max-w-2xl text-ink-700/70 dark:text-gray-300">Festive bundles and price drops, while stock lasts.</p></div></header><HamperCollection offersOnly /></main>;
}
