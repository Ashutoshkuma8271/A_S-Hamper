import { Link, useLocation } from 'react-router-dom';
import { Home, Gift, Package, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/cart';
import { useWishlist } from '@/hooks/useWishlist';

export default function MobileBottomNav() {
  const location = useLocation();
  const { count, open } = useCart();
  const { wishlistCount } = useWishlist();

  // Hide on admin or checkout pages to avoid clutter
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'All Hampers', href: '/all-hampers', icon: Gift },
    { label: 'Build Your Own', href: '/build-your-own', icon: Package },
    { label: 'Wishlist', href: '/wishlist', icon: Heart, badge: wishlistCount },
    { label: 'Cart', action: open, icon: ShoppingBag, badge: count },
  ];

  return (
    <nav 
      aria-label="Mobile navigation bar"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#FAF5E8]/98 dark:bg-[#140508]/98 backdrop-blur-md border-t border-[#E5C57B]/40 dark:border-[#33020A] shadow-[0_-4px_20px_rgba(68,4,15,0.06)] px-2 py-1 safe-bottom"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href ? location.pathname === item.href : false;

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="relative flex flex-col items-center justify-center py-1.5 px-2 text-[#44040F]/80 dark:text-[#FAF5E8]/80 hover:text-[#57222C] transition-colors"
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                  {item.badge ? (
                    <span className="absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#57222C] text-[9.5px] font-bold text-[#FBDE9C] border border-[#FBDE9C] px-1 shadow-sm">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10.5px] font-semibold tracking-tight mt-0.5 whitespace-nowrap">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href!}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 transition-colors ${
                isActive
                  ? 'text-[#57222C] dark:text-[#FBDE9C] font-bold'
                  : 'text-[#44040F]/75 dark:text-[#FAF5E8]/75 hover:text-[#57222C]'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.9]'}`} />
                {item.badge ? (
                  <span className="absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#57222C] text-[9.5px] font-bold text-[#FBDE9C] border border-[#FBDE9C] px-1 shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10.5px] tracking-tight mt-0.5 whitespace-nowrap ${isActive ? 'font-bold text-[#57222C] dark:text-[#FBDE9C]' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
