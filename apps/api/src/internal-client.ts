// Typed client for the /internal/* surface. In production this is a separate
// service (database-api) owning all DB access; here it runs in the same process
// but is still reached over HTTP so the contract is the same.
const BASE = process.env.INTERNAL_BASE_URL ?? "http://localhost:3001";

export interface InternalDomainRow { id: string; organization_id: string; name: string; status: string }
export interface InternalDnsRow { domain_name: string; record_type: "spf" | "dkim" | "dmarc"; status: "valid" | "invalid" | "warning" | "pending" }

export class InternalApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function internalJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { "x-internal-secret": "dev" } });
  if (!res.ok) throw new InternalApiError(res.status, `${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export interface ListDomainsOpts { organizationId: string; limit?: number; offset?: number }

export async function listDomains(opts: ListDomainsOpts): Promise<InternalDomainRow[]> {
  const params = new URLSearchParams({ organization_id: opts.organizationId });
  if (opts.limit !== undefined) params.set("limit", String(opts.limit));
  if (opts.offset !== undefined) params.set("offset", String(opts.offset));
  return internalJson(`/internal/domains?${params}`);
}

export async function listDnsRecords(opts: { organizationId: string }): Promise<InternalDnsRow[]> {
  const params = new URLSearchParams({ organization_id: opts.organizationId });
  return internalJson(`/internal/dns-records?${params}`);
}
