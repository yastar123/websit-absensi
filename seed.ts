import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./src/db/schema";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log("Seeding database...");

  // 1. Departments
  const depts = await db.insert(schema.departments).values([
    { name: "IT", description: "Information Technology" },
    { name: "HR", description: "Human Resources" },
    { name: "Finance", description: "Finance and Accounting" },
    { name: "Operations", description: "Operations Department" },
  ]).returning();

  const itDept = depts.find(d => d.name === "IT")!;
  const hrDept = depts.find(d => d.name === "HR")!;
  const finDept = depts.find(d => d.name === "Finance")!;
  const opsDept = depts.find(d => d.name === "Operations")!;

  // 2. Employees (Admins)
  await db.insert(schema.employees).values([
    {
      name: "Admin User",
      email: "admin@company.com",
      role: "admin",
      departmentId: itDept.id,
      password: "demo123",
    }
  ]);

  // 3. Supervisors
  const supervisors = await db.insert(schema.employees).values([
    {
      name: "IT Supervisor",
      email: "supervisor@company.com",
      role: "supervisor",
      departmentId: itDept.id,
      password: "demo123",
    },
    {
      name: "HR Supervisor",
      email: "hr.supervisor@company.com",
      role: "supervisor",
      departmentId: hrDept.id,
      password: "demo123",
    },
    {
      name: "Finance Supervisor",
      email: "fin.supervisor@company.com",
      role: "supervisor",
      departmentId: finDept.id,
      password: "demo123",
    }
  ]).returning();

  const itSup = supervisors.find(s => s.email === "supervisor@company.com")!;
  const hrSup = supervisors.find(s => s.email === "hr.supervisor@company.com")!;

  // 4. Staff
  await db.insert(schema.employees).values([
    {
      name: "IT Staff 1",
      email: "staff@company.com",
      role: "staff",
      departmentId: itDept.id,
      supervisorId: itSup.id,
      password: "demo123",
    },
    {
      name: "IT Staff 2",
      email: "it.staff2@company.com",
      role: "staff",
      departmentId: itDept.id,
      supervisorId: itSup.id,
      password: "demo123",
    },
    {
      name: "HR Staff 1",
      email: "hr.staff1@company.com",
      role: "staff",
      departmentId: hrDept.id,
      supervisorId: hrSup.id,
      password: "demo123",
    }
  ]);

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
