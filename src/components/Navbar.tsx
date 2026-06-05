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
  { to: "/locaties", label: "Onze Locaties" },
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

  const isHome = location.pathname === "/";
  const solid = !isHome || scrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      solid
        ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="container mx-auto px-4 h-24 flex items-center justify-between md:justify-center relative">

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
          className={`font-serif text-2xl md:text-4xl font-bold tracking-wide text-center transition-colors ${
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
            aria-label="Menu openen"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4">
          {allLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => handleNavClick(link.to)}
              className="block py-3 text-base font-sans text-muted-foreground hover:text-foreground border-b border-border last:border-0"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
