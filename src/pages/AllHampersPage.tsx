import HamperCollection from '@/components/HamperCollection';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function AllHampersPage() {
  return (
    <main className="min-h-screen pt-16 sm:pt-20 bg-[#FAF6EB]/40 dark:bg-[#120005]">
      <header className="border-b border-[#7F011F]/15 bg-[#FAF6EB] px-5 py-12 dark:border-[#7F011F]/30 dark:bg-[#180005] sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#7F011F] dark:text-[#DFB25B] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Storefront
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B6514] dark:text-[#DFB25B] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Curated Catalog
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#7F011F] dark:text-[#F5EBD0]">
            Artisan Gift Hampers Collection
          </h1>
          <p className="mt-3 max-w-2xl text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Handcrafted baskets and luxury keepsake boxes layered with chocolates, fragrant florals, and wax-sealed handwritten greeting cards.
          </p>
        </div>
      </header>

      <HamperCollection />
    </main>
  );
}
