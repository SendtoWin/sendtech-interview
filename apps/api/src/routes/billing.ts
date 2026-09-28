import { Hono } from "hono";
import { listDomains } from "../internal-client.js";

export const MAILBOX_PRICE_USD = 4.99;

export interface IntentRequest { organization_id: string; domains: string[]; mailboxes_per_domain: number }
export type IntentResult =
  | { ok: true; total_usd: number; mailboxes: number }
  | { ok: false; code: "not_owned"; domain: string };

// Pre-flight before any money moves: every domain in the order must belong to
// the paying organization. A domain the org does not own is refused as 409.
export async function computeMailboxIntent(req: IntentRequest): Promise<IntentResult> {
  const owned = new Set((await listDomains({ organizationId: req.organization_id })).map((d) => d.name));
  for (const domain of req.domains) {
    if (!owned.has(domain)) return { ok: false, code: "not_owned", domain };
  }
  const mailboxes = req.domains.length * req.mailboxes_per_domain;
  return { ok: true, mailboxes, total_usd: Math.round(mailboxes * MAILBOX_PRICE_USD * 100) / 100 };
}

export const billingRoutes = new Hono();

billingRoutes.post("/mailboxes/intent", async (c) => {
  const body = (await c.req.json()) as Partial<IntentRequest>;
  if (!body.organization_id || !Array.isArray(body.domains)) return c.json({ error: "bad request" }, 400);
  const result = await computeMailboxIntent({
    organization_id: body.organization_id,
    domains: body.domains,
    mailboxes_per_domain: body.mailboxes_per_domain ?? 1,
  });
  if (!result.ok) return c.json({ error: `You don't own ${result.domain}.`, code: result.code }, 409);
  return c.json(result);
});
