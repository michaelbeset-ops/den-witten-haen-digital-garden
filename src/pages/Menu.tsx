import { Button } from "@/components/ui/button";
import { Download, Leaf, Wheat } from "lucide-react";

interface MenuItem {
  name: string;
  desc: string;
  price: string;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

const menuData: MenuCategory[] = [
  {
    title: "Broodjes & Lunches",
    items: [
      { name: "Broodje gezond", desc: "Volkoren brood, kaas, ei, groenten", price: "€ 7,50" },
      { name: "Clubsandwich", desc: "Kip, bacon, sla, tomaat, ei", price: "€ 9,95" },
      { name: "Broodje carpaccio", desc: "Rucola, parmezaan, truffelmayonaise", price: "€ 10,50" },
      { name: "Tosti De Witten Haen", desc: "Boerenkaas, tomaat, pesto", price: "€ 7,95" },
    ],
  },
  {
    title: "Soepen",
    items: [
      { name: "Tomatensoep", desc: "Huisgemaakt met balletjes", price: "€ 6,50" },
      { name: "Soep van de dag", desc: "Vraag naar ons dagaanbod", price: "€ 6,50" },
    ],
  },
  {
    title: "Warme gerechten",
    items: [
      { name: "Quiche du jour", desc: "Met salade en brood", price: "€ 12,50" },
      { name: "Uitsmijter", desc: "Met ham, kaas of beide", price: "€ 9,95" },
    ],
  },
  {
    title: "Dranken",
    items: [
      { name: "Koffie / Thee", desc: "Diverse soorten beschikbaar", price: "€ 2,75" },
      { name: "Verse jus d'orange", desc: "Geperst op bestelling", price: "€ 4,50" },
      { name: "Huislimonade", desc: "Seizoensgebonden smaak", price: "€ 3,95" },
      { name: "Wijn (glas)", desc: "Wit, rood of rosé", price: "€ 4,50" },
    ],
  },
  {
    title: "High Tea",
    items: [
      { name: "High Tea klassiek", desc: "Assortiment zoet & hartig, incl. thee", price: "€ 24,95 p.p." },
      { name: "High Tea deluxe", desc: "Uitgebreid, met prosecco", price: "€ 32,50 p.p." },
    ],
  },
];

const MenuPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <h1 className="font-serif text-4xl md:text-5xl text-center mb-4">Ons Menu</h1>
      <p className="text-center text-muted-foreground font-sans mb-4">
        Vers bereid met zorg en aandacht. Geniet van onze seizoensgebonden gerechten.
      </p>

      {/* Dieetopties */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <span className="inline-flex items-center gap-1.5 text-xs font-sans bg-primary/10 text-primary rounded-full px-3 py-1.5">
          <Leaf className="w-3.5 h-3.5" /> Vegetarisch op aanvraag
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-sans bg-primary/10 text-primary rounded-full px-3 py-1.5">
          <Wheat className="w-3.5 h-3.5" /> Glutenvrij op aanvraag
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-sans bg-primary/10 text-primary rounded-full px-3 py-1.5">
          Koemelkvrij op aanvraag
        </span>
      </div>

      {menuData.map((cat) => (
        <div key={cat.title} className="mb-12">
          <h2 className="font-serif text-2xl mb-6 border-b border-border pb-2">{cat.title}</h2>
          <div className="space-y-4">
            {cat.items.map((item) => (
              <div key={item.name} className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-sans font-semibold text-base">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <span className="font-sans font-semibold text-sm whitespace-nowrap text-primary">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center mt-8">
        <Button variant="outline" size="lg" className="rounded-full gap-2">
          <Download className="w-4 h-4" />
          Download volledig menu (PDF)
        </Button>
      </div>
    </div>
  </main>
);

export default MenuPage;
