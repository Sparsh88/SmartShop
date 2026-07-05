import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Coupon from './models/Coupon.js';
import Banner from './models/Banner.js';
import Review from './models/Review.js';
import Order from './models/Order.js';

dotenv.config();

const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartshop';

const seedData = async () => {
  try {
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Coupon.deleteMany({});
    await Banner.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing database records.');

    // Seed Admin & Customer User
    const adminUser = new User({
      name: 'SmartShop Admin',
      email: 'admin@smartshop.com',
      password: 'admin123',
      role: 'admin',
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    });
    await adminUser.save();

    const customerUser = new User({
      name: 'Jane Doe',
      email: 'customer@smartshop.com',
      password: 'customer123',
      role: 'customer',
      profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      addresses: [
        {
          street: '123 Tech Park Sector 5',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          isDefault: true
        }
      ]
    });
    await customerUser.save();
    console.log('Seeded Users successfully.');

    // Seed Categories
    const categoryData = [
      {
        name: 'Laptops',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
        description: 'High-performance laptops for coding, design, and casual browsing'
      },
      {
        name: 'Shoes',
        image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500',
        description: 'Sports shoes, sneakers, and casual fashion footwear'
      },
      {
        name: 'Headphones',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500',
        description: 'Noise-canceling, bluetooth wireless premium headphones'
      },
      {
        name: 'Furniture',
        image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500',
        description: 'Ergonomic chairs, desks, and interior accessories'
      },
      {
        name: 'Clothes',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500',
        description: 'Trending hoodies, casual shirts, jackets, and premium apparel'
      },
      {
        name: 'Grocery',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        description: 'Organic coffee, dry fruits, healthy energy snacks, and daily essentials'
      }
    ];

    const categories = [];
    for (const cat of categoryData) {
      const createdCat = await Category.create(cat);
      categories.push(createdCat);
    }
    console.log('Seeded Categories successfully.');

    // Seed Banners
    await Banner.insertMany([
      {
        title: 'Mid-Year Electronics Sale',
        description: 'Upgrade your tech workspace with up to 40% discount on Laptops & Accessories.',
        image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200',
        link: '/shop?category=Laptops',
        type: 'hero'
      },
      {
        title: 'Flash Sale: Athletic Shoes',
        description: 'Flat 20% off on all premium running footwear. Valid for today only!',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
        link: '/shop?category=Shoes',
        type: 'flash'
      }
    ]);
    console.log('Seeded Banners successfully.');

    // Seed Coupons
    await Coupon.insertMany([
      {
        code: 'SMART10',
        discountType: 'percentage',
        discountValue: 10,
        minPurchase: 1000,
        maxDiscount: 2000,
        expiryDate: new Date('2027-12-31')
      },
      {
        code: 'WELCOME500',
        discountType: 'fixed',
        discountValue: 500,
        minPurchase: 3000,
        maxDiscount: 500,
        expiryDate: new Date('2027-12-31')
      }
    ]);
    console.log('Seeded Coupons successfully.');

    // Seed Products (10 items per category, total 60 items)
    const products = await Product.insertMany([
      // ==================== LAPTOPS (10 ITEMS) ====================
      {
        name: 'Dell XPS 15 Premium Laptop',
        description: 'The Dell XPS 15 offers a breathtaking infinity display, Intel i7 processor, 16GB RAM, and 512GB SSD. Perfectly configured for programming, heavy computation, and professional content creators.',
        price: 125000,
        originalPrice: 145000,
        category: 'Laptops',
        brand: 'Dell',
        stock: 12,
        images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500'],
        specs: [
          { name: 'Processor', value: 'Intel Core i7 13th Gen' },
          { name: 'RAM', value: '16GB DDR5' },
          { name: 'Storage', value: '512GB NVMe SSD' }
        ],
        rating: 4.8,
        reviewsCount: 1,
        ratingDistribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
        viewsCount: 215,
        purchaseCount: 8,
        isTrending: true
      },
      {
        name: 'HP Pavilion 14 Slim Business Laptop',
        description: 'Work and study efficiently with the lightweight HP Pavilion 14. Equipped with a Ryzen 5 chipset, 8GB RAM, and long-lasting 10-hour battery life. Includes Windows 11 Home pre-installed.',
        price: 62000,
        originalPrice: 68000,
        category: 'Laptops',
        brand: 'HP',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500'],
        specs: [
          { name: 'Processor', value: 'AMD Ryzen 5 5600U' },
          { name: 'RAM', value: '8GB DDR4' }
        ],
        rating: 4.5,
        reviewsCount: 0,
        viewsCount: 140,
        purchaseCount: 15,
        isTrending: false
      },
      {
        name: 'Lenovo IdeaPad Gaming 3 Laptop',
        description: 'Exceptional entry-level gaming device featuring NVIDIA GeForce RTX 3050 graphics, AMD Ryzen 5 CPU, 120Hz smooth refresh rate screen, and signature gaming blue backlit keyboard.',
        price: 74999,
        originalPrice: 85000,
        category: 'Laptops',
        brand: 'Lenovo',
        stock: 8,
        images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500'],
        specs: [
          { name: 'Graphics Card', value: 'NVIDIA RTX 3050 4GB' },
          { name: 'Processor', value: 'AMD Ryzen 5 6600H' }
        ],
        rating: 4.6,
        reviewsCount: 0,
        viewsCount: 180,
        purchaseCount: 22,
        isDeal: true
      },
      {
        name: 'Apple MacBook Pro 16 M3 Max',
        description: 'The ultimate laptop for developers and creatives. Powered by the groundbreaking M3 Max chip with a 16-core CPU and 40-core GPU, 36GB unified memory, and a Liquid Retina XDR 120Hz display.',
        price: 349900,
        originalPrice: 349900,
        category: 'Laptops',
        brand: 'Apple',
        stock: 5,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
        specs: [
          { name: 'Processor', value: 'Apple M3 Max 16-core' },
          { name: 'Memory', value: '36GB Unified RAM' }
        ],
        rating: 4.9,
        reviewsCount: 0,
        viewsCount: 500,
        purchaseCount: 3,
        isTrending: true
      },
      {
        name: 'ASUS ROG Zephyrus G14 Gaming Laptop',
        description: 'Incredible portability meets desktop-class performance. Features a gorgeous Nebula OLED HDR panel, AMD Ryzen 9 CPU, and RTX 4060 graphics. Housed in a premium white magnesium alloy chassis.',
        price: 154990,
        originalPrice: 179990,
        category: 'Laptops',
        brand: 'ASUS',
        stock: 6,
        images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500'],
        specs: [
          { name: 'Processor', value: 'AMD Ryzen 9 8945HS' },
          { name: 'Graphics', value: 'NVIDIA RTX 4060 8GB' }
        ],
        rating: 4.7,
        reviewsCount: 0,
        viewsCount: 160,
        purchaseCount: 4,
        isTrending: false
      },
      {
        name: 'Acer Aspire 5 Budget Laptop',
        description: 'Perfect daily driver for students and office tasks. Offers a 13th Gen Intel Core i3 chipset, 8GB expandable RAM, and a crisp Full HD display with narrow bezels.',
        price: 37990,
        originalPrice: 42990,
        category: 'Laptops',
        brand: 'Acer',
        stock: 30,
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500'],
        specs: [
          { name: 'Processor', value: 'Intel Core i3-1315U' },
          { name: 'RAM', value: '8GB DDR4' }
        ],
        rating: 4.1,
        reviewsCount: 0,
        viewsCount: 95,
        purchaseCount: 40,
        isDeal: true
      },
      {
        name: 'MSI GF63 Thin Gaming Laptop',
        description: 'Thin and light gaming notebook featuring an Intel Core i5 processor, 16GB RAM, 512GB SSD, and NVIDIA GTX 1650 graphics card. Includes red keyboard backlighting.',
        price: 52990,
        originalPrice: 59990,
        category: 'Laptops',
        brand: 'MSI',
        stock: 14,
        images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500'],
        specs: [
          { name: 'Processor', value: 'Intel Core i5-11400H' },
          { name: 'RAM', value: '16GB DDR4' }
        ],
        rating: 4.2,
        reviewsCount: 0,
        viewsCount: 88,
        purchaseCount: 19,
        isTrending: false
      },
      {
        name: 'Microsoft Surface Laptop 5',
        description: 'Sleek, lightweight, and modern touch-screen laptop. Powered by 12th Gen Intel Core i5 with Intel Evo platform certification, offering up to 18 hours of battery life and a stunning PixelSense display.',
        price: 104990,
        originalPrice: 119990,
        category: 'Laptops',
        brand: 'Microsoft',
        stock: 7,
        images: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500'],
        specs: [
          { name: 'Processor', value: 'Intel Core i5-1235U' },
          { name: 'Display', value: '13.5-inch PixelSense Touch' }
        ],
        rating: 4.6,
        reviewsCount: 0,
        viewsCount: 112,
        purchaseCount: 5,
        isTrending: false
      },
      {
        name: 'Lenovo ThinkPad X1 Carbon Gen 11',
        description: 'The legendary premium business laptop. Extremely durable carbon-fiber build, powered by Intel Core i7, 32GB RAM, and a comfortable backlit keyboard with TrackPoint.',
        price: 189990,
        originalPrice: 209990,
        category: 'Laptops',
        brand: 'Lenovo',
        stock: 4,
        images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'],
        specs: [
          { name: 'Processor', value: 'Intel Core i7-1355U' },
          { name: 'RAM', value: '32GB LPDDR5' }
        ],
        rating: 4.8,
        reviewsCount: 0,
        viewsCount: 175,
        purchaseCount: 3,
        isTrending: true
      },
      {
        name: 'HP Envy x360 2-in-1 Laptop',
        description: 'A versatile convertible touchscreen laptop. Includes a 360-degree hinge, AMD Ryzen 7 processor, 16GB RAM, and an HP stylus pen included for sketch and note taking.',
        price: 86990,
        originalPrice: 94990,
        category: 'Laptops',
        brand: 'HP',
        stock: 10,
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500'],
        specs: [
          { name: 'Processor', value: 'AMD Ryzen 7 7730U' },
          { name: 'Design', value: '2-in-1 Convertible Touchscreen' }
        ],
        rating: 4.4,
        reviewsCount: 0,
        viewsCount: 120,
        purchaseCount: 11,
        isTrending: false
      },

      // ==================== SHOES (10 ITEMS) ====================
      {
        name: 'Puma Ignite Running Shoes',
        description: 'Supercharge your daily training runs. Formulated with lightweight Ignite foam midsole, breathable mesh upper, and solid traction outsole built for high wear resistance.',
        price: 4999,
        originalPrice: 6999,
        category: 'Shoes',
        brand: 'Puma',
        stock: 35,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        specs: [
          { name: 'Type', value: 'Athletic / Running' },
          { name: 'Midsole Tech', value: 'Ignite Foam Cushioning' }
        ],
        rating: 4.4,
        reviewsCount: 0,
        viewsCount: 320,
        purchaseCount: 45,
        isTrending: true
      },
      {
        name: 'Adidas Superstar Classic Sneakers',
        description: 'The iconic street style sneakers from Adidas. Smooth leather design featuring the signature rubber shell-toe caps and triple side stripes. A must-have basic fashion accessory.',
        price: 6499,
        originalPrice: 7999,
        category: 'Shoes',
        brand: 'Adidas',
        stock: 18,
        images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500'],
        specs: [
          { name: 'Material', value: 'Genuine Grain Leather' },
          { name: 'Color', value: 'White / Black Stripes' }
        ],
        rating: 4.7,
        reviewsCount: 0,
        viewsCount: 250,
        purchaseCount: 19,
        isFlashSale: true,
        flashSaleEnd: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        name: 'Nike Air Max Cushion Running Shoes',
        description: 'Ultimate cloud-like running comfort. Employs visible Air Max heel air pods for heavy shock absorption, combined with an engineered Flyknit mesh upper for cool venting.',
        price: 12999,
        originalPrice: 14999,
        category: 'Shoes',
        brand: 'Nike',
        stock: 15,
        images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'],
        specs: [
          { name: 'Cushion', value: 'Nike Air Max Heel Unit' },
          { name: 'Upper', value: 'Breathable Flyknit Mesh' }
        ],
        rating: 4.8,
        reviewsCount: 0,
        viewsCount: 410,
        purchaseCount: 18,
        isTrending: true
      },
      {
        name: 'Reebok Classic Leather Casual Shoes',
        description: 'A timeless casual classic sneaker from Reebok. Clean, minimalist look featuring a super-soft garment leather upper and an EVA foam shock-absorbent midsole.',
        price: 5499,
        originalPrice: 5999,
        category: 'Shoes',
        brand: 'Reebok',
        stock: 22,
        images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?w=500'],
        specs: [
          { name: 'Upper', value: 'Garment Soft Leather' },
          { name: 'Midsole', value: 'Die-cut EVA cushioning' }
        ],
        rating: 4.3,
        reviewsCount: 0,
        viewsCount: 180,
        purchaseCount: 12,
        isDeal: false
      },
      {
        name: 'Asics Gel-Kayano 30 Stability Shoes',
        description: 'Elite stability running shoes. Introduces the 4D Guidance System for adaptive motion control, paired with high-performance PureGEL technology for super soft landings.',
        price: 15999,
        originalPrice: 15999,
        category: 'Shoes',
        brand: 'Asics',
        stock: 10,
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500'],
        specs: [
          { name: 'Stability Support', value: '4D Guidance System' },
          { name: 'Landing Gel', value: 'PureGEL technology' }
        ],
        rating: 4.9,
        reviewsCount: 0,
        viewsCount: 220,
        purchaseCount: 7,
        isTrending: true
      },
      {
        name: 'Nike Air Force 1 Sneakers',
        description: 'The basketball icon turned street staple. Crisp leather upper, stitched overlays, and the perfect amount of flash to make you shine. Complete with comfortable encapsulated Air cushioning.',
        price: 8999,
        originalPrice: 9999,
        category: 'Shoes',
        brand: 'Nike',
        stock: 20,
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'],
        specs: [
          { name: 'Material', value: 'Premium Leather Upper' },
          { name: 'Air Support', value: 'Encapsulated Nike Air unit' }
        ],
        rating: 4.7,
        reviewsCount: 0,
        viewsCount: 290,
        purchaseCount: 33,
        isTrending: true
      },
      {
        name: 'Adidas Ultraboost Light Running Shoes',
        description: 'The lightest Ultraboost ever made. Experience epic energy return with a Boost midsole that is 30% lighter than previous models, paired with a primeknit foot-hugging upper.',
        price: 18999,
        originalPrice: 21999,
        category: 'Shoes',
        brand: 'Adidas',
        stock: 12,
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'],
        specs: [
          { name: 'Midsole Tech', value: 'Ultraboost Light Foam' },
          { name: 'Continental Sole', value: 'Continental rubber traction' }
        ],
        rating: 4.9,
        reviewsCount: 0,
        viewsCount: 330,
        purchaseCount: 16,
        isTrending: true
      },
      {
        name: 'Puma Suede Classic Sneakers',
        description: 'An old-school Puma favorite. Crafted with premium suede leather, featuring a textured rubber cupsole and signature gold-foil branding on the side panel.',
        price: 5999,
        originalPrice: 6999,
        category: 'Shoes',
        brand: 'Puma',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'],
        specs: [
          { name: 'Material', value: 'Premium Suede Leather' },
          { name: 'Sole Type', value: 'Textured Rubber Cupsole' }
        ],
        rating: 4.5,
        reviewsCount: 0,
        viewsCount: 110,
        purchaseCount: 22,
        isTrending: false
      },
      {
        name: 'Vans Old Skool Skate Shoes',
        description: 'The timeless side-stripe skate shoe from Vans. Durable canvas and suede upper with a reinforced toe cap, supportive padded collar, and signature waffle rubber outsole.',
        price: 4499,
        originalPrice: 4999,
        category: 'Shoes',
        brand: 'Vans',
        stock: 30,
        images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500'],
        specs: [
          { name: 'Design', value: 'Low-top Lace-up Skate Shoe' },
          { name: 'Outsole', value: 'Signature Rubber Waffle' }
        ],
        rating: 4.6,
        reviewsCount: 0,
        viewsCount: 155,
        purchaseCount: 40,
        isDeal: true
      },
      {
        name: 'Converse Chuck Taylor All Star High-Top',
        description: 'The original basketball sneaker. Timeless canvas upper, white contrast stitching, star ankle patch, and double-vulcanized rubber midsole/toe guard for classic retro vibes.',
        price: 3999,
        originalPrice: 4499,
        category: 'Shoes',
        brand: 'Converse',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500'],
        specs: [
          { name: 'Upper', value: '100% Breathable Canvas' },
          { name: 'Type', value: 'High-Top Classic Sneaker' }
        ],
        rating: 4.4,
        reviewsCount: 0,
        viewsCount: 198,
        purchaseCount: 50,
        isTrending: false
      },

      // ==================== HEADPHONES (10 ITEMS) ====================
      {
        name: 'boAt Rockerz 450 Over-Ear Headphone',
        description: 'Wireless bluetooth over-ear headphone with deep bass, up to 15 hours playback backup, 40mm premium drivers, and cushiony comfortable ear cups.',
        price: 1499,
        originalPrice: 2999,
        category: 'Headphones',
        brand: 'boAt',
        stock: 60,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        specs: [
          { name: 'Driver Size', value: '40mm Dynamic' },
          { name: 'Battery Backup', value: '15 Hours Playback' }
        ],
        rating: 4.2,
        reviewsCount: 0,
        viewsCount: 450,
        purchaseCount: 95,
        isDeal: true
      },
      {
        name: 'Sony WH-1000XM4 Wireless Headset',
        description: 'Industry-leading Active Noise Canceling (ANC) headphones with smart speak-to-chat features, dual noise sensors, and 30-hour battery life. Audiophile audio performance.',
        price: 22990,
        originalPrice: 29990,
        category: 'Headphones',
        brand: 'Sony',
        stock: 15,
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500'],
        specs: [
          { name: 'ANC Type', value: 'Active Noise Canceling (HD QN1)' },
          { name: 'Battery Life', value: '30 Hours' }
        ],
        rating: 4.9,
        reviewsCount: 0,
        viewsCount: 390,
        purchaseCount: 12,
        isTrending: true
      },
      {
        name: 'Apple AirPods Max Premium Headset',
        description: 'Immersive sound engineering. Features custom high-fidelity dynamic drivers, active noise cancellation, transparency mode, spatial audio, and head tracking in a stunning aluminum cup design.',
        price: 59900,
        originalPrice: 59900,
        category: 'Headphones',
        brand: 'Apple',
        stock: 8,
        images: ['https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=500'],
        specs: [
          { name: 'Driver', value: 'Apple-designed dynamic driver' },
          { name: 'Noise Control', value: 'ANC & Transparency Mode' }
        ],
        rating: 4.8,
        reviewsCount: 0,
        viewsCount: 340,
        purchaseCount: 9,
        isTrending: false
      },
      {
        name: 'Bose QuietComfort Ultra Headphones',
        description: 'New standard in noise cancellation and spatial sound. Immersive Audio technology pushes spatial sound bounds, backed by elite Bose active noise cancellation algorithms.',
        price: 35900,
        originalPrice: 35900,
        category: 'Headphones',
        brand: 'Bose',
        stock: 10,
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500'],
        specs: [
          { name: 'Audio Tech', value: 'Bose Immersive Spatial Audio' },
          { name: 'ANC Level', value: 'Quiet, Aware & Immersion Modes' }
        ],
        rating: 4.9,
        reviewsCount: 0,
        viewsCount: 200,
        purchaseCount: 5,
        isTrending: true
      },
      {
        name: 'JBL Tune 770NC Wireless Headphones',
        description: 'Punchy bass that goes all day. Wireless over-ear headphones with adaptive noise cancellation, up to 70 hours massive battery life, and high-fidelity JBL Pure Bass sound.',
        price: 5999,
        originalPrice: 7999,
        category: 'Headphones',
        brand: 'JBL',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        specs: [
          { name: 'Sound Engine', value: 'JBL Pure Bass Sound' },
          { name: 'Battery Backup', value: 'Up to 70 Hours (Speed Charge)' }
        ],
        rating: 4.4,
        reviewsCount: 0,
        viewsCount: 150,
        purchaseCount: 30,
        isDeal: true
      },
      {
        name: 'Sennheiser HD 450BT Noise Cancelling',
        description: 'Step up to great wireless sound. Employs active noise cancellation, high-quality wireless codec support (AAC, aptX Low Latency), and up to 30 hours of battery life with USB-C fast charging.',
        price: 11990,
        originalPrice: 14990,
        category: 'Headphones',
        brand: 'Sennheiser',
        stock: 18,
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500'],
        specs: [
          { name: 'Codecs', value: 'AAC, aptX, aptX Low Latency' },
          { name: 'Battery Life', value: '30 Hours' }
        ],
        rating: 4.5,
        reviewsCount: 0,
        viewsCount: 140,
        purchaseCount: 10,
        isTrending: false
      },
      {
        name: 'Sony WH-CH720N Wireless Headphones',
        description: 'Sony lightest wireless noise-canceling headband. Features Dual Noise Sensor technology and the Integrated Processor V1 to adapt audio dynamically, plus up to 35 hours of battery life.',
        price: 9990,
        originalPrice: 14990,
        category: 'Headphones',
        brand: 'Sony',
        stock: 22,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        specs: [
          { name: 'Weight', value: '192 g (Super Light)' },
          { name: 'Processor', value: 'Sony Integrated Processor V1' }
        ],
        rating: 4.4,
        reviewsCount: 0,
        viewsCount: 180,
        purchaseCount: 20,
        isDeal: true
      },
      {
        name: 'Skullcandy Hesh ANC Wireless Over-Ear',
        description: 'Powerful, simple Active Noise Cancelling. Delivers deep, resonant bass, clear mids, and clean highs, featuring up to 22 hours battery backup and built-in Tile finding technology.',
        price: 7999,
        originalPrice: 10999,
        category: 'Headphones',
        brand: 'Skullcandy',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500'],
        specs: [
          { name: 'Tracking Tech', value: 'Built-in Tile Finding Tracker' },
          { name: 'Battery Life', value: '22 Hours' }
        ],
        rating: 4.1,
        reviewsCount: 0,
        viewsCount: 125,
        purchaseCount: 18,
        isTrending: false
      },
      {
        name: 'Jabra Elite 45h On-Ear Headphones',
        description: 'Compact, lightweight on-ear headset. Features massive 40mm drivers for rich sound, dual-microphone call technology, and a category-leading 50 hours of battery life.',
        price: 6999,
        originalPrice: 9999,
        category: 'Headphones',
        brand: 'Jabra',
        stock: 15,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        specs: [
          { name: 'Drivers Size', value: '40mm High-efficiency' },
          { name: 'Battery Life', value: '50 Hours (Industry Lead)' }
        ],
        rating: 4.3,
        reviewsCount: 0,
        viewsCount: 99,
        purchaseCount: 12,
        isTrending: false
      },
      {
        name: 'Marshall Major IV Wireless Headphones',
        description: 'The iconic Marshall sound with 80+ solid hours of wireless playtime. Features custom-tuned dynamic drivers for roaring bass, smooth mids, and brilliant treble, plus wireless charging support.',
        price: 12999,
        originalPrice: 14999,
        category: 'Headphones',
        brand: 'Marshall',
        stock: 12,
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500'],
        specs: [
          { name: 'Playtime', value: '80+ Hours Wireless' },
          { name: 'Charging', value: 'Wireless Qi Charging Enabled' }
        ],
        rating: 4.8,
        reviewsCount: 0,
        viewsCount: 220,
        purchaseCount: 9,
        isTrending: true
      },

      // ==================== FURNITURE (10 ITEMS) ====================
      {
        name: 'ErgoComfort Adjustable Office Chair',
        description: 'Ergonomic high-back workspace chair engineered with structured lumbar support, thick mesh ventilation, adjustable armrests, and 120-degree deep recline tension locks.',
        price: 11499,
        originalPrice: 15999,
        category: 'Furniture',
        brand: 'ErgoSteel',
        stock: 5,
        images: ['https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500'],
        specs: [
          { name: 'Back Support', value: 'Lumbar Memory Mesh' },
          { name: 'Recline Limit', value: '90 - 120 degrees' }
        ],
        rating: 4.6,
        reviewsCount: 0,
        viewsCount: 160,
        purchaseCount: 7,
        isTrending: false
      },
      {
        name: 'Steelcase Gesture Premium Ergonomic Chair',
        description: 'The award-winning benchmark of ergonomic engineering. Designed to support a user in diverse postures and gestures. Features dynamic back sync, armrests adjusting 360-degrees, and high load capacity.',
        price: 89900,
        originalPrice: 99900,
        category: 'Furniture',
        brand: 'Steelcase',
        stock: 4,
        images: ['https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500'],
        specs: [
          { name: 'Armrest adjustment', value: '360-degree Gesture Arms' },
          { name: 'Back Tech', value: '3D LiveBack adaptive flex' }
        ],
        rating: 5.0,
        reviewsCount: 0,
        viewsCount: 120,
        purchaseCount: 2,
        isTrending: true
      },
      {
        name: 'Autonomous SmartDesk Pro Adjustable Desk',
        description: 'Boost your workspace productivity. Height-adjustable sit-to-stand desk powered by quiet dual electric motors, featuring a heavy-duty steel frame and four programmable memory preset height locks.',
        price: 44990,
        originalPrice: 49990,
        category: 'Furniture',
        brand: 'Autonomous',
        stock: 8,
        images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500'],
        specs: [
          { name: 'Motors', value: 'Quiet Dual Electric Motors' },
          { name: 'Height range', value: '26.2 to 52 inches' }
        ],
        rating: 4.7,
        reviewsCount: 0,
        viewsCount: 190,
        purchaseCount: 5,
        isTrending: false
      },
      {
        name: 'Sleepyhead Solid Wood Office Desk',
        description: 'Elegant, sturdy, and classic. A fixed-height writing and computer table crafted from 100% genuine Sheesham solid wood, offering a rich mahogany finish and 2 spacious utility pullout drawers.',
        price: 8499,
        originalPrice: 11999,
        category: 'Furniture',
        brand: 'Sleepyhead',
        stock: 15,
        images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500'],
        specs: [
          { name: 'Material', value: 'Solid Sheesham Wood' },
          { name: 'Finish', value: 'Mahogany Polish' }
        ],
        rating: 4.4,
        reviewsCount: 0,
        viewsCount: 130,
        purchaseCount: 14,
        isFlashSale: true,
        flashSaleEnd: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        name: 'Green Soul Ergonomic Office Chair',
        description: 'Breathable high-back mesh chair featuring an adjustable headrest, structured 2D lumbar support, thick molded foam seat, and high-quality class 4 gas lift for smooth adjustment.',
        price: 8999,
        originalPrice: 12999,
        category: 'Furniture',
        brand: 'Green Soul',
        stock: 12,
        images: ['https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500'],
        specs: [
          { name: 'Gas Lift', value: 'Class 4 Heavy Duty' },
          { name: 'Headrest', value: 'Adjustable Mesh Headrest' }
        ],
        rating: 4.5,
        reviewsCount: 0,
        viewsCount: 145,
        purchaseCount: 16,
        isTrending: false
      },
      {
        name: 'Featherlite Astro Mesh Office Chair',
        description: 'A sleek, compact mesh chair ideal for modern home workspaces. Features a synchro-tilt mechanism, breathable mesh back, and fixed cushioned lumbar supports.',
        price: 6999,
        originalPrice: 8999,
        category: 'Furniture',
        brand: 'Featherlite',
        stock: 20,
        images: ['https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500'],
        specs: [
          { name: 'Mechanism', value: 'Synchro-tilt Tension' },
          { name: 'Design', value: 'Low-Back Compact Mesh' }
        ],
        rating: 4.3,
        reviewsCount: 0,
        viewsCount: 110,
        purchaseCount: 22,
        isTrending: false
      },
      {
        name: 'DeckUp Giona Engineered Wood Desk',
        description: 'Functional study table with plenty of storage. Built from high-quality particle board with laminate coating, features three side shelves and two drawers for files.',
        price: 4999,
        originalPrice: 7999,
        category: 'Furniture',
        brand: 'DeckUp',
        stock: 18,
        images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500'],
        specs: [
          { name: 'Material', value: 'Engineered Wood (Laminated)' },
          { name: 'Storage', value: '3 Shelves & 2 Drawers' }
        ],
        rating: 4.2,
        reviewsCount: 0,
        viewsCount: 135,
        purchaseCount: 17,
        isDeal: true
      },
      {
        name: 'Wakefit Minima Modern Study Table',
        description: 'Clean, minimalist computer desk featuring a powder-coated heavy metal frame and a thick particle-board tabletop with premium oak wood grain laminate finish.',
        price: 3499,
        originalPrice: 4999,
        category: 'Furniture',
        brand: 'Wakefit',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500'],
        specs: [
          { name: 'Frame', value: 'Powder-coated Mild Steel' },
          { name: 'Top Finish', value: 'Oak Wood Grain Laminate' }
        ],
        rating: 4.4,
        reviewsCount: 0,
        viewsCount: 178,
        purchaseCount: 30,
        isTrending: false
      },
      {
        name: 'Sleepyhead Ergonomic Mesh Office Chair',
        description: 'Ergonomically designed for long hours of desk work. Features a thick contoured seat cushion, high-back nylon mesh backrest with tilt tension adjustments, and dual castor wheels.',
        price: 7999,
        originalPrice: 10999,
        category: 'Furniture',
        brand: 'Sleepyhead',
        stock: 14,
        images: ['https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500'],
        specs: [
          { name: 'Lumbar support', value: 'Adjustable lumbar pad' },
          { name: 'Wheels', value: 'Dual-Wheel Nylon Castors' }
        ],
        rating: 4.5,
        reviewsCount: 0,
        viewsCount: 118,
        purchaseCount: 12,
        isTrending: false
      },
      {
        name: 'IKEA MICKE Desk with Side Shelves',
        description: 'A classic Scandinavian computer desk. Clever cable outlet panel in the back hides cables, and side drawers can be mounted on the left or right side depending on layout.',
        price: 7990,
        originalPrice: 9990,
        category: 'Furniture',
        brand: 'IKEA',
        stock: 10,
        images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500'],
        specs: [
          { name: 'Design', value: 'Scandinavian MICKE Series' },
          { name: 'Cable Management', value: 'Built-in Rear Cable Shelf' }
        ],
        rating: 4.6,
        reviewsCount: 0,
        viewsCount: 140,
        purchaseCount: 8,
        isTrending: false
      },

      // ==================== CLOTHES (10 ITEMS) ====================
      {
        name: 'Puma Classic Fleece Hoodie',
        description: 'Super-soft and warm casual hoodie from Puma. Formulated with cotton-fleece blend fabric, featuring an adjustable drawstring hood, kangaroo pockets, and subtle chest logo print.',
        price: 3499,
        originalPrice: 4499,
        category: 'Clothes',
        brand: 'Puma',
        stock: 45,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
        specs: [
          { name: 'Material', value: '80% Cotton, 20% Polyester Fleece' },
          { name: 'Fit', value: 'Relaxed Fit' }
        ],
        rating: 4.5,
        reviewsCount: 0,
        viewsCount: 280,
        purchaseCount: 38,
        isTrending: true
      },
      {
        name: 'Levis Sherpa Trucker Denim Jacket',
        description: 'The iconic denim jacket from Levis, lined with cozy warm sherpa fleece. Features a classic button-down front, dual button chest pockets, and side welt pockets. Built to last generations.',
        price: 5999,
        originalPrice: 6999,
        category: 'Clothes',
        brand: 'Levis',
        stock: 20,
        images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500'],
        specs: [
          { name: 'Outer Material', value: '100% Cotton Denim' },
          { name: 'Lining', value: '100% Polyester Sherpa fleece' }
        ],
        rating: 4.8,
        reviewsCount: 0,
        viewsCount: 310,
        purchaseCount: 15,
        isTrending: false
      },
      {
        name: 'Tommy Hilfiger Classic Fit Polo Shirt',
        description: 'A smart-casual basic essential. Made from breathable organic cotton pique knit, featuring a structured two-button collar, signature flag logo embroidery on the chest, and side slit hems.',
        price: 2499,
        originalPrice: 2999,
        category: 'Clothes',
        brand: 'Tommy Hilfiger',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500'],
        specs: [
          { name: 'Fabric', value: '100% Organic Cotton Pique' },
          { name: 'Fit', value: 'Classic Fit' }
        ],
        rating: 4.6,
        reviewsCount: 0,
        viewsCount: 190,
        purchaseCount: 28,
        isDeal: true
      },
      {
        name: 'Nike Legend Dry Fit Training T-Shirt',
        description: 'High-performance athletic workout shirt. Made with Nike signature Dri-FIT sweat-wicking lightweight polyester fabric to keep you cool, dry, and active throughout training.',
        price: 1899,
        originalPrice: 2499,
        category: 'Clothes',
        brand: 'Nike',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500'],
        specs: [
          { name: 'Tech', value: 'Nike Dri-FIT Moisture Wicking' },
          { name: 'Material', value: '100% Recycled Polyester' }
        ],
        rating: 4.7,
        reviewsCount: 0,
        viewsCount: 220,
        purchaseCount: 35,
        isTrending: true
      },
      {
        name: 'Adidas Essentials French Terry Hoodie',
        description: 'Your favorite cozy cover-up. Made with thick French terry fabric with cotton sourced sustainably. Iconic Adidas linear print across the chest and drawstring adjust hood.',
        price: 3999,
        originalPrice: 4999,
        category: 'Clothes',
        brand: 'Adidas',
        stock: 22,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
        specs: [
          { name: 'Material', value: '100% Sustainable French Terry' },
          { name: 'Pockets', value: 'Kangaroo pouch pocket' }
        ],
        rating: 4.6,
        reviewsCount: 0,
        viewsCount: 180,
        purchaseCount: 19,
        isTrending: false
      },
      {
        name: 'Levis 511 Slim Fit Men Jeans',
        description: 'A modern slim fit denim with room to move. These jeans are cut slim through the seat and thigh, with a slightly tapered leg opening. Classic five-pocket setup with zip fly.',
        price: 3499,
        originalPrice: 4499,
        category: 'Clothes',
        brand: 'Levis',
        stock: 28,
        images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500'],
        specs: [
          { name: 'Fit', value: 'Slim Fit (Tapered Leg)' },
          { name: 'Material', value: '99% Cotton, 1% Elastane Stretch' }
        ],
        rating: 4.5,
        reviewsCount: 0,
        viewsCount: 240,
        purchaseCount: 30,
        isTrending: true
      },
      {
        name: 'Puma Active Dry-Fit Sports Shorts',
        description: 'Lightweight athletic shorts engineered with Puma dryCELL active moisture management tech to draw sweat away from the skin. Elastic waistband includes internal drawcords.',
        price: 1299,
        originalPrice: 1999,
        category: 'Clothes',
        brand: 'Puma',
        stock: 45,
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500'],
        specs: [
          { name: 'Tech', value: 'Puma dryCELL Moisture control' },
          { name: 'Pockets', value: 'Dual zipper side pockets' }
        ],
        rating: 4.3,
        reviewsCount: 0,
        viewsCount: 155,
        purchaseCount: 42,
        isDeal: true
      },
      {
        name: 'Adidas Tiro Training Track Pants',
        description: 'Born on the soccer pitch, styled for the streets. Features moisture-absorbing AEROREADY technology, ankle zips for easy on-and-off, and signature three-stripes down the side.',
        price: 2999,
        originalPrice: 3999,
        category: 'Clothes',
        brand: 'Adidas',
        stock: 24,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
        specs: [
          { name: 'Technology', value: 'Adidas AEROREADY absorbs sweat' },
          { name: 'Fit', value: 'Slim tapered leg with ankle zips' }
        ],
        rating: 4.7,
        reviewsCount: 0,
        viewsCount: 290,
        purchaseCount: 41,
        isTrending: true
      },
      {
        name: 'Tommy Hilfiger Oxford Cotton Shirt',
        description: 'A timeless wardrobe essential. Features a button-down collar, structured premium Oxford cotton fabric, and the classic Tommy Hilfiger embroidered flag logo on the chest pocket.',
        price: 3999,
        originalPrice: 4999,
        category: 'Clothes',
        brand: 'Tommy Hilfiger',
        stock: 15,
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500'],
        specs: [
          { name: 'Material', value: '100% Premium Oxford Cotton' },
          { name: 'Collar', value: 'Button-Down Collar' }
        ],
        rating: 4.6,
        reviewsCount: 0,
        viewsCount: 140,
        purchaseCount: 10,
        isTrending: false
      },
      {
        name: 'Levis Classic Denim Western Shirt',
        description: 'An authentic frontier classic. Features Western-style pointed yokes on the shoulders, snap-button flap pockets on the chest, and double snap-button cuffs in a durable indigo wash.',
        price: 2999,
        originalPrice: 3999,
        category: 'Clothes',
        brand: 'Levis',
        stock: 18,
        images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500'],
        specs: [
          { name: 'Design', value: 'Western snap-button closure' },
          { name: 'Wash', value: 'Indigo Stone Wash' }
        ],
        rating: 4.5,
        reviewsCount: 0,
        viewsCount: 120,
        purchaseCount: 14,
        isTrending: false
      },

      // ==================== GROCERY (10 ITEMS) ====================
      {
        name: 'Blue Tokai Organic Coffee Beans',
        description: 'Award-winning medium roast single-origin organic arabica coffee beans, sourced directly from Attikan Estate. Offers rich notes of sweet dark chocolate, almonds, and red grapes.',
        price: 580,
        originalPrice: 690,
        category: 'Grocery',
        brand: 'Blue Tokai',
        stock: 80,
        images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500'],
        specs: [
          { name: 'Roast Type', value: 'Medium Roast' },
          { name: 'Beans Type', value: '100% Arabica' }
        ],
        rating: 4.7,
        reviewsCount: 0,
        viewsCount: 420,
        purchaseCount: 68,
        isTrending: true
      },
      {
        name: 'Happilo Premium California Almonds',
        description: 'Handpicked, raw, high-quality crunchy California almonds. Packed with vital nutrients, protein, vitamin E, healthy fats, and dietary fibers. Ideal for snack bowls and cooking.',
        price: 799,
        originalPrice: 999,
        category: 'Grocery',
        brand: 'Happilo',
        stock: 120,
        images: ['https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500'],
        specs: [
          { name: 'Type', value: 'Raw California Almonds' },
          { name: 'Nutritional Value', value: 'Rich in Protein & Vitamin E' }
        ],
        rating: 4.4,
        reviewsCount: 0,
        viewsCount: 220,
        purchaseCount: 95,
        isDeal: true
      },
      {
        name: 'YogaBar High Protein Energy Bars Pack',
        description: 'A pack of 6 delicious, wholesome energy bars packed with almonds, cranberries, oats, flax seeds, and premium whey protein. Contains no added artificial sugars or preservatives.',
        price: 420,
        originalPrice: 500,
        category: 'Grocery',
        brand: 'YogaBar',
        stock: 90,
        images: ['https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=500'],
        specs: [
          { name: 'Protein Content', value: '20g Protein per Bar' },
          { name: 'Pack Size', value: '6 Bars (60g each)' }
        ],
        rating: 4.3,
        reviewsCount: 0,
        viewsCount: 150,
        purchaseCount: 42,
        isFlashSale: true,
        flashSaleEnd: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        name: 'Blue Tokai Attikan Estate Dark Roast',
        description: 'Attikan Estate dark roast coffee beans. Boasts a heavy body with sweet, rich chocolatey undertones, low acidity, and a smooth, robust finish. Perfect for espresso pullers.',
        price: 590,
        originalPrice: 690,
        category: 'Grocery',
        brand: 'Blue Tokai',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500'],
        specs: [
          { name: 'Roast Type', value: 'Dark Roast' },
          { name: 'Flavor Notes', value: 'Dark Chocolate & Roast Nuts' }
        ],
        rating: 4.6,
        reviewsCount: 0,
        viewsCount: 130,
        purchaseCount: 30,
        isTrending: false
      },
      {
        name: 'Happilo Premium Whole Cashew Nuts',
        description: 'Premium handselected jumbo cashew nuts from Happilo. Lightly dried for maximum crispness, packed with heart-healthy minerals, copper, and magnesium. Great daily energy snack.',
        price: 899,
        originalPrice: 1099,
        category: 'Grocery',
        brand: 'Happilo',
        stock: 90,
        images: ['https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500'],
        specs: [
          { name: 'Type', value: 'Raw Jumbo Cashews' },
          { name: 'Weight', value: '500 g' }
        ],
        rating: 4.5,
        reviewsCount: 0,
        viewsCount: 140,
        purchaseCount: 55,
        isTrending: false
      },
      {
        name: 'YogaBar Multigrain Oats Pack',
        description: 'Premium rolled oats mixed with golden flax seeds, chia seeds, and real fruits. A perfect high-fiber breakfast cereal option loaded with complex carbs to start your morning.',
        price: 299,
        originalPrice: 399,
        category: 'Grocery',
        brand: 'YogaBar',
        stock: 110,
        images: ['https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=500'],
        specs: [
          { name: 'Ingredients', value: 'Rolled Oats, Chia Seeds, Flax Seeds' },
          { name: 'Fiber Weight', value: '1 kg Pack' }
        ],
        rating: 4.4,
        reviewsCount: 0,
        viewsCount: 180,
        purchaseCount: 62,
        isDeal: true
      },
      {
        name: 'Blue Tokai French Roast Coffee Powder',
        description: 'Sourced from organic estates, this French Roast represents our darkest profile. Features highly caramelized flavors, a smoky wood fragrance, and near-zero acidity. Pre-ground for drip filters.',
        price: 620,
        originalPrice: 720,
        category: 'Grocery',
        brand: 'Blue Tokai',
        stock: 35,
        images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500'],
        specs: [
          { name: 'Roast Profile', value: 'French Roast (Very Dark)' },
          { name: 'Grind Size', value: 'Medium-Fine Pre-ground' }
        ],
        rating: 4.5,
        reviewsCount: 0,
        viewsCount: 110,
        purchaseCount: 22,
        isTrending: false
      },
      {
        name: 'Happilo Premium Whole Pistachios',
        description: 'Gourmet California pistachios, lightly salted and roasted inside their shell. Rich in antioxidants and healthy proteins, perfect for guilt-free evening snacking.',
        price: 949,
        originalPrice: 1199,
        category: 'Grocery',
        brand: 'Happilo',
        stock: 75,
        images: ['https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500'],
        specs: [
          { name: 'Preparation', value: 'Roasted & Lightly Salted' },
          { name: 'Weight', value: '500 g' }
        ],
        rating: 4.6,
        reviewsCount: 0,
        viewsCount: 195,
        purchaseCount: 50,
        isDeal: true
      },
      {
        name: 'YogaBar Crunchy Peanut Butter Jar',
        description: '100% natural, slow-roasted peanuts ground into a delicious crunchy peanut butter spread. High-protein booster packed with whey isolate, containing zero hydrogenated oils.',
        price: 349,
        originalPrice: 449,
        category: 'Grocery',
        brand: 'YogaBar',
        stock: 80,
        images: ['https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=500'],
        specs: [
          { name: 'Key Ingredient', value: '100% Roasted California Peanuts' },
          { name: 'Protein Content', value: '30g Protein per 100g' }
        ],
        rating: 4.5,
        reviewsCount: 0,
        viewsCount: 160,
        purchaseCount: 44,
        isTrending: false
      },
      {
        name: 'Happilo Premium Walnut Kernels',
        description: '100% natural, raw, premium shelled Chilean walnut halves. Packed with brain-boosting Omega-3 fatty acids, antioxidants, and copper. Superb daily brain health superfood.',
        price: 1199,
        originalPrice: 1499,
        category: 'Grocery',
        brand: 'Happilo',
        stock: 65,
        images: ['https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500'],
        specs: [
          { name: 'Brain Food', value: 'High Omega-3 Fatty Acids' },
          { name: 'Weight', value: '500 g' }
        ],
        rating: 4.7,
        reviewsCount: 0,
        viewsCount: 175,
        purchaseCount: 30,
        isTrending: true
      }
    ]);
    console.log('Seeded Products successfully.');

    // Seed one sample review
    const review = new Review({
      user: customerUser._id,
      userName: customerUser.name,
      product: products[0]._id, // Dell XPS
      rating: 5,
      title: 'Absolutely incredible machine!',
      comment: 'This laptop is extremely fast and compiles programs in seconds. The battery life is decent and the screen is beautiful. Highly recommend to fellow developers.'
    });
    await review.save();
    console.log('Seeded sample Review successfully.');

    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
