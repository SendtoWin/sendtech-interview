import { useQuery } from "@tanstack/react-query";
import { api, type DnsRecordStatus } from "./api";

const PILL: Record<DnsRecordStatus, string> = {
  valid: "bg-emerald-100 text-emerald-800",
  invalid: "bg-red-100 text-red-800",
  warning: "bg-amber-100 text-amber-800",
  pending: "bg-gray-100 text-gray-600",
};

function Pill({ label, status }: { label: string; status: DnsRecordStatus }) {
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${PILL[status]}`}>{label} · {status}</span>;
}

export function DomainsTable({ organizationId }: { organizationId: string }) {
  const q = useQuery({ queryKey: ["domains", organizationId], queryFn: () => api.managedDomains(organizationId) });
  if (q.isPending) return <p className="text-gray-500">Loading domains…</p>;
  if (q.isError) return <p className="text-red-600">{String(q.error)}</p>;
  return (
    <table className="w-full text-sm border rounded">
      <thead className="bg-gray-50 text-left">
        <tr><th className="p-2">Domain</th><th className="p-2">Status</th><th className="p-2">DNS</th></tr>
      </thead>
      <tbody>
        {q.data.map((d) => (
          <tr key={d.id} className="border-t">
            <td className="p-2 font-mono">{d.name}</td>
            <td className="p-2">{d.status}</td>
            <td className="p-2 space-x-1">
              <Pill label="SPF" status={d.dns.spf} />
              <Pill label="DKIM" status={d.dns.dkim} />
              <Pill label="DMARC" status={d.dns.dmarc} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
