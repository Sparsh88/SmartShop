import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';

// WhatsApp icon (not in lucide, using inline SVG)
const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.123 1.532 5.852L.057 23.886a.5.5 0 00.611.611l6.034-1.475A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.933 0-3.737-.51-5.29-1.4l-.38-.22-3.938.963.983-3.938-.23-.39A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-xl font-bold font-display tracking-tight text-white">
              SmartShop
            </span>
            <p className="text-sm">
              Your one-stop destination for premium goods. Experience clean designs, fast shipping, and safe, encrypted checkouts.
            </p>
            <div className="flex gap-4 items-center">
              <a
                href="https://www.instagram.com/sparshchauhan050"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://wa.me/917088951914"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-400 transition"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-100 font-semibold mb-4">Shop Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=electronics" className="hover:text-orange-400 transition">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-orange-400 transition">Fashion</Link></li>
              <li><Link to="/products?category=home-kitchen" className="hover:text-orange-400 transition">Home & Kitchen</Link></li>
              <li><Link to="/products?category=books" className="hover:text-orange-400 transition">Books</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-slate-100 font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="hover:text-orange-400 transition">My Account</Link></li>
              <li><Link to="/orders" className="hover:text-orange-400 transition">Order Tracking</Link></li>
              <li><a href="#" className="hover:text-orange-400 transition">Shipping Rates</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Returns & Exchanges</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-slate-100 font-semibold">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-orange-400" />
                <span>Lovely Professional University, Phagwara, Punjab – 144411</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-orange-400" />
                <a href="tel:+917088951914" className="hover:text-orange-400 transition">+91 70889 51914</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-orange-400" />
                <a href="mailto:sparshchauhan050@gmail.com" className="hover:text-orange-400 transition break-all">
                  sparshchauhan050@gmail.com
                </a>
              </li>

            </ul>
          </div>

        </div>

        <hr className="border-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SmartShop Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
