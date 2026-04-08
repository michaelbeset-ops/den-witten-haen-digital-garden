import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/menu", label: "Menu" },
  { to: "/reserveren", label: "Reserveren" },
  { to: "/#over-ons", label: "Over ons" },
  { to: "/#contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (to: string) => {
    setOpen(false);
    if (to.startsWith("/#")) {
      const id = to.replace("/#", "");
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-serif text-xl font-bold text-foreground tracking-wide">
          Den Witten Haen
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => handleNavClick(link.to)}
              className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile */}
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
          {navLinks.map((link) => (
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
