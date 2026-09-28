import { useState } from "react";
import { ImportDomainsDialog, type ImportRow } from "./ImportDomainsDialog";
import { useMarketplaceCart } from "./useMarketplaceCart";

export const MAX_DOMAINS = 100;

const SUGGESTIONS: ImportRow[] = [
  { name: "acme-outreach.com", price: 10.75, isPremium: false },
  { name: "acme-mail.co", price: 12.99, isPremium: false },
  { name: "getacme.io", price: 38.0, isPremium: true },
];

export function SearchStep({ cart }: { cart: ReturnType<typeof useMarketplaceCart> }) {
  const [importing, setImporting] = useState(false);
  const cartDomains = cart.getCartDomains();
  const capacity = MAX_DOMAINS - cartDomains.length;

  const onImport = (rows: ImportRow[]) => {
    for (const d of rows) cart.addDomain(d.name, { price: d.price, isPremium: d.isPremium });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Buy domains</h2>
        <button className="px-3 py-1.5 rounded border" onClick={() => setImporting(true)}>Upload a list</button>
      </div>
      <ul className="divide-y border rounded">
        {SUGGESTIONS.map((s) => {
          const inCart = cartDomains.some((d) => d.name === s.name);
          return (
            <li key={s.name} className="flex items-center justify-between p-3">
              <span>{s.name} <span className="text-gray-500">${s.price.toFixed(2)}/yr</span></span>
              <button
                className="px-3 py-1 rounded bg-violet-600 text-white disabled:opacity-40"
                disabled={inCart}
                onClick={() => cart.addDomain(s.name, { price: s.price, isPremium: s.isPremium })}
              >
                {inCart ? "In cart" : "Add"}
              </button>
            </li>
          );
        })}
      </ul>
      {importing && (
        <ImportDomainsDialog capacity={capacity} onConfirm={onImport} onClose={() => setImporting(false)} />
      )}
    </section>
  );
}
