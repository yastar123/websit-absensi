import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEmployees, setCurrentUser, initializeDefaultData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize default data on first load
  initializeDefaultData();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const employees = getEmployees();
    const user = employees.find(emp => emp.email === email);

    if (user) {
      setCurrentUser(user);
      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${user.name}!`,
      });
      navigate("/");
    } else {
      toast({
        title: "Login gagal",
        description: "Email tidak ditemukan. Coba: admin@company.com",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
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

      {/* Right Panel - Login Form */}
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
              Silakan masukkan email Anda untuk melanjutkan
            </p>
          </div>

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

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Demo: <span className="font-medium text-foreground">admin@company.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
