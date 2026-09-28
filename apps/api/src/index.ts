import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { db } from "./db/client.js";
import { organizations } from "./db/schema.js";
import { billingRoutes } from "./routes/billing.js";
import { domainRoutes } from "./routes/domains.js";
import { internal } from "./routes/internal.js";

const app = new Hono();
app.get("/health", (c) => c.json({ ok: true }));
app.get("/api/organizations", async (c) => c.json(await db.select().from(organizations)));
app.route("/api/domains", domainRoutes);
app.route("/api/billing", billingRoutes);
app.route("/internal", internal);

const port = Number(process.env.PORT ?? 3001);
serve({ fetch: app.fetch, port }, () => console.log(`api on http://localhost:${port}`));
