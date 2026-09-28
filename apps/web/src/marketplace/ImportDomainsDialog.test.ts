import { describe, expect, it } from "vitest";
import { parseDomainList } from "./ImportDomainsDialog";

describe("parseDomainList", () => {
  it("reads one domain per line with an optional price", () => {
    expect(parseDomainList("A.com\n\nb.co,12.99\n")).toEqual([
      { name: "a.com", price: 10.75, isPremium: false },
      { name: "b.co", price: 12.99, isPremium: false },
    ]);
  });
});
