# AbsensiPro - Attendance Management System

## Overview
AbsensiPro is a modern attendance management system built with React, TypeScript, and Vite. It provides features for managing employee attendance, leave requests, and overtime tracking with role-based access control.

## User Roles
The system supports 3 user roles:

### 1. Admin (Full Access)
- Dashboard dengan overview kehadiran seluruh karyawan
- Manajemen Karyawan (tambah, edit, hapus)
- Manajemen Departemen
- Approve/reject izin & cuti
- Approve/reject lembur
- Laporan lengkap
- Pengaturan sistem

### 2. Supervisor (Team Management)
- Dashboard kehadiran tim
- Lihat dan kelola anggota tim
- Approve/reject izin tim
- Approve/reject lembur tim
- Laporan tim
- Absensi pribadi

### 3. Staff (Personal Attendance)
- Dashboard pribadi
- Clock in/out absensi
- Pengajuan izin & cuti
- Pengajuan lembur
- Riwayat absensi

## Demo Accounts
- **Admin**: admin@company.com
- **Supervisor**: supervisor@company.com
- **Staff**: staff@company.com

## Project Architecture
- **Frontend**: React with TypeScript, Vite, TailwindCSS, Shadcn/UI
- **Routing**: React Router DOM
- **State Management**: TanStack React Query
- **UI Components**: Shadcn/UI (Radix primitives)
- **Styling**: TailwindCSS with custom configuration
- **Storage**: LocalStorage (demo mode)

## Directory Structure
```
src/
├── components/    # Reusable UI components
│   ├── layout/    # Layout components (AppLayout, AppSidebar)
│   └── ui/        # Shadcn UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and storage
├── pages/         # Page components
│   ├── Dashboard.tsx
│   ├── Attendance.tsx
│   ├── Leave.tsx
│   ├── Overtime.tsx
│   ├── Reports.tsx
│   ├── Team.tsx (Supervisor only)
│   ├── Employees.tsx (Admin only)
│   ├── Departments.tsx (Admin only)
│   └── Settings.tsx (Admin only)
└── test/          # Test files
```

## Running the Project
- Development: `npm run dev` (runs on port 5000)
- Build: `npm run build`
- Preview: `npm run preview`
- Tests: `npm run test`

## Recent Changes
- January 28, 2026: Added 3 user roles (Admin, Supervisor, Staff)
  - Added role-based sidebar navigation
  - Created Team page for supervisors
  - Added demo accounts for all roles
- January 28, 2026: Migrated from Lovable to Replit environment
  - Updated Vite config to use port 5000 and allow all hosts
  - Removed lovable-tagger dependency
