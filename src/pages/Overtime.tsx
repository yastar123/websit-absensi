import { useState, useEffect } from "react";
import { 
  Timer, 
  Plus, 
  Clock, 
  CheckCircle2,
  FileText,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  getCurrentUser, 
  getEmployeeOvertimeRequests,
  saveOvertimeRequest,
  OvertimeRequest
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Overtime() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      const requests = await getEmployeeOvertimeRequests(currentUser.id);
      setOvertimeRequests(requests);
    };
    fetchData();
  }, [currentUser]);

  const pendingRequests = overtimeRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = overtimeRequests.filter(r => r.status === 'approved');
  
  const totalOvertimeHours = approvedRequests.reduce((total, req) => {
    return total + calculateHours(req.startTime, req.endTime);
  }, 0);

  const handleSubmit = async () => {
    if (!currentUser || !date || !startTime || !endTime || !reason) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      });
      return;
    }

    const newRequest: OvertimeRequest = {
      id: `overtime-${Date.now()}`,
      employeeId: currentUser.id,
      date,
      startTime,
      endTime,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await saveOvertimeRequest(newRequest);
    toast({
      title: "Pengajuan Berhasil",
      description: "Pengajuan lembur Anda telah dikirim untuk persetujuan",
    });
    setShowNewRequest(false);
    setDate("");
    setStartTime("");
    setEndTime("");
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lembur</h1>
          <p className="text-muted-foreground">Kelola pengajuan lembur Anda</p>
        </div>
        <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
          <DialogTrigger asChild>
            <Button className="gradient-bg">
              <Plus className="mr-2 h-4 w-4" />
              Ajukan Lembur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Pengajuan Lembur</DialogTitle>
              <DialogDescription>
                Lengkapi form berikut untuk mengajukan lembur
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tanggal Lembur</Label>
                <Input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jam Mulai</Label>
                  <Input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jam Selesai</Label>
                  <Input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alasan/Deskripsi Pekerjaan</Label>
                <Textarea 
                  placeholder="Jelaskan pekerjaan yang akan dilakukan..."
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
        <Card className="card-vercel">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Timer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jam Lembur</p>
                <p className="text-2xl font-bold text-foreground">{totalOvertimeHours.toFixed(1)} jam</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-vercel">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Approval</p>
                <p className="text-2xl font-bold text-foreground">{pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-vercel">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disetujui Bulan Ini</p>
                <p className="text-2xl font-bold text-foreground">{approvedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overtime Requests Table */}
      <Card className="card-vercel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Riwayat Pengajuan Lembur
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overtimeRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overtimeRequests.map((request) => {
                  const hours = calculateHours(request.startTime, request.endTime);
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {new Date(request.date).toLocaleDateString('id-ID', { 
                          weekday: 'short',
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{request.startTime} - {request.endTime}</TableCell>
                      <TableCell>{hours.toFixed(1)} jam</TableCell>
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
                Anda belum memiliki riwayat pengajuan lembur
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function calculateHours(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  
  return totalMinutes / 60;
}
