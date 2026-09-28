# SendTech interview repo

A shrunk-down slice of SendTech, an email deliverability platform. Customers buy domains and mailboxes, and we warm those mailboxes up so their outreach lands in the inbox. This repo keeps the same stack and the same shape as the real product, in about 25 files.

```
apps/
├── web/   React 19 + Vite + Tailwind v4 + TanStack Query. Talks only to /api/*.
└── api/   Node 20 + Hono + Drizzle + Postgres.
           /api/*       user-facing
           /internal/*  service-to-service (in production this is a separate service)
```

## Setup (about 2 minutes)

Prerequisites: Node 20+, pnpm 9+, Docker.

```bash
pnpm install
pnpm db:up        # Postgres on localhost:5433
pnpm db:seed      # 2 organizations, 253 domains, DNS check rows
pnpm dev          # api on :3001, web on :5173
```

Open http://localhost:5173. The org switcher at the top right moves between the two seeded customers.

## Tests and checks

```bash
pnpm test         # vitest in both apps
pnpm typecheck
```

## How we work

Every task arrives the way it does at SendTech: as something a customer saw. You will be given the tasks during the interview. For each one, branch off `main`, reproduce the symptom, find the cause, fix it, add the test that would have caught it, and open a PR whose description says what the customer saw, what the cause was, and how you verified the fix. AI tools are allowed and encouraged. Think out loud.
