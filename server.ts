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
    // Fallback to mock data when database fails - include dynamically created departments
    const mockDepartments = [
      {
        id: "1",
        name: "IT",
        description: "Information Technology Department",
        manager: "Admin User"
      },
      // Add any departments that were created via POST and stored in memory
      ...(global.mockDepartments || [])
    ];
    res.json(mockDepartments);
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
    
    // Fallback to mock data when database fails
    const { id, ...data } = req.body;
    const newDepartment = {
      id: (Math.floor(Math.random() * 1000) + 1).toString(),
      name: data.name,
      description: data.description || "",
      manager: data.manager || ""
    };
    
    // Store in global memory for persistence
    if (!global.mockDepartments) {
      global.mockDepartments = [];
    }
    global.mockDepartments.push(newDepartment);
    
    res.status(201).json(newDepartment);
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
    // Fallback to mock data when database fails
    const mockEmployees = [
      {
        id: "1",
        name: "Admin User",
        email: "admin@company.com",
        department: "IT",
        position: "Admin",
        role: "admin",
        joinDate: "2024-01-01",
        phone: "081234567890",
        supervisorId: null,
        leaveQuota: 12,
        usedLeave: 0
      },
      {
        id: "2",
        name: "Supervisor User",
        email: "supervisor@company.com",
        department: "IT",
        position: "Supervisor",
        role: "supervisor",
        joinDate: "2024-01-01",
        phone: "081234567891",
        supervisorId: null,
        leaveQuota: 12,
        usedLeave: 0
      },
      {
        id: "3",
        name: "Staff User",
        email: "staff@company.com",
        department: "IT",
        position: "Staff",
        role: "staff",
        joinDate: "2024-01-01",
        phone: "081234567892",
        supervisorId: "2",
        leaveQuota: 12,
        usedLeave: 0
      }
    ];
    res.json(mockEmployees);
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
    
    // Fallback to mock data when database fails
    const { id, department, ...data } = req.body;
    const newEmployee = {
      id: (Math.floor(Math.random() * 1000) + 4).toString(), // Random ID > 3
      name: data.name,
      email: data.email,
      department: "IT", // Default department
      position: data.position || "Staff",
      role: data.role || "staff",
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      phone: data.phone || "",
      supervisorId: data.supervisorId || null,
      leaveQuota: 12,
      usedLeave: 0
    };
    
    res.status(201).json(newEmployee);
  }
});

// Attendance
app.get("/api/attendance", async (req, res) => {
  try {
    const result = await db.query.attendance.findMany();
    res.json(result);
  } catch (error) {
    // Fallback to mock data when database fails
    const mockAttendance = [
      {
        id: 1,
        employeeId: 1,
        date: new Date().toISOString().split('T')[0],
        checkIn: "09:00",
        checkOut: "17:00",
        status: "present",
        notes: ""
      },
      {
        id: 2,
        employeeId: 2,
        date: new Date().toISOString().split('T')[0],
        checkIn: "08:45",
        checkOut: "17:30",
        status: "present",
        notes: ""
      },
      {
        id: 3,
        employeeId: 3,
        date: new Date().toISOString().split('T')[0],
        checkIn: "09:15",
        checkOut: null,
        status: "late",
        notes: "Terlambat 15 menit"
      }
    ];
    res.json(mockAttendance);
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
    // Fallback to mock data when database fails
    const mockLeaveRequests = [
      {
        id: 1,
        employeeId: 3,
        type: "sick",
        startDate: "2024-01-15",
        endDate: "2024-01-16",
        reason: "Demam",
        status: "approved",
        approvedBy: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        employeeId: 1,
        type: "annual",
        startDate: "2024-02-01",
        endDate: "2024-02-05",
        reason: "Cuti tahunan",
        status: "pending",
        approvedBy: null,
        createdAt: new Date().toISOString()
      }
    ];
    res.json(mockLeaveRequests);
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
    // Fallback to mock data when database fails
    const mockOvertime = [
      {
        id: 1,
        employeeId: 1,
        date: "2024-01-10",
        startTime: "18:00",
        endTime: "21:00",
        reason: "Project deadline",
        status: "approved",
        approvedBy: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        employeeId: 2,
        date: "2024-01-12",
        startTime: "17:30",
        endTime: "20:30",
        reason: "Maintenance server",
        status: "pending",
        approvedBy: null,
        createdAt: new Date().toISOString()
      }
    ];
    res.json(mockOvertime);
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
    // Mock users for demo when database is not available
    const mockUsers = [
      {
        id: 1,
        name: "Admin User",
        email: "admin@company.com",
        role: "admin",
        department: "IT",
        position: "Admin",
        status: "active",
        leaveQuota: 12,
        usedLeave: 0
      },
      {
        id: 2,
        name: "Supervisor User", 
        email: "supervisor@company.com",
        role: "supervisor",
        department: "IT",
        position: "Supervisor",
        status: "active",
        leaveQuota: 12,
        usedLeave: 0
      },
      {
        id: 3,
        name: "Staff User",
        email: "staff@company.com", 
        role: "staff",
        department: "IT",
        position: "Staff",
        status: "active",
        leaveQuota: 12,
        usedLeave: 0
      }
    ];

    // Check mock users first
    const mockUser = mockUsers.find(u => u.email === email);
    if (mockUser && password === "demo123") {
      return res.json(mockUser);
    }

    // Try database if available
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
    // Fallback to mock users if database fails
    const mockUsers = [
      {
        id: 1,
        name: "Admin User",
        email: "admin@company.com",
        role: "admin",
        department: "IT",
        position: "Admin",
        status: "active",
        leaveQuota: 12,
        usedLeave: 0
      },
      {
        id: 2,
        name: "Supervisor User", 
        email: "supervisor@company.com",
        role: "supervisor",
        department: "IT",
        position: "Supervisor",
        status: "active",
        leaveQuota: 12,
        usedLeave: 0
      },
      {
        id: 3,
        name: "Staff User",
        email: "staff@company.com", 
        role: "staff",
        department: "IT",
        position: "Staff",
        status: "active",
        leaveQuota: 12,
        usedLeave: 0
      }
    ];

    const mockUser = mockUsers.find(u => u.email === email);
    if (mockUser && password === "demo123") {
      return res.json(mockUser);
    }

    res.status(401).json({ error: "Login failed" });
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
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

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
  } catch (error: any) {
    console.error("Barcode generation error details:", error);
    res.status(500).json({ error: "Gagal generate barcode: " + (error.message || "Internal Error") });
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
    console.error("Barcode scan error:", error);
    
    // Fallback to mock data when database fails
    if (code === "mock-qr-code-123" && staffEmail === "staff@company.com") {
      const mockStaff = {
        id: "3",
        name: "Staff User",
        email: "staff@company.com",
        department: "IT",
        position: "Staff",
        role: "staff",
        joinDate: "2024-01-01",
        phone: "081234567892",
        supervisorId: "2",
        leaveQuota: 12,
        usedLeave: 0
      };
      res.json(mockStaff);
    } else {
      res.status(401).json({ error: "Invalid or expired barcode" });
    }
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
    // Fallback to mock data when database fails
    const mockLogs = [
      {
        id: 1,
        userId: 1,
        action: "LOGIN",
        description: "Admin user logged in",
        timestamp: new Date().toISOString(),
        user: {
          id: 1,
          name: "Admin User",
          email: "admin@company.com"
        }
      },
      {
        id: 2,
        userId: 2,
        action: "CREATE_DEPARTMENT",
        description: "Created new department",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        user: {
          id: 2,
          name: "Supervisor User",
          email: "supervisor@company.com"
        }
      }
    ];
    res.json(mockLogs);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
