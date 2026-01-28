import express from "express";
import cors from "cors";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./src/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Departments
app.get("/api/departments", async (req, res) => {
  try {
    const result = await db.query.departments.findMany();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

app.post("/api/departments", async (req, res) => {
  try {
    const result = await db.insert(schema.departments).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create department" });
  }
});

// Employees
app.get("/api/employees", async (req, res) => {
  try {
    const result = await db.query.employees.findMany();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const result = await db.insert(schema.employees).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create employee" });
  }
});

// Attendance
app.get("/api/attendance", async (req, res) => {
  try {
    const result = await db.query.attendance.findMany();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

app.post("/api/attendance", async (req, res) => {
  try {
    const result = await db.insert(schema.attendance).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to log attendance" });
  }
});

// Leave Requests
app.get("/api/leave", async (req, res) => {
  try {
    const result = await db.query.leaveRequests.findMany();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

app.post("/api/leave", async (req, res) => {
  try {
    const result = await db.insert(schema.leaveRequests).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit leave request" });
  }
});

// Overtime
app.get("/api/overtime", async (req, res) => {
  try {
    const result = await db.query.overtime.findMany();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch overtime" });
  }
});

app.post("/api/overtime", async (req, res) => {
  try {
    const result = await db.insert(schema.overtime).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit overtime request" });
  }
});

// Auth
app.post("/api/login", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db.query.employees.findFirst({
      where: eq(schema.employees.email, email)
    });
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Email not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Reports
app.get("/api/reports/stats", async (req, res) => {
  const { month, department } = req.query;
  try {
    const employees = await db.query.employees.findMany();
    const attendance = await db.query.attendance.findMany();
    res.json({ employees, attendance });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report stats" });
  }
});

// Settings
app.get("/api/settings", async (req, res) => {
  res.json({
    companyName: "PT. AbsensiPro Indonesia",
    workStartTime: "09:00",
    workEndTime: "18:00",
    lateThreshold: 15,
  });
});

// Shifts
app.get("/api/shifts", async (req, res) => {
  try {
    // Basic mock for now, can be table later
    res.json([
      { id: 'shift-1', name: 'Regular', startTime: '09:00', endTime: '18:00' },
      { id: 'shift-2', name: 'Early', startTime: '07:00', endTime: '16:00' },
      { id: 'shift-3', name: 'Late', startTime: '14:00', endTime: '23:00' },
    ]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shifts" });
  }
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
