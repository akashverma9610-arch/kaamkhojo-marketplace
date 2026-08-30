import { createInsertSchema } from "drizzle-zod";
import { boolean, date, index, integer, numeric, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
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
  serviceCategories: text("service_categories").array().notNull().default([]),
  avatar: text("avatar").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const serviceCategoriesTable = pgTable("service_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  slug: text("slug").notNull().default(""),
  parentCategory: text("parent_category").notNull().default(""),
  group: text("group").notNull().default("Home Services"),
  startingPrice: integer("starting_price").notNull(),
  active: boolean("active").notNull().default(true),
});

export const techniciansTable = pgTable("technicians", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  serviceCategories: text("service_categories").array().notNull().default([]),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
  reviewCount: integer("review_count").notNull(),
  distance: text("distance").notNull(),
  location: text("location").notNull(),
  avatar: text("avatar").notNull(),
  verified: boolean("verified").notNull().default(false),
  availableToday: boolean("available_today").notNull().default(false),
});

export const technicianServicesTable = pgTable("technician_services", {
  technicianId: text("technician_id").notNull().references(() => techniciansTable.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => serviceCategoriesTable.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.technicianId, table.categoryId] }),
}));

export const serviceRequestsTable = pgTable("service_requests", {
  id: text("id").primaryKey(),
  service: text("service").notNull(),
  technicianName: text("technician_name").notNull(),
  customerName: text("customer_name").notNull(),
  schedule: text("schedule").notNull(),
  status: text("status").notNull(),
  amount: integer("amount").notNull(),
});

export const workRequestsTable = pgTable("work_requests", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => profilesTable.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => serviceCategoriesTable.id),
  problemTitle: text("problem_title").notNull(),
  description: text("description").notNull(),
  city: text("city").notNull(),
  area: text("area").notNull(),
  address: text("address").notNull(),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  preferredDate: date("preferred_date", { mode: "string" }),
  preferredTime: text("preferred_time").notNull(),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  budgetText: text("budget_text").notNull(),
  urgency: text("urgency").notNull(),
  status: text("status").notNull().default("OPEN"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  customerIdx: index("work_requests_customer_id_idx").on(table.customerId),
  categoryIdx: index("work_requests_category_id_idx").on(table.categoryId),
  statusIdx: index("work_requests_status_idx").on(table.status),
}));

export const workRequestPhotosTable = pgTable("work_request_photos", {
  id: text("id").primaryKey(),
  workRequestId: text("work_request_id").notNull().references(() => workRequestsTable.id, { onDelete: "cascade" }),
  photoUrl: text("photo_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  workRequestIdx: index("work_request_photos_work_request_id_idx").on(table.workRequestId),
}));

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertServiceCategorySchema = createInsertSchema(serviceCategoriesTable);
export const insertTechnicianSchema = createInsertSchema(techniciansTable);
export const insertTechnicianServiceSchema = createInsertSchema(technicianServicesTable);
export const insertServiceRequestSchema = createInsertSchema(serviceRequestsTable);
export const insertWorkRequestSchema = createInsertSchema(workRequestsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertWorkRequestPhotoSchema = createInsertSchema(workRequestPhotosTable).omit({
  createdAt: true,
});

export type Profile = typeof profilesTable.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type ServiceCategory = typeof serviceCategoriesTable.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type Technician = typeof techniciansTable.$inferSelect;
export type TechnicianService = typeof technicianServicesTable.$inferSelect;
export type InsertTechnicianService = z.infer<typeof insertTechnicianServiceSchema>;
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type ServiceRequest = typeof serviceRequestsTable.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type WorkRequest = typeof workRequestsTable.$inferSelect;
export type InsertWorkRequest = z.infer<typeof insertWorkRequestSchema>;
export type WorkRequestPhoto = typeof workRequestPhotosTable.$inferSelect;
export type InsertWorkRequestPhoto = z.infer<typeof insertWorkRequestPhotoSchema>;

export const WORK_REQUEST_STATUSES = [
  "OPEN",
  "TECHNICIAN_INTERESTED",
  "TECHNICIAN_SELECTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type WorkRequestStatus = (typeof WORK_REQUEST_STATUSES)[number];