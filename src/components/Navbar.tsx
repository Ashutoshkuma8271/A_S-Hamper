import { useEffect, useState, useCallback, type FormEvent } from 'react';
import {
  Search,
  Heart,
  UserRound,
  ShoppingBag,
  Moon,
  Sun,
  Sparkles,
  ChevronRight,
  Gift,
  Package,
  Store,
  ShieldCheck,
  LogOut,
  X,
  Compass,
  Crown,
} from 'lucide-react';
import { useCart } from '@/cart';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useWishlist } from '@/hooks/useWishlist';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';

interface NavLinkItem {
  label: string;
  href: string;
  badge?: string;
  icon?: typeof Gift;
}

const mainNavLinks: NavLinkItem[] = [
  { label: 'Home', href: '/', icon: Sparkles },
  { label: 'All Hampers', href: '/all-hampers', icon: Gift },
  { label: 'Build Your Own', href: '/build-your-own', icon: Package },
  { label: 'Corporate', href: '/corporate', icon: Crown },
  { label: 'Vendor Zone', href: '/vendor', icon: Store },
  { label: 'About', href: '/about', icon: Compass },
];

export default function Navbar() {
  const { count, open } = useCart();
  const { wishlistCount } = useWishlist();
  const { session, profile, isAdmin, isVendor, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 15);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll and handle escape key when mobile menu is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all-hampers?search=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  const isStoreAdmin = profile?.role === 'admin' || isAdmin;

  const roleLinks: NavLinkItem[] = isVendor
    ? [
        { label: 'Vendor Studio', href: '/vendor', icon: Store },
        { label: 'Live Storefront', href: '/', icon: Gift },
        { label: 'All Hampers', href: '/all-hampers', icon: Package },
      ]
    : isStoreAdmin
    ? [
        { label: 'Admin Dashboard', href: '/admin', icon: ShieldCheck },
        { label: 'Live Storefront', href: '/', icon: Gift },
        { label: 'All Hampers', href: '/all-hampers', icon: Package },
      ]
    : mainNavLinks;

  const showWishlistBadge = wishlistCount > 0;
  const showCartBadge = count > 0;
  const accountLink = isVendor ? '/vendor' : isAdmin ? '/admin' : '/profile';
  const userInitial = (profile?.full_name || profile?.business_name || session?.user?.email || 'A').charAt(0).toUpperCase();

  return (
    <header
      role="banner"
      className={`navbar fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F5EBD0]/98 dark:bg-[#180005]/98 backdrop-blur-md border-b border-[#7F011F]/20 dark:border-[#7F011F]/40 shadow-[0_4px_20px_rgba(127,1,31,0.08)] py-2 sm:py-2.5'
          : 'bg-[#F5EBD0]/95 dark:bg-[#180005]/95 backdrop-blur-sm border-b border-[#7F011F]/15 dark:border-[#7F011F]/30 py-2.5 sm:py-3.5'
      }`}
    >
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4 xl:gap-6 px-2.5 xs:px-3 sm:px-5 lg:px-6 xl:px-8">
        {/* Left: Brand Logo */}
        <Link
          to="/"
          className="shrink-0 flex items-center py-0.5 transition-opacity hover:opacity-95 cursor-pointer"
          aria-label="A_S Hamper - Go to Homepage"
        >
          <BrandLogo variant="horizontal" size="sm" />
        </Link>

        {/* Center: Desktop Navigation Links (Responsive for 1024px, 1280px, 1440px+) */}
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className="navbar hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-1 min-w-0"
        >
          {roleLinks.map((l) => {
            const isActive = location.pathname === l.href;
            return (
              <Link
                key={l.href}
                to={l.href}
                className={`relative px-2.5 xl:px-3.5 py-1.5 text-[13.5px] xl:text-[15px] font-display font-medium tracking-[0.01em] transition-all duration-200 whitespace-nowrap group rounded-full ${
                  isActive
                    ? 'text-[#F5EBD0] bg-[#7F011F] font-semibold shadow-xs'
                    : 'text-[#7F011F]/85 hover:text-[#7F011F] hover:bg-[#7F011F]/10 dark:text-[#F5EBD0]/85 dark:hover:text-[#F5EBD0] dark:hover:bg-white/10'
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {l.label}
                  {l.badge && (
                    <span className="ml-0.5 inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-sans font-bold bg-[#7F011F] text-[#F5EBD0] dark:bg-[#F5EBD0] dark:text-[#7F011F] uppercase tracking-wider">
                      {l.badge}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions Toolbar: Theme Toggle -> Wishlist -> Cart -> Profile -> Hamburger */}
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 shrink-0">

          {/* 1. Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center min-h-[38px] min-w-[38px] h-9 w-9 sm:h-10 sm:w-10 rounded-full text-[#7F011F] bg-white/60 dark:bg-white/5 border border-[#7F011F]/30 hover:border-[#7F011F] hover:bg-[#7F011F]/10 active:scale-95 transition-all dark:text-[#F5EBD0] dark:border-[#7F011F]/40 shrink-0 shadow-xs focus:outline-none"
            aria-label="Toggle dark/light theme"
            title={theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#7F011F]" strokeWidth={2} />
            ) : (
              <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#F5EBD0]" strokeWidth={2} />
            )}
          </button>

          {/* 2. Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative flex items-center justify-center min-h-[38px] min-w-[38px] h-9 w-9 sm:h-10 sm:w-10 rounded-full text-[#7F011F] bg-white/60 dark:bg-white/5 border border-[#7F011F]/30 hover:border-[#7F011F] hover:bg-[#7F011F]/10 active:scale-95 transition-all dark:text-[#F5EBD0] dark:border-[#7F011F]/40 shrink-0 shadow-xs focus:outline-none"
            aria-label={`View Wishlist with ${wishlistCount} items`}
            title="Wishlist"
          >
            <Heart
              className={showWishlistBadge ? 'h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#7F011F] fill-[#7F011F] dark:text-[#F5EBD0] dark:fill-[#F5EBD0]' : 'h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#7F011F] dark:text-[#F5EBD0]'}
              strokeWidth={2}
            />
            {showWishlistBadge && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full bg-[#7F011F] text-[9.5px] sm:text-[10px] font-sans font-black text-[#F5EBD0] border-2 border-[#F5EBD0] dark:border-[#180005] shadow-sm animate-pulse">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>

          {/* 3. Cart Trigger Button */}
          <button
            type="button"
            onClick={open}
            className="relative flex items-center justify-center min-h-[38px] min-w-[38px] h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#7F011F] text-[#F5EBD0] hover:bg-[#680018] active:scale-95 transition-all shadow-[0_2px_10px_rgba(127,1,31,0.25)] border border-[#7F011F] shrink-0 focus:outline-none"
            aria-label={`Open cart with ${count} items`}
            title="Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#F5EBD0]" strokeWidth={2} />
            {showCartBadge && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full bg-[#F5EBD0] text-[9.5px] sm:text-[10px] font-sans font-black text-[#7F011F] border-2 border-[#7F011F] shadow-md">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>

          {/* 4. User Profile / Account Button */}
          {session ? (
            <Link
              to={accountLink}
              className="flex items-center justify-center min-h-[38px] min-w-[38px] h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#7F011F] text-[#F5EBD0] text-xs sm:text-sm font-display font-bold ring-2 ring-[#7F011F]/50 hover:ring-[#7F011F] active:scale-95 transition-all shadow-sm shrink-0 overflow-hidden"
              aria-label="Account profile"
              title={
                profile?.role === 'vendor'
                  ? `Vendor Studio (${profile?.business_name || session.user.email})`
                  : profile?.full_name || 'My Account'
              }
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="h-full w-full rounded-full object-cover" />
              ) : (
                userInitial
              )}
            </Link>
          ) : (
            <Link
              to="/profile"
              className="flex items-center justify-center min-h-[38px] min-w-[38px] h-9 w-9 sm:h-10 sm:w-10 rounded-full text-[#7F011F] bg-white/60 dark:bg-white/5 border border-[#7F011F]/30 hover:border-[#7F011F] hover:bg-[#7F011F]/10 active:scale-95 transition-all dark:text-[#F5EBD0] dark:border-[#7F011F]/40 shrink-0 shadow-xs focus:outline-none"
              aria-label="Sign in to your account"
              title="Sign In / Profile"
            >
              <UserRound className="h-4 w-4 sm:h-4.5 sm:w-4.5" strokeWidth={2} />
            </Link>
          )}

          {/* 5. Mobile & Tablet Hamburger Drawer Toggle Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="navbar lg:hidden relative flex items-center justify-center min-h-[38px] min-w-[38px] h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/70 dark:bg-white/5 border border-[#7F011F]/30 text-[#7F011F] hover:bg-[#7F011F]/10 transition-all duration-300 dark:text-[#F5EBD0] dark:border-[#7F011F]/40 shrink-0 focus:outline-none shadow-xs"
            aria-label={menuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
            aria-expanded={menuOpen}
            aria-controls="luxury-offcanvas-drawer"
          >
            <div className="relative w-4.5 h-3.5 flex flex-col justify-between py-0.5">
              <span
                className={`h-0.5 w-full bg-[#7F011F] dark:bg-[#F5EBD0] rounded-full transition-all duration-300 ease-out origin-top-left ${
                  menuOpen ? 'rotate-45 translate-x-1 -translate-y-0.5' : ''
                }`}
              />
              <span
                className={`h-0.5 w-full bg-[#7F011F] dark:bg-[#F5EBD0] rounded-full transition-all duration-200 ease-out ${
                  menuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                }`}
              />
              <span
                className={`h-0.5 w-full bg-[#7F011F] dark:bg-[#F5EBD0] rounded-full transition-all duration-300 ease-out origin-bottom-left ${
                  menuOpen ? '-rotate-45 translate-x-1 translate-y-0.5' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Wine-Red & Light-Sand Off-Canvas Mobile Drawer */}
      {menuOpen && (
        <div
          id="luxury-offcanvas-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation Drawer"
          className="fixed inset-0 z-50 lg:hidden flex justify-end animate-fade-in"
        >
          {/* Frosted Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-[#180005]/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Off-Canvas Slide-in Panel */}
          <aside
            className="relative z-10 flex flex-col w-[85vw] max-w-sm h-full bg-gradient-to-b from-[#2B000A] via-[#1F0007] to-[#120004] text-[#F5EBD0] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-l border-[#7F011F]/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#7F011F]/30 bg-[#1F0007]/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-full bg-[#7F011F]/30 border border-[#F5EBD0]/30 grid place-items-center text-[#F5EBD0]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="font-display text-lg font-semibold tracking-wide text-[#F5EBD0]">
                  A_S Hamper
                </span>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                className="flex items-center justify-center min-h-[40px] min-w-[40px] h-10 w-10 rounded-full text-[#F5EBD0]/80 hover:text-white bg-white/10 hover:bg-white/20 border border-[#F5EBD0]/20 transition-all active:scale-95"
                aria-label="Close navigation drawer"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Mobile Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center h-11 w-full rounded-2xl border border-[#7F011F]/40 bg-white/10 px-4 focus-within:border-[#F5EBD0] focus-within:ring-2 focus-within:ring-[#F5EBD0]/20 transition-all shadow-inner">
                <Search className="h-4 w-4 text-[#F5EBD0]/80 shrink-0" strokeWidth={2} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections..."
                  className="w-full bg-transparent pl-2.5 text-sm text-[#F5EBD0] outline-none placeholder:text-[#F5EBD0]/40 font-sans"
                />
              </form>

              {/* Quick Action Buttons in Drawer */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/wishlist"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#F5EBD0] transition-all"
                >
                  <Heart className="h-4 w-4 text-[#F5EBD0]" />
                  <span>Wishlist ({wishlistCount})</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    open();
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#F5EBD0] transition-all text-left"
                >
                  <ShoppingBag className="h-4 w-4 text-[#F5EBD0]" />
                  <span>Cart ({count})</span>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="navbar space-y-1.5 pt-1">
                {roleLinks.map((l) => {
                  const isActive = location.pathname === l.href;
                  const Icon = l.icon || Gift;
                  return (
                    <Link
                      key={l.href}
                      to={l.href}
                      onClick={closeMenu}
                      className={`group relative flex items-center justify-between rounded-xl p-3 transition-all duration-200 border ${
                        isActive
                          ? 'bg-gradient-to-r from-[#7F011F] to-[#520013] text-[#F5EBD0] border-[#F5EBD0]/40'
                          : 'bg-white/5 text-[#F5EBD0]/90 hover:text-white hover:bg-white/10 border-white/10'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#F5EBD0] rounded-r-full shadow-[0_0_8px_rgba(245,235,208,0.8)]" />
                      )}

                      <div className="flex items-center gap-3 pl-1">
                        <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#F5EBD0]' : 'text-[#F5EBD0]/80'}`} strokeWidth={1.9} />
                        <span className="font-display text-base font-medium tracking-wide text-[#F5EBD0]">
                          {l.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {l.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-[#F5EBD0] text-[#7F011F] text-[9.5px] font-sans font-bold uppercase tracking-wider">
                            {l.badge}
                          </span>
                        )}
                        <ChevronRight className={`h-4 w-4 ${
                          isActive ? 'text-[#F5EBD0]' : 'text-white/40 group-hover:text-[#F5EBD0]'
                        }`} />
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* User Account Controls */}
              <div className="pt-3 border-t border-[#7F011F]/30 space-y-2">
                <Link
                  to={accountLink}
                  onClick={closeMenu}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#F5EBD0]"
                >
                  <div className="flex items-center gap-2.5">
                    <UserRound className="h-4 w-4" />
                    <span>{session ? (profile?.full_name || 'My Account') : 'Sign In / Register'}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </Link>

                {session && (
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      closeMenu();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold font-sans bg-white/10 text-[#F5EBD0] hover:bg-white/20 border border-white/15 active:scale-95 transition-all"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2} />
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
