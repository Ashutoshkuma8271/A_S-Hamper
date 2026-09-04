import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ImagePlus, Minus, PackagePlus, Plus, Sparkles, Gift, Heart, Zap, Truck, Ribbon, ShieldCheck } from 'lucide-react';
import { useCart, formatPrice } from '@/cart';
import { useNavigate } from 'react-router-dom';

const boxes = [
  { 
    name: 'Classic Wicker Picnic Basket', 
    price: 599, 
    image: 'https://images.pexels.com/photos/6690454/pexels-photo-6690454.jpeg?auto=compress&cs=tinysrgb&h=400&w=500',
    desc: 'Handwoven natural willow wicker with leatherette buckles' 
  },
  { 
    name: 'Royal Plum Velvet Keepsake Box', 
    price: 749, 
    image: 'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=400&w=500',
    desc: 'Rigid luxury matte burgundy box with magnetic closure' 
  },
  { 
    name: 'Artisan Wooden Keepsake Trunk', 
    price: 1299, 
    image: 'https://images.pexels.com/photos/2072175/pexels-photo-2072175.jpeg?auto=compress&cs=tinysrgb&h=400&w=500',
    desc: 'Solid pine wood trunk with brass antique latch' 
  },
  { 
    name: 'Eco-Chic Kraft Gift Crate', 
    price: 399, 
    image: 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg?auto=compress&cs=tinysrgb&h=400&w=500',
    desc: '100% recyclable ribbed kraft box with gold foiled seal' 
  },
];

const extras = [
  { name: 'Belgian Dark Chocolate Bar (72%)', price: 280, category: 'Treats', icon: '🍫' },
  { name: 'Hand-Poured Lavender Soy Candle', price: 450, category: 'Aroma', icon: '🕯️' },
  { name: 'Kashmiri Saffron Roasted Almonds (100g)', price: 380, category: 'Gourmet', icon: '🥜' },
  { name: 'Artisan Floral Rose Herbal Tea Blend', price: 320, category: 'Beverage', icon: '🍵' },
  { name: 'Handcrafted Ceramic Keepsake Mug', price: 390, category: 'Keepsake', icon: '☕' },
  { name: 'Mulberry Silk Sleep Eye Mask', price: 490, category: 'Wellness', icon: '✨' },
  { name: 'Pure Organic Wildflower Honey (150g)', price: 290, category: 'Gourmet', icon: '🍯' },
  { name: 'French Butter Macarons Box (Pack of 4)', price: 350, category: 'Treats', icon: '🧁' },
];

const steps = ['1. Select Box', '2. Add Items', '3. Photo Card', '4. Custom Message', '5. Satin Ribbon', '6. Delivery Date', '7. Review & Pack'];

export default function BuildYourOwnPage() {
  const { add, open } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [box, setBox] = useState(0);
  const [selected, setSelected] = useState<string[]>(['Belgian Dark Chocolate Bar (72%)', 'Hand-Poured Lavender Soy Candle']);
  const [message, setMessage] = useState('Wishing you all the happiness, joy, and wonderful moments today and always!');
  const [photo, setPhoto] = useState<string | null>(null);
  const [wrapping, setWrapping] = useState('Champagne Gold Satin Ribbon');
  const [delivery, setDelivery] = useState('Express Delivery (1–2 business days)');
  const [added, setAdded] = useState(false);

  const total = useMemo(() => {
    return boxes[box].price + extras.filter((item) => selected.includes(item.name)).reduce((sum, item) => sum + item.price, 0);
  }, [box, selected]);

  const toggleExtra = (name: string) => {
    setSelected((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  };

  const createHamperObject = () => ({
    id: 'custom-hamper',
    slug: `custom-hamper-${Date.now()}`,
    name: `Custom Hamper (${boxes[box].name})`,
    category: 'custom',
    price: total,
    image: photo || boxes[box].image,
    description: `${boxes[box].name} with ${selected.length} hand-picked gifts: ${selected.join(', ')}. Ribbon: ${wrapping}.`,
    tag: 'Hand-Packed Studio Box',
  });

  function addToCart() {
    add(createHamperObject());
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  }

  function buyNow() {
    add(createHamperObject());
    open();
    navigate('/cart');
  }

  return (
    <div className="min-h-screen pb-20 pt-16 sm:pt-20">
      {/* Header Banner */}
      <header className="border-b border-cream-200 dark:border-stone-800 bg-[#FAF6F0] dark:bg-[#120D10] px-4 py-10 sm:py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gold-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-wine-900 dark:text-gold-300 border border-gold-400/40">
              Personalisation Studio
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-wine-900 sm:text-5xl dark:text-white">
            Build your own bespoke hamper
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-ink-700/70 dark:text-gray-300">
            Hand-curate every detail in seven simple steps. We will arrange your items, tie a satin ribbon, and tuck in your custom gift card.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        {/* Step Navigation Bar */}
        <div className="overflow-x-auto pb-3">
          <ol className="flex items-center gap-2 min-w-max">
            {steps.map((label, index) => (
              <li key={label}>
                <button
                  onClick={() => setStep(index)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                    index === step
                      ? 'border-wine-600 bg-wine-600 text-cream-50 shadow-md scale-105'
                      : index < step
                      ? 'border-gold-400/60 bg-gold-400/15 text-wine-900 dark:text-gold-300'
                      : 'border-cream-300 bg-white/70 dark:bg-stone-900/60 text-ink-700/60 hover:border-gold-400 dark:border-stone-800 dark:text-gray-400'
                  }`}
                >
                  {index < step && <Check className="mr-1 inline h-3.5 w-3.5 text-gold-600" />}
                  {label}
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Active Step Panel */}
          <section className="rounded-[2rem] bg-white dark:bg-[#1A1317] p-6 sm:p-8 border border-cream-200/80 dark:border-stone-800 shadow-sm">
            {step === 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-wine-900 dark:text-white">1. Select your gift box or basket</h2>
                    <p className="mt-1 text-xs sm:text-sm text-ink-700/70 dark:text-gray-300">Each box is crafted with premium finishes and includes protective crinkle shreds.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {boxes.map((item, idx) => (
                    <button
                      key={item.name}
                      onClick={() => setBox(idx)}
                      className={`flex flex-col text-left rounded-2xl border p-4 transition-all duration-300 ${
                        box === idx
                          ? 'border-wine-600 bg-wine-600/5 ring-2 ring-wine-600/20 shadow-md'
                          : 'border-cream-300 dark:border-stone-800 bg-cream-50/50 dark:bg-stone-900/50 hover:border-gold-400'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full rounded-xl overflow-hidden mb-3 bg-cream-100 dark:bg-stone-800">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display font-bold text-sm text-wine-900 dark:text-white">{item.name}</h4>
                        <span className="font-bold text-xs text-wine-700 dark:text-gold-300 shrink-0">{formatPrice(item.price)}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-ink-700/60 dark:text-gray-400">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-wine-900 dark:text-white">2. Choose thoughtful treats & items</h2>
                <p className="mt-1 text-xs sm:text-sm text-ink-700/70 dark:text-gray-300">Select the items you would like hand-arranged in the hamper.</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {extras.map((item) => {
                    const isSelected = selected.includes(item.name);
                    return (
                      <button
                        key={item.name}
                        onClick={() => toggleExtra(item.name)}
                        className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? 'border-wine-600 bg-wine-600/10 ring-2 ring-wine-600/20 shadow-sm'
                            : 'border-cream-300 dark:border-stone-800 bg-cream-50/40 dark:bg-stone-900/40 hover:border-gold-400'
                        }`}
                      >
                        <div className="flex items-center gap-3 pr-2">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <span className="text-xs font-bold text-ink-900 dark:text-white block leading-tight">{item.name}</span>
                            <span className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold">{item.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-bold text-wine-800 dark:text-gold-300">{formatPrice(item.price)}</span>
                          <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                            isSelected ? 'bg-wine-600 text-white' : 'bg-cream-200 dark:bg-stone-800 text-ink-700'
                          }`}>
                            {isSelected ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-wine-900 dark:text-white">3. Add a memorable photo card</h2>
                <p className="mt-1 text-xs sm:text-sm text-ink-700/70 dark:text-gray-300">Upload a favourite snapshot to print on thick 300 GSM textured matte cardstock (Complimentary).</p>

                <label className="mt-6 grid min-h-52 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-cream-300 bg-cream-100/40 p-6 text-center hover:border-gold-500 dark:border-stone-800 dark:bg-stone-900/50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) setPhoto(URL.createObjectURL(file));
                    }}
                  />
                  {photo ? (
                    <div className="relative group">
                      <img src={photo} alt="Gift card preview" className="h-44 rounded-xl object-cover shadow-md" />
                      <span className="mt-2 text-xs font-bold text-wine-700 dark:text-gold-300 block">Click to change photo</span>
                    </div>
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-full bg-gold-400/20 text-gold-600 grid place-items-center mb-1">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                      <span className="mt-2 text-sm font-bold text-wine-900 dark:text-white">Click or drag photo to upload</span>
                      <span className="mt-1 text-xs text-ink-700/50 dark:text-gray-400">JPG, PNG, or WEBP up to 10 MB</span>
                    </>
                  )}
                </label>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-wine-900 dark:text-white">4. Write your heartfelt message</h2>
                <p className="mt-1 text-xs sm:text-sm text-ink-700/70 dark:text-gray-300">Our team hand-writes or laser-prints your words inside a foil-embossed envelope.</p>

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={300}
                  rows={6}
                  className="input mt-5 resize-none text-sm"
                  placeholder="Dear [Name], wishing you the warmest celebration on your special day..."
                />
                <div className="mt-2 flex items-center justify-between text-xs text-ink-700/50 dark:text-gray-400">
                  <span>Pro tip: Mention a fond memory or warm blessing!</span>
                  <span>{message.length} / 300</span>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-wine-900 dark:text-white">5. Select luxury bow & wrapping</h2>
                <p className="mt-1 text-xs sm:text-sm text-ink-700/70 dark:text-gray-300">All ribbons are hand-tied in our studio with a custom gold wax seal.</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Champagne Gold Satin Ribbon', detail: 'Complimentary', icon: '🎀' },
                    { label: 'Burgundy Royal Velvet Ribbon', detail: '+ ₹80', icon: '🍷' },
                    { label: 'Rose Gold Shimmer Bow', detail: '+ ₹60', icon: '🌸' },
                    { label: 'Natural Jute Rustic String & Pine Cone', detail: 'Complimentary', icon: '🌿' },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setWrapping(option.label)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        wrapping === option.label
                          ? 'border-wine-600 bg-wine-600/10 ring-2 ring-wine-600/20 shadow-sm'
                          : 'border-cream-300 dark:border-stone-800 bg-cream-50/50 dark:bg-stone-900/50 hover:border-gold-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{option.icon}</span>
                        <span className="text-xs font-bold text-ink-900 dark:text-white">{option.label}</span>
                      </div>
                      <span className="text-xs font-bold text-wine-800 dark:text-gold-300">{option.detail}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-wine-900 dark:text-white">6. Select delivery speed</h2>
                <p className="mt-1 text-xs sm:text-sm text-ink-700/70 dark:text-gray-300">We deliver across India with real-time SMS tracking.</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Standard Delivery (3–5 business days)', detail: 'Free above ₹999', icon: '🚚' },
                    { label: 'Express Delivery (1–2 business days)', detail: '₹149', icon: '⚡' },
                    { label: 'Same Day Dispatch (Metro Cities)', detail: '₹249', icon: '🚀' },
                    { label: 'Schedule Exact Future Date', detail: 'Choose at Checkout', icon: '📅' },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setDelivery(option.label)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        delivery === option.label
                          ? 'border-wine-600 bg-wine-600/10 ring-2 ring-wine-600/20 shadow-sm'
                          : 'border-cream-300 dark:border-stone-800 bg-cream-50/50 dark:bg-stone-900/50 hover:border-gold-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{option.icon}</span>
                        <span className="text-xs font-bold text-ink-900 dark:text-white">{option.label}</span>
                      </div>
                      <span className="text-xs font-bold text-wine-800 dark:text-gold-300">{option.detail}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-500/15 text-gold-600">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-wine-900 dark:text-white">7. Your bespoke hamper is ready!</h2>
                    <p className="text-xs sm:text-sm text-ink-700/60 dark:text-gray-300">Ready to be lovingly packaged in our studio.</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-cream-100/70 dark:bg-stone-900/70 p-5 border border-cream-200/80 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-wine-900 dark:text-gold-300">{boxes[box].name}</h3>
                    <span className="font-bold text-wine-800 dark:text-gold-400">{formatPrice(total)}</span>
                  </div>

                  <div className="mt-3 text-xs space-y-1 text-ink-800 dark:text-gray-200">
                    <p><strong>Selected Treats:</strong> {selected.length > 0 ? selected.join(', ') : 'None'}</p>
                    <p><strong>Wrapping:</strong> {wrapping}</p>
                    <p><strong>Delivery:</strong> {delivery}</p>
                    {photo && <p className="text-gold-600 font-semibold">✓ Custom photo card attached</p>}
                  </div>

                  {message && (
                    <div className="mt-4 p-3 rounded-xl bg-white/80 dark:bg-stone-800/80 border border-gold-400/30">
                      <p className="text-xs italic text-ink-700/90 dark:text-gray-300 font-serif">“{message}”</p>
                    </div>
                  )}
                </div>

                {added && (
                  <p className="mt-4 rounded-xl bg-sage-500/15 p-3 text-center text-xs font-bold text-sage-700 dark:text-sage-300 border border-sage-500/30 animate-fade-in">
                    ✓ Custom hamper successfully added to your cart!
                  </p>
                )}
              </div>
            )}

            {/* Stepper Footer Controls */}
            <div className="mt-8 flex items-center justify-between border-t border-cream-200/80 dark:border-stone-800 pt-6">
              <button
                disabled={step === 0}
                onClick={() => setStep((current) => current - 1)}
                className="inline-flex items-center gap-2 rounded-full border border-cream-300 dark:border-stone-700 px-5 py-2.5 text-xs sm:text-sm font-bold disabled:opacity-40 hover:bg-cream-100 dark:hover:bg-stone-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              {step === steps.length - 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={addToCart}
                    className="inline-flex items-center gap-1.5 rounded-full border border-wine-600 bg-white dark:bg-stone-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-wine-800 dark:text-cream-100 hover:bg-wine-600 hover:text-white transition-colors"
                  >
                    <PackagePlus className="h-4 w-4" /> Add to Cart
                  </button>
                  <button
                    onClick={buyNow}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-wine-700 to-wine-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-cream-50 hover:from-wine-800 hover:to-wine-700 shadow-md shadow-wine-900/25 transition-all"
                  >
                    <Zap className="h-4 w-4 text-gold-300" /> Buy Now
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setStep((current) => current + 1)}
                  className="inline-flex items-center gap-2 rounded-full bg-wine-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-cream-50 hover:bg-wine-700 shadow-md transition-all"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>

          {/* Right Sticky Summary Sidebar */}
          <aside className="h-fit rounded-[2rem] bg-white dark:bg-[#1A1317] p-6 border border-cream-200/80 dark:border-stone-800 lg:sticky lg:top-24 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Your Hamper</span>
              <span className="text-xs font-bold text-sage-600 bg-sage-500/10 px-2 py-0.5 rounded-full">Step {step + 1} of 7</span>
            </div>

            <p className="mt-3 font-display text-3xl font-bold text-wine-900 dark:text-white">{formatPrice(total)}</p>

            <div className="my-4 border-t border-cream-200/80 dark:border-stone-800" />

            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-3 font-semibold">
                <span className="text-ink-800 dark:text-gray-200">{boxes[box].name}</span>
                <span className="text-wine-800 dark:text-gold-300">{formatPrice(boxes[box].price)}</span>
              </div>

              {extras
                .filter((item) => selected.includes(item.name))
                .map((item) => (
                  <div key={item.name} className="flex justify-between gap-3 text-ink-700/80 dark:text-gray-300">
                    <span>{item.icon} {item.name}</span>
                    <span className="font-semibold">{formatPrice(item.price)}</span>
                  </div>
                ))}

              <div className="flex justify-between gap-3 text-ink-700/80 dark:text-gray-300 pt-2 border-t border-cream-200/50 dark:border-stone-800/60">
                <span>🎀 {wrapping}</span>
                <span className="text-sage-600 font-bold">Included</span>
              </div>

              <div className="flex justify-between gap-3 text-ink-700/80 dark:text-gray-300">
                <span>✍️ Custom Card & Message</span>
                <span className="text-sage-600 font-bold">Free</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-cream-200/80 dark:border-stone-800">
              <button
                onClick={buyNow}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-wine-700 to-wine-600 py-3 text-sm font-bold text-cream-50 hover:from-wine-800 hover:to-wine-700 shadow-md shadow-wine-900/20 transition-all"
              >
                <Zap className="h-4 w-4 text-gold-300" /> Complete & Order
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
