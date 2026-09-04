import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  Clock,
  Sparkles,
  Truck,
  ShieldCheck,
  Package,
  Send,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Thank you for subscribing to A_S Hamper VIP Gifting!', { icon: '🎁' });
    setEmailInput('');
  };

  return (
    <footer role="contentinfo" aria-label="Site Footer" className="bg-[#180005] text-[#F5EBD0] border-t border-[#7F011F]/40 relative font-sans">
      {/* Top Features Strip */}
      <div className="border-b border-[#7F011F]/30 bg-[#240008] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#b3864a] text-[#140609] flex items-center justify-center shrink-0 shadow-md">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs sm:text-sm">Same-Day Delivery</h5>
              <p className="text-[12px] text-[#ece1cd] mt-0.5 font-medium">Order by 2 PM for priority delivery</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#b3864a] text-[#140609] flex items-center justify-center shrink-0 shadow-md">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs sm:text-sm">Hand-Packed Studio</h5>
              <p className="text-[12px] text-[#ece1cd] mt-0.5 font-medium">Triple quality checked in studio</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#b3864a] text-[#140609] flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs sm:text-sm">100% Encrypted Checkout</h5>
              <p className="text-[12px] text-[#ece1cd] mt-0.5 font-medium">Razorpay, UPI & card security</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#b3864a] text-[#140609] flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs sm:text-sm">WhatsApp Support</h5>
              <p className="text-[12px] text-[#ece1cd] mt-0.5 font-medium">+91 63862 56770 live support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-[#b3864a]/20">
        <div className="rounded-3xl bg-gradient-to-r from-[#290d14] via-[#3a131c] to-[#290d14] p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl border border-[#c79e63]/40">
          <div className="max-w-xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f0cf9c] uppercase tracking-widest bg-[#b3864a]/20 px-3 py-1 rounded-full border border-[#c79e63]/40">
              <Sparkles className="h-3.5 w-3.5" /> VIP Gifting Club
            </span>
            <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-white">
              Join Our Luxury Gifting Circle
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-[#f6efe4] leading-relaxed font-medium">
              Subscribe to receive private seasonal catalog previews, early festival hamper access, and VIP discounts.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email address"
              className="px-5 py-3.5 rounded-full bg-white text-[#140609] placeholder-[#57222c]/70 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#c79e63] flex-1 min-w-[250px] shadow-inner"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b3864a] px-7 py-3.5 text-xs font-bold text-[#140609] hover:bg-[#c79e63] transition-all shadow-lg shrink-0"
            >
              Subscribe <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Link Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block transition-opacity hover:opacity-95">
              <BrandLogo variant="horizontal" size="md" isDark />
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed text-[#ece1cd] font-medium max-w-sm">
              Personalised artisan gift hampers, hand-crafted and packed in small studio batches. Choose a signature basket, curate premium delights, attach a wax-sealed card, and deliver with pristine care.
            </p>

            {/* Direct Contact Links */}
            <div className="space-y-2.5 pt-2 text-xs font-medium">
              <a
                href="mailto:hello@ashamper.in"
                className="flex items-center gap-2.5 text-[#f6efe4] hover:text-[#f0cf9c] transition-colors"
              >
                <Mail className="h-4 w-4 text-[#c79e63] shrink-0" /> hello@ashamper.in
              </a>
              <a
                href="tel:+916386256770"
                className="flex items-center gap-2.5 text-[#f6efe4] hover:text-[#f0cf9c] transition-colors"
              >
                <Phone className="h-4 w-4 text-[#c79e63] shrink-0" /> +91 63862 56770
              </a>
              <div className="flex items-center gap-2.5 text-[#ece1cd]">
                <Clock className="h-4 w-4 text-[#c79e63] shrink-0" /> Mon – Sun: 9:00 AM – 8:00 PM IST
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-3 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid place-items-center h-10 w-10 rounded-full bg-[#b3864a]/20 text-[#f0cf9c] hover:bg-[#b3864a] hover:text-[#140609] transition-colors border border-[#c79e63]/40"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid place-items-center h-10 w-10 rounded-full bg-[#b3864a]/20 text-[#f0cf9c] hover:bg-[#b3864a] hover:text-[#140609] transition-colors border border-[#c79e63]/40"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.714 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="grid place-items-center h-10 w-10 rounded-full bg-[#b3864a]/20 text-[#f0cf9c] hover:bg-[#b3864a] hover:text-[#140609] transition-colors border border-[#c79e63]/40"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/916386256770"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="grid place-items-center h-10 w-10 rounded-full bg-[#b3864a]/20 text-[#f0cf9c] hover:bg-[#b3864a] hover:text-[#140609] transition-colors border border-[#c79e63]/40"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="grid place-items-center h-10 w-10 rounded-full bg-[#b3864a]/20 text-[#f0cf9c] hover:bg-[#b3864a] hover:text-[#140609] transition-colors border border-[#c79e63]/40"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 1: Shop Categories */}
          <div>
            <h4 className="font-display text-[#f0cf9c] font-bold text-sm uppercase tracking-wider mb-4 border-b border-[#b3864a]/40 pb-2">
              Shop Hampers
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/best-sellers" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/all-hampers" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  All Gift Hampers
                </Link>
              </li>
              <li>
                <Link to="/build-your-own" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Build Custom Hamper
                </Link>
              </li>
              <li>
                <Link to="/all-hampers?cat=birthday" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Birthday Hampers
                </Link>
              </li>
              <li>
                <Link to="/all-hampers?cat=anniversary" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Anniversary Hampers
                </Link>
              </li>
              <li>
                <Link to="/corporate" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Corporate Gifting
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Exclusive Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Customer Care */}
          <div>
            <h4 className="font-display text-[#f0cf9c] font-bold text-sm uppercase tracking-wider mb-4 border-b border-[#b3864a]/40 pb-2">
              Customer Services
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/how-it-works" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/same-day-delivery" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Same-Day PIN Checker
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  How It Works Guide
                </Link>
              </li>
              <li>
                <Link to="/hand-packed" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Hand-Packed Guarantee
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Shopping Cart Drawer
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  My Wishlist ❤️
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  My Account Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Vendors */}
          <div>
            <h4 className="font-display text-[#f0cf9c] font-bold text-sm uppercase tracking-wider mb-4 border-b border-[#b3864a]/40 pb-2">
              Company & Partners
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/about" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  About A_S Hamper
                </Link>
              </li>
              <li>
                <Link to="/hand-packed" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Our Hand-Packing Studio
                </Link>
              </li>
              <li>
                <Link to="/vendor" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Vendor Partner Zone
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#DFB25B]" />
                  Admin Operations Portal
                </Link>
              </li>
              <li>
                <Link to="/corporate" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Bulk Corporate Orders
                </Link>
              </li>
              <li>
                <a href="#privacy" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Privacy & Data Security
                </a>
              </li>
              <li>
                <a href="#terms" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#refunds" className="text-[#f6efe4] hover:text-[#f0cf9c] transition-colors block">
                  Shipping & Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar & Trust Badges */}
      <div className="border-t border-[#7F011F]/30 bg-[#0d0406] py-6 px-4 sm:px-6 text-xs text-[#ece1cd]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-semibold text-white">© {new Date().getFullYear()} A_S Hamper. All rights reserved. Hand-packed with care.</p>
            <p className="text-[11px] text-[#ece1cd] mt-0.5">
              Designed for luxury gifting, personal hamper customization, and same-day priority delivery. · <Link to="/admin" className="text-[#f0cf9c] hover:underline">Admin Login</Link>
            </p>
          </div>

          {/* Payment Method Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded bg-white px-3 py-1 text-[11px] font-bold text-[#140609] shadow-sm">
              Razorpay Secured
            </span>
            <span className="rounded bg-white px-3 py-1 text-[11px] font-bold text-[#140609] shadow-sm">
              UPI Instant
            </span>
            <span className="rounded bg-white px-3 py-1 text-[11px] font-bold text-[#140609] shadow-sm">
              Visa / Mastercard
            </span>
            <span className="rounded bg-white px-3 py-1 text-[11px] font-bold text-[#140609] shadow-sm">
              RuPay
            </span>
            <span className="rounded bg-white px-3 py-1 text-[11px] font-bold text-[#140609] shadow-sm">
              Cash On Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
