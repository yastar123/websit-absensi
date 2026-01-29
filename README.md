# AbsensiPro - Sistem Manajemen Kehadiran Modern

AbsensiPro adalah platform manajemen kehadiran (attendance management) yang dirancang untuk efisiensi dan transparansi dalam pengelolaan karyawan. Sistem ini mendukung peran bertingkat (Role-Based Access Control) untuk Admin, Supervisor, dan Staff.

## 🚀 Fitur Utama

### 1. Dashboard Interaktif
- **Admin**: Ringkasan kehadiran seluruh perusahaan, statistik mingguan, dan notifikasi persetujuan yang tertunda.
- **Supervisor**: Monitoring kehadiran tim, ringkasan anggota tim, dan pengelolaan pengajuan izin/lembur tim.
- **Staff**: Pencatatan kehadiran (Clock In/Out), sisa cuti, dan status pengajuan pribadi.

### 2. Manajemen Karyawan & Departemen (Admin)
- Menambah, mengedit, dan menonaktifkan akun karyawan.
- Pengaturan departemen dan penugasan Supervisor.
- Filter peran (Admin, Supervisor, Staff) untuk manajemen yang lebih mudah.

### 3. Sistem Kehadiran (Attendance)
- Pencatatan waktu masuk (Clock In) dan keluar (Clock Out).
- Deteksi keterlambatan otomatis berdasarkan aturan perusahaan.
- Riwayat kehadiran lengkap dengan status (Hadir, Terlambat, Izin, Sakit).

### 4. Pengajuan Izin & Cuti (Leave Requests)
- Formulir pengajuan izin/cuti untuk karyawan.
- Alur persetujuan (approval) oleh Admin atau Supervisor.
- Pemantauan kuota cuti tahunan.

### 5. Pengajuan Lembur (Overtime)
- Pengajuan jam lembur untuk tugas tambahan.
- Persetujuan lembur yang terintegrasi dengan laporan.

### 6. Laporan (Reports)
- Laporan bulanan otomatis.
- Statistik kehadiran per departemen.
- Ekspor data untuk kebutuhan penggajian (payroll).

## 🛠️ Arsitektur Teknologi

- **Frontend**: React (TypeScript), Vite, TailwindCSS, Shadcn/UI.
- **Backend**: Express.js (Node.js) dengan TypeScript.
- **Database**: PostgreSQL dengan Drizzle ORM.
- **State Management**: React Query (TanStack Query).

## 🔑 Akun Demo (Gunakan untuk Pengujian)

| Peran | Email | Password |
|-------|-------|----------|
| **Admin** | `admin@company.com` | `demo123` |
| **Supervisor** | `supervisor@company.com` | `demo123` |
| **Staff** | `staff@company.com` | `demo123` |

## ⚙️ Cara Menjalankan Project

1. Pastikan database PostgreSQL sudah dikonfigurasi di environment.
2. Jalankan seeding untuk data awal:
   ```bash
   npx tsx src/db/seed.ts
   ```
3. Mulai Backend:
   ```bash
   npx tsx server.ts
   ```
4. Mulai Frontend:
   ```bash
   npm run dev
   ```

---
*Dikembangkan dengan ❤️ untuk produktivitas yang lebih baik.*
