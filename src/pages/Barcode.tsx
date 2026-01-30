import { useState, useEffect } from "react";
import { 
  QrCode, 
  RefreshCw, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Users 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  getCurrentUser, 
  getActiveBarcode, 
  getEmployees, 
  type Barcode as BarcodeType, 
  type Employee 
} from "@/lib/storage";

export default function Barcode() {
  const [activeBarcode, setActiveBarcode] = useState<BarcodeType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionNumber, setSessionNumber] = useState("absensi ke-1");
  const [departmentStaff, setDepartmentStaff] = useState<Employee[]>([]);
  const [timeLeft, setTimeLeft] = useState("");
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser?.role === "supervisor") {
      loadActiveBarcode();
      loadDepartmentStaff();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!activeBarcode) return;

    const interval = setInterval(() => {
      const expiry = new Date(activeBarcode.expiresAt);
      const now = new Date();
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}j ${minutes}m lagi`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBarcode]);

  const loadActiveBarcode = async () => {
    if (!currentUser) return;
    try {
      const barcode = await getActiveBarcode(currentUser.id.toString());
      setActiveBarcode(barcode);
    } catch (error) {
      console.error("Failed to load barcode:", error);
    }
  };

  const loadDepartmentStaff = async () => {
    if (!currentUser) return;
    try {
      const employees = await getEmployees();
      const staff = employees.filter(
        (e) => e.role === "staff" && e.department === currentUser.department
      );
      setDepartmentStaff(staff);
    } catch (error) {
      console.error("Failed to load staff:", error);
    }
  };

  const handleGenerateBarcode = async () => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/barcode/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          supervisorId: currentUser.id,
          sessionNumber: sessionNumber
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Gagal membuat barcode");
      }
      
      const result = await response.json();
      setActiveBarcode(result.barcode);
      toast({
        title: "Barcode berhasil dibuat",
        description: `Barcode untuk ${sessionNumber} berlaku selama 24 jam`,
      });
    } catch (error: any) {
      toast({
        title: "Gagal membuat barcode",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const copyToClipboard = () => {
    if (activeBarcode) {
      navigator.clipboard.writeText(activeBarcode.code);
      toast({
        title: "Kode disalin",
        description: "Kode barcode telah disalin ke clipboard",
      });
    }
  };

  if (currentUser?.role !== "supervisor") {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Akses Terbatas</h3>
            <p className="text-muted-foreground text-center">
              Hanya supervisor yang dapat mengakses fitur generate barcode.
              <br />
              Staff dapat menggunakan barcode untuk absensi di departemen masing-masing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manajemen Barcode</h1>
        <p className="text-muted-foreground">Generate barcode untuk absensi staff di departemen Anda</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-vercel overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Barcode Absensi</CardTitle>
                <CardDescription>
                  Departemen {currentUser.department}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-full space-y-2">
                <Label>Sesi Absensi</Label>
                <Select value={sessionNumber} onValueChange={setSessionNumber}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sesi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absensi ke-1">Absensi ke-1</SelectItem>
                    <SelectItem value="absensi ke-2">Absensi ke-2</SelectItem>
                    <SelectItem value="absensi ke-3">Absensi ke-3</SelectItem>
                    <SelectItem value="absensi ke-4">Absensi ke-4</SelectItem>
                    <SelectItem value="absensi ke-5">Absensi ke-5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {activeBarcode ? (
                <>
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-border">
                    <QRCodeSVG 
                      value={activeBarcode.code} 
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  
                  <div className="w-full space-y-4">
                    <div className="flex flex-col items-center p-3 bg-muted/50 rounded-xl border border-dashed">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Kode Barcode</span>
                      <span className="text-sm font-mono font-bold text-foreground break-all text-center">
                        {activeBarcode.code}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-medium">Berlaku</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{timeLeft}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="w-full" onClick={copyToClipboard}>
                        <Copy className="mr-2 h-3 w-3" />
                        Salin
                      </Button>
                      <Button 
                        size="sm"
                        className="w-full gradient-bg" 
                        onClick={handleGenerateBarcode}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`mr-2 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                        Update
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-sm font-semibold">Belum Ada Barcode</h3>
                  <p className="text-xs text-muted-foreground mb-6">
                    Generate barcode pertama untuk departemen Anda.
                  </p>
                  <Button className="gradient-bg" onClick={handleGenerateBarcode} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                    Buat Barcode
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-vercel">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Staff Departemen</CardTitle>
                <CardDescription>
                  Daftar staff yang dapat menggunakan barcode
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {departmentStaff.length > 0 ? (
                <div className="divide-y divide-border">
                  {departmentStaff.map((staff) => (
                    <div key={staff.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{staff.name}</span>
                        <span className="text-xs text-muted-foreground">{staff.email}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Staff</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">Tidak ada staff terdaftar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-vercel">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Cara Penggunaan
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-primary">1.</span>
              Generate barcode baru setiap hari atau jika barcode lama sudah expired.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">2.</span>
              Tampilkan barcode ini kepada staff Anda di kantor.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">3.</span>
              Staff menscan barcode melalui menu "Absensi" di akun mereka masing-masing.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">4.</span>
              Sistem akan memverifikasi apakah staff tersebut berada di departemen Anda.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}