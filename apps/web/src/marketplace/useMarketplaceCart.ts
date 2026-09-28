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

  const persist = useCallback((next: CartState) => {
    setState(next);
    try { localStorage.setItem(keyFor(orgId), JSON.stringify(next)); } catch { /* storage unavailable */ }
  }, [orgId]);

  const getCartDomains = useCallback(
    () => state.items.filter((i): i is CartDomain => i.kind === "domain"),
    [state.items],
  );

  const addDomain = useCallback((name: string, meta?: Omit<CartDomain, "kind" | "name">) => {
    if (state.items.some((i) => i.kind === "domain" && i.name === name)) return;
    const domain: CartDomain = meta ? { kind: "domain", name, ...meta } : { kind: "domain", name };
    persist({ items: [...state.items, domain] });
  }, [state.items, persist]);

  const removeDomain = useCallback((name: string) => {
    persist({ items: state.items.filter((i) => !(i.kind === "domain" && i.name === name)) });
  }, [state.items, persist]);

  const addMailbox = useCallback((item: Omit<CartMailbox, "kind">) => {
    if (state.items.some((i) => i.kind === "mailbox" && i.username === item.username && i.domain === item.domain)) return;
    persist({ items: [...state.items, { kind: "mailbox", ...item }] });
  }, [state.items, persist]);

  const clear = useCallback(() => persist(empty), [persist]);

  const total = state.items.reduce((sum, i) => sum + (i.kind === "domain" ? (i.price ?? 0) : 4.99), 0);

  return { items: state.items, total, getCartDomains, addDomain, removeDomain, addMailbox, clear };
}
