import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const leftLinks = [
  { to: "/#over-ons", label: "Over ons", active: true },
  { to: "/menu", label: "Menu", active: true },
  { to: "/groepen", label: "Groepen & Vergaderen", active: false },
];

const rightLinks = [
  { to: "/locaties", label: "Onze Locaties", active: false },
  { to: "/reserveren", label: "Reserveren", active: true },
  { to: "/#contact", label: "Contact", active: false },
];

const allLinks = [...leftLinks, ...rightLinks];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (to: string, active: boolean) => {
    if (!active) return;
    setOpen(false);
    if (to.startsWith("/#")) {
      const id = to.replace("/#", "");
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between md:justify-center relative">

        {/* Desktop: left links */}
        <div className="hidden md:flex items-center gap-5 absolute left-4 lg:left-8">
          {leftLinks.map((link) =>
            link.active ? (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => handleNavClick(link.to, link.active)}
                className={`text-sm font-sans transition-colors whitespace-nowrap ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white md:text-black md:hover:text-black/70"}`}
              >
                {link.label}
              </Link>
            ) : (
              <span
                key={link.to}
                title="Binnenkort beschikbaar"
                className={`text-sm font-sans cursor-not-allowed whitespace-nowrap select-none ${scrolled ? "text-muted-foreground/40" : "text-white/30 md:text-foreground/30"}`}
              >
                {link.label}
              </span>
            )
          )}
        </div>

        {/* Center logo */}
        <Link
          to="/"
          className={`font-serif text-xl md:text-2xl font-bold tracking-wide text-center transition-colors duration-300 ${scrolled ? "text-foreground" : "text-white md:text-black md:[text-shadow:0_1px_8px_rgba(255,255,255,0.8)]"}`}
        >
          Den Witten Haen
        </Link>

        {/* Desktop: right links */}
        <div className="hidden md:flex items-center gap-5 absolute right-4 lg:right-8">
          {rightLinks.map((link) =>
            link.active ? (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => handleNavClick(link.to, link.active)}
                className={`text-sm font-sans transition-colors whitespace-nowrap ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white md:text-black md:hover:text-black/70"}`}
              >
                {link.label}
              </Link>
            ) : (
              <span
                key={link.to}
                title="Binnenkort beschikbaar"
                className={`text-sm font-sans cursor-not-allowed whitespace-nowrap select-none ${scrolled ? "text-muted-foreground/40" : "text-white/30 md:text-foreground/30"}`}
              >
                {link.label}
              </span>
            )
          )}
        </div>

        {/* Mobile: reserve + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/reserveren">
            <Button size="sm" variant="hero">Reserveren</Button>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-foreground"
            aria-label="Menu openen"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4">
          {allLinks.map((link) =>
            link.active ? (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => handleNavClick(link.to, link.active)}
                className="block py-3 text-base font-sans text-muted-foreground hover:text-foreground border-b border-border last:border-0"
              >
                {link.label}
              </Link>
            ) : (
              <span
                key={link.to}
                className="block py-3 text-base font-sans text-muted-foreground/40 border-b border-border last:border-0 cursor-not-allowed"
              >
                {link.label}
              </span>
            )
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
