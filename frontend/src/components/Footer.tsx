import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from './ScrollReveal';

// WhatsApp icon SVG
const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.123 1.532 5.852L.057 23.886a.5.5 0 00.611.611l6.034-1.475A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.933 0-3.737-.51-5.29-1.4l-.38-.22-3.938.963.983-3.938-.23-.39A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#121214] border-t border-neutral-200/80 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollRevealGroup staggerDelay={0.1} delayChildren={0.05} className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <ScrollRevealItem direction="up" distance={20}>
            <div className="space-y-4">
              <span className="font-editorial text-2xl font-black tracking-tight text-neutral-900 dark:text-white uppercase block">
                SMARTSHOP
              </span>
              <p className="text-xs sm:text-sm leading-relaxed">
                Your premier destination for high-end fashion, luxury apparel, and designer outerwear. Crafted for effortless modern aesthetics.
              </p>
              <div className="flex gap-3 items-center pt-2">
                <a
                  href="https://www.instagram.com/sparshchauhan050"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#F4F3EF] dark:bg-[#1E1E22] text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center justify-center transition"
                  aria-label="Instagram"
                >
                  <Instagram size={17} />
                </a>
                <a
                  href="https://wa.me/917088951914"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#F4F3EF] dark:bg-[#1E1E22] text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center justify-center transition"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon size={17} />
                </a>
              </div>
            </div>
          </ScrollRevealItem>

          {/* Quick Links */}
          <ScrollRevealItem direction="up" distance={20}>
            <div>
              <h4 className="font-editorial text-neutral-900 dark:text-white font-bold text-xs uppercase tracking-widest mb-4">
                Shop Apparel
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><Link to="/products" className="hover:text-neutral-900 dark:hover:text-white transition">All Clothing</Link></li>
                <li><Link to="/products?category=jackets" className="hover:text-neutral-900 dark:hover:text-white transition">Outerwear & Jackets</Link></li>
                <li><Link to="/products?category=hoodies" className="hover:text-neutral-900 dark:hover:text-white transition">Hoodies & Sweatshirts</Link></li>
                <li><Link to="/products?category=pants-trousers" className="hover:text-neutral-900 dark:hover:text-white transition">Pants & Trousers</Link></li>
                <li><Link to="/products?category=sneakers" className="hover:text-neutral-900 dark:hover:text-white transition">Footwear & Sneakers</Link></li>
              </ul>
            </div>
          </ScrollRevealItem>

          {/* Customer Care */}
          <ScrollRevealItem direction="up" distance={20}>
            <div>
              <h4 className="font-editorial text-neutral-900 dark:text-white font-bold text-xs uppercase tracking-widest mb-4">
                Customer Care
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><Link to="/profile" className="hover:text-neutral-900 dark:hover:text-white transition">My Profile</Link></li>
                <li><Link to="/orders" className="hover:text-neutral-900 dark:hover:text-white transition">Track Order</Link></li>
                <li><Link to="/wishlist" className="hover:text-neutral-900 dark:hover:text-white transition">Wishlist Items</Link></li>
                <li><Link to="/cart" className="hover:text-neutral-900 dark:hover:text-white transition">Shopping Bag</Link></li>
              </ul>
            </div>
          </ScrollRevealItem>

          {/* Contact Info */}
          <ScrollRevealItem direction="up" distance={20}>
            <div className="space-y-4">
              <h4 className="font-editorial text-neutral-900 dark:text-white font-bold text-xs uppercase tracking-widest">
                Contact & Studio
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-neutral-900 dark:text-white" />
                  <span>Lovely Professional University, Phagwara, Punjab – 144411</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone size={16} className="shrink-0 text-neutral-900 dark:text-white" />
                  <a href="tel:+917088951914" className="hover:text-neutral-900 dark:hover:text-white transition">+91 70889 51914</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail size={16} className="shrink-0 text-neutral-900 dark:text-white" />
                  <a href="mailto:sparshchauhan050@gmail.com" className="hover:text-neutral-900 dark:hover:text-white transition break-all">
                    sparshchauhan050@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </ScrollRevealItem>

        </ScrollRevealGroup>

        <div className="my-10 border-t border-neutral-100 dark:border-neutral-800" />

        <ScrollReveal direction="up" distance={15} duration={0.5}>
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-400 gap-4">
            <p>© {new Date().getFullYear()} SmartShop Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition">Shipping Policy</a>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </footer>
  );
}
