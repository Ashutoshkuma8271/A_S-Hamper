import { CartProvider } from '@/cart';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { WishlistProvider } from '@/hooks/useWishlist';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RouteGate from '@/components/RouteGate';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppButton from '@/components/WhatsAppButton';
import MobileBottomNav from '@/components/MobileBottomNav';
import HomePage from '@/pages/HomePage';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AllHampersPage = lazy(() => import('@/pages/AllHampersPage'));
const BuildYourOwnPage = lazy(() => import('@/pages/BuildYourOwnPage'));
const OffersPage = lazy(() => import('@/pages/OffersPage'));
const CorporatePage = lazy(() => import('@/pages/CorporatePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const VendorPage = lazy(() => import('@/pages/VendorPage'));
const CustomerDashboard = lazy(() => import('@/pages/CustomerDashboard'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));
const BestSellersPage = lazy(() => import('@/pages/BestSellersPage'));
const HowItWorksPage = lazy(() => import('@/pages/HowItWorksPage'));
const HandPackedPage = lazy(() => import('@/pages/HandPackedPage'));
const SameDayDeliveryPage = lazy(() => import('@/pages/SameDayDeliveryPage'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 3200,
                style: {
                  background: '#2B040B',
                  color: '#FAF4E8',
                  border: '1px solid rgba(229, 192, 123, 0.35)',
                  borderRadius: '9999px',
                  padding: '8px 18px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  maxWidth: '400px',
                  boxShadow: '0 12px 30px -8px rgba(43, 4, 11, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(8px)',
                  letterSpacing: '0.01em',
                },
                success: {
                  iconTheme: {
                    primary: '#D4AF37',
                    secondary: '#2B040B',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#E53E3E',
                    secondary: '#FAF4E8',
                  },
                },
              }}
            />
            <Router>
            <div className="min-h-screen bg-cream-50 dark:bg-gray-900 transition-colors pb-16 md:pb-0">
              <Navbar />
              <Suspense
                fallback={
                  <main className="min-h-screen pt-28 px-4 sm:px-6 max-w-7xl mx-auto" aria-busy="true">
                    <LoadingSkeleton type="hamper-grid" count={4} />
                  </main>
                }
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/all-hampers" element={<AllHampersPage />} />
                  <Route path="/best-sellers" element={<BestSellersPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/hand-packed" element={<HandPackedPage />} />
                  <Route path="/same-day-delivery" element={<SameDayDeliveryPage />} />
                  <Route path="/build-your-own" element={<BuildYourOwnPage />} />
                  <Route path="/offers" element={<OffersPage />} />
                  <Route path="/corporate" element={<CorporatePage />} />
                  <Route path="/vendor" element={<VendorPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/customer/*" element={<RouteGate><CustomerDashboard /></RouteGate>} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/admin/*" element={<AdminPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </Suspense>
              <Footer />
              <CartDrawer />
              <WhatsAppButton />
              <MobileBottomNav />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
