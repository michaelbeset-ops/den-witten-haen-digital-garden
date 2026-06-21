import { Link } from "react-router-dom";
import philadelphiaLogo from "@/assets/philadelphia-logo.png";

const Footer = () => (
  <footer id="contact" className="bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-serif text-lg mb-3">Den Witten Haen</h3>
        <p className="text-sm opacity-80">Groenmarkt 19-B</p>
        <p className="text-sm opacity-80">3311 BD Dordrecht</p>
        <div className="flex gap-4 mt-4">
          <a href="https://www.instagram.com/denwittenhaen/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-70 hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>
          <a href="https://www.facebook.com/DenWittenHaen/?locale=nl_NL" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="opacity-70 hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-lg mb-3">Contact</h3>
        <p className="text-sm opacity-80">Tel: <a href="tel:0786112050" className="hover:opacity-100">078 611 2050</a></p>
        <p className="text-sm opacity-80">E-mail: <a href="mailto:denwittenhaen@philadelphia.nl" className="hover:opacity-100">denwittenhaen@philadelphia.nl</a></p>
        <div className="mt-3">
          <h4 className="text-sm font-semibold mb-1">Openingstijden</h4>
          <p className="text-sm opacity-80">Ma t/m wo: 09:00 – 16:00</p>
          <p className="text-sm opacity-80">Do t/m za: 10:00 – 17:00</p>
          <p className="text-sm opacity-80">Zo: gesloten</p>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-lg mb-3">Links</h3>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">Home</Link>
          <Link to="/menu" className="opacity-80 hover:opacity-100 transition-opacity">Menu</Link>
          <Link to="/reserveren" className="opacity-80 hover:opacity-100 transition-opacity">Reserveren</Link>
          <Link to="/team" className="opacity-80 hover:opacity-100 transition-opacity">Ons Team</Link>
          <Link to="/privacy" className="opacity-80 hover:opacity-100 transition-opacity">Privacybeleid</Link>
          <Link to="/cookies" className="opacity-80 hover:opacity-100 transition-opacity">Cookiebeleid</Link>
        </div>
      </div>
    </div>

    {/* Philadelphia */}
    <div className="border-t border-primary-foreground/20 py-6">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <p className="text-xs opacity-60">Onderdeel van</p>
        <img
          src={philadelphiaLogo}
          alt="Philadelphia – Het beste uit elkaar"
          className="h-12 object-contain"
          loading="lazy"
        />
      </div>
    </div>

    <div className="border-t border-primary-foreground/10 text-center py-4 text-xs opacity-50 flex flex-col sm:flex-row items-center justify-center gap-2">
      <span>© {new Date().getFullYear()} Den Witten Haen. Alle rechten voorbehouden.</span>
      <span className="hidden sm:inline">·</span>
      <a href="https://sitefront.nl" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        Powered by Sitefront
      </a>
    </div>
  </footer>
);

export default Footer;
      <div>
        <h3 className="font-serif text-lg mb-3">Contact</h3>
        <p className="text-sm opacity-80">Tel: <a href="tel:0786112050" className="hover:opacity-100">078 611 2050</a></p>
        <p className="text-sm opacity-80">E-mail: <a href="mailto:denwittenhaen@philadelphia.nl" className="hover:opacity-100">denwittenhaen@philadelphia.nl</a></p>
        <div className="mt-3">
          <h4 className="text-sm font-semibold mb-1">Openingstijden</h4>
          <p className="text-sm opacity-80">Ma t/m wo: 09:00 – 16:00</p>
          <p className="text-sm opacity-80">Do t/m za: 10:00 – 17:00</p>
          <p className="text-sm opacity-80">Zo: gesloten</p>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-lg mb-3">Links</h3>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">Home</Link>
          <Link to="/menu" className="opacity-80 hover:opacity-100 transition-opacity">Menu</Link>
          <Link to="/reserveren" className="opacity-80 hover:opacity-100 transition-opacity">Reserveren</Link>
          <Link to="/team" className="opacity-80 hover:opacity-100 transition-opacity">Ons Team</Link>
          <Link to="/privacy" className="opacity-80 hover:opacity-100 transition-opacity">Privacybeleid</Link>
          <Link to="/cookies" className="opacity-80 hover:opacity-100 transition-opacity">Cookiebeleid</Link>
        </div>
      </div>
    </div>

    {/* Philadelphia */}
    <div className="border-t border-primary-foreground/20 py-6">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <p className="text-xs opacity-60">Onderdeel van</p>
        <img
          src={philadelphiaLogo}
          alt="Philadelphia – Het beste uit elkaar"
          className="h-12 object-contain"
          loading="lazy"
        />
      </div>
    </div>

    <div className="border-t border-primary-foreground/10 text-center py-4 text-xs opacity-50 flex flex-col sm:flex-row items-center justify-center gap-2">
      <span>© {new Date().getFullYear()} Den Witten Haen. Alle rechten voorbehouden.</span>
      <span className="hidden sm:inline">·</span>
      <a href="https://sitefront.nl" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        Powered by Sitefront
      </a>
    </div>
  </footer>
);

export default Footer;
