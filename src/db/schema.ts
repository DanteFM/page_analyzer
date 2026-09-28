import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const sites = pgTable(
  "sites",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    url: text("url").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // один и тот же url невозможен для одного пользователя
    unique("sites_owner_url_unique").on(table.ownerId, table.url),
    // оптимизация - по ownerId будут идти запросы, добавляем индекс на колонку для Postgres
    index("sites_owner_id_idx").on(table.ownerId)
  ]
);

export const checks = pgTable(
  "checks",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // "cascade" - при удалении сайта, автоматически удалятся его проверки
    siteId: uuid("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["done", "failed"]}).notNull(),
    httpStatus: integer("http_status"),
    responseMs: integer("response_ms"),
    title: text("title"),
    h1: text("h1"),
    description: text("description"),
    error: text("error"),
    details: jsonb("details"), // произвольный JSON
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // оптимизация, по аналогии с таблицей sites
    index("checks_site_id_idx").on(table.siteId)
  ]
)