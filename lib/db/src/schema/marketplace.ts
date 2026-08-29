import { createInsertSchema } from "drizzle-zod";
import { boolean, integer, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  location: text("location").notNull(),
  bio: text("bio").notNull().default(""),
  skills: text("skills").array().notNull().default([]),
  avatar: text("avatar").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const serviceCategoriesTable = pgTable("service_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  startingPrice: integer("starting_price").notNull(),
});

export const techniciansTable = pgTable("technicians", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
  reviewCount: integer("review_count").notNull(),
  distance: text("distance").notNull(),
  location: text("location").notNull(),
  avatar: text("avatar").notNull(),
  verified: boolean("verified").notNull().default(false),
  availableToday: boolean("available_today").notNull().default(false),
});

export const serviceRequestsTable = pgTable("service_requests", {
  id: text("id").primaryKey(),
  service: text("service").notNull(),
  technicianName: text("technician_name").notNull(),
  customerName: text("customer_name").notNull(),
  schedule: text("schedule").notNull(),
  status: text("status").notNull(),
  amount: integer("amount").notNull(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertServiceCategorySchema = createInsertSchema(serviceCategoriesTable);
export const insertTechnicianSchema = createInsertSchema(techniciansTable);
export const insertServiceRequestSchema = createInsertSchema(serviceRequestsTable);

export type Profile = typeof profilesTable.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type ServiceCategory = typeof serviceCategoriesTable.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type Technician = typeof techniciansTable.$inferSelect;
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type ServiceRequest = typeof serviceRequestsTable.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;