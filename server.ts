import express from "express";
import cors from "cors";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./src/db/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
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
    const { id, ...data } = req.body;
    const values = {
      ...data,
      // If id is empty string or null, don't include it to let serial auto-increment
      ...(id && id !== "" ? { id: parseInt(id) } : {})
    };
    const result = await db.insert(schema.departments).values(values).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Department creation error:", error);
    res.status(500).json({ error: "Failed to create department" });
  }
});

// Employees
app.get("/api/employees", async (req, res) => {
  try {
    const result = await db.query.employees.findMany({
      with: {
        department: true,
      }
    });
    // Transform to match frontend interface
    const transformed = result.map(e => ({
      ...e,
      id: e.id.toString(),
      department: e.department?.name || "Unassigned",
      position: e.role.charAt(0).toUpperCase() + e.role.slice(1),
      leaveQuota: 12,
      usedLeave: 0
    }));
    res.json(transformed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    await db.delete(schema.employees).where(eq(schema.employees.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const { id, department, ...data } = req.body;
    const values = {
      ...data,
      departmentId: data.departmentId ? parseInt(data.departmentId.toString()) : null,
      supervisorId: data.supervisorId ? parseInt(data.supervisorId.toString()) : null,
      // If id is empty string or emp-XXX, don't include it to let serial auto-increment
      ...(id && !id.toString().startsWith('emp-') ? { id: parseInt(id.toString()) } : {})
    };
    
    // Check if employee with this email already exists when creating new
    if (!id || id.toString().startsWith('emp-')) {
      const existing = await db.query.employees.findFirst({
        where: eq(schema.employees.email, data.email)
      });
      if (existing) {
        return res.status(400).json({ error: "Email sudah terdaftar" });
      }
    }

    const result = await db.insert(schema.employees)
      .values(values)
      .onConflictDoUpdate({
        target: schema.employees.id,
        set: values
      })
      .returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Employee creation error:", error);
    res.status(500).json({ error: "Gagal menyimpan data karyawan" });
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
  const { email, password } = req.body;
  try {
    const user = await db.query.employees.findFirst({
      where: eq(schema.employees.email, email),
      with: {
        department: true,
      }
    });
    if (user) {
      // In a real app, we would verify the password here
      // For this demo, we'll allow 'demo123' or any password if not set
      if (password !== "demo123") {
        return res.status(401).json({ error: "Password salah" });
      }

      // Transform to match frontend interface
      const transformed = {
        ...user,
        id: user.id.toString(),
        department: user.department?.name || "Unassigned",
        position: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        leaveQuota: 12,
        usedLeave: 0
      };
      res.json(transformed);
    } else {
      res.status(401).json({ error: "Email tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Manual Attendance (Supervisor only)
app.post("/api/attendance/manual", async (req, res) => {
  const { supervisorId, employeeId, status } = req.body;
  try {
    const supervisor = await db.query.employees.findFirst({
      where: and(
        eq(schema.employees.id, parseInt(supervisorId)),
        eq(schema.employees.role, "supervisor")
      )
    });

    if (!supervisor) {
      return res.status(403).json({ error: "Hanya supervisor yang dapat melakukan absensi manual" });
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    // Check if record already exists
    const existing = await db.query.attendance.findFirst({
      where: and(
        eq(schema.attendance.employeeId, parseInt(employeeId)),
        eq(schema.attendance.date, dateStr)
      )
    });

    let result;
    if (existing) {
      result = await db.update(schema.attendance)
        .set({ status: status || 'present' })
        .where(eq(schema.attendance.id, existing.id))
        .returning();
    } else {
      result = await db.insert(schema.attendance).values({
        employeeId: parseInt(employeeId),
        date: dateStr,
        checkIn: now,
        status: status || 'present'
      }).returning();
    }

    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal melakukan absensi manual" });
  }
});

// Barcode - Generate (Supervisor only)
app.post("/api/barcode/generate", async (req, res) => {
  const { supervisorId } = req.body;
  try {
    const supervisor = await db.query.employees.findFirst({
      where: and(
        eq(schema.employees.id, parseInt(supervisorId)),
        eq(schema.employees.role, "supervisor")
      ),
      with: { department: true }
    });

    if (!supervisor) {
      return res.status(403).json({ error: "Only supervisors can generate barcodes" });
    }

    if (!supervisor.departmentId) {
      return res.status(400).json({ error: "Supervisor must be assigned to a department" });
    }

    await db.update(schema.barcodes)
      .set({ isActive: false })
      .where(eq(schema.barcodes.supervisorId, supervisor.id));

    const code = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    const result = await db.insert(schema.barcodes).values({
      code,
      supervisorId: supervisor.id,
      departmentId: supervisor.departmentId,
      expiresAt,
      isActive: true
    }).returning();

    res.json({
      barcode: result[0],
      department: supervisor.department?.name
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate barcode" });
  }
});

// Barcode - Scan/Login (Staff only)
app.post("/api/barcode/scan", async (req, res) => {
  const { code, staffEmail } = req.body;
  try {
    const barcode = await db.query.barcodes.findFirst({
      where: and(
        eq(schema.barcodes.code, code),
        eq(schema.barcodes.isActive, true),
        gt(schema.barcodes.expiresAt, new Date())
      ),
      with: { department: true, supervisor: true }
    });

    if (!barcode) {
      return res.status(401).json({ error: "Invalid or expired barcode" });
    }

    if (!barcode.departmentId) {
      return res.status(400).json({ error: "Barcode has no department assigned" });
    }

    const staff = await db.query.employees.findFirst({
      where: and(
        eq(schema.employees.email, staffEmail),
        eq(schema.employees.role, "staff"),
        eq(schema.employees.departmentId, barcode.departmentId)
      ),
      with: { department: true }
    });

    if (!staff) {
      return res.status(401).json({ error: "Staff not found or not in this department" });
    }

    const transformed = {
      ...staff,
      id: staff.id.toString(),
      department: staff.department?.name || "Unassigned",
      position: staff.role.charAt(0).toUpperCase() + staff.role.slice(1),
      leaveQuota: 12,
      usedLeave: 0
    };

    res.json(transformed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to scan barcode" });
  }
});

// Get active barcode for supervisor
app.get("/api/barcode/:supervisorId", async (req, res) => {
  try {
    const barcode = await db.query.barcodes.findFirst({
      where: and(
        eq(schema.barcodes.supervisorId, parseInt(req.params.supervisorId)),
        eq(schema.barcodes.isActive, true),
        gt(schema.barcodes.expiresAt, new Date())
      ),
      with: { department: true }
    });

    if (!barcode) {
      return res.status(404).json({ error: "No active barcode found" });
    }

    res.json(barcode);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch barcode" });
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
    lateThreshold: 0, // No tolerance
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

// Activity Logs
app.get("/api/activity-logs", async (req, res) => {
  try {
    const logs = await db.query.activityLogs.findMany({
      with: {
        user: true,
      },
      orderBy: (activityLogs, { desc }) => [desc(activityLogs.timestamp)],
      limit: 100,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
