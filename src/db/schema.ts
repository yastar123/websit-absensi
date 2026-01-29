import { pgTable, serial, text, timestamp, date, integer, doublePrecision, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  manager: text("manager"),
  employeeCount: integer("employee_count").default(0),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  departmentId: integer("department_id").references(() => departments.id),
  email: text("email").unique(),
  phone: text("phone"),
  joinDate: date("join_date"),
  status: text("status").default("active"),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  date: date("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  status: text("status"), // present, late, absent
});

export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  type: text("type").notNull(), // annual, sick, etc.
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  status: text("status").default("pending"), // pending, approved, rejected
});

export const overtime = pgTable("overtime", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  date: date("date").notNull(),
  hours: doublePrecision("hours").notNull(),
  reason: text("reason"),
  status: text("status").default("pending"),
});

export const barcodes = pgTable("barcodes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  supervisorId: integer("supervisor_id").references(() => employees.id),
  departmentId: integer("department_id").references(() => departments.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
});

export const employeesRelations = relations(employees, ({ one }) => ({
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
}));

export const barcodesRelations = relations(barcodes, ({ one }) => ({
  supervisor: one(employees, {
    fields: [barcodes.supervisorId],
    references: [employees.id],
  }),
  department: one(departments, {
    fields: [barcodes.departmentId],
    references: [departments.id],
  }),
}));
