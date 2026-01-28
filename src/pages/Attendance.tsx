import { useState, useEffect } from "react";
import { 
  Clock, 
  QrCode, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  History,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  getCurrentUser, 
  getTodayAttendance, 
  saveAttendance,
  getEmployeeAttendance,
  AttendanceRecord
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Attendance() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const currentUser = getCurrentUser();
  const todayAttendance = currentUser ? getTodayAttendance(currentUser.id) : null;
  const attendanceHistory = currentUser ? getEmployeeAttendance(currentUser.id).slice(0, 10) : [];
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async () => {
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

    saveAttendance(record);
    setIsProcessing(false);
    toast({
      title: "Clock In Berhasil",
      description: `Anda tercatat masuk pada ${timeStr}${isLate ? ' (Terlambat)' : ''}`,
    });
    window.location.reload();
  };

  const handleClockOut = async () => {
    if (!currentUser || !todayAttendance) return;
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);

    const record: AttendanceRecord = {
      ...todayAttendance,
      clockOut: timeStr,
    };

    saveAttendance(record);
    setIsProcessing(false);
    toast({
      title: "Clock Out Berhasil",
      description: `Anda tercatat pulang pada ${timeStr}`,
    });
    window.location.reload();
  };

  const handleBarcodeAttendance = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowBarcodeModal(false);
    
    if (!todayAttendance?.clockIn) {
      handleClockIn();
    } else {
      handleClockOut();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Hadir</Badge>;
      case 'late':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Terlambat</Badge>;
      case 'absent':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Tidak Hadir</Badge>;
      case 'leave':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Cuti</Badge>;
      case 'sick':
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted">Sakit</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Absensi Kehadiran</h1>
        <p className="text-muted-foreground">Catat kehadiran Anda hari ini</p>
      </div>

      {/* Clock In/Out Card */}
      <Card className="card-vercel overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 gradient-bg opacity-[0.02]" />
          <CardContent className="relative p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Time Display */}
              <div className="text-center lg:text-left">
                <p className="text-6xl font-bold text-foreground font-mono">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="text-lg text-muted-foreground mt-2">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-2 mt-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Kantor Pusat - Jakarta</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!todayAttendance?.clockIn ? (
                  <Button 
                    size="lg" 
                    className="h-14 px-8 gradient-bg hover:opacity-90 transition-opacity"
                    onClick={handleClockIn}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Clock In
                      </>
                    )}
                  </Button>
                ) : !todayAttendance?.clockOut ? (
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-14 px-8 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={handleClockOut}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                    ) : (
                      <>
                        <XCircle className="mr-2 h-5 w-5" />
                        Clock Out
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-medium">Absensi Lengkap</span>
                  </div>
                )}

                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-14 px-8"
                  onClick={() => setShowBarcodeModal(true)}
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  Scan Barcode
                </Button>
              </div>
            </div>

            {/* Today's Status */}
            {todayAttendance && (
              <div className="mt-8 pt-6 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Clock In</p>
                    <p className="text-xl font-semibold text-foreground mt-1">
                      {todayAttendance.clockIn || '-'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Clock Out</p>
                    <p className="text-xl font-semibold text-foreground mt-1">
                      {todayAttendance.clockOut || '-'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(todayAttendance.status)}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Attendance History */}
      <Card className="card-vercel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <History className="h-4 w-4 text-primary" />
            Riwayat Absensi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Tanggal</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceHistory.map((record) => {
                const duration = record.clockIn && record.clockOut 
                  ? calculateDuration(record.clockIn, record.clockOut)
                  : '-';
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {new Date(record.date).toLocaleDateString('id-ID', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell>{record.clockIn || '-'}</TableCell>
                    <TableCell>{record.clockOut || '-'}</TableCell>
                    <TableCell>{duration}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Barcode Modal */}
      <Dialog open={showBarcodeModal} onOpenChange={setShowBarcodeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Barcode Absensi</DialogTitle>
            <DialogDescription>
              Arahkan barcode ke kamera untuk melakukan absensi
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-8 space-y-6">
            <div className="relative h-64 w-64 bg-muted rounded-xl flex items-center justify-center overflow-hidden">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Memproses...</p>
                </div>
              ) : (
                <>
                  <QrCode className="h-32 w-32 text-muted-foreground/30" />
                  <div className="absolute inset-0 border-2 border-dashed border-primary/50 m-4 rounded-lg" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary animate-pulse-soft" />
                </>
              )}
            </div>
            <Button 
              className="w-full gradient-bg" 
              onClick={handleBarcodeAttendance}
              disabled={isProcessing}
            >
              {isProcessing ? 'Memproses...' : 'Simulasi Scan'}
            </Button>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Ini adalah simulasi. Pada implementasi nyata, gunakan kamera.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function calculateDuration(clockIn: string, clockOut: string): string {
  const [inHour, inMin] = clockIn.split(':').map(Number);
  const [outHour, outMin] = clockOut.split(':').map(Number);
  
  let totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}j ${minutes}m`;
}
