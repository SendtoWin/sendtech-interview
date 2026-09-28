import { Hono } from "hono";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import { dnsRecords, domains } from "../db/schema.js";

// Service-to-service surface. Pages at 100 by default, 500 max — the same
// contract every internal list route in SendTech follows.
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export const internal = new Hono();

internal.use("*", async (c, next) => {
  if (c.req.header("x-internal-secret") !== "dev") return c.json({ error: "forbidden" }, 403);
  await next();
});

function page(c: { req: { query: (k: string) => string | undefined } }) {
  const limit = Math.min(Number(c.req.query("limit") ?? DEFAULT_LIMIT), MAX_LIMIT);
  const offset = Number(c.req.query("offset") ?? 0);
  return { limit, offset };
}

internal.get("/domains", async (c) => {
  const organizationId = c.req.query("organization_id");
  if (!organizationId) return c.json({ error: "organization_id required" }, 400);
  const { limit, offset } = page(c);
  const rows = await db.select().from(domains)
    .where(eq(domains.organizationId, organizationId))
    .orderBy(domains.createdAt, domains.id)
    .limit(limit).offset(offset);
  return c.json(rows.map((r) => ({ id: r.id, organization_id: r.organizationId, name: r.name, status: r.status })));
});

internal.get("/dns-records", async (c) => {
  const organizationId = c.req.query("organization_id");
  if (!organizationId) return c.json({ error: "organization_id required" }, 400);
  const { limit, offset } = page(c);
  const owned = db.select({ name: domains.name }).from(domains).where(eq(domains.organizationId, organizationId));
  const rows = await db.select().from(dnsRecords)
    .where(and(inArray(dnsRecords.domainName, owned)))
    .orderBy(dnsRecords.id)
    .limit(limit).offset(offset);
  return c.json(rows.map((r) => ({ domain_name: r.domainName, record_type: r.recordType, status: r.status })));
});
