import { useState } from "react";

export interface ImportRow { name: string; price: number; isPremium: boolean }

// One domain per line, optionally "name,price". Prices come from the registrar
// search in production; here a fixed quote stands in for it.
export function parseDomainList(text: string): ImportRow[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, price] = line.split(",").map((s) => s.trim());
      return { name: name.toLowerCase(), price: price ? Number(price) : 10.75, isPremium: false };
    });
}

interface Props { capacity: number; onConfirm: (rows: ImportRow[]) => void; onClose: () => void }

export function ImportDomainsDialog({ capacity, onConfirm, onClose }: Props) {
  const [text, setText] = useState("");
  const rows = parseDomainList(text).slice(0, capacity);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[520px] space-y-4">
        <h2 className="text-lg font-semibold">Upload a list of domains</h2>
        <p className="text-sm text-gray-500">Paste one domain per line. Up to {capacity}.</p>
        <textarea
          className="w-full h-48 border rounded p-2 font-mono text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"acme-outreach.com\nacme-mail.co,12.99"}
        />
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1.5 rounded border" onClick={onClose}>Cancel</button>
          <button
            className="px-3 py-1.5 rounded bg-violet-600 text-white disabled:opacity-40"
            disabled={rows.length === 0}
            onClick={() => { onConfirm(rows); onClose(); }}
          >
            Add {rows.length} to cart
          </button>
        </div>
      </div>
    </div>
  );
}
