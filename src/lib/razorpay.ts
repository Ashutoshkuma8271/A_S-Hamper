export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type RazorpayCheckoutOptions = {
  amount: number; // in Rupees
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onFailure: (errorMsg: string) => void;
};

export async function openRazorpayCheckout({
  amount,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
}: RazorpayCheckoutOptions): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure('RAZORPAY_FALLBACK');
    return;
  }

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // If no explicit production or test key is defined, trigger fail-safe payment gateway modal
  if (!razorpayKey) {
    onFailure('RAZORPAY_FALLBACK');
    return;
  }

  const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);

  const options = {
    key: razorpayKey,
    amount: Math.round(amount * 100), // convert to paise
    currency: 'INR',
    name: 'A_S Hamper',
    description: `Order #${orderNumber} - Personalised Luxury Hampers`,
    image: `${window.location.origin}/hero-hamper.webp`,
    handler: function (response: RazorpaySuccessResponse) {
      if (response && response.razorpay_payment_id) {
        onSuccess(response);
      } else {
        onFailure('RAZORPAY_FALLBACK');
      }
    },
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: cleanPhone ? `+91${cleanPhone}` : '',
    },
    notes: {
      order_number: orderNumber,
    },
    theme: {
      color: '#57222C',
    },
    modal: {
      ondismiss: function () {
        onFailure('Payment process was cancelled by customer.');
      },
    },
  };

  try {
    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function () {
      onFailure('RAZORPAY_FALLBACK');
    });
    rzp.open();
  } catch (err) {
    console.error('Error launching Razorpay:', err);
    onFailure('RAZORPAY_FALLBACK');
  }
}
