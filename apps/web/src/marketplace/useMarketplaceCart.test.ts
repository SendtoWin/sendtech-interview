import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useMarketplaceCart } from "./useMarketplaceCart";

describe("useMarketplaceCart", () => {
  beforeEach(() => localStorage.clear());

  it("adds a domain once and ignores a duplicate", () => {
    const { result } = renderHook(() => useMarketplaceCart("org"));
    act(() => result.current.addDomain("a.com", { price: 10 }));
    act(() => result.current.addDomain("a.com", { price: 10 }));
    expect(result.current.getCartDomains()).toEqual([{ kind: "domain", name: "a.com", price: 10 }]);
  });

  it("persists across remount", () => {
    const first = renderHook(() => useMarketplaceCart("org"));
    act(() => first.result.current.addDomain("a.com"));
    first.unmount();
    const second = renderHook(() => useMarketplaceCart("org"));
    expect(second.result.current.getCartDomains()).toHaveLength(1);
  });

  it("adds multiple domains without intermediate renders", () => {
    const { result } = renderHook(() => useMarketplaceCart("org"));
    act(() => {
      result.current.addDomain("a.com");
      result.current.addDomain("b.com");
      result.current.addDomain("c.com");
    });
    expect(result.current.getCartDomains()).toHaveLength(3);
  });
});
