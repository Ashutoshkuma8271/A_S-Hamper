export type Category = {
  id: string;
  name: string;
  tagline: string;
  image: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  tag?: string;
  is_offer?: boolean;
  original_price?: number | null;
};

export const categories: Category[] = [
  {
    id: 'birthday',
    name: 'Birthday Hampers',
    tagline: 'Confetti, cake and candlelight',
    image:
      'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'anniversary',
    name: 'Anniversary Hampers',
    tagline: 'For the years worth toasting',
    image:
      'https://images.pexels.com/photos/6822851/pexels-photo-6822851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'wedding',
    name: 'Wedding Hampers',
    tagline: 'Trousseau-worthy gifting',
    image:
      'https://images.pexels.com/photos/759495/pexels-photo-759495.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'baby-shower',
    name: 'Baby Shower Hampers',
    tagline: 'Soft, sweet and brand new',
    image:
      'https://images.pexels.com/photos/9215406/pexels-photo-9215406.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'corporate',
    name: 'Corporate Gift Hampers',
    tagline: 'Branded, bulk, beautifully done',
    image:
      'https://images.pexels.com/photos/6690454/pexels-photo-6690454.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'festival',
    name: 'Festival Hampers',
    tagline: 'Diwali, Christmas, Rakhi & more',
    image:
      'https://images.pexels.com/photos/8887279/pexels-photo-8887279.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'valentine',
    name: 'Valentine Hampers',
    tagline: 'Roses, cocoa, quiet romance',
    image:
      'https://images.pexels.com/photos/19376100/pexels-photo-19376100.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'luxury',
    name: 'Luxury Hampers',
    tagline: 'Our most extravagant baskets',
    image:
      'https://images.pexels.com/photos/8468661/pexels-photo-8468661.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export const products: Product[] = [
  {
    id: '1',
    slug: 'velvet-noir-luxe-basket',
    name: 'Velvet Noir Luxe Basket',
    category: 'luxury',
    price: 4250,
    tag: 'Best seller',
    is_offer: true,
    original_price: 4850,
    image:
      'https://images.pexels.com/photos/8468661/pexels-photo-8468661.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description:
      'Our signature wicker basket layered with single-origin chocolate, a hand-poured orchid candle and a floral tea blend.',
  },
  {
    id: '2',
    slug: 'golden-hour-birthday-box',
    name: 'Golden Hour Birthday Box',
    category: 'birthday',
    price: 2100,
    tag: 'Best seller',
    image:
      'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description:
      'Blush keepsake box with buttercream cupcakes, taper candles and a foiled personalised birthday card.',
  },
  {
    id: '3',
    slug: 'crimson-vows-anniversary',
    name: 'Crimson Vows Anniversary Hamper',
    category: 'anniversary',
    price: 3450,
    tag: 'Best seller',
    image:
      'https://images.pexels.com/photos/6822851/pexels-photo-6822851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description:
      'A dozen roses, two crystal-cut glasses and a gilded chocolate flight for the evening in.',
  },
  {
    id: '4',
    slug: 'champagne-trousseau-trunk',
    name: 'Champagne Trousseau Trunk',
    category: 'wedding',
    price: 6800,
    tag: 'Best seller',
    image:
      'https://images.pexels.com/photos/759495/pexels-photo-759495.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description:
      'A keepsake trunk for the bridal party: silk pouches, scented candles and monogrammed chocolates.',
  },
  {
    id: '5',
    slug: 'diya-diwali-tray',
    name: 'Diya Diwali Tray',
    category: 'festival',
    price: 1950,
    is_offer: true,
    original_price: 2250,
    image:
      'https://images.pexels.com/photos/8887279/pexels-photo-8887279.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description:
      'Hand-painted diyas, kaju katli, a brass diya and a marigold-garland card for the festival of lights.',
  },
  {
    id: '6',
    slug: 'little-ones-welcome-box',
    name: 'Little Ones Welcome Box',
    category: 'baby-shower',
    price: 2600,
    image:
      'https://images.pexels.com/photos/9215406/pexels-photo-9215406.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description:
      'Soft muslin swaddles, a wooden teether, almond soap and a hand-letterpressed birth announcement.',
  },
  {
    id: '7',
    slug: 'boardroom-ribbon-box',
    name: 'Boardroom Ribbon Box',
    category: 'corporate',
    price: 1500,
    image:
      'https://images.pexels.com/photos/6690454/pexels-photo-6690454.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description:
      'Branded ribbon, a ceramic mug, single-origin coffee and a foil-stamped note card with your logo.',
  },
  {
    id: '8',
    slug: 'rose-and-cocoa-set',
    name: 'Rose & Cocoa Set',
    category: 'valentine',
    price: 2300,
    image:
      'https://images.pexels.com/photos/19376100/pexels-photo-19376100.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description:
      'A velvet box of ruby truffles, a rose petal candle and a wax-sealed love letter card.',
  },
];

export const testimonials = [
  {
    quote: 'The photo card made my mother cry. Packaging felt like it cost twice the price.',
    author: 'Ananya R.',
    location: 'Bengaluru',
  },
  {
    quote: 'Ordered 60 Diwali hampers for the team. Branded ribbons, delivered to 60 addresses.',
    author: 'Vikram S.',
    location: 'Mumbai',
  },
  {
    quote: 'Built my own basket in five minutes and it arrived exactly as previewed.',
    author: 'Meera K.',
    location: 'Delhi',
  },
];

export const steps = [
  {
    n: '01',
    title: 'Pick a basket',
    body: 'Wicker, rigid keepsake box or a wooden trunk.',
  },
  {
    n: '02',
    title: 'Make it personal',
    body: 'Add items, a photo, and a hand-written card.',
  },
  {
    n: '03',
    title: 'Choose the day',
    body: 'Pick a delivery date, slot or a surprise drop.',
  },
];
