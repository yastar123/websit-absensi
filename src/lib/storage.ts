// Types
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  joinDate: string;
  phone: string;
  role: 'admin' | 'supervisor' | 'staff';
  supervisorId?: string;
  avatar?: string;
  leaveQuota: number;
  usedLeave: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: 'present' | 'absent' | 'late' | 'leave' | 'sick';
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'personal';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  manager?: string;
}

export interface WorkShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  departmentId?: string;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'absensi_current_user',
};

const API_URL = "/api";

export const initializeDefaultData = () => {
  // We'll let the backend handle data initialization if needed
};

export const getEmployees = async (): Promise<Employee[]> => {
  const res = await fetch(`${API_URL}/employees`);
  return res.json();
};

export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const res = await fetch(`${API_URL}/attendance`);
  return res.json();
};

export const getDepartments = async (): Promise<Department[]> => {
  const res = await fetch(`${API_URL}/departments`);
  return res.json();
};

export const getActivityLogs = async (): Promise<any[]> => {
  const res = await fetch(`${API_URL}/activity-logs`);
  return res.json();
};

export const login = async (email: string, password?: string): Promise<Employee> => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  return res.json();
};

export const markAttendanceManual = async (supervisorId: string, employeeId: string): Promise<AttendanceRecord> => {
  const res = await fetch(`${API_URL}/attendance/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ supervisorId, employeeId, status: 'present' }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Gagal melakukan absensi manual");
  }
  return res.json();
};

export const loginWithBarcode = async (code: string, staffEmail: string): Promise<Employee> => {
  const res = await fetch(`${API_URL}/barcode/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, staffEmail }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Barcode login failed");
  }
  return res.json();
};

export interface Barcode {
  id: number;
  code: string;
  supervisorId: number;
  departmentId: number;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export const generateBarcode = async (supervisorId: string): Promise<{ barcode: Barcode; department: string }> => {
  const res = await fetch(`${API_URL}/barcode/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ supervisorId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to generate barcode");
  }
  return res.json();
};

export const getActiveBarcode = async (supervisorId: string): Promise<Barcode | null> => {
  const res = await fetch(`${API_URL}/barcode/${supervisorId}`);
  if (!res.ok) return null;
  return res.json();
};

export const saveAttendance = async (record: AttendanceRecord): Promise<AttendanceRecord> => {
  const res = await fetch(`${API_URL}/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  return res.json();
};

export const saveLeaveRequest = async (request: LeaveRequest): Promise<LeaveRequest> => {
  const res = await fetch(`${API_URL}/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return res.json();
};

export const saveOvertimeRequest = async (request: OvertimeRequest): Promise<OvertimeRequest> => {
  const res = await fetch(`${API_URL}/overtime`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return res.json();
};

export const getEmployeeAttendance = async (employeeId: string): Promise<AttendanceRecord[]> => {
  const records = await getAttendanceRecords();
  return records.filter(a => a.employeeId === employeeId);
};

export const getTodayAttendance = async (employeeId: string): Promise<AttendanceRecord | undefined> => {
  const today = new Date().toISOString().split('T')[0];
  const records = await getAttendanceRecords();
  return records.find(a => a.employeeId === employeeId && a.date === today);
};

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  const res = await fetch(`${API_URL}/leave`);
  return res.json();
};

export const getOvertimeRequests = async (): Promise<OvertimeRequest[]> => {
  const res = await fetch(`${API_URL}/overtime`);
  return res.json();
};

export const getEmployeeLeaveRequests = async (employeeId: string): Promise<LeaveRequest[]> => {
  const requests = await getLeaveRequests();
  return requests.filter(l => l.employeeId === employeeId);
};

export const getEmployeeOvertimeRequests = async (employeeId: string): Promise<OvertimeRequest[]> => {
  const requests = await getOvertimeRequests();
  return requests.filter(o => o.employeeId === employeeId);
};

export const scanBarcode = async (code: string, staffEmail: string): Promise<any> => {
  const res = await fetch(`${API_URL}/barcode/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, staffEmail }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Gagal scan barcode");
  }
  return res.json();
};

export const getShifts = async (): Promise<WorkShift[]> => {
  const res = await fetch(`${API_URL}/shifts`);
  return res.json();
};

export const saveEmployee = async (employee: any): Promise<Employee> => {
  const res = await fetch(`${API_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Gagal menyimpan data karyawan");
  }
  return res.json();
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/employees/${id}`, {
    method: "DELETE",
  });
};

export const saveDepartment = async (department: any): Promise<Department> => {
  const res = await fetch(`${API_URL}/departments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(department),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Gagal menyimpan data departemen");
  }
  return res.json();
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/departments/${id}`, {
    method: "DELETE",
  });
};

export const saveShift = async (shift: WorkShift): Promise<WorkShift> => {
  const res = await fetch(`${API_URL}/shifts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(shift),
  });
  return res.json();
};

export const deleteShift = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/shifts/${id}`, {
    method: "DELETE",
  });
};

// Current user operations
export const getCurrentUser = (): Employee | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};
export const setCurrentUser = (user: Employee): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};
export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getTeamMembers = async (supervisorId: string): Promise<Employee[]> => {
  const employees = await getEmployees();
  return employees.filter(e => e.supervisorId === supervisorId);
};

export const getTeamAttendance = async (supervisorId: string): Promise<AttendanceRecord[]> => {
  const members = await getTeamMembers(supervisorId);
  const teamIds = members.map(m => m.id);
  const records = await getAttendanceRecords();
  return records.filter(a => teamIds.includes(a.employeeId));
};

export const getTeamLeaveRequests = async (supervisorId: string): Promise<LeaveRequest[]> => {
  const members = await getTeamMembers(supervisorId);
  const teamIds = members.map(m => m.id);
  const requests = await getLeaveRequests();
  return requests.filter(l => teamIds.includes(l.employeeId));
};

export const getTeamOvertimeRequests = async (supervisorId: string): Promise<OvertimeRequest[]> => {
  const members = await getTeamMembers(supervisorId);
  const teamIds = members.map(m => m.id);
  const requests = await getOvertimeRequests();
  return requests.filter(o => teamIds.includes(o.employeeId));
};

export const getMonthlyStats = async (month: number, year: number) => {
  const records = await getAttendanceRecords();
  const employees = await getEmployees();
  
  const monthRecords = records.filter(r => {
    const date = new Date(r.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  return {
    totalPresent: monthRecords.filter(r => r.status === 'present').length,
    totalLate: monthRecords.filter(r => r.status === 'late').length,
    totalAbsent: monthRecords.filter(r => r.status === 'absent').length,
    totalLeave: monthRecords.filter(r => r.status === 'leave' || r.status === 'sick').length,
    totalEmployees: employees.length,
  };
};

export const getDepartmentStats = async () => {
  const employees = await getEmployees();
  const departments = await getDepartments();
  const today = new Date().toISOString().split('T')[0];
  const allRecords = await getAttendanceRecords();
  const records = allRecords.filter(r => r.date === today);

  return departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept.name);
    const presentCount = records.filter(r => 
      deptEmployees.some(e => e.id === r.employeeId) && 
      (r.status === 'present' || r.status === 'late')
    ).length;

    return {
      department: dept.name,
      total: deptEmployees.length,
      present: presentCount,
      absent: deptEmployees.length - presentCount,
    };
  });
};
