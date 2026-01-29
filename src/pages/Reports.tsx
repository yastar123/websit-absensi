import { useState, useEffect } from "react";
import { 
  FileBarChart, 
  Download, 
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  getEmployees, 
  getAttendanceRecords,
  getDepartments,
  Employee,
  AttendanceRecord,
  Department
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      const [emps, depts, records] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getAttendanceRecords()
      ]);
      setEmployees(emps);
      setDepartments(depts);
      setAllRecords(records);
    };
    fetchData();
  }, []);

  const currentYear = new Date().getFullYear();
  const filteredRecords = allRecords.filter(r => {
    const date = new Date(r.date);
    return date.getMonth() === parseInt(selectedMonth) && date.getFullYear() === currentYear;
  });

  const employeeStats = employees
    .filter(e => selectedDepartment === 'all' || e.department === selectedDepartment)
    .map(emp => {
      const empRecords = filteredRecords.filter(r => r.employeeId === emp.id);
      const present = empRecords.filter(r => r.status === 'present').length;
      const late = empRecords.filter(r => r.status === 'late').length;
      const absent = empRecords.filter(r => r.status === 'absent').length;
      const leave = empRecords.filter(r => r.status === 'leave' || r.status === 'sick').length;
      
      return {
        ...emp,
        present,
        late,
        absent,
        leave,
        total: present + late + absent + leave,
        attendanceRate: ((present + late) / Math.max(present + late + absent, 1) * 100).toFixed(1),
      };
    });

  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const dayRecords = filteredRecords.filter(r => {
      const date = new Date(r.date);
      return date.getDate() === day;
    });
    
    return {
      day: day.toString(),
      hadir: dayRecords.filter(r => r.status === 'present').length,
      terlambat: dayRecords.filter(r => r.status === 'late').length,
    };
  }).filter(d => d.hadir > 0 || d.terlambat > 0);

  const handleExport = (format: 'excel' | 'pdf') => {
    toast({
      title: "Mengunduh Laporan",
      description: `Laporan sedang disiapkan dalam format ${format.toUpperCase()}...`,
    });
    
    // Simple simulation of download
    setTimeout(() => {
      const blob = new Blob(["Simulated report content"], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Absensi_${selectedMonth}_${selectedDepartment}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 1500);
  };

  const months = [
    { value: '0', label: 'Januari' },
    { value: '1', label: 'Februari' },
    { value: '2', label: 'Maret' },
    { value: '3', label: 'April' },
    { value: '4', label: 'Mei' },
    { value: '5', label: 'Juni' },
    { value: '6', label: 'Juli' },
    { value: '7', label: 'Agustus' },
    { value: '8', label: 'September' },
    { value: '9', label: 'Oktober' },
    { value: '10', label: 'November' },
    { value: '11', label: 'Desember' },
  ];

  const totalPresent = employeeStats.reduce((sum, e) => sum + e.present, 0);
  const totalLate = employeeStats.reduce((sum, e) => sum + e.late, 0);
  const totalAbsent = employeeStats.reduce((sum, e) => sum + e.absent, 0);
  const avgAttendanceRate = employeeStats.length > 0
    ? (employeeStats.reduce((sum, e) => sum + parseFloat(e.attendanceRate), 0) / employeeStats.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan</h1>
          <p className="text-muted-foreground">Analisis dan rekap kehadiran karyawan</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-vercel">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter:</span>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40 bg-background">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-44 bg-background">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Semua Departemen</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-vercel">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalPresent}</p>
                <p className="text-xs text-muted-foreground">Total Hadir</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-vercel">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalLate}</p>
                <p className="text-xs text-muted-foreground">Terlambat</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-vercel">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Users className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalAbsent}</p>
                <p className="text-xs text-muted-foreground">Tidak Hadir</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-vercel">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgAttendanceRate}%</p>
                <p className="text-xs text-muted-foreground">Rata-rata Kehadiran</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Attendance Chart */}
      <Card className="card-vercel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" />
            Tren Kehadiran Harian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="hadir" name="Hadir" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="terlambat" name="Terlambat" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Employee Report Table */}
      <Card className="card-vercel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileBarChart className="h-4 w-4 text-primary" />
            Rekap Per Karyawan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nama</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead className="text-center">Hadir</TableHead>
                <TableHead className="text-center">Terlambat</TableHead>
                <TableHead className="text-center">Tidak Hadir</TableHead>
                <TableHead className="text-center">Cuti/Izin</TableHead>
                <TableHead className="text-right">Tingkat Kehadiran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeStats.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{emp.department}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-success font-medium">{emp.present}</TableCell>
                  <TableCell className="text-center text-warning font-medium">{emp.late}</TableCell>
                  <TableCell className="text-center text-destructive font-medium">{emp.absent}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{emp.leave}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${
                      parseFloat(emp.attendanceRate) >= 90 ? 'text-success' :
                      parseFloat(emp.attendanceRate) >= 75 ? 'text-warning' :
                      'text-destructive'
                    }`}>
                      {emp.attendanceRate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
