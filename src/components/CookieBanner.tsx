import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = (type: string) => {
    localStorage.setItem("cookie-consent", type);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border p-4 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center gap-4 justify-between">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Wij gebruiken cookies voor een betere ervaring.{" "}
          <Link to="/cookies" className="underline text-primary hover:text-primary/80">
            Lees ons cookiebeleid
          </Link>.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => accept("functional")}>
            Alleen functioneel
          </Button>
          <Button size="sm" onClick={() => accept("all")}>
            Accepteren
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
