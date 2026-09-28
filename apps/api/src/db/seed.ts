import { sql } from "./client.js";

const STATUSES = ["valid", "invalid", "warning"] as const;

async function main() {
  await sql`drop table if exists organizations, domains, dns_records, mailboxes`;
  await sql`create table organizations (id text primary key, name text not null)`;
  await sql`create table domains (id text primary key, organization_id text not null, name text not null, status text not null, created_at timestamp not null default now())`;
  await sql`create table dns_records (id serial primary key, domain_name text not null, record_type text not null, status text not null, checked_at timestamp not null default now())`;
  await sql`create table mailboxes (id text primary key, organization_id text not null, domain_name text not null, email text not null)`;

  await sql`insert into organizations values ('org_small', 'Acme Studio'), ('org_big', 'Northwind Outreach (250 domains)')`;

  const small = ["acmestudio.com", "acmefounders.com", "acmehq.com"];
  for (const [i, name] of small.entries()) {
    await sql`insert into domains values (${"dom_s" + i}, 'org_small', ${name}, 'connected')`;
  }
  // acmehq.com has real DNS signal, acmefounders.com has never been checked
  await sql`insert into dns_records (domain_name, record_type, status) values
    ('acmehq.com', 'spf', 'valid'), ('acmehq.com', 'dkim', 'valid'), ('acmehq.com', 'dmarc', 'warning'),
    ('acmestudio.com', 'spf', 'valid'), ('acmestudio.com', 'dkim', 'invalid'), ('acmestudio.com', 'dmarc', 'valid')`;

  for (let i = 1; i <= 250; i++) {
    const name = `northwind-${String(i).padStart(3, "0")}.com`;
    await sql`insert into domains values (${"dom_b" + i}, 'org_big', ${name}, 'connected')`;
    // every third domain has a full set of dns rows, mixed statuses
    if (i % 3 === 0) {
      for (const t of ["spf", "dkim", "dmarc"]) {
        await sql`insert into dns_records (domain_name, record_type, status) values (${name}, ${t}, ${STATUSES[(i + t.length) % 3]})`;
      }
    }
  }
  await sql`insert into mailboxes values ('mb_1', 'org_small', 'acmehq.com', 'ana@acmehq.com')`;
  console.log("seeded: 2 orgs, 253 domains, dns rows for 85 of them");
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
