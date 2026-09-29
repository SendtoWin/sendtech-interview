import { useCallback, useEffect, useState } from "react";

export interface CartDomain { kind: "domain"; name: string; price?: number; isPremium?: boolean }
export interface CartMailbox { kind: "mailbox"; username: string; domain: string }
export type CartItem = CartDomain | CartMailbox;

interface CartState { items: CartItem[] }

const keyFor = (orgId: string) => `marketplace-cart-${orgId}`;
const empty: CartState = { items: [] };

function read(orgId: string): CartState {
  try {
    const raw = localStorage.getItem(keyFor(orgId));
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    return Array.isArray(parsed.items) ? { items: parsed.items } : empty;
  } catch {
    return empty;
  }
}

export function useMarketplaceCart(orgId: string) {
  const [state, setState] = useState<CartState>(() => read(orgId));

  useEffect(() => { setState(read(orgId)); }, [orgId]);

  const setAndPersist = useCallback((updater: (prev: CartState) => CartState) => {
    setState((prev) => {
      const next = updater(prev);
      if (next === prev) return prev;
      try { localStorage.setItem(keyFor(orgId), JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }, [orgId]);

  const getCartDomains = useCallback(
    () => state.items.filter((i): i is CartDomain => i.kind === "domain"),
    [state.items],
  );

  const addDomain = useCallback((name: string, meta?: Omit<CartDomain, "kind" | "name">) => {
    setAndPersist((state) => {
      if (state.items.some((i) => i.kind === "domain" && i.name === name)) return state;
      const domain: CartDomain = meta ? { kind: "domain", name, ...meta } : { kind: "domain", name };
      return { items: [...state.items, domain] };
    });
  }, [setAndPersist]);

  const removeDomain = useCallback((name: string) => {
    setAndPersist((state) => ({ items: state.items.filter((i) => !(i.kind === "domain" && i.name === name)) }));
  }, [setAndPersist]);

  const addMailbox = useCallback((item: Omit<CartMailbox, "kind">) => {
    setAndPersist((state) => {
      if (state.items.some((i) => i.kind === "mailbox" && i.username === item.username && i.domain === item.domain)) return state;
      return { items: [...state.items, { kind: "mailbox", ...item }] };
    });
  }, [setAndPersist]);

  const clear = useCallback(() => setAndPersist(() => empty), [setAndPersist]);

  const total = state.items.reduce((sum, i) => sum + (i.kind === "domain" ? (i.price ?? 0) : 4.99), 0);

  return { items: state.items, total, getCartDomains, addDomain, removeDomain, addMailbox, clear };
}
