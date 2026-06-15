import { Leaf } from "lucide-react";

interface MenuItem {
  name: string;
  desc?: string;
  price?: string;
  vega?: boolean;
}

interface MenuCategory {
  title: string;
  note?: string;
  items: MenuItem[];
}

const menuData: MenuCategory[] = [
  {
    title: "Koffie | Thee | Chocolademelk",
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
    title: "Zuivel",
    items: [
      { name: "(Karne)melk", price: "€ 2,00" },
      { name: "Fristi | Chocomel", price: "€ 3,25" },
      { name: "Smoothie", desc: "Met groenten en fruit van het seizoen", price: "€ 4,50" },
    ],
  },
  {
    title: "Fris",
    items: [
      { name: "Cola | Cola zero", price: "€ 3,25" },
      { name: "Royal Bliss | Ginger Ale | Ginger Beer | Tonic | Bitterlemon | Pink aromatic", price: "€ 3,25" },
      { name: "Earth water Still | Sparkling", price: "€ 3,00" },
      { name: "Fuzetea | Green | Mango Chamomile | Black tea hibiscus", price: "€ 3,25" },
      { name: "Lipton | Sparkling", price: "€ 3,25" },
      { name: "Rivella", price: "€ 3,25" },
      { name: "Verse jus d'orange", price: "€ 4,00" },
      { name: "Biologische Appelsap", price: "€ 3,50" },
    ],
  },
  {
    title: "Wijn",
    items: [
      { name: "Wit | Rood | Rosé (glas)", price: "€ 4,25" },
      { name: "Fles wijn", price: "€ 21,50" },
      { name: "Fles bubbels Cava", price: "€ 21,50" },
    ],
  },
  {
    title: "Bier",
    items: [
      { name: "Hertog Jan Pils", price: "€ 3,25" },
      { name: "Vedett Extra Pilsener", price: "€ 4,75" },
      { name: "Vedett Extra White", price: "€ 4,75" },
      { name: "Vedett IPA", price: "€ 4,75" },
      { name: "Vrijwit 0,5%", price: "€ 4,75" },
      { name: "Jupiler 0,0%", price: "€ 3,25" },
    ],
  },
  {
    title: "Soep van de dag",
    items: [
      { name: "Soep van de dag", desc: "Vraag naar ons aanbod van de dag.", price: "€ 7,50" },
    ],
  },
  {
    title: "Sandwiches & Broodjes",
    items: [
      { name: "Sandwich Geitenkaas", desc: "Appel | honing | walnoten", price: "€ 10,50" },
      { name: "Sandwich Carpaccio", desc: "Parmezaanse kaas | truffelmayo | salade | pijnboompitten", price: "€ 10,50" },
      { name: "Italiaanse bol", desc: "Gezond | ham | kaas | ei | rauwkost", price: "€ 9,50" },
      { name: "Club Sandwich", desc: "Spek | kip | ei | sriracha mayo", price: "€ 9,50" },
    ],
  },
  {
    title: "Kroketten",
    items: [
      { name: "Bourgondische kroketten", desc: "Twee rundvlees | brood | mosterdmayonaise", price: "€ 10,50" },
      { name: "Cas & Kas Vegan kroketten", desc: "Twee vegan | brood | mosterdmayonaise", price: "€ 10,50", vega: true },
    ],
  },
  {
    title: "Flammkuchen",
    items: [
      { name: "Spek", desc: "Roomkaas | mozarella | rode ui", price: "€ 13,50" },
      { name: "Tonijn", desc: "Crème fraîche | geraspte kaas | bieslook", price: "€ 13,50" },
      { name: "Vega", desc: "Champignon | kastanje | crème fraîche | geitenkaas", price: "€ 13,50", vega: true },
    ],
  },
  {
    title: "Warme gerechten",
    items: [
      { name: "Friet stoofvlees", price: "€ 12,50" },
      { name: "Het Witten Haentje", desc: "Soep | rundvleeskroket | tonijnsalade | eiersalade", price: "€ 13,50" },
      { name: "Uitsmijter Den Witten Haen", desc: "Bruin brood | 3 eieren · Extra beleg € 1,00 per beleg: ham | kaas | spek", price: "€ 8,00" },
    ],
  },
  {
    title: "Salades",
    items: [
      { name: "Tonijn Salade", desc: "Romeinse sla | cherry tomaat | rode ui | ei | olijf | paprika | maïs | vinaigrette", price: "€ 12,50" },
      { name: "Blauwe Kaas Salade", desc: "Gemengde salade | blauwe kaas | druiven | noten | honing", price: "€ 13,50", vega: true },
    ],
  },
  {
    title: "Tosti's",
    items: [
      { name: "Tosti van Gogh", desc: "Brie | walnoten | honing", price: "€ 8,00", vega: true },
      { name: "Croque Monsieur", desc: "Ham | kaas", price: "€ 6,00" },
      { name: "Croque Madame", desc: "Gebakken ei | ham | kaas", price: "€ 6,50" },
    ],
  },
  {
    title: "Woensdag Special",
    items: [
      { name: "Pannenkoeken", desc: "Extra beleg € 1,00 per beleg: appel | kaas | spek", price: "€ 6,00" },
    ],
  },
  {
    title: "Voor de kleine gasten",
    items: [
      { name: "Patatje", desc: "Friet, appelmoes en keuze uit: kroket | bitterballen | frikandel", price: "€ 5,50" },
      { name: "Bammetje", desc: "Ham | kaas | hagelslag | jam", price: "€ 2,75" },
      { name: "Krokettenpretje", desc: "Brood | kroket | mayonaise", price: "€ 4,00" },
      { name: "Friet met mayo", price: "€ 3,75" },
    ],
  },
  {
    title: "Lekker voor bij de borrel",
    items: [
      { name: "Bitterballen 8 stuks", price: "€ 8,50" },
      { name: "Bittergarnituur 8 stuks", price: "€ 8,50" },
    ],
  },
  {
    title: "Taart",
    items: [
      { name: "Huisgemaakte taart", price: "€ 4,25" },
      { name: "Huisgemaakte lekkernijen", price: "€ 2,75" },
    ],
  },
  {
    title: "High Tea",
    note: "Minimaal 1 dag van tevoren reserveren, vanaf 2 personen. Huisgemaakte zoete & hartige lekkernijen en belegde broodjes, scones en keuze uit het thee assortiment.",
    items: [
      { name: "High Tea", price: "€ 24,50 p.p." },
    ],
  },
  {
    title: "Lunch (vanaf 8 personen)",
    items: [
      { name: "Kakellunch", desc: "Soep | broodjes | sandwiches | salade | melk | karnemelk | jus d'orange | fruit | koffie | thee", price: "€ 15,50 p.p." },
      { name: "Kraailunch", desc: "Soep | broodjes | sandwiches | salade | warme snack | melk | karnemelk | jus d'orange | fruit | koffie | thee", price: "€ 18,00 p.p." },
    ],
  },
];

const MenuPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <h1 className="font-serif text-4xl md:text-5xl text-center mb-4">Ons Menu</h1>
      <p className="text-center text-muted-foreground font-sans mb-4">
        Vers bereid met zorg en aandacht.
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <span className="inline-flex items-center gap-1.5 text-xs font-sans bg-primary/10 text-primary rounded-full px-3 py-1.5">
          <Leaf className="w-3.5 h-3.5" /> Vega opties beschikbaar
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-sans bg-muted text-muted-foreground rounded-full px-3 py-1.5">
          Wilt u informatie over allergenen? Vraag dit aan onze medewerkers.
        </span>
      </div>

      {menuData.map((cat) => (
        <div key={cat.title} className="mb-10">
          <h2 className="font-serif text-2xl mb-1 border-b border-border pb-2">{cat.title}</h2>
          {cat.note && (
            <p className="text-xs text-muted-foreground font-sans mb-4 mt-2 leading-relaxed">{cat.note}</p>
          )}
          <div className="space-y-4 mt-4">
            {cat.items.map((item) => (
              <div key={item.name} className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-sans font-semibold text-base flex items-center gap-1.5">
                    {item.name}
                    {item.vega && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-primary text-primary text-[9px] font-bold leading-none shrink-0">V</span>
                    )}
                  </h3>
                  {item.desc && <p className="text-sm text-muted-foreground">{item.desc}</p>}
                </div>
                {item.price && (
                  <span className="font-sans font-semibold text-sm whitespace-nowrap text-primary">{item.price}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </main>
);

export default MenuPage;
