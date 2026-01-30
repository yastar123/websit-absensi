import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Clock, 
  QrCode, 
  CheckCircle2, 
  XCircle,
  History,
  AlertCircle,
  Upload,
  Camera
} from "lucide-react";
import QrScanner from "qr-scanner";
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
  scanBarcode,
  AttendanceRecord
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Attendance() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [scannerActive, setScannerActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  // Callback ref to ensure video element is captured
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      videoRef.current = node;
      setVideoReady(true);
      console.log("Video element set via callback ref");
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      const [today, history] = await Promise.all([
        getTodayAttendance(currentUser.id),
        getEmployeeAttendance(currentUser.id)
      ]);
      setTodayAttendance(today || null);
      setAttendanceHistory(history.slice(0, 10));
    };
    fetchData();
  }, [currentUser?.id]); // Only refetch when user ID changes

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleScanResult = async (qrCode: string) => {
    setIsProcessing(true);
    stopScanner();
    
    try {
      const result = await scanBarcode(qrCode, currentUser?.email || "");
      toast({
        title: "Absensi Berhasil",
        description: `Anda berhasil absen dengan barcode`,
      });
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Gagal Absen",
        description: error.message || "Barcode tidak valid",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setShowBarcodeModal(false);
    }
  };

  const startScanner = async () => {
    console.log("Starting QR scanner...");
    console.log("Video ready state:", videoReady);
    console.log("Video ref exists:", !!videoRef.current);
    
    if (!videoReady || !videoRef.current) {
      console.error("Video not ready");
      toast({
        title: "Error",
        description: "Video element not ready. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setScannerActive(true);
      console.log("Creating QR Scanner...");
      
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          console.log("QR Code detected:", result.data);
          // Vibrate on successful scan (if supported)
          if ('vibrate' in navigator) {
            navigator.vibrate(200);
          }
          await handleScanResult(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
        }
      );
      
      console.log("Starting QR Scanner...");
      await qrScannerRef.current.start();
      console.log("QR Scanner started successfully - Ready to scan!");
    } catch (error) {
      console.error("Failed to start scanner:", error);
      toast({
        title: "Error",
        description: `Gagal memulai kamera: ${error.message || error}`,
        variant: "destructive"
      });
      setScannerActive(false);
    }
  };

  const stopScanner = () => {
    console.log("Stopping QR scanner...");
    
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    
    setScannerActive(false);
    console.log("QR Scanner stopped");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      console.log("Processing uploaded file:", file.name);
      
      // Create image element to process the QR code
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = async () => {
        if (!ctx) {
          throw new Error('Canvas context not available');
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          // Use qr-scanner to decode the image
          const result = await QrScanner.scanImage(canvas.toDataURL(), {
            returnDetailedScanResult: true,
          });
          
          if (result && result.data) {
            console.log("QR Code detected from image:", result.data);
            await handleScanResult(result.data);
          } else {
            throw new Error('No QR code found in image');
          }
        } catch (scanError) {
          console.error("QR scan error:", scanError);
          throw new Error('QR code tidak terdeteksi di gambar. Pastikan gambar jelas dan QR code terlihat dengan baik.');
        }
      };
      
      img.onerror = () => {
        throw new Error('Gagal memuat gambar. Pastikan format gambar valid.');
      };
      
      img.src = URL.createObjectURL(file);
      
    } catch (error: any) {
      console.error("File upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal memproses gambar",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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

    await saveAttendance(record);
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

    await saveAttendance(record);
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
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-lg text-muted-foreground mt-2">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-2 mt-3 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
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
      <Dialog open={showBarcodeModal} onOpenChange={(open) => {
        setShowBarcodeModal(open);
        if (!open) {
          stopScanner();
          setVideoReady(false); // Reset video ready state
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Barcode Absensi</DialogTitle>
            <DialogDescription>
              Pilih metode scan untuk melakukan absensi
            </DialogDescription>
          </DialogHeader>
          
          {/* Scan Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={scanMode === 'camera' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setScanMode('camera')}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Kamera
            </Button>
            <Button
              variant={scanMode === 'upload' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setScanMode('upload')}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
          <div className="flex flex-col items-center py-8 space-y-6">
            <div className="relative h-64 w-64 bg-black rounded-xl overflow-hidden">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-white">Memproses...</p>
                </div>
              ) : scanMode === 'camera' ? (
                <>
                  <video
                    ref={setVideoRef}
                    className={`w-full h-full object-cover ${scannerActive ? 'block' : 'hidden'}`}
                    onLoadedData={() => console.log("Video loaded successfully")}
                  />
                  {!scannerActive && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 absolute inset-0">
                      <QrCode className="h-32 w-32 text-white/50" />
                      <p className="text-sm text-white/70">Kamera tidak aktif</p>
                      <p className="text-xs text-white/50">Klik "Mulai Scanner" untuk memulai</p>
                      <p className="text-xs text-white/50">Video ref: {videoRef.current ? "found" : "not found"}, Ready: {videoReady.toString()}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Upload className="h-32 w-32 text-white/50" />
                  <p className="text-sm text-white/70">Upload QR Code</p>
                  <p className="text-xs text-white/50">Pilih gambar QR code dari laptop</p>
                </div>
              )}
            </div>
            
            {scanMode === 'camera' ? (
              <>
                <Button 
                  className="w-full gradient-bg" 
                  onClick={() => {
                    console.log("Camera button clicked!");
                    startScanner();
                  }}
                  disabled={isProcessing}
                >
                  {scannerActive ? 'Stop Scanner' : 'Mulai Scanner'}
                </Button>
              </>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  className="w-full gradient-bg" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isProcessing ? 'Memproses...' : 'Pilih Gambar QR Code'}
                </Button>
              </>
            )}
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
