import { useEffect, useState } from "react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getCurrentUser, 
  getEmployees, 
  getAttendanceRecords,
  getMonthlyStats,
  getDepartmentStats,
  getTodayAttendance
} from "@/lib/storage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentUser = getCurrentUser();
  const employees = getEmployees();
  const today = new Date();
  const monthlyStats = getMonthlyStats(today.getMonth(), today.getFullYear());
  const departmentStats = getDepartmentStats();
  const todayAttendance = currentUser ? getTodayAttendance(currentUser.id) : null;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Selamat datang, {currentUser?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            {today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground font-mono">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-sm text-muted-foreground">Waktu Server</p>
          </div>
        </div>
      </div>

      {/* Today's Status */}
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
                  <h3 className="font-semibold text-lg text-foreground">Status Hari Ini</h3>
                  <p className="text-muted-foreground">
                    {todayAttendance?.clockIn ? (
                      <>Clock In: <span className="font-medium text-foreground">{todayAttendance.clockIn}</span></>
                    ) : (
                      'Anda belum melakukan absensi hari ini'
                    )}
                    {todayAttendance?.clockOut && (
                      <> • Clock Out: <span className="font-medium text-foreground">{todayAttendance.clockOut}</span></>
                    )}
                  </p>
                </div>
              </div>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                todayAttendance?.status === 'present' ? 'bg-success/10 text-success' :
                todayAttendance?.status === 'late' ? 'bg-warning/10 text-warning' :
                'bg-muted text-muted-foreground'
              }`}>
                {todayAttendance?.status === 'present' ? 'Hadir Tepat Waktu' :
                 todayAttendance?.status === 'late' ? 'Terlambat' :
                 'Belum Absen'}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Stats Grid */}
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
          title="Terlambat"
          value={monthlyStats.totalLate}
          change="3%"
          changeType="negative"
          icon={<Clock className="h-6 w-6 text-warning" />}
          iconBg="bg-warning/10"
        />
        <StatCard
          title="Tidak Hadir"
          value={monthlyStats.totalAbsent}
          icon={<UserX className="h-6 w-6 text-destructive" />}
          iconBg="bg-destructive/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance Chart */}
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
                  <Bar dataKey="terlambat" name="Terlambat" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="izin" name="Izin" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
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
    </div>
  );
}
