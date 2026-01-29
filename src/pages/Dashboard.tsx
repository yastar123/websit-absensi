import { useEffect, useState } from "react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  CalendarDays,
  Bell,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  getCurrentUser, 
  getEmployees, 
  getMonthlyStats,
  getDepartmentStats,
  getTodayAttendance,
  getTeamMembers,
  getTeamLeaveRequests,
  getTeamOvertimeRequests,
  getLeaveRequests,
  getOvertimeRequests,
  getEmployeeLeaveRequests,
  getEmployeeOvertimeRequests,
  saveAttendance,
  AttendanceRecord,
  Employee,
  LeaveRequest,
  OvertimeRequest
} from "@/lib/storage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ title, value, change, changeType, icon, iconBg }: StatCardProps) {
  return (
    <Card className="card-vercel">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {change && (
                <span className={`flex items-center text-xs font-medium ${
                  changeType === 'positive' ? 'text-success' : 'text-destructive'
                }`}>
                  {changeType === 'positive' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {change}
                </span>
              )}
            </div>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [pendingLeave, setPendingLeave] = useState<LeaveRequest[]>([]);
  const [pendingOvertime, setPendingOvertime] = useState<OvertimeRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      const [emps, mStats, dStats, lReqs, oReqs] = await Promise.all([
        getEmployees(),
        getMonthlyStats(today.getMonth(), today.getFullYear()),
        getDepartmentStats(),
        getLeaveRequests(),
        getOvertimeRequests()
      ]);
      setEmployees(emps);
      setMonthlyStats(mStats);
      setDepartmentStats(dStats);
      setPendingLeave(lReqs.filter(l => l.status === 'pending'));
      setPendingOvertime(oReqs.filter(o => o.status === 'pending'));
    };
    
    // Only fetch once on mount
    fetchData();
  }, []); // Keep empty array for initial load only

  const weeklyData = [
    { name: 'Sen', hadir: 45, terlambat: 3, izin: 2 },
    { name: 'Sel', hadir: 47, terlambat: 2, izin: 1 },
    { name: 'Rab', hadir: 44, terlambat: 4, izin: 2 },
    { name: 'Kam', hadir: 46, terlambat: 2, izin: 2 },
    { name: 'Jum', hadir: 48, terlambat: 1, izin: 1 },
  ];

  const pieData = departmentStats.map((stat, index) => ({
    name: stat.department,
    value: stat.present,
    color: ['#0070F3', '#7928CA', '#FF0080', '#F5A623'][index % 4]
  }));

  const COLORS = ['#0070F3', '#7928CA', '#FF0080', '#F5A623'];

  if (!monthlyStats) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Karyawan"
          value={employees.length}
          icon={<Users className="h-6 w-6 text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Hadir Hari Ini"
          value={monthlyStats.totalPresent}
          change="12%"
          changeType="positive"
          icon={<UserCheck className="h-6 w-6 text-success" />}
          iconBg="bg-success/10"
        />
        <StatCard
          title="Tidak Hadir"
          value={monthlyStats.totalAbsent}
          icon={<UserX className="h-6 w-6 text-destructive" />}
          iconBg="bg-destructive/10"
        />
      </div>

      {(pendingLeave.length > 0 || pendingOvertime.length > 0) && (
        <Card className="card-vercel border-warning/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Pengajuan Menunggu Persetujuan</p>
                <p className="text-sm text-muted-foreground">
                  {pendingLeave.length} izin/cuti, {pendingOvertime.length} lembur
                </p>
              </div>
              <Badge variant="secondary">{pendingLeave.length + pendingOvertime.length} pending</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-vercel lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Kehadiran Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  />
                  <Bar dataKey="hadir" name="Hadir" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="izin" name="Izin" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-vercel">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Per Departemen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {departmentStats.map((stat, index) => (
                <div key={stat.department} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{stat.department}</span>
                  </div>
                  <span className="font-medium text-foreground">{stat.present}/{stat.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function SupervisorDashboard() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [pendingLeave, setPendingLeave] = useState<LeaveRequest[]>([]);
  const [pendingOvertime, setPendingOvertime] = useState<OvertimeRequest[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      const [members, lReqs, oReqs, tAtt] = await Promise.all([
        getTeamMembers(currentUser.id),
        getTeamLeaveRequests(currentUser.id),
        getTeamOvertimeRequests(currentUser.id),
        getTodayAttendance(currentUser.id)
      ]);
      setTeamMembers(members);
      setPendingLeave(lReqs.filter(l => l.status === 'pending'));
      setPendingOvertime(oReqs.filter(o => o.status === 'pending'));
      setTodayAttendance(tAtt || null);
    };
    fetchData();
  }, [currentUser]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Anggota Tim"
          value={teamMembers.length}
          icon={<Users className="h-6 w-6 text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Hadir Hari Ini"
          value={teamMembers.length}
          icon={<UserCheck className="h-6 w-6 text-success" />}
          iconBg="bg-success/10"
        />
        <StatCard
          title="Izin Pending"
          value={pendingLeave.length}
          icon={<CalendarDays className="h-6 w-6 text-warning" />}
          iconBg="bg-warning/10"
        />
        <StatCard
          title="Lembur Pending"
          value={pendingOvertime.length}
          icon={<Timer className="h-6 w-6 text-blue-500" />}
          iconBg="bg-blue-500/10"
        />
      </div>

      {(pendingLeave.length > 0 || pendingOvertime.length > 0) && (
        <Card className="card-vercel border-warning/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Pengajuan Tim Menunggu</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingLeave.length} izin/cuti, {pendingOvertime.length} lembur perlu approval
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/team')} data-testid="btn-go-to-team">
                Lihat Tim
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="card-vercel overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 gradient-bg opacity-[0.03]" />
          <CardContent className="relative p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Absensi Anda Hari Ini</h3>
                  <p className="text-muted-foreground">
                    {todayAttendance?.clockIn ? (
                      <>Clock In: <span className="font-medium text-foreground">{todayAttendance.clockIn}</span></>
                    ) : (
                      'Anda belum melakukan absensi hari ini'
                    )}
                    {todayAttendance?.clockOut && (
                      <> | Clock Out: <span className="font-medium text-foreground">{todayAttendance.clockOut}</span></>
                    )}
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/attendance')} data-testid="btn-go-to-attendance">
                Absensi
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      <Card className="card-vercel">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Anggota Tim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.length > 0 ? teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.position}</p>
                  </div>
                </div>
                <Badge variant="outline">Staff</Badge>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">Belum ada anggota tim</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function StaffDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [pendingLeave, setPendingLeave] = useState<LeaveRequest[]>([]);
  const [pendingOvertime, setPendingOvertime] = useState<OvertimeRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      const [tAtt, lReqs, oReqs] = await Promise.all([
        getTodayAttendance(currentUser.id),
        getEmployeeLeaveRequests(currentUser.id),
        getEmployeeOvertimeRequests(currentUser.id)
      ]);
      setTodayAttendance(tAtt || null);
      setPendingLeave(lReqs.filter(l => l.status === 'pending'));
      setPendingOvertime(oReqs.filter(o => o.status === 'pending'));
    };
    fetchData();
  }, [currentUser]);

  const leaveQuota = currentUser?.leaveQuota || 12;
  const usedLeave = currentUser?.usedLeave || 0;
  const remainingLeave = leaveQuota - usedLeave;

  const handleQuickClockIn = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    const isLate = now.getHours() >= 9 && now.getMinutes() > 0;

    const record: AttendanceRecord = {
      id: `att-${currentUser.id}-${now.toISOString().split('T')[0]}`,
      employeeId: currentUser.id,
      date: now.toISOString().split('T')[0],
      clockIn: timeStr,
      status: isLate ? 'late' : 'present',
    };

    await saveAttendance(record);
    setIsProcessing(false);
    toast({
      title: "Clock In Berhasil",
      description: `Anda tercatat masuk pada ${timeStr}${isLate ? ' (Terlambat)' : ''}`,
    });
    window.location.reload();
  };

  const handleQuickClockOut = async () => {
    if (!currentUser || !todayAttendance) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);

    const record: AttendanceRecord = {
      ...todayAttendance,
      clockOut: timeStr,
    };

    await saveAttendance(record);
    setIsProcessing(false);
    toast({
      title: "Clock Out Berhasil",
      description: `Anda tercatat pulang pada ${timeStr}`,
    });
    window.location.reload();
  };

  return (
    <>
      <Card className="card-vercel overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 gradient-bg opacity-[0.05]" />
          <CardContent className="relative p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-foreground">Status Absensi Hari Ini</h3>
                  <p className="text-muted-foreground mt-1">
                    {todayAttendance?.clockIn ? (
                      <>
                        Clock In: <span className="font-medium text-foreground">{todayAttendance.clockIn}</span>
                        {todayAttendance?.clockOut && (
                          <> | Clock Out: <span className="font-medium text-foreground">{todayAttendance.clockOut}</span></>
                        )}
                      </>
                    ) : (
                      'Anda belum melakukan absensi hari ini'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {!todayAttendance?.clockIn ? (
                  <Button 
                    size="lg" 
                    className="h-12 px-6 gradient-bg"
                    onClick={handleQuickClockIn}
                    disabled={isProcessing}
                    data-testid="btn-clock-in"
                  >
                    {isProcessing ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-5 w-5" />
                        Clock In
                      </>
                    )}
                  </Button>
                ) : !todayAttendance?.clockOut ? (
                  <Button 
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={handleQuickClockOut}
                    disabled={isProcessing}
                    data-testid="btn-clock-out"
                  >
                    {isProcessing ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                    ) : (
                      <>
                        <UserX className="mr-2 h-5 w-5" />
                        Clock Out
                      </>
                    )}
                  </Button>
                ) : (
                  <Badge className="bg-success/10 text-success px-4 py-2 text-base">
                    Absensi Lengkap
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-vercel">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Sisa Cuti</p>
                <p className="text-2xl font-bold text-foreground">{remainingLeave} hari</p>
              </div>
            </div>
            <Progress value={(usedLeave / leaveQuota) * 100} className="mt-4 h-2" />
            <p className="text-xs text-muted-foreground mt-2">{usedLeave} dari {leaveQuota} hari terpakai</p>
          </CardContent>
        </Card>

        <Card className="card-vercel">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Izin Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingLeave.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-vercel">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Timer className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lembur Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingOvertime.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!todayAttendance?.clockOut && todayAttendance?.clockIn && (
        <Card className="card-vercel border-warning/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Jangan lupa absen keluar!</p>
                <p className="text-sm text-muted-foreground">
                  Pastikan Anda melakukan clock out sebelum pulang
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="card-vercel hover-elevate cursor-pointer" onClick={() => navigate('/leave')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ajukan Izin/Cuti</p>
                  <p className="text-sm text-muted-foreground">Buat pengajuan baru</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-vercel hover-elevate cursor-pointer" onClick={() => navigate('/overtime')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <Timer className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ajukan Lembur</p>
                  <p className="text-sm text-muted-foreground">Buat pengajuan baru</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function Dashboard() {
  const currentUser = getCurrentUser();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali, {currentUser?.name || 'User'}
        </p>
      </div>

      {currentUser?.role === 'admin' && <AdminDashboard />}
      {currentUser?.role === 'supervisor' && <SupervisorDashboard />}
      {currentUser?.role === 'staff' && <StaffDashboard />}
    </div>
  );
}
