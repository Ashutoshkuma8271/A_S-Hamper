import Hero from '@/components/Hero';
import BestSellers from '@/components/BestSellers';
import Steps from '@/components/Steps';
import DeferredSection from '@/components/DeferredSection';

export default function HomePage() {
  return (
    <main className="w-full overflow-hidden">
      {/* 1. Full-Bleed Hero Slider with 4 Pillars */}
      <Hero />

      {/* 2. Live Announcement Marquee Tape */}
      <DeferredSection load={() => import('@/components/Marquee')} minHeight={56} />

      {/* 3. Shop by Occasion Grid */}
      <DeferredSection load={() => import('@/components/Categories')} minHeight={720} />

      {/* 4. Top Curations & Best Sellers with Filters */}
      <BestSellers />

      {/* 5. How It Works - 3-Step Customization Flow */}
      <Steps />

      {/* 6. Corporate & Bulk Bespoke Gifting */}
      <DeferredSection load={() => import('@/components/Corporate')} minHeight={760} />

      {/* 7. Verified Customer Reviews & Testimonials */}
      <DeferredSection load={() => import('@/components/Testimonials')} minHeight={580} />

      {/* 8. Studio Craft & Guarantee */}
      <DeferredSection load={() => import('@/components/About')} minHeight={640} />
    </main>
  );
}
