import Corporate from '@/components/Corporate';

export default function CorporatePage() {
  return (
    <div className="min-h-screen pb-20 pt-16">
      <div className="border-b border-cream-200 bg-cream-100/50 px-5 py-14 dark:border-gray-800 dark:bg-gray-900 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-600">Corporate gifting</p>
        <h1 className="mt-3 font-display font-semibold text-wine-800 text-4xl sm:text-5xl tracking-tight dark:text-white">Bulk hampers, your branding</h1>
        <p className="mt-3 max-w-2xl text-ink-700/70 dark:text-gray-300">Diwali gifting, onboarding kits, and client thank-yous — beautifully made from 25 units.</p>
      </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="cv-auto"><Corporate /></div>
      </div>
    </div>
  );
}
