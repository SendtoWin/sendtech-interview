import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

// status: 'registering' | 'awaiting_nameservers' | 'connected'
export const domains = pgTable("domains", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// The DNS validator (a 6-hourly sweep, out of scope for this repo) writes one
// row per (domain, record_type). status: 'valid' | 'invalid' | 'warning' | 'pending'
export const dnsRecords = pgTable("dns_records", {
  id: integer("id").primaryKey(),
  domainName: text("domain_name").notNull(),
  recordType: text("record_type").notNull(), // spf | dkim | dmarc
  status: text("status").notNull(),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

export const mailboxes = pgTable("mailboxes", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  domainName: text("domain_name").notNull(),
  email: text("email").notNull(),
});
