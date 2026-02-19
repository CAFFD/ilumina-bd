// ============================================================
// 🏙️ IluminaCity - Database Schema (Drizzle ORM)
// Compatível com a estrutura existente em produção.
// ============================================================

import {
  pgTable,
  uuid,
  text,
  varchar,
  numeric,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// ENUMS (mantendo valores existentes em inglês)
// ============================================================

export const appRoleEnum = pgEnum("app_role", [
  "admin",
  "operator",
  "citizen",
]);

export const occurrenceStatusEnum = pgEnum("occurrence_status", [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "cancelled",
]);

export const priorityLevelEnum = pgEnum("priority_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const workOrderStatusEnum = pgEnum("work_order_status", [
  "pending",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const occurrenceCategoryEnum = pgEnum("occurrence_category", [
  "lampada_queimada",
  "lampada_piscando",
  "vandalismo",
  "outros",
]);

// ============================================================
// TABELAS
// ============================================================

// --- Users (Auth Local) ---
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hash
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Bairros ---
export const neighborhoods = pgTable("neighborhoods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  city: text("city").notNull().default("Palmital"),
  zoneColor: text("zone_color").notNull().default("#3b82f6"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Endereços ---
export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  street: text("street"),
  number: text("number"),
  neighborhoodId: uuid("neighborhood_id").references(() => neighborhoods.id),
  zipCode: text("zip_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Postes (INTOCÁVEL — manter colunas exatas) ---
export const poles = pgTable("poles", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: text("external_id").notNull().unique(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  lampType: text("lamp_type"),
  powerW: numeric("power_w").default("0"),
  ips: text("ips").array().default([]),
  addressId: uuid("address_id").references(() => addresses.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Histórico de IDs de Postes ---
export const poleIdHistory = pgTable("pole_id_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  poleId: uuid("pole_id").notNull().references(() => poles.id),
  oldExternalId: text("old_external_id").notNull(),
  newExternalId: text("new_external_id").notNull(),
  changedBy: uuid("changed_by"),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Categorias ---
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Perfis (vinculados ao auth antigo, agora linkado a users) ---
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id).unique(),
  fullName: text("full_name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Roles de Usuário ---
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  role: appRoleEnum("role").notNull().default("citizen"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Ocorrências ---
export const occurrences = pgTable("occurrences", {
  id: uuid("id").primaryKey().defaultRandom(),
  protocol: text("protocol").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: occurrenceStatusEnum("status").notNull().default("open"),
  priority: priorityLevelEnum("priority").notNull().default("medium"),
  categoryId: uuid("category_id").references(() => categories.id),
  poleId: uuid("pole_id").references(() => poles.id),
  userId: uuid("user_id").references(() => users.id),
  reporterName: text("reporter_name"),
  reporterEmail: text("reporter_email"),
  reporterPhone: text("reporter_phone"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Imagens de Ocorrências ---
export const occurrenceImages = pgTable("occurrence_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  occurrenceId: uuid("occurrence_id").notNull().references(() => occurrences.id),
  imageUrl: text("image_url").notNull(),
  uploadedBy: uuid("uploaded_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Ordens de Serviço ---
export const workOrders = pgTable("work_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  occurrenceId: uuid("occurrence_id").notNull().references(() => occurrences.id),
  status: workOrderStatusEnum("status").notNull().default("pending"),
  priority: priorityLevelEnum("priority").notNull().default("medium"),
  notes: text("notes"),
  scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
  assignedTo: uuid("assigned_to"), // Referência opcional a user/operator
  createdBy: uuid("created_by").notNull().references(() => users.id),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Pivô: Itens da OS (N:N work_orders <-> occurrences) ---
export const workOrderItems = pgTable("work_order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  workOrderId: uuid("work_order_id").notNull().references(() => workOrders.id, { onDelete: "cascade" }),
  occurrenceId: uuid("occurrence_id").notNull().references(() => occurrences.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Pivô: Operadores da OS (N:N work_orders <-> users/profiles) ---
export const workOrderOperators = pgTable("work_order_operators", {
  id: uuid("id").primaryKey().defaultRandom(),
  workOrderId: uuid("work_order_id").notNull().references(() => workOrders.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Logs de Atividade ---
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: text("action").notNull(),
  targetTable: text("target_table"),
  targetId: uuid("target_id"),
  userId: uuid("user_id").references(() => users.id),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// RELAÇÕES (Drizzle ORM)
// ============================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  roles: many(userRoles),
  occurrences: many(occurrences),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  neighborhood: one(neighborhoods, {
    fields: [addresses.neighborhoodId],
    references: [neighborhoods.id],
  }),
}));

export const polesRelations = relations(poles, ({ one, many }) => ({
  address: one(addresses, {
    fields: [poles.addressId],
    references: [addresses.id],
  }),
  idHistory: many(poleIdHistory),
  occurrences: many(occurrences),
}));

export const poleIdHistoryRelations = relations(poleIdHistory, ({ one }) => ({
  pole: one(poles, {
    fields: [poleIdHistory.poleId],
    references: [poles.id],
  }),
}));

export const occurrencesRelations = relations(occurrences, ({ one, many }) => ({
  category: one(categories, {
    fields: [occurrences.categoryId],
    references: [categories.id],
  }),
  pole: one(poles, {
    fields: [occurrences.poleId],
    references: [poles.id],
  }),
  reporter: one(users, {
    fields: [occurrences.userId],
    references: [users.id],
  }),
  images: many(occurrenceImages),
  workOrderItems: many(workOrderItems),
}));

export const occurrenceImagesRelations = relations(occurrenceImages, ({ one }) => ({
  occurrence: one(occurrences, {
    fields: [occurrenceImages.occurrenceId],
    references: [occurrences.id],
  }),
}));

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  items: many(workOrderItems),
  operators: many(workOrderOperators),
  creator: one(users, {
      fields: [workOrders.createdBy],
      references: [users.id]
  })
}));

export const workOrderItemsRelations = relations(workOrderItems, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderItems.workOrderId],
    references: [workOrders.id],
  }),
  occurrence: one(occurrences, {
    fields: [workOrderItems.occurrenceId],
    references: [occurrences.id],
  }),
}));

export const workOrderOperatorsRelations = relations(workOrderOperators, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderOperators.workOrderId],
    references: [workOrders.id],
  }),
  user: one(users, {
      fields: [workOrderOperators.userId],
      references: [users.id]
  })
}));
