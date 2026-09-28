import { Hono } from "hono";
import { listDomains } from "../internal-client.js";

export type DnsRecordStatus = "valid" | "invalid" | "warning" | "pending";
export interface ManagedDomain {
  id: string;
  name: string;
  status: string;
  dns: { spf: DnsRecordStatus; dkim: DnsRecordStatus; dmarc: DnsRecordStatus };
}

export async function buildManagedDomains(organizationId: string): Promise<ManagedDomain[]> {
  const rows = await listDomains({ organizationId, limit: 500 });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status,
    // DNS pills (spf/dkim/dmarc) are placeholders ("pending") for now — the
    // registrar's list doesn't return per-record DNS status; real DNS sync is
    // a later phase.
    dns: { spf: "pending", dkim: "pending", dmarc: "pending" },
  }));
}

export const domainRoutes = new Hono();

domainRoutes.get("/managed", async (c) => {
  const organizationId = c.req.query("organization_id");
  if (!organizationId) return c.json({ error: "organization_id required" }, 400);
  return c.json(await buildManagedDomains(organizationId));
});
