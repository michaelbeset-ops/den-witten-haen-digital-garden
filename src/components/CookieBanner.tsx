import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent";

/**
 * Korte melding over cookies. De site plaatst alleen een functionele
 * voorkeur in localStorage en gebruikt geen tracking, dus er valt niets te
 * kiezen: dit is een mededeling, geen toestemmingsvraag.
 */
const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Privémodus of geblokkeerde opslag: dan tonen we de melding niet.
      return;
    }
    if (seen) return;
    const t = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => setAnimate(true));
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setAnimate(false);
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, "functional");
      } catch {
        // Niets te doen: dan verschijnt de melding een volgende keer opnieuw.
      }
      setVisible(false);
    }, 250);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookiemelding"
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        animate ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-card border-t border-border shadow-lg">
        <div className="container mx-auto px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-muted-foreground font-sans leading-relaxed flex-1">
            Wij gebruiken alleen functionele cookies en volgen u niet. Meer hierover leest u in ons{" "}
            <Link to="/cookies" className="underline underline-offset-2 hover:text-primary transition-colors">
              cookiebeleid
            </Link>{" "}
            en{" "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-primary transition-colors">
              privacybeleid
            </Link>
            .
          </p>
          <Button size="sm" onClick={dismiss} className="shrink-0 w-full sm:w-auto">
            Begrepen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
