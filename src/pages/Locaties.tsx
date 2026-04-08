import { MapPin } from "lucide-react";

const locations = [
  {
    name: "Den Witten Haen – Lunchroom",
    address: "Voorstraat, centrum Dordrecht",
    desc: "Onze gezellige lunchroom in een monumentaal pand met verborgen stadstuin.",
  },
  {
    name: "Den Witten Haen – Vergaderzalen",
    address: "Centrum Dordrecht",
    desc: "Inspirerende vergaderruimtes in historische sfeer, inclusief catering.",
  },
];

const LocationsPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <h1 className="font-serif text-4xl md:text-5xl text-center mb-4">Onze Locaties in Dordrecht</h1>
      <p className="text-center text-muted-foreground font-sans mb-12 max-w-xl mx-auto">
        Ontdek onze locaties in het hart van Dordrecht.
      </p>

      <div className="space-y-6">
        {locations.map((loc) => (
          <div key={loc.name} className="bg-card rounded-lg p-6 border border-border flex gap-4 items-start">
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="font-serif text-xl mb-1">{loc.name}</h2>
              <p className="text-sm text-muted-foreground font-sans mb-1">{loc.address}</p>
              <p className="text-sm text-muted-foreground font-sans">{loc.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </main>
);

export default LocationsPage;
