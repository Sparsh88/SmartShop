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
  createdAt: string;
  updatedAt?: string;
  categoryId?: string;
  category: FallbackCategory;
  reviews?: any[];
}

export const fallbackCategories: FallbackCategory[] = [
  {
    id: 'cat-tshirts-01',
    name: 'T-Shirts',
    slug: 't-shirts',
    image: '/uploads/black-crewneck-tee.jpg',
  },
  {
    id: 'cat-shirts-02',
    name: 'Shirts',
    slug: 'shirts',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-jeans-03',
    name: 'Jeans',
    slug: 'jeans',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-pants-04',
    name: 'Pants & Trousers',
    slug: 'pants-trousers',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-jackets-05',
    name: 'Jackets',
    slug: 'jackets',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-hoodies-06',
    name: 'Hoodies',
    slug: 'hoodies',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-sweaters-07',
    name: 'Sweaters',
    slug: 'sweaters',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-sneakers-08',
    name: 'Sneakers',
    slug: 'sneakers',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-shoes-09',
    name: 'Shoes',
    slug: 'shoes',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-fullsets-10',
    name: 'Full Sets / Outfits',
    slug: 'full-sets',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
  },
];

const catMap: Record<string, FallbackCategory> = {};
for (const cat of fallbackCategories) {
  catMap[cat.slug] = cat;
}

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
  categorySlug: string
): FallbackProduct => {
  const finalPrice = discount > 0 ? parseFloat((price * (1 - discount / 100)).toFixed(2)) : price;
  const cat = catMap[categorySlug] || fallbackCategories[0];
  return {
    id,
    name,
    description,
    price,
    discount,
    discountPrice: finalPrice,
    stock,
    rating,
    brand,
    images: [img],
    isFeatured,
    isTrending,
    categoryId: cat.id,
    category: cat,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const fallbackProducts: FallbackProduct[] = [
  // ==========================================
  // 1. T-SHIRTS (5 Products)
  // ==========================================
  makeProduct(
    'p-ts-01',
    'Classic Cotton Crewneck T-Shirt',
    'Premium 220 GSM combed organic cotton t-shirt with reinforced ribbed collar and clean tailored drape.',
    699,
    15,
    75,
    4.8,
    'AuraStudio',
    '/uploads/black-crewneck-tee.jpg',
    true,
    true,
    't-shirts'
  ),
  makeProduct(
    'p-ts-02',
    'Oversized Graphic Streetwear T-Shirt',
    'Heavyweight boxy drop-shoulder tee with vintage distressed typography and soft acid wash finish.',
    999,
    10,
    60,
    4.7,
    'UrbanThread',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    true,
    false,
    't-shirts'
  ),
  makeProduct(
    'p-ts-03',
    'Premium Mercerized Polo T-Shirt',
    'Double-mercerized fine cotton knit polo featuring structured rib collar and mother-of-pearl buttons.',
    1299,
    10,
    45,
    4.9,
    'VogueStyles',
    'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80',
    false,
    true,
    't-shirts'
  ),
  makeProduct(
    'p-ts-04',
    'Casual Minimalist Printed T-Shirt',
    'Breathable cotton-modal blend casual tee featuring abstract tonal chest print and split side hem.',
    799,
    20,
    80,
    4.6,
    'Monochrome Co',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    't-shirts'
  ),
  makeProduct(
    'p-ts-05',
    'Slim Fit Basic Stretch T-Shirt',
    'Ultra-soft pima cotton tee infused with 5% elastane for seamless contour and all-day flexible stretch.',
    599,
    10,
    90,
    4.5,
    'AuraStudio',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    't-shirts'
  ),

  // ==========================================
  // 2. SHIRTS (5 Products)
  // ==========================================
  makeProduct(
    'p-sh-01',
    'Classic Formal Poplin Shirt',
    'Crisp two-ply Egyptian cotton dress shirt with spread collar and French cuffs for sharp formal attire.',
    1899,
    10,
    50,
    4.8,
    'VogueStyles',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    true,
    false,
    'shirts'
  ),
  makeProduct(
    'p-sh-02',
    'Casual Check Flannel Overshirt',
    'Brushed yarn-dyed heavyweight flannel shirt in classic earth tones with twin utility flap pockets.',
    1599,
    15,
    40,
    4.7,
    'UrbanThread',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
    false,
    true,
    'shirts'
  ),
  makeProduct(
    'p-sh-03',
    'Pure Linen Breathable Summer Shirt',
    'Relaxed airy 100% French linen button-down shirt designed to keep you cool in warm humid weather.',
    1699,
    10,
    65,
    4.9,
    'AuraStudio',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    true,
    true,
    'shirts'
  ),
  makeProduct(
    'p-sh-04',
    'Classic Denim Western Shirt',
    '8oz mid-wash cotton denim shirt with pearl snap buttons, pointed western yokes, and curved hem.',
    1799,
    12,
    35,
    4.6,
    'UrbanThread',
    'https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'shirts'
  ),
  makeProduct(
    'p-sh-05',
    'Premium Oxford Button-Down Shirt',
    'Timeless basket-weave Oxford cotton casual shirt with box pleat back and durable locker loop.',
    1499,
    15,
    55,
    4.8,
    'Monochrome Co',
    'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'shirts'
  ),

  // ==========================================
  // 3. JEANS (5 Products)
  // ==========================================
  makeProduct(
    'p-jn-01',
    'Slim Fit Indigo Blue Jeans',
    'Comfort stretch 12.5oz indigo denim jeans with whiskering details, slim taper, and copper rivets.',
    1999,
    15,
    50,
    4.8,
    'UrbanThread',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
    true,
    true,
    'jeans'
  ),
  makeProduct(
    'p-jn-02',
    'Regular Fit Jet Black Jeans',
    'Stay-black reactive dyed denim jeans engineered to resist color fading through dozens of washes.',
    1899,
    10,
    45,
    4.7,
    'Monochrome Co',
    'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800&auto=format&fit=crop&q=80',
    false,
    true,
    'jeans'
  ),
  makeProduct(
    'p-jn-03',
    'Vintage Distressed Denim Jeans',
    'Street-styled distressed jeans with artisan hand-abraded knees, subtle paint splatter, and raw hem.',
    2499,
    20,
    30,
    4.6,
    'UrbanThread',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80',
    true,
    false,
    'jeans'
  ),
  makeProduct(
    'p-jn-04',
    'Relaxed Fit Straight Leg Jeans',
    'Roomy 90s vintage skater silhouette cut from 100% rigid unwashed cotton denim with button fly.',
    2199,
    10,
    40,
    4.8,
    'AuraStudio',
    'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'jeans'
  ),
  makeProduct(
    'p-jn-05',
    'Light Wash Vintage Denim Jeans',
    'Classic sun-bleached light cyan blue denim jeans pants with subtle tinting and relaxed tapered silhouette.',
    1999,
    12,
    35,
    4.7,
    'VogueStyles',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'jeans'
  ),

  // ==========================================
  // 4. PANTS & TROUSERS (5 Products)
  // ==========================================
  makeProduct(
    'p-pt-01',
    'Slim Fit Stretch Chinos',
    'Tailored flat-front cotton twill chinos with flex waistband and hidden internal coin pocket.',
    1499,
    10,
    60,
    4.7,
    'VogueStyles',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
    true,
    true,
    'pants-trousers'
  ),
  makeProduct(
    'p-pt-02',
    'Multi-Pocket Tactical Cargo Pants',
    'Heavy ripstop utility cargo pants with six gusseted 3D pockets, reinforced knees, and drawcord cuffs.',
    1799,
    15,
    45,
    4.8,
    'UrbanThread',
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
    false,
    true,
    'pants-trousers'
  ),
  makeProduct(
    'p-pt-03',
    'Pleated Wide-Leg Formal Trousers',
    'High-waisted double-pleated sartorial trousers tailored from drapey wool-poly blend with side adjusters.',
    2299,
    10,
    30,
    4.9,
    'VogueStyles',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80',
    true,
    false,
    'pants-trousers'
  ),
  makeProduct(
    'p-pt-04',
    'Relaxed Fit Linen Drawstring Pants',
    'Lightweight breathable linen-cotton slacks with elasticated waist and relaxed wide leg profile.',
    1399,
    10,
    70,
    4.6,
    'AuraStudio',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'pants-trousers'
  ),
  makeProduct(
    'p-pt-05',
    'Heavyweight Cotton Jogger Pants',
    '380 GSM French terry urban sweatpants joggers with thick ribbed cuffs and heavy zippered pockets.',
    1299,
    15,
    55,
    4.7,
    'Monochrome Co',
    'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'pants-trousers'
  ),

  // ==========================================
  // 5. JACKETS (5 Products)
  // ==========================================
  makeProduct(
    'p-jk-01',
    'Classic Denim Trucker Jacket',
    'Iconic rugged 14oz indigo denim trucker jacket with vintage copper buttons and twin chest flap pockets.',
    2499,
    15,
    40,
    4.8,
    'UrbanThread',
    'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=80',
    true,
    true,
    'jackets'
  ),
  makeProduct(
    'p-jk-02',
    'Genuine Lambskin Leather Biker Jacket',
    'Premium asymmetric zip motorcycle jacket crafted from supple full-grain lambskin with heavy silver hardware.',
    5499,
    10,
    15,
    4.9,
    'VogueStyles',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    true,
    true,
    'jackets'
  ),
  makeProduct(
    'p-jk-03',
    'Minimalist MA-1 Bomber Jacket',
    'Military-inspired flight bomber jacket with water-resistant satin nylon shell, ribbed storm cuffs, and arm utility pocket.',
    2999,
    12,
    30,
    4.7,
    'Monochrome Co',
    'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'jackets'
  ),
  makeProduct(
    'p-jk-04',
    'Casual Quilted Winter Puffer Jacket',
    'Ultra-warm lightweight thermal down puffer jacket with stand collar, fleece-lined pockets, and weather shield coating.',
    3499,
    20,
    25,
    4.8,
    'AuraStudio',
    'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&auto=format&fit=crop&q=80',
    false,
    true,
    'jackets'
  ),
  makeProduct(
    'p-jk-05',
    'Technical Lightweight Windbreaker Jacket',
    'Packable technical windbreaker zip jacket featuring waterproof hood and storm flap protection.',
    1999,
    10,
    50,
    4.6,
    'UrbanThread',
    'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'jackets'
  ),

  // ==========================================
  // 6. HOODIES (5 Products)
  // ==========================================
  makeProduct(
    'p-hd-01',
    'Classic Pullover Fleece Hoodie',
    'Ultra-cozy 400 GSM brushed fleece pullover hoodie with double-layered hood and spacious kangaroo pocket.',
    1699,
    15,
    70,
    4.8,
    'AuraStudio',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
    true,
    true,
    'hoodies'
  ),
  makeProduct(
    'p-hd-02',
    'Oversized Drop-Shoulder Street Hoodie',
    'Boxy relaxed silhouette hoodie cut from organic heavy French terry with seamless shoulders and raw edge hems.',
    1999,
    10,
    55,
    4.9,
    'UrbanThread',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    true,
    false,
    'hoodies'
  ),
  makeProduct(
    'p-hd-03',
    'Full Zip-Up Heavyweight Hoodie',
    'High-density cotton fleece hoodie featuring full two-way metal YKK zipper and structured drawcord hood.',
    1899,
    10,
    45,
    4.7,
    'Monochrome Co',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80',
    false,
    true,
    'hoodies'
  ),
  makeProduct(
    'p-hd-04',
    'Vintage Acid Wash Graphic Hoodie',
    'Hand-dyed acid wash streetwear hoodie with subtle retro chest emblem and distressed ribbing.',
    2199,
    15,
    35,
    4.6,
    'UrbanThread',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'hoodies'
  ),
  makeProduct(
    'p-hd-05',
    'Thermal Waffle Lined Warm Hoodie',
    'Dual-layer construction hoodie with insulating waffle thermal interior engineered for chilly winters.',
    2299,
    12,
    40,
    4.8,
    'VogueStyles',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'hoodies'
  ),

  // ==========================================
  // 7. SWEATERS (5 Products)
  // ==========================================
  makeProduct(
    'p-sw-01',
    'Traditional Cable Knit Wool Sweater',
    'Rich textured Aran cable knit sweater spun from soft merino wool blend yarns for timeless winter elegance.',
    2499,
    15,
    40,
    4.9,
    'VogueStyles',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
    true,
    true,
    'sweaters'
  ),
  makeProduct(
    'p-sw-02',
    'Cashmere Blend Crew Neck Sweater',
    'Featherlight fine-gauge cashmere and cotton knit crewneck pullover with luxurious buttery soft handfeel.',
    2999,
    10,
    30,
    4.9,
    'VogueStyles',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80',
    true,
    false,
    'sweaters'
  ),
  makeProduct(
    'p-sw-03',
    'Merino Wool Ribbed Turtleneck Sweater',
    'Minimalist high rollneck sweater knit from 100% fine Australian merino wool with slim elegant profile.',
    2799,
    10,
    25,
    4.8,
    'AuraStudio',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
    false,
    true,
    'sweaters'
  ),
  makeProduct(
    'p-sw-04',
    'Casual Quarter-Zip Ribbed Pullover Sweater',
    'Sporty tailored quarter-zip sweater with high standing mock collar and antique silver zipper pull.',
    2199,
    15,
    45,
    4.7,
    'Monochrome Co',
    'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'sweaters'
  ),
  makeProduct(
    'p-sw-05',
    'Chunky Mohair Buttoned Cardigan Sweater',
    'Slouchy oversized cardigan sweater knit with hairy textured mohair yarn and genuine horn buttons.',
    2699,
    10,
    20,
    4.8,
    'UrbanThread',
    'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'sweaters'
  ),

  // ==========================================
  // 8. SNEAKERS (5 Products)
  // ==========================================
  makeProduct(
    'p-sn-01',
    'Classic White Leather Low-Top Sneakers',
    'Clean monochrome white calfskin leather sneakers with cushioned ortholite insole and vulcanized rubber sole.',
    2799,
    10,
    55,
    4.8,
    'StepUp',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80',
    true,
    true,
    'sneakers'
  ),
  makeProduct(
    'p-sn-02',
    'Urban Air Streetwear Sneakers',
    'Iconic street silhouette sneakers with premium leather panels, perforated toe box, and air cushioning.',
    3499,
    15,
    40,
    4.9,
    'StepUp',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    true,
    false,
    'sneakers'
  ),
  makeProduct(
    'p-sn-03',
    'Casual Streetwear Skate Sneakers',
    'Durable flat-sole skate sneakers with reinforced suede toe cap and double-stitched canvas side panels.',
    2299,
    15,
    60,
    4.7,
    'StepUp',
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
    false,
    true,
    'sneakers'
  ),
  makeProduct(
    'p-sn-04',
    'Retro High-Top Basketball Court Sneakers',
    'Vintage court silhouette high-top sneakers with padded ankle collar and high-traction pivot point tread.',
    3199,
    12,
    30,
    4.8,
    'StepUp',
    'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'sneakers'
  ),
  makeProduct(
    'p-sn-05',
    'Chunky Retro Cushioning Sneakers',
    'Vintage runner inspired chunky sneakers featuring multi-layer suede mesh upper and sculpted comfort midsole.',
    2899,
    10,
    45,
    4.6,
    'StepUp',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'sneakers'
  ),

  // ==========================================
  // 9. SHOES (5 Products)
  // ==========================================
  makeProduct(
    'p-so-01',
    'Formal Glossy Full-Grain Leather Derby Shoes',
    'Handcrafted Goodyear welted dress derby shoes in glossy full-grain leather with stacked leather heel.',
    3999,
    10,
    25,
    4.9,
    'StepUp',
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80',
    true,
    false,
    'shoes'
  ),
  makeProduct(
    'p-so-02',
    'Handcrafted Italian Suede Loafers',
    'Slip-on penny loafers sculpted from rich water-resistant Italian suede with soft memory foam footbed.',
    3299,
    10,
    35,
    4.8,
    'StepUp',
    'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80',
    false,
    true,
    'shoes'
  ),
  makeProduct(
    'p-so-03',
    'Everyday Mesh Knit Walking Shoes',
    'Ultra-lightweight sock-fit walking slip-ons with flexible grooved outsole for effortless all-day stride.',
    1699,
    15,
    80,
    4.6,
    'StepUp',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'shoes'
  ),
  makeProduct(
    'p-so-04',
    'Classic Canvas Deck Shoes',
    'Minimalist vulcanized canvas boat deck shoes with 360-degree rawhide lacing and non-marking siped sole.',
    1499,
    10,
    65,
    4.5,
    'StepUp',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'shoes'
  ),
  makeProduct(
    'p-so-05',
    'Rugged Leather Chelsea Ankle Boots',
    'Ankle-height Chelsea boots cut from heavy oiled leather with dual elastic side gores and lugged rubber sole.',
    4499,
    15,
    20,
    4.9,
    'StepUp',
    'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80',
    true,
    true,
    'shoes'
  ),

  // ==========================================
  // 10. FULL SETS / OUTFITS (5 Products)
  // ==========================================
  makeProduct(
    'p-fs-01',
    'Casual Heavy Cotton T-Shirt & Jogger Set',
    'Coordinated 2-piece loungewear set featuring boxy heavyweight tee and tapered drawcord sweatpants.',
    2499,
    15,
    30,
    4.8,
    'AuraStudio',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    true,
    true,
    'full-sets'
  ),
  makeProduct(
    'p-fs-02',
    'Cozy Hoodie and Sweatpants 2-Piece Set',
    'Matching premium fleece tracksuit set with drop-shoulder pullover hoodie and cuffed thermal sweatpants.',
    3299,
    10,
    25,
    4.9,
    'UrbanThread',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
    true,
    false,
    'full-sets'
  ),
  makeProduct(
    'p-fs-03',
    'Summer Resort Linen Shirt & Shorts Outfit Set',
    'Vacation-ready pure linen matching set with camp-collar short-sleeve shirt and elasticated drawstring shorts.',
    2799,
    12,
    35,
    4.7,
    'AuraStudio',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    false,
    true,
    'full-sets'
  ),
  makeProduct(
    'p-fs-04',
    'Premium Streetwear Utility Outfit Set',
    'Modern urban ensemble with nylon zip-front overshirt jacket paired with matching tactical cargo trousers.',
    4199,
    15,
    20,
    4.8,
    'UrbanThread',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=80',
    false,
    false,
    'full-sets'
  ),
  makeProduct(
    'p-fs-05',
    'Winter Tailored Overcoat & Knitwear Combination Set',
    'Sophisticated winter styling set featuring double-breasted wool trench coat, merino turtleneck, and tailored slacks.',
    5999,
    10,
    15,
    4.9,
    'VogueStyles',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&auto=format&fit=crop&q=80',
    true,
    false,
    'full-sets'
  ),
];
