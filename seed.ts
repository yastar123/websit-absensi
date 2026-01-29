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

  // 1. Create Department
  const [dept] = await db.insert(schema.departments).values({
    name: "IT",
    manager: "Admin",
  }).returning();

  // 2. Create Admin Employee
  await db.insert(schema.employees).values({
    name: "Admin User",
    email: "admin@company.com",
    role: "admin",
    departmentId: dept.id,
    status: "active",
  });

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
