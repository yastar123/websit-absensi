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
}

export interface WorkShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  departmentId?: string;
}

// Storage keys
const STORAGE_KEYS = {
  EMPLOYEES: 'absensi_employees',
  ATTENDANCE: 'absensi_attendance',
  LEAVE_REQUESTS: 'absensi_leave_requests',
  OVERTIME_REQUESTS: 'absensi_overtime_requests',
  DEPARTMENTS: 'absensi_departments',
  SHIFTS: 'absensi_shifts',
  CURRENT_USER: 'absensi_current_user',
};

// Initialize default data
export const initializeDefaultData = () => {
  // Check if already initialized
  if (localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) return;

  const defaultDepartments: Department[] = [
    { id: 'dept-1', name: 'Engineering', description: 'Software Development Team' },
    { id: 'dept-2', name: 'Human Resources', description: 'HR Department' },
    { id: 'dept-3', name: 'Marketing', description: 'Marketing & Sales' },
    { id: 'dept-4', name: 'Finance', description: 'Finance & Accounting' },
  ];

  const defaultShifts: WorkShift[] = [
    { id: 'shift-1', name: 'Regular', startTime: '09:00', endTime: '18:00' },
    { id: 'shift-2', name: 'Early', startTime: '07:00', endTime: '16:00' },
    { id: 'shift-3', name: 'Late', startTime: '14:00', endTime: '23:00' },
  ];

  const defaultEmployees: Employee[] = [
    {
      id: 'emp-1',
      name: 'Admin User',
      email: 'admin@company.com',
      department: 'Human Resources',
      position: 'HR Manager',
      joinDate: '2020-01-15',
      phone: '081234567890',
      role: 'admin',
      leaveQuota: 12,
      usedLeave: 2,
    },
    {
      id: 'emp-2',
      name: 'Supervisor Demo',
      email: 'supervisor@company.com',
      department: 'Engineering',
      position: 'Team Lead',
      joinDate: '2021-03-01',
      phone: '081234567891',
      role: 'supervisor',
      leaveQuota: 12,
      usedLeave: 3,
    },
    {
      id: 'emp-3',
      name: 'Staff Demo',
      email: 'staff@company.com',
      department: 'Engineering',
      position: 'Software Engineer',
      joinDate: '2022-06-15',
      phone: '081234567892',
      role: 'staff',
      supervisorId: 'emp-2',
      leaveQuota: 12,
      usedLeave: 5,
    },
    {
      id: 'emp-4',
      name: 'Budi Santoso',
      email: 'budi@company.com',
      department: 'Engineering',
      position: 'Software Engineer',
      joinDate: '2022-03-01',
      phone: '081234567893',
      role: 'staff',
      supervisorId: 'emp-2',
      leaveQuota: 12,
      usedLeave: 4,
    },
    {
      id: 'emp-5',
      name: 'Siti Rahayu',
      email: 'siti@company.com',
      department: 'Marketing',
      position: 'Marketing Executive',
      joinDate: '2021-06-15',
      phone: '081234567894',
      role: 'staff',
      leaveQuota: 12,
      usedLeave: 3,
    },
    {
      id: 'emp-6',
      name: 'Ahmad Wijaya',
      email: 'ahmad@company.com',
      department: 'Finance',
      position: 'Accountant',
      joinDate: '2023-01-10',
      phone: '081234567895',
      role: 'staff',
      leaveQuota: 12,
      usedLeave: 1,
    },
  ];

  // Generate some attendance records
  const today = new Date();
  const defaultAttendance: AttendanceRecord[] = [];
  
  defaultEmployees.forEach(emp => {
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const random = Math.random();
      let status: AttendanceRecord['status'] = 'present';
      let clockIn = '09:00';
      let clockOut = '18:00';

      if (random < 0.1) {
        status = 'late';
        clockIn = `09:${Math.floor(Math.random() * 30 + 10)}`;
      } else if (random < 0.15) {
        status = 'absent';
        clockIn = undefined as any;
        clockOut = undefined as any;
      } else if (random < 0.2) {
        status = 'leave';
        clockIn = undefined as any;
        clockOut = undefined as any;
      }

      defaultAttendance.push({
        id: `att-${emp.id}-${dateStr}`,
        employeeId: emp.id,
        date: dateStr,
        clockIn,
        clockOut,
        status,
      });
    }
  });

  // Save to localStorage
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(defaultDepartments));
  localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(defaultShifts));
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(defaultEmployees));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(defaultAttendance));
  localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.OVERTIME_REQUESTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultEmployees[0]));
};

// Generic storage helpers
const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setItems = <T>(key: string, items: T[]): void => {
  localStorage.setItem(key, JSON.stringify(items));
};

// Employee operations
export const getEmployees = (): Employee[] => getItems<Employee>(STORAGE_KEYS.EMPLOYEES);
export const getEmployee = (id: string): Employee | undefined => 
  getEmployees().find(e => e.id === id);
export const saveEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  if (index >= 0) {
    employees[index] = employee;
  } else {
    employees.push(employee);
  }
  setItems(STORAGE_KEYS.EMPLOYEES, employees);
};
export const deleteEmployee = (id: string): void => {
  const employees = getEmployees().filter(e => e.id !== id);
  setItems(STORAGE_KEYS.EMPLOYEES, employees);
};

// Attendance operations
export const getAttendanceRecords = (): AttendanceRecord[] => 
  getItems<AttendanceRecord>(STORAGE_KEYS.ATTENDANCE);
export const getEmployeeAttendance = (employeeId: string): AttendanceRecord[] =>
  getAttendanceRecords().filter(a => a.employeeId === employeeId);
export const getTodayAttendance = (employeeId: string): AttendanceRecord | undefined => {
  const today = new Date().toISOString().split('T')[0];
  return getAttendanceRecords().find(a => a.employeeId === employeeId && a.date === today);
};
export const saveAttendance = (record: AttendanceRecord): void => {
  const records = getAttendanceRecords();
  const index = records.findIndex(r => r.id === record.id);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  setItems(STORAGE_KEYS.ATTENDANCE, records);
};

// Leave request operations
export const getLeaveRequests = (): LeaveRequest[] => 
  getItems<LeaveRequest>(STORAGE_KEYS.LEAVE_REQUESTS);
export const getEmployeeLeaveRequests = (employeeId: string): LeaveRequest[] =>
  getLeaveRequests().filter(l => l.employeeId === employeeId);
export const saveLeaveRequest = (request: LeaveRequest): void => {
  const requests = getLeaveRequests();
  const index = requests.findIndex(r => r.id === request.id);
  if (index >= 0) {
    requests[index] = request;
  } else {
    requests.push(request);
  }
  setItems(STORAGE_KEYS.LEAVE_REQUESTS, requests);
};

// Overtime request operations
export const getOvertimeRequests = (): OvertimeRequest[] => 
  getItems<OvertimeRequest>(STORAGE_KEYS.OVERTIME_REQUESTS);
export const getEmployeeOvertimeRequests = (employeeId: string): OvertimeRequest[] =>
  getOvertimeRequests().filter(o => o.employeeId === employeeId);
export const saveOvertimeRequest = (request: OvertimeRequest): void => {
  const requests = getOvertimeRequests();
  const index = requests.findIndex(r => r.id === request.id);
  if (index >= 0) {
    requests[index] = request;
  } else {
    requests.push(request);
  }
  setItems(STORAGE_KEYS.OVERTIME_REQUESTS, requests);
};

// Department operations
export const getDepartments = (): Department[] => 
  getItems<Department>(STORAGE_KEYS.DEPARTMENTS);
export const saveDepartment = (dept: Department): void => {
  const depts = getDepartments();
  const index = depts.findIndex(d => d.id === dept.id);
  if (index >= 0) {
    depts[index] = dept;
  } else {
    depts.push(dept);
  }
  setItems(STORAGE_KEYS.DEPARTMENTS, depts);
};
export const deleteDepartment = (id: string): void => {
  const depts = getDepartments().filter(d => d.id !== id);
  setItems(STORAGE_KEYS.DEPARTMENTS, depts);
};

// Shift operations
export const getShifts = (): WorkShift[] => getItems<WorkShift>(STORAGE_KEYS.SHIFTS);
export const saveShift = (shift: WorkShift): void => {
  const shifts = getShifts();
  const index = shifts.findIndex(s => s.id === shift.id);
  if (index >= 0) {
    shifts[index] = shift;
  } else {
    shifts.push(shift);
  }
  setItems(STORAGE_KEYS.SHIFTS, shifts);
};
export const deleteShift = (id: string): void => {
  const shifts = getShifts().filter(s => s.id !== id);
  setItems(STORAGE_KEYS.SHIFTS, shifts);
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

// Team helpers for supervisors
export const getTeamMembers = (supervisorId: string): Employee[] => {
  return getEmployees().filter(e => e.supervisorId === supervisorId);
};

export const getTeamAttendance = (supervisorId: string): AttendanceRecord[] => {
  const teamMembers = getTeamMembers(supervisorId);
  const teamIds = teamMembers.map(m => m.id);
  return getAttendanceRecords().filter(a => teamIds.includes(a.employeeId));
};

export const getTeamLeaveRequests = (supervisorId: string): LeaveRequest[] => {
  const teamMembers = getTeamMembers(supervisorId);
  const teamIds = teamMembers.map(m => m.id);
  return getLeaveRequests().filter(l => teamIds.includes(l.employeeId));
};

export const getTeamOvertimeRequests = (supervisorId: string): OvertimeRequest[] => {
  const teamMembers = getTeamMembers(supervisorId);
  const teamIds = teamMembers.map(m => m.id);
  return getOvertimeRequests().filter(o => teamIds.includes(o.employeeId));
};

// Statistics helpers
export const getMonthlyStats = (month: number, year: number) => {
  const records = getAttendanceRecords();
  const employees = getEmployees();
  
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

export const getDepartmentStats = () => {
  const employees = getEmployees();
  const departments = getDepartments();
  const today = new Date().toISOString().split('T')[0];
  const records = getAttendanceRecords().filter(r => r.date === today);

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
