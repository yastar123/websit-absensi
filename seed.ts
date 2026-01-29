import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./src/db/schema";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log("Upserting seed data...");

  // 1. Create or get IT Department
  let dept = await db.query.departments.findFirst({
    where: eq(schema.departments.name, "IT"),
  });

  if (!dept) {
    const result = await db.insert(schema.departments).values({
      name: "IT",
      manager: "Admin",
    }).returning();
    dept = result[0];
  }

  const users = [
    {
      name: "Admin User",
      email: "admin@company.com",
      role: "admin",
      departmentId: dept.id,
      status: "active",
    },
    {
      name: "Supervisor User",
      email: "supervisor@company.com",
      role: "supervisor",
      departmentId: dept.id,
      status: "active",
    },
    {
      name: "Staff User",
      email: "staff@company.com",
      role: "staff",
      departmentId: dept.id,
      status: "active",
    },
  ];

  for (const user of users) {
    const existing = await db.query.employees.findFirst({
      where: eq(schema.employees.email, user.email),
    });

    if (!existing) {
      await db.insert(schema.employees).values(user);
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }

  console.log("Upserting completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Upserting failed:", err);
  process.exit(1);
});
