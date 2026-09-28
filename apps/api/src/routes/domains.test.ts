import { describe, expect, it, vi } from "vitest";
import * as client from "../internal-client.js";
import { buildManagedDomains } from "./domains.js";

describe("buildManagedDomains", () => {
  it("lists every managed domain with its dns pills", async () => {
    vi.spyOn(client, "listDomains").mockResolvedValue([
      { id: "1", organization_id: "org", name: "a.com", status: "connected" },
    ]);
    const rows = await buildManagedDomains("org");
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("a.com");
    expect(Object.keys(rows[0].dns)).toEqual(["spf", "dkim", "dmarc"]);
  });
});
