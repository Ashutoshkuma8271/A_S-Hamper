import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '916386256770';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

  const defaultMessage = 'Hello A_S Hamper! I would like to inquire about personalized artisan gift hampers.';
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-[4.5rem] right-3.5 sm:bottom-6 sm:right-6 z-[60] flex items-center gap-2 pointer-events-auto select-none font-sans">
      {/* WhatsApp Floating Action Button matching exact circular icon */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.7)] transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Chat with Artisan on WhatsApp"
        title="Chat with Artisan on WhatsApp"
      >
        {/* Subtle Pulsing Outer Glow */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none group-hover:opacity-0" />

        {/* Exact WhatsApp Circular Icon SVG */}
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full drop-shadow-md transition-transform duration-300 group-hover:rotate-6"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="50" fill="#25D366" />
          <path
            d="M50.2 19.5C33.3 19.5 19.5 33.3 19.5 50.2c0 5.4 1.4 10.7 4.1 15.3L19 81l16-4.2c4.4 2.4 9.4 3.7 15.2 3.7 16.9 0 30.7-13.8 30.7-30.7 0-16.9-13.8-30.3-30.7-30.3zm0 55.4c-4.8 0-9.4-1.3-13.4-3.7l-.9-.6-9.5 2.5 2.5-9.3-.6-1c-2.6-4.1-4-8.9-4-13.8 0-14.1 11.5-25.6 25.6-25.6 14.1 0 25.6 11.5 25.6 25.6-.1 14.1-11.6 25.9-25.3 25.9zm14.1-19.2c-.8-.4-4.6-2.3-5.3-2.5-.7-.3-1.3-.4-1.8.4-.5.8-2.1 2.5-2.5 3.1-.5.5-.9.6-1.7.2-.8-.4-3.3-1.2-6.3-3.9-2.3-2.1-3.9-4.7-4.4-5.5-.4-.8 0-1.2.4-1.6.3-.4.8-.9 1.2-1.4.4-.5.5-.8.8-1.3.3-.5.1-1-.1-1.4-.3-.4-1.8-4.4-2.5-6-.7-1.6-1.4-1.4-1.9-1.4h-1.6c-.5 0-1.4.2-2.2 1-.8.8-2.9 2.9-2.9 7 0 4.1 3 8.1 3.4 8.7.4.5 5.9 9 14.3 12.6 2 .9 3.6 1.4 4.8 1.8 2 .6 3.9.5 5.3.3 1.6-.2 4.6-1.9 5.3-3.7.6-1.8.6-3.4.4-3.7-.1-.4-.7-.6-1.5-1z"
            fill="#FFFFFF"
          />
        </svg>

        {/* Live Online Badge Dot */}
        <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-[#128C7E] border-2 border-white shadow-sm flex items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        </span>
      </a>
    </div>
  );
}
