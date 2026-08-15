export interface FallbackCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface FallbackProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  discountPrice: number;
  stock: number;
  rating: number;
  brand: string;
  images: string[];
  isFeatured: boolean;
  isTrending: boolean;
  createdAt: Date;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  reviews?: any[];
}

export const fallbackCategories: FallbackCategory[] = [
  {
    id: 'cat-electronics-01',
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'cat-fashion-02',
    name: 'Fashion',
    slug: 'fashion',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'cat-home-kitchen-03',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'cat-beauty-04',
    name: 'Beauty',
    slug: 'beauty',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'cat-books-05',
    name: 'Books',
    slug: 'books',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60',
  },
];

const catMap: Record<string, FallbackCategory> = {
  electronics: fallbackCategories[0],
  fashion: fallbackCategories[1],
  'home-kitchen': fallbackCategories[2],
  beauty: fallbackCategories[3],
  books: fallbackCategories[4],
};

const makeProduct = (
  id: string,
  name: string,
  description: string,
  price: number,
  discount: number,
  stock: number,
  rating: number,
  brand: string,
  img: string,
  isFeatured: boolean,
  isTrending: boolean,
  categorySlug: 'electronics' | 'fashion' | 'home-kitchen' | 'beauty' | 'books'
): FallbackProduct => {
  const cat = catMap[categorySlug];
  const discountPrice = Math.round(price * (1 - discount / 100));
  return {
    id,
    name,
    description,
    price,
    discount,
    discountPrice,
    stock,
    rating,
    brand,
    images: [img],
    isFeatured,
    isTrending,
    createdAt: new Date('2026-01-15T10:00:00Z'),
    categoryId: cat.id,
    category: {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    },
    reviews: [
      {
        id: `rev-${id}-1`,
        rating: 5,
        comment: 'Great product for everyday use. High value for money in Indian market!',
        user: { name: 'SmartShop Buyer' },
        createdAt: new Date('2026-02-01'),
      },
    ],
  };
};

export const fallbackProducts: FallbackProduct[] = [
  // ==========================================
  // 1. ELECTRONICS - AcousticPro (10 Products) - Indian MRPs ₹699 - ₹5,499
  // ==========================================
  makeProduct('p-ap-01', 'AcousticPro Studio ANC Headphones', 'Studio-grade sound with active noise cancellation, custom drivers, and 45-hour battery.', 3499, 15, 25, 4.8, 'AcousticPro', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', true, true, 'electronics'),
  makeProduct('p-ap-02', 'AcousticPro Earbuds Pro', 'Ultra-lightweight true wireless earbuds with immersive bass, touch controls, and IPX7 sweat resistance.', 1799, 10, 45, 4.6, 'AcousticPro', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80', true, false, 'electronics'),
  makeProduct('p-ap-03', 'AcousticPro Neckband Wireless', 'Ergonomic neckband wireless earphones with high-fidelity sound, built-in mic, and quick charging.', 999, 10, 60, 4.5, 'AcousticPro', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80', false, true, 'electronics'),
  makeProduct('p-ap-04', 'AcousticPro Bluetooth Speaker', 'Powerful 360-degree wireless speaker with dual passive radiators and colorful RGB sync lighting.', 1499, 20, 30, 4.7, 'AcousticPro', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),
  makeProduct('p-ap-05', 'AcousticPro Home Soundbar', 'Premium home theater soundbar with dedicated wireless subwoofer and Dolby Atmos compatibility.', 4999, 15, 15, 4.9, 'AcousticPro', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80', true, false, 'electronics'),
  makeProduct('p-ap-06', 'AcousticPro Gaming Headset', 'Immersive 7.1 surround sound headset with noise-isolating microphone and multi-platform compatibility.', 1899, 10, 40, 4.6, 'AcousticPro', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80', false, true, 'electronics'),
  makeProduct('p-ap-07', 'AcousticPro Professional USB Mic', 'High-quality USB condenser mic perfect for recording podcasts, streaming games, and voiceovers.', 2499, 12, 12, 4.8, 'AcousticPro', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),
  makeProduct('p-ap-08', 'AcousticPro Pocket Speaker', 'Ultra-portable mini bluetooth speaker with surprisingly loud volume and 10 hours battery runtime.', 699, 15, 80, 4.4, 'AcousticPro', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),
  makeProduct('p-ap-09', 'AcousticPro Active Sports Earphones', 'In-ear sports earphones with earhooks, sweatproof coating, and crystal-clear stereo calling.', 899, 10, 55, 4.5, 'AcousticPro', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),
  makeProduct('p-ap-10', 'AcousticPro Reference Monitors', 'Desktop active studio reference monitor speakers for accurate sound engineering and playback.', 5499, 10, 10, 4.9, 'AcousticPro', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),

  // ==========================================
  // 2. ELECTRONICS - FitVibe (10 Products) - Indian MRPs ₹899 - ₹4,999
  // ==========================================
  makeProduct('p-fv-01', 'FitVibe Smartwatch Active', 'Modern smartwatch with real-time heart rate monitoring, built-in GPS, custom watchfaces, and sports modes.', 2999, 15, 50, 4.7, 'FitVibe', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80', true, true, 'electronics'),
  makeProduct('p-fv-02', 'FitVibe Fitness Tracker Band', 'Slim wellness band with sleep score analyzer, steps tracker, and calls notification alert system.', 1299, 15, 110, 4.6, 'FitVibe', 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80', false, true, 'electronics'),
  makeProduct('p-fv-03', 'FitVibe Sports GPS Watch', 'Premium multisport watch with compass, barometric altimeter, and rugged shockproof shell.', 4499, 10, 30, 4.8, 'FitVibe', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80', true, false, 'electronics'),
  makeProduct('p-fv-04', 'FitVibe Smart Tracker Ring', 'Elegant wellness ring crafted from titanium. Tracks temperature, heart rate, and steps discreetly.', 3999, 10, 20, 4.7, 'FitVibe', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),
  makeProduct('p-fv-05', 'FitVibe Pulse Chest Strap', 'Chest strap pulse monitor with high precision Bluetooth and ANT+ data broadcasting channels.', 1199, 10, 45, 4.5, 'FitVibe', 'https://images.unsplash.com/photo-1510519138197-06b8f2a08407?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),
  makeProduct('p-fv-06', 'FitVibe Hybrid Smartwatch', 'Classic physical clock watchhands merged with a stealth digital notification OLED subscreen.', 3299, 10, 25, 4.7, 'FitVibe', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),
  makeProduct('p-fv-07', 'FitVibe Rugged Outdoor Watch', 'Built for high durability outdoors. 100m water resistant casing with standard multi-day battery.', 4999, 12, 18, 4.8, 'FitVibe', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),
  makeProduct('p-fv-08', 'FitVibe Kids Activity Band', 'Brightly colored, durable tracker with gamified goals and secure parent dashboard monitoring.', 899, 20, 90, 4.4, 'FitVibe', 'https://images.unsplash.com/photo-1509741102003-ca64bfe5f069?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),
  makeProduct('p-fv-09', 'FitVibe Smart Tracker Slim', 'Ultra-thin fitness bracelet focusing on core vitals monitoring and lightweight comfortable styling.', 1099, 10, 75, 4.5, 'FitVibe', 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),
  makeProduct('p-fv-10', 'FitVibe Luxury AMOLED Watch', 'Gold-plated premium watch frame with high-definition AMOLED screen and custom leather straps.', 4999, 15, 8, 4.9, 'FitVibe', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80', false, false, 'electronics'),

  // ==========================================
  // 3. FASHION - StepUp (10 Products) - Indian MRPs ₹799 - ₹2,799
  // ==========================================
  makeProduct('p-su-01', 'StepUp Canvas Sneakers', 'Clean everyday canvas shoes featuring soft ortholite inner lining and durable vulcanized rubber soles.', 1299, 15, 85, 4.6, 'StepUp', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80', false, true, 'fashion'),
  makeProduct('p-su-02', 'StepUp Pro Running Shoes', 'Lightweight mesh upper with energetic response foam cushioning designed for runner trails.', 2199, 20, 40, 4.8, 'StepUp', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', true, true, 'fashion'),
  makeProduct('p-su-03', 'StepUp Classic Suede Loafers', 'Handcrafted slip-on loafers created from fine suede leather. Adds a smart look to casual suits.', 1799, 10, 35, 4.5, 'StepUp', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-su-04', 'StepUp Rugged Leather Boots', 'Tough ankle-high leather boots with heavy traction rubber outsoles for rough winter roads.', 2799, 15, 25, 4.7, 'StepUp', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-su-05', 'StepUp Everyday Slip-ons', 'Super-flexible mesh knit walkwear shoes. Slide in and out effortlessly without laces.', 899, 10, 95, 4.4, 'StepUp', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-su-06', 'StepUp Skate High-Tops', 'Durable flat-bottom high-top shoes featuring double stitched canvas layers and ankle support.', 1599, 10, 50, 4.6, 'StepUp', 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-su-07', 'StepUp Summer Cork Sandals', 'Ergonomic cork-bed sandals with dual adjustable buckle straps. Great for hot weather walks.', 799, 15, 70, 4.5, 'StepUp', 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-su-08', 'StepUp Knit Breathable Trainers', 'Breathable elastic sock-fit training sneakers with standard foam footbeds for gym setups.', 1499, 10, 60, 4.6, 'StepUp', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-su-09', 'StepUp Trail Running Shoes', 'Waterproof outer membrane with high-traction lug soles designed for hiking and trail routes.', 2499, 15, 30, 4.7, 'StepUp', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-su-10', 'StepUp Formal Derby Shoes', 'Glossy polished full-grain leather dress shoes. Timeless formal laces fit for office and events.', 2299, 10, 20, 4.8, 'StepUp', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),

  // ==========================================
  // 4. FASHION - VogueStyles (10 Products) - Indian MRPs ₹699 - ₹3,499
  // ==========================================
  makeProduct('p-vs-01', 'VogueStyles Bomber Faux Leather Jacket', 'Classic fit stylish jacket crafted from durable vegan leather. Premium urban aesthetic.', 2999, 15, 15, 4.9, 'VogueStyles', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80', true, true, 'fashion'),
  makeProduct('p-vs-02', 'VogueStyles Denim Utility Jacket', 'Heavyweight cotton blue jean jacket featuring reinforced pocket seams and metal buttons.', 1899, 15, 55, 4.7, 'VogueStyles', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80', false, true, 'fashion'),
  makeProduct('p-vs-03', 'VogueStyles Casual Knit Blazer', 'Comfortable textured knit stretch fabric blazer. Ideal layer to dress up basic plain shirts.', 2499, 10, 28, 4.8, 'VogueStyles', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80', true, false, 'fashion'),
  makeProduct('p-vs-04', 'VogueStyles Oversized Fleece Hoodie', 'Extra thick brushed inner cotton lining provides a very cozy warm lounge clothing profile.', 1199, 20, 80, 4.6, 'VogueStyles', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-vs-05', 'VogueStyles Tailored Linen Shirt', 'Lightweight linen blend breathable summer wear shirt. Keeps you cool in hot environments.', 999, 10, 65, 4.5, 'VogueStyles', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-vs-06', 'VogueStyles Classic Trench Coat', 'Double-breasted timeless trench coat. Essential winter and rain outer layer for professionals.', 3499, 15, 12, 4.9, 'VogueStyles', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-vs-07', 'VogueStyles Cable Knit Sweater', 'Beautiful traditional knit pattern sweater crafted from soft premium acrylic blend yarns.', 1399, 15, 40, 4.6, 'VogueStyles', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-vs-08', 'VogueStyles Slim Fit Chinos', 'Smart flat-front stretch twill pants. Versatile look for offices and dinner dates alike.', 1299, 10, 50, 4.5, 'VogueStyles', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-vs-09', 'VogueStyles Cotton Casual Shorts', 'Breathable drawstring loop shorts. Ultimate comfort outfit for casual days and weekends.', 699, 15, 90, 4.4, 'VogueStyles', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),
  makeProduct('p-vs-10', 'VogueStyles Suede Luxury Overcoat', 'Knee-length coat built from soft-brushed suede fabric. Elegant high-fashion look.', 3499, 10, 6, 4.9, 'VogueStyles', 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=80', false, false, 'fashion'),

  // ==========================================
  // 5. HOME & KITCHEN - BaristaCo (10 Products) - Indian MRPs ₹799 - ₹5,999
  // ==========================================
  makeProduct('p-bc-01', 'BaristaCo Premium Espresso Maker', 'Top-tier home espresso station with 15 bar pressure, steam wand, and automatic dosing.', 5999, 15, 12, 4.9, 'BaristaCo', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80', true, true, 'home-kitchen'),
  makeProduct('p-bc-02', 'BaristaCo Conical Burr Grinder', 'Precision coffee grinder with 40 distinct macro settings for coarse frenchpress to fine espresso.', 1899, 10, 35, 4.8, 'BaristaCo', 'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?w=600&auto=format&fit=crop&q=80', false, true, 'home-kitchen'),
  makeProduct('p-bc-03', 'BaristaCo Automatic Milk Frother', 'Hot and cold milk texturing. Indulge in thick luxurious foam layer caps for cafe lattes.', 1299, 10, 50, 4.7, 'BaristaCo', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-bc-04', 'BaristaCo Gooseneck Drip Kettle', 'Matte black gooseneck kettle with built-in analog thermometer on the lid for pour-over coffee.', 1499, 15, 20, 4.8, 'BaristaCo', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-bc-05', 'BaristaCo Cold Brew Pitcher', 'Borosilicate glass pitcher with fine mesh metal filter core for steeping smooth cold brew.', 899, 10, 80, 4.5, 'BaristaCo', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-bc-06', 'BaristaCo French Press Travel Mug', 'Double walled vacuum insulated travel mug built with an integrated plunger screen mechanism.', 799, 10, 65, 4.6, 'BaristaCo', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-bc-07', 'BaristaCo Drip Brewer Machine', 'Programmable multi-cup drip brewer. Warm plate functionality ensures fresh hot cups all morning.', 2499, 12, 18, 4.7, 'BaristaCo', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-bc-08', 'BaristaCo Precision Digital Scale', 'High accuracy food and coffee brewing scale featuring integrated autotimers and tare features.', 999, 10, 40, 4.6, 'BaristaCo', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-bc-09', 'BaristaCo Siphon Coffee Brewer', 'Stunning science-lab style vacuum siphon coffee maker. Produces clean complex flavor notes.', 2199, 15, 15, 4.8, 'BaristaCo', 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-bc-10', 'BaristaCo Double Glass Mug Set', 'Set of four double-wall thermal insulated glass mugs. Keeps hands cool and espresso hot.', 899, 15, 50, 4.7, 'BaristaCo', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),

  // ==========================================
  // 6. HOME & KITCHEN - ChefMaster (10 Products) - Indian MRPs ₹499 - ₹4,999
  // ==========================================
  makeProduct('p-cm-01', 'ChefMaster 3-Ply Stainless Cookware', 'Professional tri-ply stainless steel pots and pans cookware set with heat-resistant handles.', 4999, 20, 20, 4.9, 'ChefMaster', 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=600&auto=format&fit=crop&q=80', true, true, 'home-kitchen'),
  makeProduct('p-cm-02', 'ChefMaster Damascus Japanese Knife', 'Ultra-sharp 8-inch Damascus steel chef knife with ergonomic handle for precision cutting.', 1999, 15, 35, 4.9, 'ChefMaster', 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&auto=format&fit=crop&q=80', false, true, 'home-kitchen'),
  makeProduct('p-cm-03', 'ChefMaster Cast Iron Dutch Oven', 'Heavy enameled cast iron Dutch oven with tight-fitting lid for slow-braised stews and curries.', 2799, 10, 25, 4.8, 'ChefMaster', 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=600&auto=format&fit=crop&q=80', true, false, 'home-kitchen'),
  makeProduct('p-cm-04', 'ChefMaster Digital Air Fryer 6L', '1800W rapid air circulation fryer with 12 preset cooking modes and non-stick dishwasher basket.', 3999, 20, 40, 4.7, 'ChefMaster', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-cm-05', 'ChefMaster Bamboo Cutting Board', 'Organic extra-large antimicrobial bamboo carving board with deep juice grooves.', 699, 15, 80, 4.6, 'ChefMaster', 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-cm-06', 'ChefMaster Stand Mixer', '1000W planetary motion baking mixer with dough hook, wire whisk, and flat beater attachments.', 4999, 15, 15, 4.8, 'ChefMaster', 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-cm-07', 'ChefMaster Silicone Utensil Set', '12-piece heat-resistant silicone kitchen cooking utensil tools with natural beechwood handles.', 899, 15, 60, 4.6, 'ChefMaster', 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-cm-08', 'ChefMaster Immersion Hand Blender', '800W variable speed stainless steel stick blender with chopper attachment and whisk.', 1399, 10, 50, 4.5, 'ChefMaster', 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-cm-09', 'ChefMaster Hard-Anodized Wok', '12-inch flat-bottom stir-fry nonstick wok with tempered glass lid and helper handle.', 1499, 10, 45, 4.7, 'ChefMaster', 'https://images.unsplash.com/photo-1584990347449-3893c52a0a23?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),
  makeProduct('p-cm-10', 'ChefMaster Digital Food Thermometer', 'Instant-read 2-second food and oil thermometer with backlit display and waterproof rating.', 499, 10, 95, 4.8, 'ChefMaster', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', false, false, 'home-kitchen'),

  // ==========================================
  // 7. BEAUTY - GlowRx (10 Products) - Indian MRPs ₹349 - ₹999
  // ==========================================
  makeProduct('p-gr-01', 'GlowRx Hyaluronic Face Serum', 'Intense hydration serum featuring pure hyaluronic acid, organic extract, and vitamin B5.', 599, 15, 65, 4.7, 'GlowRx', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-gr-02', 'GlowRx Ultra Hydrating Cream', 'Rich cream focusing on reinforcing weak moisture barriers. Locks skin hydration for 24 hours.', 749, 15, 50, 4.8, 'GlowRx', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80', true, true, 'beauty'),
  makeProduct('p-gr-03', 'GlowRx Matte Sunscreen SPF 50', 'Broad spectrum gel block sunscreen. Non-greasy matte finish leaves no chalky white cast.', 449, 10, 120, 4.6, 'GlowRx', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80', false, true, 'beauty'),
  makeProduct('p-gr-04', 'GlowRx Amino Gentle Cleanser', 'Gentle pH-balanced foaming face wash with amino acids. Cleans without stripping natural skin oils.', 399, 15, 95, 4.5, 'GlowRx', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-gr-05', 'GlowRx Anti-Aging Retinol Cream', 'Encapsulated retinol complex cream. Visibly reduces fine lines and improves skin turnover.', 899, 10, 40, 4.8, 'GlowRx', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-gr-06', 'GlowRx Vitamin C Brightening Mask', 'Clay mask infused with stable Vitamin C esters and kaolin clay. Unclogs pores and brightens skin.', 499, 15, 60, 4.6, 'GlowRx', 'https://images.unsplash.com/photo-1567928815116-3e0e92271810?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-gr-07', 'GlowRx Niacinamide Face Serum', '10% Niacinamide + 1% Zinc PCA serum. Shrinks enlarged pores and minimizes breakout blemishes.', 549, 12, 75, 4.7, 'GlowRx', 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-gr-08', 'GlowRx Exfoliating Face Scrub', 'Extremely fine micro-dermabrasion particles smoothly buff away flaky layers of dead skin.', 349, 10, 80, 4.5, 'GlowRx', 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-gr-09', 'GlowRx Under Eye Caffeine Gel', 'Soothing cooling caffeine peptide eye gel. Instantly depuffs dark circles and fatigue bags.', 649, 15, 45, 4.6, 'GlowRx', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-gr-10', 'GlowRx Squalane Night Oil', 'Luxury squalane and jojoba sleep oil. Nourishes skin cells deeply to restore bounce by morning.', 999, 10, 30, 4.9, 'GlowRx', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),

  // ==========================================
  // 8. BEAUTY - PureEssence (10 Products) - Indian MRPs ₹299 - ₹799
  // ==========================================
  makeProduct('p-pe-01', 'PureEssence Botanical Face Elixir', 'Cold-pressed rosehip and argan oil blend for luminous youthful skin glow.', 799, 15, 45, 4.8, 'PureEssence', 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80', true, true, 'beauty'),
  makeProduct('p-pe-02', 'PureEssence Soothing Aloe Toner Mist', 'Alcohol-free calming toner mist formulated with 90% pure organic aloe vera extract.', 399, 10, 90, 4.6, 'PureEssence', 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&auto=format&fit=crop&q=80', false, true, 'beauty'),
  makeProduct('p-pe-03', 'PureEssence Green Tea Eye Serum', 'Antioxidant-rich fermented green tea extract serum that diminishes puffiness and fine lines.', 699, 10, 55, 4.7, 'PureEssence', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80', true, false, 'beauty'),
  makeProduct('p-pe-04', 'PureEssence Shea Butter Body Balm', 'Ultra-nourishing whipped shea butter infused with sweet almond oil and vanilla notes.', 499, 15, 70, 4.7, 'PureEssence', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-pe-05', 'PureEssence Bamboo Charcoal Detox Mask', 'Activated bamboo charcoal clay mask for pulling deep impurities and unclogging pores.', 449, 10, 85, 4.5, 'PureEssence', 'https://images.unsplash.com/photo-1567928815116-3e0e92271810?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-pe-06', 'PureEssence Peptide Lip Repair Balm', 'Overnight plumping lip treatment balm with ceramides and natural berry extracts.', 299, 10, 110, 4.6, 'PureEssence', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-pe-07', 'PureEssence Probiotic Milky Cleanser', 'Gentle barrier-repair milky cleanser enriched with bifida ferment lysate and oat milk.', 499, 12, 60, 4.7, 'PureEssence', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-pe-08', 'PureEssence Centella Calming Gel', 'Fast-absorbing soothing gel for irritated, sunburned, or acne-prone skin types.', 379, 10, 95, 4.6, 'PureEssence', 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-pe-09', 'PureEssence Vegan Collagen Day Cream', 'Lightweight anti-wrinkle day moisturizer with SPF 30 and plant micro-collagen.', 749, 15, 40, 4.8, 'PureEssence', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),
  makeProduct('p-pe-10', 'PureEssence Rosewater Floral Mist', 'Refreshing floral hydration spray that locks in makeup and revives tired, dry skin.', 299, 10, 130, 4.5, 'PureEssence', 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&auto=format&fit=crop&q=80', false, false, 'beauty'),

  // ==========================================
  // 9. BOOKS - Penguin Books (10 Products) - Indian MRPs ₹349 - ₹1,199
  // ==========================================
  makeProduct('p-pb-01', 'Atomic Habits (James Clear)', 'An easy & proven way to build good habits and break bad ones. The global bestseller on self-growth.', 499, 20, 120, 4.9, 'Penguin Books', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', true, true, 'books'),
  makeProduct('p-pb-02', 'Thinking, Fast and Slow (Daniel Kahneman)', 'Explores the two systems that drive human choices: fast intuitive thinking, and slow logical analysis.', 449, 15, 80, 4.8, 'Penguin Books', 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80', true, false, 'books'),
  makeProduct('p-pb-03', 'The Power of Habit (Charles Duhigg)', 'Award-winning science reporter explains why habits exist and how to rewire behavioral routines.', 399, 10, 95, 4.7, 'Penguin Books', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80', false, true, 'books'),
  makeProduct('p-pb-04', 'Clean Code (Robert C. Martin)', 'A handbook of agile software craftsmanship. Teaches programmers how to write maintainable code.', 799, 15, 50, 4.9, 'Penguin Books', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-pb-05', 'The Pragmatic Programmer (Andy Hunt)', 'Essential handbook detailing practical coding practices, system design, and developer mindsets.', 849, 10, 45, 4.9, 'Penguin Books', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-pb-06', 'Introduction to Algorithms (CLRS)', 'The global standard textbook providing thorough analyses and implementations of algorithms.', 1199, 10, 30, 4.8, 'Penguin Books', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-pb-07', 'Zero to One (Peter Thiel)', 'Notes on startups, or how to build the future. Legendary builder shares insights on creating new value.', 349, 15, 150, 4.7, 'Penguin Books', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-pb-08', 'Start with Why (Simon Sinek)', 'How great leaders inspire everyone to take action by starting with the fundamental purpose behind vision.', 379, 10, 105, 4.6, 'Penguin Books', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-pb-09', 'Deep Work (Cal Newport)', 'Rules for focused success in a distracted world. Master complex skills and produce top tier output.', 399, 15, 115, 4.8, 'Penguin Books', 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-pb-10', 'Sapiens (Yuval Noah Harari)', 'A brief history of humankind. Examines cognitive, agricultural, and scientific milestones of our species.', 499, 10, 90, 4.9, 'Penguin Books', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', false, false, 'books'),

  // ==========================================
  // 10. BOOKS - ReadWell Publishing (10 Products) - Indian MRPs ₹279 - ₹999
  // ==========================================
  makeProduct('p-rw-01', 'The Psychology of Money (Morgan Housel)', 'Timeless lessons on wealth, greed, and happiness. How human behavior drives financial success.', 349, 15, 140, 4.9, 'ReadWell Publishing', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', true, true, 'books'),
  makeProduct('p-rw-02', 'Show Your Work! (Austin Kleon)', '10 ways to share your creativity and get discovered. A guide to making your work visible online.', 299, 10, 95, 4.7, 'ReadWell Publishing', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80', false, true, 'books'),
  makeProduct('p-rw-03', 'Designing Data-Intensive Applications', 'The definitive guide to the architecture, scalability, and reliability of modern distributed systems.', 999, 15, 40, 4.9, 'ReadWell Publishing', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80', true, false, 'books'),
  makeProduct('p-rw-04', 'System Design Interview (Alex Xu)', 'An insider guide to mastering high-scale distributed software system design interviews.', 899, 10, 60, 4.9, 'ReadWell Publishing', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-rw-05', 'Man Search for Meaning (Viktor Frankl)', 'A psychiatrist experience in concentration camps and his psychotherapeutic method of finding purpose.', 279, 10, 110, 4.8, 'ReadWell Publishing', 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-rw-06', 'Essentialism (Greg McKeown)', 'The disciplined pursuit of less. How to focus only on what is truly essential to accomplish more.', 369, 15, 85, 4.7, 'ReadWell Publishing', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-rw-07', 'Refactoring (Martin Fowler)', 'Improving the design of existing code. A comprehensive handbook with concrete practical code patterns.', 949, 10, 35, 4.8, 'ReadWell Publishing', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-rw-08', 'Grit: The Power of Passion (Angela Duckworth)', 'Pioneering psychologist shows why passion and persistence trump innate talent for high achievement.', 389, 10, 90, 4.6, 'ReadWell Publishing', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-rw-09', 'Hooked: How to Build Habit-Forming Products', 'A four-step process for creating products that users love and return to repeatedly.', 429, 15, 70, 4.7, 'ReadWell Publishing', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
  makeProduct('p-rw-10', 'Never Split the Difference (Chris Voss)', 'Negotiating as if your life depended on it. Practical hostage-negotiation tactics for business and life.', 449, 15, 125, 4.9, 'ReadWell Publishing', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80', false, false, 'books'),
];
