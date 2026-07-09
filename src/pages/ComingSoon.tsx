import heroImage from "@/assets/hero-interior.png";

const ComingSoon = () => (
  <main className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
    <img
      src={heroImage}
      alt="Sfeervol interieur van Den Witten Haen"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-foreground/65" />

    <div className="relative z-10 text-center px-4 max-w-xl mx-auto py-16">
      <p className="text-primary-foreground/70 font-sans text-sm tracking-widest uppercase mb-4">
        Lunchroom · Dordrecht
      </p>
      <h1 className="font-serif text-5xl md:text-6xl text-primary-foreground mb-5 leading-tight">
        Den Witten Haen
      </h1>
      <p className="font-serif text-2xl md:text-3xl text-primary-foreground/90 mb-6">
        Binnenkort online
      </p>
      <p className="text-primary-foreground/80 font-sans leading-relaxed mb-10 max-w-md mx-auto">
        Wij werken aan onze nieuwe website. Ondertussen bent u van harte welkom in onze
        sfeervolle lunchroom in het hart van Dordrecht — voor lunch, high tea en meer.
      </p>

      <div className="text-primary-foreground/85 font-sans text-sm space-y-1 mb-8">
        <p>Groenmarkt 19-B, 3311 BD Dordrecht</p>
        <p>
          <a href="tel:0786112050" className="hover:text-primary-foreground transition-colors">078 611 20 50</a>
          {" · "}
          <a href="mailto:denwittenhaen@philadelphia.nl" className="hover:text-primary-foreground transition-colors">denwittenhaen@philadelphia.nl</a>
        </p>
      </div>

      <div className="text-primary-foreground/85 font-sans text-sm mb-8">
        <p className="uppercase tracking-wide text-xs text-primary-foreground/60 mb-1">Openingstijden</p>
        <p>Ma t/m vr: 10:00 – 16:00 · Za: 10:00 – 17:00 · Zo: gesloten</p>
      </div>

      <div className="flex items-center justify-center gap-5">
        <a href="https://www.instagram.com/denwittenhaen/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </a>
        <a href="https://www.facebook.com/DenWittenHaen/?locale=nl_NL" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </a>
      </div>
    </div>
  </main>
);

export default ComingSoon;
