export type DnsRecordStatus = "valid" | "invalid" | "warning" | "pending";
export interface Organization { id: string; name: string }
export interface ManagedDomain {
  id: string; name: string; status: string;
  dns: { spf: DnsRecordStatus; dkim: DnsRecordStatus; dmarc: DnsRecordStatus };
}
export interface IntentOk { ok: true; total_usd: number; mailboxes: number }

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? res.statusText);
  return body as T;
}

export const api = {
  organizations: () => fetch("/api/organizations").then(json<Organization[]>),
  managedDomains: (organizationId: string) =>
    fetch(`/api/domains/managed?organization_id=${organizationId}`).then(json<ManagedDomain[]>),
  mailboxIntent: (organization_id: string, domains: string[], mailboxes_per_domain: number) =>
    fetch("/api/billing/mailboxes/intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organization_id, domains, mailboxes_per_domain }),
    }).then(json<IntentOk>),
};
