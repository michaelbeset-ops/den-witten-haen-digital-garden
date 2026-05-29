import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay so the banner slides in after page load
      const t = setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => setAnimate(true));
      }, 600);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = (type: "functional" | "all") => {
    setAnimate(false);
    setTimeout(() => {
      localStorage.setItem("cookie-consent", type);
      setVisible(false);
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookiemelding"
      aria-live="polite"
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        animate ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-card border-t border-border shadow-2xl">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Icon + text */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Cookie className="text-primary shrink-0 mt-0.5" size={20} aria-hidden="true" />
              <div>
                <p className="font-sans font-semibold text-sm text-foreground mb-1">
                  Wij gebruiken cookies
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Functionele cookies zijn altijd actief. Met uw toestemming plaatsen wij ook analytische
                  cookies (Google Analytics) om onze website te verbeteren. Lees meer in ons{" "}
                  <Link to="/cookies" className="underline underline-offset-2 hover:text-primary transition-colors">
                    cookiebeleid
                  </Link>{" "}
                  en{" "}
                  <Link to="/privacy" className="underline underline-offset-2 hover:text-primary transition-colors">
                    privacybeleid
                  </Link>.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 shrink-0 sm:self-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => accept("functional")}
                aria-label="Alleen functionele cookies accepteren"
              >
                Alleen functioneel
              </Button>
              <Button
                size="sm"
                onClick={() => accept("all")}
                aria-label="Alle cookies accepteren"
              >
                Alles accepteren
              </Button>
              <button
                onClick={() => accept("functional")}
                aria-label="Sluiten – alleen functionele cookies"
                className="ml-1 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
