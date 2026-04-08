import { Link } from "react-router-dom";

const Footer = () => (
  <footer id="contact" className="bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-serif text-lg mb-3">Den Witten Haen</h3>
        <p className="text-sm opacity-80">Centrum Dordrecht</p>
        <p className="text-sm opacity-80">Voorstraat 000, 3311 XX Dordrecht</p>
      </div>
      <div>
        <h3 className="font-serif text-lg mb-3">Contact</h3>
        <p className="text-sm opacity-80">Tel: 078 – 000 00 00</p>
        <p className="text-sm opacity-80">E-mail: info@denwittenhaen.nl</p>
        <div className="mt-3">
          <h4 className="text-sm font-semibold mb-1">Openingstijden</h4>
          <p className="text-sm opacity-80">Ma t/m za: 10:00 – 17:00</p>
          <p className="text-sm opacity-80">Zo: gesloten</p>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-lg mb-3">Links</h3>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">Home</Link>
          <Link to="/menu" className="opacity-80 hover:opacity-100 transition-opacity">Menu</Link>
          <Link to="/reserveren" className="opacity-80 hover:opacity-100 transition-opacity">Reserveren</Link>
          <Link to="/privacy" className="opacity-80 hover:opacity-100 transition-opacity">Privacybeleid</Link>
          <Link to="/cookies" className="opacity-80 hover:opacity-100 transition-opacity">Cookiebeleid</Link>
        </div>
      </div>
    </div>
    <div className="border-t border-primary-foreground/20 text-center py-4 text-xs opacity-60">
      © {new Date().getFullYear()} Den Witten Haen. Alle rechten voorbehouden.
    </div>
  </footer>
);

export default Footer;
