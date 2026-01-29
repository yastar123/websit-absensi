import { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  getCurrentUser, 
  getEmployeeLeaveRequests,
  saveLeaveRequest,
  LeaveRequest
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Leave() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      const requests = await getEmployeeLeaveRequests(currentUser.id);
      setLeaveRequests(requests);
    };
    fetchData();
  }, [currentUser?.id]); // Only refetch when user ID changes

  const leaveQuota = currentUser?.leaveQuota || 12;
  const usedLeave = currentUser?.usedLeave || 0;
  const remainingLeave = leaveQuota - usedLeave;
  const leavePercentage = (usedLeave / leaveQuota) * 100;

  const pendingRequests = leaveRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = leaveRequests.filter(r => r.status === 'approved').length;

  const handleSubmit = async () => {
    if (!currentUser || !leaveType || !startDate || !endDate || !reason) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      });
      return;
    }

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: currentUser.id,
      type: leaveType as 'annual' | 'sick' | 'personal',
      startDate,
      endDate,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await saveLeaveRequest(newRequest);
    toast({
      title: "Pengajuan Berhasil",
      description: "Pengajuan izin/cuti Anda telah dikirim untuk persetujuan",
    });
    setShowNewRequest(false);
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    window.location.reload();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Menunggu</Badge>;
      case 'approved':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Disetujui</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case 'annual':
        return <Badge variant="outline" className="border-primary text-primary">Cuti Tahunan</Badge>;
      case 'sick':
        return <Badge variant="outline" className="border-destructive text-destructive">Sakit</Badge>;
      case 'personal':
        return <Badge variant="outline" className="border-muted-foreground text-muted-foreground">Izin Pribadi</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Izin & Cuti</h1>
          <p className="text-muted-foreground">Kelola pengajuan izin dan cuti Anda</p>
        </div>
        <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
          <DialogTrigger asChild>
            <Button className="gradient-bg">
              <Plus className="mr-2 h-4 w-4" />
              Ajukan Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Pengajuan Izin/Cuti</DialogTitle>
              <DialogDescription>
                Lengkapi form berikut untuk mengajukan izin atau cuti
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Jenis Pengajuan</Label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="annual">Cuti Tahunan</SelectItem>
                    <SelectItem value="sick">Sakit</SelectItem>
                    <SelectItem value="personal">Izin Pribadi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alasan</Label>
                <Textarea 
                  placeholder="Jelaskan alasan pengajuan Anda..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                Batal
              </Button>
              <Button className="gradient-bg" onClick={handleSubmit}>
                Ajukan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Leave Quota Card */}
        <Card className="card-vercel md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kuota Cuti Tahunan</p>
                  <p className="text-2xl font-bold text-foreground">{remainingLeave} hari</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Terpakai</p>
                <p className="text-lg font-semibold text-foreground">{usedLeave}/{leaveQuota}</p>
              </div>
            </div>
            <Progress value={leavePercentage} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {leavePercentage.toFixed(0)}% kuota cuti telah digunakan tahun ini
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <Card className="card-vercel">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{pendingRequests}</p>
                  <p className="text-xs text-muted-foreground">Menunggu</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-vercel">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{approvedRequests}</p>
                  <p className="text-xs text-muted-foreground">Disetujui</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leave Requests Table */}
      <Card className="card-vercel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Riwayat Pengajuan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Jenis</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map((request) => {
                  const start = new Date(request.startDate);
                  const end = new Date(request.endDate);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell>{getLeaveTypeBadge(request.type)}</TableCell>
                      <TableCell>
                        {start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>{days} hari</TableCell>
                      <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Belum Ada Pengajuan</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Anda belum memiliki riwayat pengajuan izin atau cuti
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
