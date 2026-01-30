import { useState, useEffect } from "react";
import { Users, UserCheck, Clock, CalendarDays, Timer, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  getCurrentUser,
  getTeamMembers,
  getTeamAttendance,
  getTeamLeaveRequests,
  getTeamOvertimeRequests,
  saveLeaveRequest,
  saveOvertimeRequest,
  markAttendanceManual,
  Employee,
  LeaveRequest,
  OvertimeRequest,
  AttendanceRecord
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Team() {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = useState("members");
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [teamAttendance, setTeamAttendance] = useState<AttendanceRecord[]>([]);
  const [pendingLeave, setPendingLeave] = useState<LeaveRequest[]>([]);
  const [pendingOvertime, setPendingOvertime] = useState<OvertimeRequest[]>([]);
  
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'supervisor') return;
    let isMounted = true;
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [members, attendance, leaves, overtimes] = await Promise.all([
          getTeamMembers(currentUser.id),
          getTeamAttendance(currentUser.id),
          getTeamLeaveRequests(currentUser.id),
          getTeamOvertimeRequests(currentUser.id)
        ]);
        if (isMounted) {
          setTeamMembers(members);
          setTeamAttendance(attendance.filter(a => a.date === today));
          setPendingLeave(leaves.filter(l => l.status === 'pending'));
          setPendingOvertime(overtimes.filter(o => o.status === 'pending'));
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [currentUser?.id]); // Only dependency is ID

  if (!currentUser || currentUser.role !== 'supervisor') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getMemberAttendance = (memberId: string) => {
    return teamAttendance.find(a => a.employeeId === memberId);
  };

  const handleLeaveApproval = async (request: LeaveRequest, approved: boolean) => {
    await saveLeaveRequest({
      ...request,
      status: approved ? 'approved' : 'rejected',
      approvedBy: currentUser.id
    });
    toast({
      title: approved ? "Izin Disetujui" : "Izin Ditolak",
      description: `Pengajuan izin telah ${approved ? 'disetujui' : 'ditolak'}.`,
    });
    window.location.reload();
  };

  const handleOvertimeApproval = async (request: OvertimeRequest, approved: boolean) => {
    await saveOvertimeRequest({
      ...request,
      status: approved ? 'approved' : 'rejected',
      approvedBy: currentUser.id
    });
    toast({
      title: approved ? "Lembur Disetujui" : "Lembur Ditolak",
      description: `Pengajuan lembur telah ${approved ? 'disetujui' : 'ditolak'}.`,
    });
    window.location.reload();
  };

  const getMemberName = (employeeId: string) => {
    const member = teamMembers.find(m => m.id === employeeId);
    return member?.name || 'Unknown';
  };

  const handleManualAttendance = async (employeeId: string) => {
    if (!currentUser) return;
    try {
      await markAttendanceManual(currentUser.id, employeeId);
      toast({
        title: "Absensi Berhasil",
        description: `Berhasil mencatat kehadiran manual untuk ${getMemberName(employeeId)}`,
      });
      // Refresh data
      const attendance = await getTeamAttendance(currentUser.id);
      const today = new Date().toISOString().split('T')[0];
      setTeamAttendance(attendance.filter(a => a.date === today));
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tim Saya</h1>
        <p className="text-muted-foreground">Kelola dan pantau anggota tim Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-vercel">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Anggota Tim</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-vercel">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hadir Hari Ini</p>
                <p className="text-2xl font-bold">{teamAttendance.filter(a => a.status === 'present' || a.status === 'late').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-vercel">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
                <CalendarDays className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Izin Pending</p>
                <p className="text-2xl font-bold">{pendingLeave.length}</p>
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
                <p className="text-2xl font-bold">{pendingOvertime.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members" data-testid="tab-members">Anggota Tim</TabsTrigger>
          <TabsTrigger value="leave" data-testid="tab-leave">
            Izin Pending {pendingLeave.length > 0 && <Badge variant="destructive" className="ml-2">{pendingLeave.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="overtime" data-testid="tab-overtime">
            Lembur Pending {pendingOvertime.length > 0 && <Badge variant="destructive" className="ml-2">{pendingOvertime.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card className="card-vercel">
            <CardHeader>
              <CardTitle className="text-base">Daftar Anggota Tim</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Status Hari Ini</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => {
                    const attendance = getMemberAttendance(member.id);
                    const isPresent = attendance?.status === 'present' || attendance?.status === 'late';
                    return (
                      <TableRow key={member.id} data-testid={`team-member-${member.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.position}</TableCell>
                        <TableCell>
                          <Badge variant={
                            attendance?.status === 'present' ? 'default' :
                            attendance?.status === 'late' ? 'secondary' :
                            'outline'
                          }>
                            {attendance?.status === 'present' ? 'Hadir' :
                             attendance?.status === 'late' ? 'Terlambat' :
                             attendance?.status === 'leave' ? 'Izin' :
                             attendance?.status === 'sick' ? 'Sakit' :
                             'Belum Absen'}
                          </Badge>
                        </TableCell>
                        <TableCell>{attendance?.clockIn || '-'}</TableCell>
                        <TableCell>
                          {!isPresent && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleManualAttendance(member.id)}
                            >
                              Tandai Hadir
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {teamMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Belum ada anggota tim
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="mt-4">
          <Card className="card-vercel">
            <CardHeader>
              <CardTitle className="text-base">Pengajuan Izin & Cuti</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLeave.map((request) => (
                    <TableRow key={request.id} data-testid={`leave-request-${request.id}`}>
                      <TableCell className="font-medium">{getMemberName(request.employeeId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {request.type === 'annual' ? 'Cuti' : request.type === 'sick' ? 'Sakit' : 'Izin'}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.startDate} - {request.endDate}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleLeaveApproval(request, true)}
                            data-testid={`approve-leave-${request.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleLeaveApproval(request, false)}
                            data-testid={`reject-leave-${request.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingLeave.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Tidak ada pengajuan izin yang menunggu persetujuan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overtime" className="mt-4">
          <Card className="card-vercel">
            <CardHeader>
              <CardTitle className="text-base">Pengajuan Lembur</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jam</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOvertime.map((request) => (
                    <TableRow key={request.id} data-testid={`overtime-request-${request.id}`}>
                      <TableCell className="font-medium">{getMemberName(request.employeeId)}</TableCell>
                      <TableCell>{request.date}</TableCell>
                      <TableCell>{request.startTime} - {request.endTime}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleOvertimeApproval(request, true)}
                            data-testid={`approve-overtime-${request.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleOvertimeApproval(request, false)}
                            data-testid={`reject-overtime-${request.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingOvertime.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Tidak ada pengajuan lembur yang menunggu persetujuan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
