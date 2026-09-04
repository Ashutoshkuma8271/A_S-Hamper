import { useState } from 'react';
import {
  X,
  Lock,
  CreditCard,
  Building2,
  Smartphone,
  Banknote,
  Loader2,
  ArrowRight,
  QrCode,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '@/cart';
import { BrandEmblem } from '@/components/BrandLogo';

type RazorpayModalProps = {
  isOpen: boolean;
  amount: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onClose: () => void;
  onPaymentSuccess: (paymentId: string, method: string) => void;
};

type PayTab = 'upi' | 'card' | 'netbanking' | 'cod';

export default function RazorpayModal({
  isOpen,
  amount,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  onClose,
  onPaymentSuccess,
}: RazorpayModalProps) {
  const [activeTab, setActiveTab] = useState<PayTab>('upi');
  const [upiApp, setUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(customerName);
  const [selectedBank, setSelectedBank] = useState('sbi');

  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  if (!isOpen) return null;

  const merchantVpa = 'ashamper@upi';
  const upiPayload = `upi://pay?pa=${merchantVpa}&pn=A_S%20Hamper%20Gifting&am=${amount}&cu=INR&tn=Order%20${orderNumber}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    upiPayload
  )}`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(merchantVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleProcessPayment = () => {
    setPayError(null);

    if (activeTab === 'upi') {
      if (upiId.trim() && !upiId.includes('@')) {
        setPayError('Please enter a valid UPI ID (e.g. mobile@upi or name@okaxis)');
        return;
      }
    } else if (activeTab === 'card') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 16) {
        setPayError('Please enter a valid 16-digit Card Number');
        return;
      }
      if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setPayError('Please enter valid expiry date (MM/YY)');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setPayError('Please enter 3-digit CVV');
        return;
      }
    }

    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      const generatedPayId = `pay_rzp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const payMethodLabel =
        activeTab === 'upi'
          ? `UPI (${upiApp.toUpperCase()})`
          : activeTab === 'card'
          ? 'Credit/Debit Card'
          : activeTab === 'netbanking'
          ? `Net Banking (${selectedBank.toUpperCase()})`
          : 'Cash on Delivery';

      onPaymentSuccess(generatedPayId, payMethodLabel);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-ink-900/70 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border border-cream-300 dark:border-gray-700 flex flex-col max-h-[90vh]">
        {/* Razorpay Gateway Header */}
        <div className="bg-[#57222C] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <BrandEmblem size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold tracking-wide">A_S Hamper Checkout</h3>
                <span className="rounded-full bg-gold-400/20 px-2 py-0.5 text-[9px] font-bold uppercase text-gold-300">
                  Razorpay Live
                </span>
              </div>
              <p className="text-[11px] text-cream-200/80">Order #{orderNumber}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10 transition-colors text-cream-200"
            aria-label="Close payment modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-cream-100/70 px-6 py-3 border-b border-cream-200 dark:bg-gray-800/60 dark:border-gray-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-gray-600 dark:text-gray-300">Amount Payable</span>
          <span className="font-display text-base font-bold text-wine-800 dark:text-gold-300">
            {formatPrice(amount)}
          </span>
        </div>

        {/* Payment Tabs */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-cream-100 p-1.5 dark:bg-gray-800 text-center text-xs">
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 font-semibold transition-all ${
                activeTab === 'upi'
                  ? 'bg-wine-600 text-white shadow'
                  : 'text-gray-600 hover:text-wine-700 dark:text-gray-300'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span className="text-[10px]">UPI / Apps</span>
            </button>

            <button
              onClick={() => setActiveTab('card')}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 font-semibold transition-all ${
                activeTab === 'card'
                  ? 'bg-wine-600 text-white shadow'
                  : 'text-gray-600 hover:text-wine-700 dark:text-gray-300'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-[10px]">Card</span>
            </button>

            <button
              onClick={() => setActiveTab('netbanking')}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 font-semibold transition-all ${
                activeTab === 'netbanking'
                  ? 'bg-wine-600 text-white shadow'
                  : 'text-gray-600 hover:text-wine-700 dark:text-gray-300'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span className="text-[10px]">NetBanking</span>
            </button>

            <button
              onClick={() => setActiveTab('cod')}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 font-semibold transition-all ${
                activeTab === 'cod'
                  ? 'bg-wine-600 text-white shadow'
                  : 'text-gray-600 hover:text-wine-700 dark:text-gray-300'
              }`}
            >
              <Banknote className="h-4 w-4" />
              <span className="text-[10px]">COD</span>
            </button>
          </div>

          {/* Tab 1: Dynamic UPI QR Code & Apps */}
          {activeTab === 'upi' && (
            <div className="space-y-4">
              {/* Dynamic QR Code Card */}
              <div className="flex flex-col items-center justify-center rounded-3xl border border-cream-300 bg-cream-50/60 p-4 text-center dark:border-gray-700 dark:bg-gray-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-wine-800 dark:text-gold-300 mb-2">
                  <QrCode className="h-4 w-4 text-wine-600" />
                  <span>Scan QR Code to Pay {formatPrice(amount)}</span>
                </div>

                <div className="relative rounded-2xl bg-white p-3 shadow-md border border-cream-200 dark:border-gray-700">
                  <img
                    src={qrCodeUrl}
                    alt="Scan UPI QR Code"
                    className="h-40 w-40 object-contain rounded-lg"
                  />
                  <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-bold text-gray-500">
                    <span>Scan with any UPI App</span>
                  </div>
                </div>

                {/* VPA & Copy Button */}
                <div className="mt-3 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 border border-cream-300 text-xs shadow-sm dark:bg-gray-700 dark:border-gray-600">
                  <span className="font-mono text-[11px] font-bold text-wine-800 dark:text-white">
                    {merchantVpa}
                  </span>
                  <button
                    onClick={handleCopyVpa}
                    className="text-wine-600 hover:text-wine-800 dark:text-gold-300 flex items-center gap-1 text-[10px] font-bold"
                  >
                    {copiedVpa ? <Check className="h-3 w-3 text-sage-600" /> : <Copy className="h-3 w-3" />}
                    {copiedVpa ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* UPI App Quick Select */}
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Select your preferred UPI App:
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'gpay', label: 'Google Pay', icon: '🌐' },
                  { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
                  { id: 'paytm', label: 'Paytm UPI', icon: '🟦' },
                  { id: 'bhim', label: 'BHIM / Any UPI', icon: '⚡' },
                ].map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setUpiApp(app.id)}
                    className={`flex items-center justify-between rounded-2xl border p-3 text-xs font-bold transition-all ${
                      upiApp === app.id
                        ? 'border-wine-600 bg-wine-600/5 text-wine-800 ring-1 ring-wine-600 dark:text-gold-300 dark:bg-wine-600/10'
                        : 'border-cream-300 bg-cream-50/50 text-gray-700 hover:border-wine-600/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{app.icon}</span>
                      <span>{app.label}</span>
                    </div>
                    {upiApp === app.id && <Check className="h-3.5 w-3.5 text-wine-600" />}
                  </button>
                ))}
              </div>

              {/* Direct App Link */}
              <a
                href={upiPayload}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-wine-600/30 bg-wine-600/10 py-2.5 text-xs font-bold text-wine-800 dark:text-gold-300 hover:bg-wine-600/20 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open directly in Mobile UPI App
              </a>

              {/* VPA Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                  Or enter your VPA / UPI ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210@paytm or name@okaxis"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-2xl border border-cream-300 bg-cream-50 p-2.5 text-xs text-ink-800 outline-none focus:border-wine-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Credit / Debit Card */}
          {activeTab === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                  Card Number *
                </label>
                <input
                  type="text"
                  maxLength={19}
                  placeholder="4532 •••• •••• 8923"
                  value={cardNumber}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setCardNumber(raw.replace(/(.{4})/g, '$1 ').trim());
                  }}
                  className="w-full rounded-2xl border border-cream-300 bg-cream-50 p-2.5 text-xs text-ink-800 outline-none focus:border-wine-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Expiry (MM/YY) *
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="08/28"
                    value={cardExpiry}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (raw.length >= 3) {
                        setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
                      } else {
                        setCardExpiry(raw);
                      }
                    }}
                    className="w-full rounded-2xl border border-cream-300 bg-cream-50 p-2.5 text-xs text-ink-800 outline-none focus:border-wine-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    CVV *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-2xl border border-cream-300 bg-cream-50 p-2.5 text-xs text-ink-800 outline-none focus:border-wine-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Ashutosh Kumar"
                  className="w-full rounded-2xl border border-cream-300 bg-cream-50 p-2.5 text-xs text-ink-800 outline-none focus:border-wine-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Net Banking */}
          {activeTab === 'netbanking' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Select your Bank:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sbi', label: 'State Bank of India' },
                  { id: 'hdfc', label: 'HDFC Bank' },
                  { id: 'icici', label: 'ICICI Bank' },
                  { id: 'axis', label: 'Axis Bank' },
                  { id: 'kotak', label: 'Kotak Mahindra' },
                  { id: 'pnb', label: 'Punjab National Bank' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBank(b.id)}
                    className={`rounded-2xl border p-3 text-xs font-bold text-left transition-all ${
                      selectedBank === b.id
                        ? 'border-wine-600 bg-wine-600/5 text-wine-800 ring-1 ring-wine-600 dark:text-gold-300'
                        : 'border-cream-300 bg-cream-50/50 text-gray-700 hover:border-wine-600/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: COD */}
          {activeTab === 'cod' && (
            <div className="rounded-2xl bg-cream-50 p-4 border border-cream-300 dark:bg-gray-800 dark:border-gray-700 text-xs space-y-2">
              <p className="font-bold text-wine-800 dark:text-white">
                Cash on Delivery (COD) Selected
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                You can pay cash directly to our delivery executive when your hamper arrives.
              </p>
            </div>
          )}

          {payError && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 p-2.5 rounded-xl">
              {payError}
            </p>
          )}

          {/* Submit Action */}
          <button
            onClick={handleProcessPayment}
            disabled={processing}
            className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-wine-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-wine-600/30 transition-all hover:bg-wine-700 hover:shadow-xl active:scale-95 disabled:opacity-60"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying Payment...
              </>
            ) : (
              <>
                I HAVE PAID ({formatPrice(amount)})
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <div className="pt-1 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3 text-sage-600" />
            <span>256-bit SSL Razorpay Encrypted Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
}
