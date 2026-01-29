import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowRight, QrCode, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login, loginWithBarcode, setCurrentUser, initializeDefaultData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [barcodeValue, setBarcodeValue] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  initializeDefaultData();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(email);
      if (user) {
        setCurrentUser(user);
        toast({
          title: "Login berhasil",
          description: `Selamat datang, ${user.name}!`,
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Login gagal",
        description: "Email tidak ditemukan. Coba: admin@company.com atau supervisor@company.com",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleBarcodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await loginWithBarcode(barcodeValue, staffEmail);
      if (user) {
        setCurrentUser(user);
        toast({
          title: "Login berhasil",
          description: `Selamat datang, ${user.name}!`,
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Login gagal",
        description: error.message || "Barcode tidak valid atau sudah kadaluarsa",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-bg flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">AbsensiPro</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Sistem Kehadiran<br />
            Modern & Efisien
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Kelola absensi karyawan dengan mudah. Pantau kehadiran, izin, dan lembur dalam satu platform terintegrasi.
          </p>
          <div className="flex gap-8">
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm text-white/70">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-white/70">Perusahaan</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm text-white/70">Pengguna</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/60">
          © 2024 AbsensiPro. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">AbsensiPro</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">
              Masuk ke akun Anda
            </h2>
            <p className="text-muted-foreground">
              Pilih metode login sesuai peran Anda
            </p>
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email (Admin/Supervisor)
              </TabsTrigger>
              <TabsTrigger value="barcode" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Barcode (Staff)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-6 mt-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 gradient-bg hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Masuk
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground font-medium">Akun Demo:</p>
                <div className="flex flex-col gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => { setEmail('admin@company.com'); setPassword('demo123'); }}
                    className="flex flex-col items-center p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <span className="font-bold text-primary">Admin</span>
                    <span className="text-xs text-muted-foreground">admin@company.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmail('supervisor@company.com'); setPassword('demo123'); }}
                    className="flex flex-col items-center p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <span className="font-bold text-primary">Supervisor</span>
                    <span className="text-xs text-muted-foreground">supervisor@company.com</span>
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="barcode" className="space-y-6 mt-6">
              <form onSubmit={handleBarcodeLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staffEmail">Email Staff</Label>
                    <Input
                      id="staffEmail"
                      type="email"
                      placeholder="staff@company.com"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Kode Barcode</Label>
                    <Input
                      id="barcode"
                      type="text"
                      placeholder="Masukkan atau scan kode barcode"
                      value={barcodeValue}
                      onChange={(e) => setBarcodeValue(e.target.value)}
                      className="h-12"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Minta kode barcode dari supervisor departemen Anda
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 gradient-bg hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Login dengan Barcode
                      <QrCode className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Staff harus mendapatkan kode barcode dari supervisor departemennya terlebih dahulu. 
                  Barcode berlaku selama 24 jam.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
