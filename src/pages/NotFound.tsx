import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404: pagina niet gevonden:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="pt-24 pb-20 min-h-[70vh] flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center">
        <p className="text-sm text-primary font-sans uppercase tracking-wide mb-2">Foutmelding 404</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-4">Pagina niet gevonden</h1>
        <p className="text-muted-foreground font-sans leading-relaxed mb-8">
          De pagina die u zoekt bestaat niet (meer) of is verplaatst.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/"><Button variant="hero" size="lg" className="w-full sm:w-auto">Naar de homepage</Button></Link>
          <Link to="/reserveren"><Button variant="outline" size="lg" className="w-full sm:w-auto">Reserveren</Button></Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
