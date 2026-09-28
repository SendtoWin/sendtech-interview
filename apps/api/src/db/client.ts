import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const url = process.env.DATABASE_URL ?? "postgres://sendtech:sendtech@localhost:5433/sendtech";
export const sql = postgres(url, { max: 5 });
export const db = drizzle(sql, { schema });
