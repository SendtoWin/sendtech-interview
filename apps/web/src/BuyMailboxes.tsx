import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "./api";

// Buys one mailbox on every domain the org manages, which is what a customer
// scaling up does after a bulk domain purchase.
export function BuyMailboxes({ organizationId }: { organizationId: string }) {
  const domains = useQuery({ queryKey: ["domains", organizationId], queryFn: () => api.managedDomains(organizationId) });
  const [perDomain, setPerDomain] = useState(1);
  const intent = useMutation({
    mutationFn: () => api.mailboxIntent(organizationId, (domains.data ?? []).map((d) => d.name), perDomain),
  });
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Buy mailboxes</h2>
      <label className="flex items-center gap-2 text-sm">
        Mailboxes per domain
        <input type="number" min={1} max={5} value={perDomain} onChange={(e) => setPerDomain(Number(e.target.value))} className="border rounded px-2 py-1 w-16" />
      </label>
      <button
        className="px-3 py-1.5 rounded bg-violet-600 text-white disabled:opacity-40"
        disabled={!domains.data || intent.isPending}
        onClick={() => intent.mutate()}
      >
        Price {domains.data?.length ?? 0} domains × {perDomain}
      </button>
      {intent.isError && <p className="text-red-600 text-sm">{intent.error.message}</p>}
      {intent.data && <p className="text-sm">{intent.data.mailboxes} mailboxes · ${intent.data.total_usd.toFixed(2)}/mo</p>}
    </section>
  );
}
