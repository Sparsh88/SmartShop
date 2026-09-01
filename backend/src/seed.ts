/// <reference types="node" />
import { PrismaClient, Role, DiscountType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Fashion & Clothing catalog...');

  // 1. Clean existing database in safe foreign-key order
  await prisma.notification.deleteMany().catch(() => {});
  await prisma.userProductInteraction.deleteMany().catch(() => {});
  await prisma.review.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.cartItem.deleteMany().catch(() => {});
  await prisma.cart.deleteMany().catch(() => {});
  await prisma.wishlist.deleteMany().catch(() => {});
  await prisma.address.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.coupon.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  console.log('Cleaned old records successfully.');

  // 2. Hash administrator password
  const adminHashedPassword = await bcrypt.hash('Sp@080806', 10);

  // 3. Create administrator user
  const admin = await prisma.user.create({
    data: {
      name: 'Sparsh Chauhan',
      email: 'sparshchauhan050@gmail.com',
      password: adminHashedPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  // Create initial cart and wishlist for admin
  await prisma.cart.create({
    data: {
      userId: admin.id,
    },
  });

  await prisma.wishlist.create({
    data: {
      userId: admin.id,
    },
  });

  console.log('Seeded Administrator User:', {
    admin: admin.email,
  });

  // 4. Create Fashion Categories
  const categoriesData = [
    {
      name: 'T-Shirts',
      slug: 't-shirts',
      image: '/uploads/black-crewneck-tee.jpg',
    },
    {
      name: 'Shirts',
      slug: 'shirts',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Jeans',
      slug: 'jeans',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Pants & Trousers',
      slug: 'pants-trousers',
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Jackets',
      slug: 'jackets',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Hoodies',
      slug: 'hoodies',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sweaters',
      slug: 'sweaters',
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sneakers',
      slug: 'sneakers',
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Shoes',
      slug: 'shoes',
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Full Sets / Outfits',
      slug: 'full-sets',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: cat,
    });
    categories[createdCat.slug] = createdCat;
  }
  console.log('Created categories:', Object.keys(categories));

  // 5. Create 50 Unique Clothing Products with verified URLs
  const rawProducts = [
    // 1. T-SHIRTS
    {
      name: 'Classic Cotton Crewneck T-Shirt',
      description: 'Premium 220 GSM combed organic cotton t-shirt with reinforced ribbed collar and clean tailored drape.',
      price: 699,
      discount: 15,
      stock: 75,
      rating: 4.8,
      brand: 'AuraStudio',
      images: ['/uploads/black-crewneck-tee.jpg'],
      isFeatured: true,
      isTrending: true,
      categorySlug: 't-shirts',
    },
    {
      name: 'Oversized Graphic Streetwear T-Shirt',
      description: 'Heavyweight boxy drop-shoulder tee with vintage distressed typography and soft acid wash finish.',
      price: 999,
      discount: 10,
      stock: 60,
      rating: 4.7,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: false,
      categorySlug: 't-shirts',
    },
    {
      name: 'Premium Mercerized Polo T-Shirt',
      description: 'Double-mercerized fine cotton knit polo featuring structured rib collar and mother-of-pearl buttons.',
      price: 1299,
      discount: 10,
      stock: 45,
      rating: 4.9,
      brand: 'VogueStyles',
      images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: true,
      categorySlug: 't-shirts',
    },
    {
      name: 'Casual Minimalist Printed T-Shirt',
      description: 'Breathable cotton-modal blend casual tee featuring abstract tonal chest print and split side hem.',
      price: 799,
      discount: 20,
      stock: 80,
      rating: 4.6,
      brand: 'Monochrome Co',
      images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 't-shirts',
    },
    {
      name: 'Slim Fit Basic Stretch T-Shirt',
      description: 'Ultra-soft pima cotton tee infused with 5% elastane for seamless contour and all-day flexible stretch.',
      price: 599,
      discount: 10,
      stock: 90,
      rating: 4.5,
      brand: 'AuraStudio',
      images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 't-shirts',
    },

    // 2. SHIRTS
    {
      name: 'Classic Formal Poplin Shirt',
      description: 'Crisp two-ply Egyptian cotton dress shirt with spread collar and French cuffs for sharp formal attire.',
      price: 1899,
      discount: 10,
      stock: 50,
      rating: 4.8,
      brand: 'VogueStyles',
      images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: false,
      categorySlug: 'shirts',
    },
    {
      name: 'Casual Check Flannel Overshirt',
      description: 'Brushed yarn-dyed heavyweight flannel shirt in classic earth tones with twin utility flap pockets.',
      price: 1599,
      discount: 15,
      stock: 40,
      rating: 4.7,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: true,
      categorySlug: 'shirts',
    },
    {
      name: 'Pure Linen Breathable Summer Shirt',
      description: 'Relaxed airy 100% French linen button-down shirt designed to keep you cool in warm humid weather.',
      price: 1699,
      discount: 10,
      stock: 65,
      rating: 4.9,
      brand: 'AuraStudio',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: true,
      categorySlug: 'shirts',
    },
    {
      name: 'Classic Denim Western Shirt',
      description: '8oz mid-wash cotton denim shirt with pearl snap buttons, pointed western yokes, and curved hem.',
      price: 1799,
      discount: 12,
      stock: 35,
      rating: 4.6,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'shirts',
    },
    {
      name: 'Premium Oxford Button-Down Shirt',
      description: 'Timeless basket-weave Oxford cotton casual shirt with box pleat back and durable locker loop.',
      price: 1499,
      discount: 15,
      stock: 55,
      rating: 4.8,
      brand: 'Monochrome Co',
      images: ['https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'shirts',
    },

    // 3. JEANS
    {
      name: 'Slim Fit Indigo Blue Jeans',
      description: 'Comfort stretch 12.5oz indigo denim jeans with whiskering details, slim taper, and copper rivets.',
      price: 1999,
      discount: 15,
      stock: 50,
      rating: 4.8,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: true,
      categorySlug: 'jeans',
    },
    {
      name: 'Regular Fit Jet Black Jeans',
      description: 'Stay-black reactive dyed denim jeans engineered to resist color fading through dozens of washes.',
      price: 1899,
      discount: 10,
      stock: 45,
      rating: 4.7,
      brand: 'Monochrome Co',
      images: ['https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: true,
      categorySlug: 'jeans',
    },
    {
      name: 'Vintage Distressed Denim Jeans',
      description: 'Street-styled distressed jeans with artisan hand-abraded knees, subtle paint splatter, and raw hem.',
      price: 2499,
      discount: 20,
      stock: 30,
      rating: 4.6,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: false,
      categorySlug: 'jeans',
    },
    {
      name: 'Relaxed Fit Straight Leg Jeans',
      description: 'Roomy 90s vintage skater silhouette cut from 100% rigid unwashed cotton denim with button fly.',
      price: 2199,
      discount: 10,
      stock: 40,
      rating: 4.8,
      brand: 'AuraStudio',
      images: ['https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'jeans',
    },
    {
      name: 'Light Wash Vintage Denim Jeans',
      description: 'Classic sun-bleached light cyan blue denim jeans pants with subtle tinting and relaxed tapered silhouette.',
      price: 1999,
      discount: 12,
      stock: 35,
      rating: 4.7,
      brand: 'VogueStyles',
      images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'jeans',
    },

    // 4. PANTS & TROUSERS
    {
      name: 'Slim Fit Stretch Chinos',
      description: 'Tailored flat-front cotton twill chinos with flex waistband and hidden internal coin pocket.',
      price: 1499,
      discount: 10,
      stock: 60,
      rating: 4.7,
      brand: 'VogueStyles',
      images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: true,
      categorySlug: 'pants-trousers',
    },
    {
      name: 'Multi-Pocket Tactical Cargo Pants',
      description: 'Heavy ripstop utility cargo pants with six gusseted 3D pockets, reinforced knees, and drawcord cuffs.',
      price: 1799,
      discount: 15,
      stock: 45,
      rating: 4.8,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: true,
      categorySlug: 'pants-trousers',
    },
    {
      name: 'Pleated Wide-Leg Formal Trousers',
      description: 'High-waisted double-pleated sartorial trousers tailored from drapey wool-poly blend with side adjusters.',
      price: 2299,
      discount: 10,
      stock: 30,
      rating: 4.9,
      brand: 'VogueStyles',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: false,
      categorySlug: 'pants-trousers',
    },
    {
      name: 'Relaxed Fit Linen Drawstring Pants',
      description: 'Lightweight breathable linen-cotton slacks with elasticated waist and relaxed wide leg profile.',
      price: 1399,
      discount: 10,
      stock: 70,
      rating: 4.6,
      brand: 'AuraStudio',
      images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'pants-trousers',
    },
    {
      name: 'Heavyweight Cotton Jogger Pants',
      description: '380 GSM French terry urban sweatpants joggers with thick ribbed cuffs and heavy zippered pockets.',
      price: 1299,
      discount: 15,
      stock: 55,
      rating: 4.7,
      brand: 'Monochrome Co',
      images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'pants-trousers',
    },

    // 5. JACKETS
    {
      name: 'Classic Denim Trucker Jacket',
      description: 'Iconic rugged 14oz indigo denim trucker jacket with vintage copper buttons and twin chest flap pockets.',
      price: 2499,
      discount: 15,
      stock: 40,
      rating: 4.8,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: true,
      categorySlug: 'jackets',
    },
    {
      name: 'Genuine Lambskin Leather Biker Jacket',
      description: 'Premium asymmetric zip motorcycle jacket crafted from supple full-grain lambskin with heavy silver hardware.',
      price: 5499,
      discount: 10,
      stock: 15,
      rating: 4.9,
      brand: 'VogueStyles',
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: true,
      categorySlug: 'jackets',
    },
    {
      name: 'Minimalist MA-1 Bomber Jacket',
      description: 'Military-inspired flight bomber jacket with water-resistant satin nylon shell, ribbed storm cuffs, and arm utility pocket.',
      price: 2999,
      discount: 12,
      stock: 30,
      rating: 4.7,
      brand: 'Monochrome Co',
      images: ['https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'jackets',
    },
    {
      name: 'Casual Quilted Winter Puffer Jacket',
      description: 'Ultra-warm lightweight thermal down puffer jacket with stand collar, fleece-lined pockets, and weather shield coating.',
      price: 3499,
      discount: 20,
      stock: 25,
      rating: 4.8,
      brand: 'AuraStudio',
      images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: true,
      categorySlug: 'jackets',
    },
    {
      name: 'Technical Lightweight Windbreaker Jacket',
      description: 'Packable technical windbreaker zip jacket featuring waterproof hood and storm flap protection.',
      price: 1999,
      discount: 10,
      stock: 50,
      rating: 4.6,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'jackets',
    },

    // 6. HOODIES
    {
      name: 'Classic Pullover Fleece Hoodie',
      description: 'Ultra-cozy 400 GSM brushed fleece pullover hoodie with double-layered hood and spacious kangaroo pocket.',
      price: 1699,
      discount: 15,
      stock: 70,
      rating: 4.8,
      brand: 'AuraStudio',
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: true,
      categorySlug: 'hoodies',
    },
    {
      name: 'Oversized Drop-Shoulder Street Hoodie',
      description: 'Boxy relaxed silhouette hoodie cut from organic heavy French terry with seamless shoulders and raw edge hems.',
      price: 1999,
      discount: 10,
      stock: 55,
      rating: 4.9,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: false,
      categorySlug: 'hoodies',
    },
    {
      name: 'Full Zip-Up Heavyweight Hoodie',
      description: 'High-density cotton fleece hoodie featuring full two-way metal YKK zipper and structured drawcord hood.',
      price: 1899,
      discount: 10,
      stock: 45,
      rating: 4.7,
      brand: 'Monochrome Co',
      images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: true,
      categorySlug: 'hoodies',
    },
    {
      name: 'Vintage Acid Wash Graphic Hoodie',
      description: 'Hand-dyed acid wash streetwear hoodie with subtle retro chest emblem and distressed ribbing.',
      price: 2199,
      discount: 15,
      stock: 35,
      rating: 4.6,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'hoodies',
    },
    {
      name: 'Thermal Waffle Lined Warm Hoodie',
      description: 'Dual-layer construction hoodie with insulating waffle thermal interior engineered for chilly winters.',
      price: 2299,
      discount: 12,
      stock: 40,
      rating: 4.8,
      brand: 'VogueStyles',
      images: ['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'hoodies',
    },

    // 7. SWEATERS
    {
      name: 'Traditional Cable Knit Wool Sweater',
      description: 'Rich textured Aran cable knit sweater spun from soft merino wool blend yarns for timeless winter elegance.',
      price: 2499,
      discount: 15,
      stock: 40,
      rating: 4.9,
      brand: 'VogueStyles',
      images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: true,
      categorySlug: 'sweaters',
    },
    {
      name: 'Cashmere Blend Crew Neck Sweater',
      description: 'Featherlight fine-gauge cashmere and cotton knit crewneck pullover with luxurious buttery soft handfeel.',
      price: 2999,
      discount: 10,
      stock: 30,
      rating: 4.9,
      brand: 'VogueStyles',
      images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: false,
      categorySlug: 'sweaters',
    },
    {
      name: 'Merino Wool Ribbed Turtleneck Sweater',
      description: 'Minimalist high rollneck sweater knit from 100% fine Australian merino wool with slim elegant profile.',
      price: 2799,
      discount: 10,
      stock: 25,
      rating: 4.8,
      brand: 'AuraStudio',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: true,
      categorySlug: 'sweaters',
    },
    {
      name: 'Casual Quarter-Zip Ribbed Pullover Sweater',
      description: 'Sporty tailored quarter-zip sweater with high standing mock collar and antique silver zipper pull.',
      price: 2199,
      discount: 15,
      stock: 45,
      rating: 4.7,
      brand: 'Monochrome Co',
      images: ['https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'sweaters',
    },
    {
      name: 'Chunky Mohair Buttoned Cardigan Sweater',
      description: 'Slouchy oversized cardigan sweater knit with hairy textured mohair yarn and genuine horn buttons.',
      price: 2699,
      discount: 10,
      stock: 20,
      rating: 4.8,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'sweaters',
    },

    // 8. SNEAKERS
    {
      name: 'Classic White Leather Low-Top Sneakers',
      description: 'Clean monochrome white calfskin leather sneakers with cushioned ortholite insole and vulcanized rubber sole.',
      price: 2799,
      discount: 10,
      stock: 55,
      rating: 4.8,
      brand: 'StepUp',
      images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: true,
      categorySlug: 'sneakers',
    },
    {
      name: 'Urban Air Streetwear Sneakers',
      description: 'Iconic street silhouette sneakers with premium leather panels, perforated toe box, and air cushioning.',
      price: 3499,
      discount: 15,
      stock: 40,
      rating: 4.9,
      brand: 'StepUp',
      images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: false,
      categorySlug: 'sneakers',
    },
    {
      name: 'Casual Streetwear Skate Sneakers',
      description: 'Durable flat-sole skate sneakers with reinforced suede toe cap and double-stitched canvas side panels.',
      price: 2299,
      discount: 15,
      stock: 60,
      rating: 4.7,
      brand: 'StepUp',
      images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: true,
      categorySlug: 'sneakers',
    },
    {
      name: 'Retro High-Top Basketball Court Sneakers',
      description: 'Vintage court silhouette high-top sneakers with padded ankle collar and high-traction pivot point tread.',
      price: 3199,
      discount: 12,
      stock: 30,
      rating: 4.8,
      brand: 'StepUp',
      images: ['https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'sneakers',
    },
    {
      name: 'Chunky Retro Cushioning Sneakers',
      description: 'Vintage runner inspired chunky sneakers featuring multi-layer suede mesh upper and sculpted comfort midsole.',
      price: 2899,
      discount: 10,
      stock: 45,
      rating: 4.6,
      brand: 'StepUp',
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'sneakers',
    },

    // 9. SHOES
    {
      name: 'Formal Glossy Full-Grain Leather Derby Shoes',
      description: 'Handcrafted Goodyear welted dress derby shoes in glossy full-grain leather with stacked leather heel.',
      price: 3999,
      discount: 10,
      stock: 25,
      rating: 4.9,
      brand: 'StepUp',
      images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: false,
      categorySlug: 'shoes',
    },
    {
      name: 'Handcrafted Italian Suede Loafers',
      description: 'Slip-on penny loafers sculpted from rich water-resistant Italian suede with soft memory foam footbed.',
      price: 3299,
      discount: 10,
      stock: 35,
      rating: 4.8,
      brand: 'StepUp',
      images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: true,
      categorySlug: 'shoes',
    },
    {
      name: 'Everyday Mesh Knit Walking Shoes',
      description: 'Ultra-lightweight sock-fit walking slip-ons with flexible grooved outsole for effortless all-day stride.',
      price: 1699,
      discount: 15,
      stock: 80,
      rating: 4.6,
      brand: 'StepUp',
      images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'shoes',
    },
    {
      name: 'Classic Canvas Deck Shoes',
      description: 'Minimalist vulcanized canvas boat deck shoes with 360-degree rawhide lacing and non-marking siped sole.',
      price: 1499,
      discount: 10,
      stock: 65,
      rating: 4.5,
      brand: 'StepUp',
      images: ['https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'shoes',
    },
    {
      name: 'Rugged Leather Chelsea Ankle Boots',
      description: 'Ankle-height Chelsea boots cut from heavy oiled leather with dual elastic side gores and lugged rubber sole.',
      price: 4499,
      discount: 15,
      stock: 20,
      rating: 4.9,
      brand: 'StepUp',
      images: ['https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: true,
      categorySlug: 'shoes',
    },

    // 10. FULL SETS / OUTFITS
    {
      name: 'Casual Heavy Cotton T-Shirt & Jogger Set',
      description: 'Coordinated 2-piece loungewear set featuring boxy heavyweight tee and tapered drawcord sweatpants.',
      price: 2499,
      discount: 15,
      stock: 30,
      rating: 4.8,
      brand: 'AuraStudio',
      images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: true,
      categorySlug: 'full-sets',
    },
    {
      name: 'Cozy Hoodie and Sweatpants 2-Piece Set',
      description: 'Matching premium fleece tracksuit set with drop-shoulder pullover hoodie and cuffed thermal sweatpants.',
      price: 3299,
      discount: 10,
      stock: 25,
      rating: 4.9,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: false,
      categorySlug: 'full-sets',
    },
    {
      name: 'Summer Resort Linen Shirt & Shorts Outfit Set',
      description: 'Vacation-ready pure linen matching set with camp-collar short-sleeve shirt and elasticated drawstring shorts.',
      price: 2799,
      discount: 12,
      stock: 35,
      rating: 4.7,
      brand: 'AuraStudio',
      images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: true,
      categorySlug: 'full-sets',
    },
    {
      name: 'Premium Streetwear Utility Outfit Set',
      description: 'Modern urban ensemble with nylon zip-front overshirt jacket paired with matching tactical cargo trousers.',
      price: 4199,
      discount: 15,
      stock: 20,
      rating: 4.8,
      brand: 'UrbanThread',
      images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=80'],
      isFeatured: false,
      isTrending: false,
      categorySlug: 'full-sets',
    },
    {
      name: 'Winter Tailored Overcoat & Knitwear Combination Set',
      description: 'Sophisticated winter styling set featuring double-breasted wool trench coat, merino turtleneck, and tailored slacks.',
      price: 5999,
      discount: 10,
      stock: 15,
      rating: 4.9,
      brand: 'VogueStyles',
      images: ['https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&auto=format&fit=crop&q=80'],
      isFeatured: true,
      isTrending: false,
      categorySlug: 'full-sets',
    },
  ];

  const productsData = rawProducts.map((p) => {
    const discount = p.discount || 0;
    const discountPrice = p.price - (p.price * discount) / 100;
    const targetCategory = categories[p.categorySlug] || Object.values(categories)[0];
    return {
      name: p.name,
      description: p.description,
      price: parseFloat(p.price.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      discountPrice: parseFloat(discountPrice.toFixed(2)),
      stock: p.stock,
      rating: p.rating || 4.7,
      brand: p.brand,
      images: p.images,
      isFeatured: p.isFeatured,
      isTrending: p.isTrending,
      categoryId: targetCategory.id,
    };
  });

  for (const prod of productsData) {
    await prisma.product.create({
      data: prod,
    });
  }
  console.log(`Created ${productsData.length} fashion clothing products successfully.`);

  // 6. Create Coupons
  const coupons = [
    {
      code: 'WELCOME10',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minCartValue: 999,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'FASHION500',
      discountType: DiscountType.FLAT,
      discountValue: 500,
      minCartValue: 2999,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'SUMMER20',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      minCartValue: 1999,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.create({
      data: coupon,
    });
  }
  console.log('Created coupons:', coupons.map((c) => c.code));

  console.log('Database seeding finished successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
