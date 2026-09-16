import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const leftLinks = [
  { to: "/#over-ons", label: "Over ons" },
  { to: "/menu", label: "Menu" },
  { to: "/groepen", label: "Groepen & Vergaderen" },
];

const rightLinks = [
  { to: "/locaties", label: "Locatie" },
  { to: "/reserveren", label: "Reserveren" },
  { to: "/#contact", label: "Contact" },
];

const allLinks = [...leftLinks, ...rightLinks];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (to: string) => {
    setOpen(false);
    if (to.startsWith("/#")) {
      const id = to.replace("/#", "");
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Lock body scroll while the mobile menu is open. Plain `overflow: hidden`
  // on <body> is unreliable on iOS Safari, so pin the body in place instead
  // and restore the scroll position on close.
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = { position: style.position, top: style.top, left: style.left, right: style.right, width: style.width };
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Sluit het mobiele menu bij navigatie (ook via browser terug/vooruit).
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  const isHome = location.pathname === "/";
  // Met geopend mobiel menu altijd een dichte balk: anders blijft de hero-foto
  // door de transparante balk heen zichtbaar boven het menu.
  const solid = !isHome || scrolled || open;

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 transition-all duration-300 ${open ? "z-[60]" : "z-50"} ${
      solid
        ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="container mx-auto px-4 h-20 md:h-24 flex items-center justify-between md:justify-center relative">

        {/* Desktop: left links */}
        <div className="hidden md:flex items-center gap-5 absolute left-4 lg:left-8">
          {leftLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => handleNavClick(link.to)}
              className={`text-sm font-sans transition-colors whitespace-nowrap ${
                solid
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-primary-foreground/80 hover:text-primary-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Center logo */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`font-serif text-xl sm:text-2xl md:text-4xl font-bold tracking-wide text-center whitespace-nowrap transition-colors ${
            solid ? "text-foreground" : "text-primary-foreground"
          }`}
        >
          Den Witten Haen
        </Link>

        {/* Desktop: right links */}
        <div className="hidden md:flex items-center gap-5 absolute right-4 lg:right-8">
          {rightLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => handleNavClick(link.to)}
              className={`text-sm font-sans transition-colors whitespace-nowrap ${
                solid
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-primary-foreground/80 hover:text-primary-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile: reserve + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/reserveren">
            <Button size="sm" variant={solid ? "hero" : "heroOutline"} className={!solid ? "border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground" : ""}>
              Reserveren
            </Button>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className={`p-2 transition-colors ${solid ? "text-foreground" : "text-primary-foreground"}`}
            aria-label={open ? "Menu sluiten" : "Menu openen"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

    </nav>

      {/* Mobiel menu, buiten <nav> gerenderd: de backdrop-blur van de balk maakt
          anders een containing block, waardoor dit vaste paneel in de balk wordt
          opgesloten en niet zichtbaar is. */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-x-0 top-20 bottom-0 z-[55] bg-background border-t border-border flex flex-col overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <nav className="flex-1 flex flex-col justify-center px-6 py-6">
            {allLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => handleNavClick(link.to)}
                className="py-3.5 font-serif text-2xl text-foreground border-b border-border last:border-0 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 pb-8 pt-4 border-t border-border">
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              Groenmarkt 19-B, 3311 BD Dordrecht<br />
              <a href="tel:0786112050" className="hover:text-foreground">078 611 20 50</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
