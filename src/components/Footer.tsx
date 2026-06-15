import { Link } from "react-router-dom";
import philadelphiaLogo from "@/assets/philadelphia-logo.png";

const Footer = () => (
  <footer id="contact" className="bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-serif text-lg mb-3">Den Witten Haen</h3>
        <p className="text-sm opacity-80">Groenmarkt 19-B</p>
        <p className="text-sm opacity-80">3311 BD Dordrecht</p>
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
