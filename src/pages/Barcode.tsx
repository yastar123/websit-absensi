import { useState, useEffect } from "react";
import { QrCode, Copy, RefreshCw, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, generateBarcode, getActiveBarcode, getEmployees, type Barcode as BarcodeType, type Employee } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Barcode() {
  const [activeBarcode, setActiveBarcode] = useState<BarcodeType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [departmentStaff, setDepartmentStaff] = useState<Employee[]>([]);
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser?.role === "supervisor") {
      loadActiveBarcode();
      loadDepartmentStaff();
    }
  }, []);

  const loadActiveBarcode = async () => {
    if (!currentUser) return;
    try {
      const barcode = await getActiveBarcode(currentUser.id);
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
      const result = await generateBarcode(currentUser.id);
      setActiveBarcode(result.barcode);
      toast({
        title: "Barcode berhasil dibuat",
        description: `Barcode untuk departemen ${result.department} berlaku selama 24 jam`,
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

  const formatExpiryTime = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m`;
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
              Staff dapat login menggunakan barcode dari supervisor departemen masing-masing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Barcode</h1>
        <p className="text-muted-foreground mt-1">
          Generate barcode untuk absensi staff di departemen Anda
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Barcode Login
            </CardTitle>
            <CardDescription>
              Generate barcode untuk staff di departemen {currentUser?.department}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeBarcode ? (
              <div className="space-y-4">
                <div className="p-6 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-2">Kode Barcode</p>
                  <p className="font-mono text-lg font-bold break-all">
                    {activeBarcode.code}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Berlaku</span>
                  </div>
                  <span className="text-sm font-medium text-green-700">
                    {formatExpiryTime(activeBarcode.expiresAt)} lagi
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Salin Kode
                  </Button>
                  <Button
                    onClick={handleGenerateBarcode}
                    variant="outline"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Generate Baru
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-8 bg-muted rounded-lg flex flex-col items-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-center">
                    Belum ada barcode aktif
                  </p>
                </div>

                <Button
                  onClick={handleGenerateBarcode}
                  className="w-full gradient-bg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate Barcode
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Departemen
            </CardTitle>
            <CardDescription>
              Daftar staff yang dapat menggunakan barcode ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {departmentStaff.length > 0 ? (
              <div className="space-y-3">
                {departmentStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.email}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Staff
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Tidak ada staff di departemen ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cara Penggunaan Barcode Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Klik tombol "Generate Barcode" untuk membuat kode baru</li>
            <li>Bagikan kode barcode kepada staff di departemen Anda</li>
            <li>Staff dapat melakukan absensi dengan scan barcode ini di menu "Absensi"</li>
            <li>Barcode berlaku selama 24 jam sejak dibuat</li>
            <li>Anda dapat membuat barcode baru kapan saja (barcode lama otomatis tidak aktif)</li>
            <li>Sebagai Supervisor, Anda juga dapat menandai kehadiran staff secara manual di menu "Tim Saya"</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
