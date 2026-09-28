import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "./api";
import { BuyMailboxes } from "./BuyMailboxes";
import { DomainsTable } from "./DomainsTable";
import { SearchStep } from "./marketplace/SearchStep";
import { useMarketplaceCart } from "./marketplace/useMarketplaceCart";

function Marketplace({ organizationId }: { organizationId: string }) {
  const cart = useMarketplaceCart(organizationId);
  const domains = cart.getCartDomains();
  return (
    <div className="grid grid-cols-[1fr_280px] gap-6">
      <SearchStep cart={cart} />
      <aside className="border rounded p-4 space-y-2 h-fit">
        <h3 className="font-semibold">Cart</h3>
        <p className="text-sm text-gray-600">{domains.length} domains · ${cart.total.toFixed(2)}</p>
        <ul className="text-sm max-h-64 overflow-auto">
          {domains.map((d) => (
            <li key={d.name} className="flex justify-between">
              <span className="font-mono">{d.name}</span>
              <button className="text-gray-400" onClick={() => cart.removeDomain(d.name)}>×</button>
            </li>
          ))}
        </ul>
        {domains.length > 0 && <button className="text-xs text-gray-500 underline" onClick={cart.clear}>Clear</button>}
      </aside>
    </div>
  );
}

export function App() {
  const orgs = useQuery({ queryKey: ["orgs"], queryFn: api.organizations });
  const [orgId, setOrgId] = useState<string>();
  const [tab, setTab] = useState<"domains" | "marketplace" | "mailboxes">("domains");
  const active = orgId ?? orgs.data?.[0]?.id;
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-violet-700">SendTech</h1>
        <select className="border rounded px-2 py-1" value={active ?? ""} onChange={(e) => setOrgId(e.target.value)}>
          {orgs.data?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </header>
      <nav className="flex gap-2 text-sm">
        {(["domains", "marketplace", "mailboxes"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded ${tab === t ? "bg-violet-100 text-violet-800" : "text-gray-600"}`}>{t}</button>
        ))}
      </nav>
      {active && tab === "domains" && <DomainsTable organizationId={active} />}
      {active && tab === "marketplace" && <Marketplace organizationId={active} />}
      {active && tab === "mailboxes" && <BuyMailboxes organizationId={active} />}
    </main>
  );
}
