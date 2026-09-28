import { describe, expect, it, vi } from "vitest";
import * as client from "../internal-client.js";
import { computeMailboxIntent } from "./billing.js";

const row = (name: string): client.InternalDomainRow => ({ id: name, organization_id: "org", name, status: "connected" });

describe("computeMailboxIntent", () => {
  it("prices an order on domains the org owns", async () => {
    vi.spyOn(client, "listDomains").mockResolvedValue([row("a.com"), row("b.com")]);
    const r = await computeMailboxIntent({ organization_id: "org", domains: ["a.com", "b.com"], mailboxes_per_domain: 2 });
    expect(r).toEqual({ ok: true, mailboxes: 4, total_usd: 19.96 });
  });

  it("refuses a domain the org does not own", async () => {
    vi.spyOn(client, "listDomains").mockResolvedValue([row("a.com")]);
    const r = await computeMailboxIntent({ organization_id: "org", domains: ["other.com"], mailboxes_per_domain: 1 });
    expect(r).toEqual({ ok: false, code: "not_owned", domain: "other.com" });
  });
});
