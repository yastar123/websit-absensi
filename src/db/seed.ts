import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log("Seeding database...");

  // Seed Departments
  const depts = await db.insert(schema.departments).values([
    { name: "IT", manager: "Admin User", employeeCount: 1 },
    { name: "HR", manager: "Supervisor User", employeeCount: 1 },
    { name: "Operations", manager: "Supervisor User", employeeCount: 1 },
  ]).returning();

  const itDept = depts.find(d => d.name === "IT");
  const hrDept = depts.find(d => d.name === "HR");

  // Seed Employees (Demo Accounts)
  const employees = await db.insert(schema.employees).values([
    {
      name: "Admin User",
      role: "admin",
      email: "admin@company.com",
      departmentId: itDept?.id,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
    },
    {
      name: "Supervisor User",
      role: "supervisor",
      email: "supervisor@company.com",
      departmentId: hrDept?.id,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
    },
    {
      name: "Staff User",
      role: "staff",
      email: "staff@company.com",
      departmentId: itDept?.id,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
    },
  ]).returning();

  // Seed Leave Types
  await db.insert(schema.leaveTypes).values([
    { name: "Cuti Tahunan", description: "Jatah cuti tahunan", defaultQuota: 12, isActive: true },
    { name: "Sakit", description: "Izin sakit dengan surat dokter", defaultQuota: 0, isActive: true },
    { name: "Izin Pribadi", description: "Izin untuk keperluan pribadi", defaultQuota: 0, isActive: true },
  ]).onConflictDoNothing();

  console.log("Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
