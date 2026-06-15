import { Leaf } from "lucide-react";

interface MenuItem {
  name: string;
  desc?: string;
  price?: string;
  vega?: boolean;
}

interface MenuCategory {
  id: string;
  title: string;
  note?: string;
  items: MenuItem[];
  cols?: boolean;
}

const drinks: MenuCategory[] = [
  {
    id: "koffie",
    title: "Koffie | Thee | Chocolademelk",
    cols: true,
    items: [
      { name: "Koffie", price: "€ 3,00" },
      { name: "Koffie verkeerd", price: "€ 3,25" },
      { name: "Cappuccino", price: "€ 3,25" },
      { name: "Cappuccino met havermelk", price: "€ 3,50" },
      { name: "Latte Macchiato", price: "€ 3,50" },
      { name: "Flat White", price: "€ 4,25" },
      { name: "Cortado", price: "€ 3,00" },
      { name: "Espresso", price: "€ 2,75" },
      { name: "Dubbele espresso", price: "€ 4,50" },
      { name: "Thee", price: "€ 3,00" },
      { name: "Verse munt thee | Verse gember thee", price: "€ 3,50" },
      { name: "Warme chocolademelk", price: "€ 3,00" },
      { name: "Slagroom", price: "€ 0,50" },
    ],
  },
  {
    id: "dranken",
    title: "Dranken",
    cols: true,
    items: [
      { name: "(Karne)melk", price: "€ 2,00" },
      { name: "Fristi | Chocomel", price: "€ 3,25" },
      { name: "Smoothie (seizoen)", price: "€ 4,50" },
      { name: "Cola | Cola zero", price: "€ 3,25" },
      { name: "Ginger Ale | Ginger Beer | Tonic | Bitterlemon | Pink aromatic", price: "€ 3,25" },
      { name: "Earth water Still | Sparkling", price: "€ 3,00" },
      { name: "Fuzetea | Green | Mango Chamomile | Black tea hibiscus", price: "€ 3,25" },
      { name: "Rivella", price: "€ 3,25" },
      { name: "Verse jus d'orange", price: "€ 4,00" },
      { name: "Biologische Appelsap", price: "€ 3,50" },
      { name: "Wit | Rood | Rosé (glas)", price: "€ 4,25" },
      { name: "Fles wijn", price: "€ 21,50" },
      { name: "Fles bubbels Cava", price: "€ 21,50" },
      { name: "Hertog Jan Pils", price: "€ 3,25" },
      { name: "Vedett Extra Pilsener / White / IPA", price: "€ 4,75" },
      { name: "Vrijwit 0,5%", price: "€ 4,75" },
      { name: "Jupiler 0,0%", price: "€ 3,25" },
    ],
  },
];

const food: MenuCategory[] = [
  {
    id: "soep",
    title: "Soep van de dag",
    items: [
      { name: "Soep van de dag", desc: "Vraag naar ons aanbod van de dag", price: "€ 7,50" },
    ],
  },
  {
    id: "sandwiches",
    title: "Sandwiches & Broodjes",
    items: [
      { name: "Sandwich Geitenkaas", desc: "Appel · honing · walnoten", price: "€ 10,50" },
      { name: "Sandwich Carpaccio", desc: "Parmezaanse kaas · truffelmayo · salade · pijnboompitten", price: "€ 10,50" },
      { name: "Italiaanse bol", desc: "Gezond · ham · kaas · ei · rauwkost", price: "€ 9,50" },
      { name: "Club Sandwich", desc: "Spek · kip · ei · sriracha mayo", price: "€ 9,50" },
    ],
  },
  {
    id: "kroketten",
    title: "Kroketten",
    items: [
      { name: "Bourgondische kroketten", desc: "Twee rundvlees · brood · mosterdmayonaise", price: "€ 10,50" },
      { name: "Cas & Kas Vegan kroketten", desc: "Twee vegan · brood · mosterdmayonaise", price: "€ 10,50", vega: true },
    ],
  },
  {
    id: "flammkuchen",
    title: "Flammkuchen",
    items: [
      { name: "Spek", desc: "Roomkaas · mozarella · rode ui", price: "€ 13,50" },
      { name: "Tonijn", desc: "Crème fraîche · geraspte kaas · bieslook", price: "€ 13,50" },
      { name: "Vega", desc: "Champignon · kastanje · crème fraîche · geitenkaas", price: "€ 13,50", vega: true },
    ],
  },
  {
    id: "warm",
    title: "Warme gerechten",
    items: [
      { name: "Friet stoofvlees", price: "€ 12,50" },
      { name: "Het Witten Haentje", desc: "Soep · rundvleeskroket · tonijnsalade · eiersalade", price: "€ 13,50" },
      { name: "Uitsmijter Den Witten Haen", desc: "Bruin brood · 3 eieren · extra beleg € 1,00: ham, kaas of spek", price: "€ 8,00" },
    ],
  },
  {
    id: "salades",
    title: "Salades",
    items: [
      { name: "Tonijn Salade", desc: "Romeinse sla · cherry tomaat · rode ui · ei · olijf · paprika · maïs · vinaigrette", price: "€ 12,50" },
      { name: "Blauwe Kaas Salade", desc: "Gemengde salade · blauwe kaas · druiven · noten · honing", price: "€ 13,50", vega: true },
    ],
  },
  {
    id: "tostis",
    title: "Tosti's",
    items: [
      { name: "Tosti van Gogh", desc: "Brie · walnoten · honing", price: "€ 8,00", vega: true },
      { name: "Croque Monsieur", desc: "Ham · kaas", price: "€ 6,00" },
      { name: "Croque Madame", desc: "Gebakken ei · ham · kaas", price: "€ 6,50" },
    ],
  },
  {
    id: "woensdag",
    title: "Woensdag Special",
    items: [
      { name: "Pannenkoeken", desc: "Extra beleg € 1,00: appel · kaas · spek", price: "€ 6,00" },
    ],
  },
  {
    id: "borrel",
    title: "Lekker voor bij de borrel",
    items: [
      { name: "Bitterballen 8 stuks", price: "€ 8,50" },
      { name: "Bittergarnituur 8 stuks", price: "€ 8,50" },
    ],
  },
  {
    id: "taart",
    title: "Taart",
    items: [
      { name: "Huisgemaakte taart", price: "€ 4,25" },
      { name: "Huisgemaakte lekkernijen", price: "€ 2,75" },
    ],
  },
  {
    id: "kinderen",
    title: "Voor de kleine gasten",
    items: [
      { name: "Patatje", desc: "Friet · appelmoes · kroket, bitterballen of frikandel", price: "€ 5,50" },
      { name: "Bammetje", desc: "Ham · kaas · hagelslag · jam", price: "€ 2,75" },
      { name: "Krokettenpretje", desc: "Brood · kroket · mayonaise", price: "€ 4,00" },
      { name: "Friet met mayo", price: "€ 3,75" },
    ],
  },
];

const navItems = [
  { id: "koffie", label: "Koffie & Thee" },
  { id: "dranken", label: "Dranken" },
  { id: "soep", label: "Soep" },
  { id: "sandwiches", label: "Sandwiches" },
  { id: "flammkuchen", label: "Flammkuchen" },
  { id: "warm", label: "Warm" },
  { id: "salades", label: "Salades" },
  { id: "tostis", label: "Tosti's" },
  { id: "kinderen", label: "Kinderen" },
  { id: "hightea", label: "High Tea" },
  { id: "lunch", label: "Lunch" },
];

const CategoryHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-4 mb-5">
    <h2 className="font-serif text-xl text-foreground whitespace-nowrap">{title}</h2>
    <div className="flex-1 h-px bg-border" />
  </div>
);

const MenuRow = ({ item }: { item: MenuItem }) => (
  <div className="flex justify-between items-start gap-4 py-2.5 border-b border-border/50 last:border-0">
    <div className="flex-1 min-w-0">
      <span className="font-sans font-medium text-sm text-foreground flex items-center gap-1.5 flex-wrap">
        {item.name}
        {item.vega && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary border border-primary rounded-full px-1.5 py-0.5 leading-none">
            <Leaf className="w-2.5 h-2.5" /> vega
          </span>
        )}
      </span>
      {item.desc && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>}
    </div>
    {item.price && (
      <span className="font-sans font-semibold text-sm text-foreground whitespace-nowrap">{item.price}</span>
    )}
  </div>
);

const MenuPage = () => (
  <main className="pt-20 pb-20">
    {/* Hero */}
    <div className="bg-foreground text-primary-foreground py-12 text-center mb-10">
      <p className="text-xs font-sans tracking-[4px] uppercase text-primary-foreground/60 mb-2">Lunchroom · Dordrecht</p>
      <h1 className="font-serif text-4xl md:text-5xl">Ons Menu</h1>
      <p className="text-sm font-sans text-primary-foreground/70 mt-3">
        Vers bereid met zorg en aandacht
      </p>
    </div>

    {/* Sticky nav */}
    <div className="sticky top-[96px] z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 px-4 py-2 container mx-auto" style={{ minWidth: "max-content" }}>
          {navItems.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="text-xs font-sans px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap"
            >
              {n.label}
            </a>
          ))}
        </div>
      </div>
    </div>

    <div className="container mx-auto px-4 max-w-3xl mt-10">

      {/* Dranken blok */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6" id="koffie">
        <CategoryHeader title="Koffie | Thee | Chocolademelk" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          {drinks[0].items.map((item) => <MenuRow key={item.name} item={item} />)}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 mb-10" id="dranken">
        <CategoryHeader title="Dranken" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          {drinks[1].items.map((item) => <MenuRow key={item.name} item={item} />)}
        </div>
      </div>

      {/* Decoratieve scheiding */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 h-px bg-border" />
        <span className="font-serif text-muted-foreground text-sm italic">Van onze keuken</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Etenscategorieën */}
      {food.map((cat) => (
        <div key={cat.id} id={cat.id} className="mb-8 scroll-mt-36">
          <CategoryHeader title={cat.title} />
          {cat.note && <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{cat.note}</p>}
          <div>
            {cat.items.map((item) => <MenuRow key={item.name} item={item} />)}
          </div>
        </div>
      ))}

      {/* High Tea – uitgelicht */}
      <div id="hightea" className="scroll-mt-36 bg-foreground text-primary-foreground rounded-xl p-8 mb-6">
        <p className="text-xs font-sans tracking-[3px] uppercase text-primary-foreground/60 mb-1">Signature</p>
        <div className="flex justify-between items-start gap-4 mb-3">
          <h2 className="font-serif text-2xl">High Tea</h2>
          <span className="font-sans font-bold text-xl">€ 24,50 <span className="text-sm font-normal opacity-70">p.p.</span></span>
        </div>
        <p className="text-sm text-primary-foreground/80 font-sans leading-relaxed">
          Huisgemaakte zoete & hartige lekkernijen, belegde broodjes, scones en keuze uit het thee assortiment.
        </p>
        <p className="text-xs text-primary-foreground/50 font-sans mt-3">
          Minimaal 1 dag van tevoren reserveren · vanaf 2 personen
        </p>
      </div>

      {/* Groepslunch – uitgelicht */}
      <div id="lunch" className="scroll-mt-36 bg-primary/5 border border-primary/15 rounded-xl p-8 mb-10">
        <p className="text-xs font-sans tracking-[3px] uppercase text-primary mb-1">Vanaf 8 personen</p>
        <h2 className="font-serif text-2xl mb-5">Groepslunch</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-background rounded-lg p-5 border border-border">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-serif text-lg">Kakellunch</h3>
              <span className="font-sans font-bold text-primary">€ 15,50 <span className="text-xs font-normal text-muted-foreground">p.p.</span></span>
            </div>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              Soep · broodjes · sandwiches · salade · melk · karnemelk · jus d'orange · fruit · koffie · thee
            </p>
          </div>
          <div className="bg-background rounded-lg p-5 border border-border">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-serif text-lg">Kraailunch</h3>
              <span className="font-sans font-bold text-primary">€ 18,00 <span className="text-xs font-normal text-muted-foreground">p.p.</span></span>
            </div>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              Soep · broodjes · sandwiches · salade · warme snack · melk · karnemelk · jus d'orange · fruit · koffie · thee
            </p>
          </div>
        </div>
      </div>

      {/* Allergen note */}
      <p className="text-center text-xs text-muted-foreground font-sans">
        Wilt u informatie over allergenen? Vraag dit aan onze medewerkers.
      </p>
    </div>
  </main>
);

export default MenuPage;
