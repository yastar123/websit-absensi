import { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Clock, 
  Bell,
  Shield,
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: "PT. AbsensiPro Indonesia",
    workStartTime: "09:00",
    workEndTime: "18:00",
    lateThreshold: 15,
    enableNotifications: true,
    enableEmailReminder: false,
    requireLocation: true,
    autoClockOut: false,
  });
  const { toast } = useToast();

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('absensi_settings', JSON.stringify(settings));
    toast({
      title: "Pengaturan Disimpan",
      description: "Perubahan pengaturan telah berhasil disimpan",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground">Konfigurasi sistem absensi</p>
      </div>

      {/* General Settings */}
      <Card className="card-vercel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="h-4 w-4 text-primary" />
            Pengaturan Umum
          </CardTitle>
          <CardDescription>Konfigurasi dasar perusahaan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Perusahaan</Label>
            <Input 
              value={settings.companyName}
              onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Work Hours Settings */}
      <Card className="card-vercel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" />
            Jam Kerja
          </CardTitle>
          <CardDescription>Atur jam kerja dan toleransi keterlambatan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Jam Masuk</Label>
              <Input 
                type="time"
                value={settings.workStartTime}
                onChange={(e) => setSettings(prev => ({ ...prev, workStartTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Jam Pulang</Label>
              <Input 
                type="time"
                value={settings.workEndTime}
                onChange={(e) => setSettings(prev => ({ ...prev, workEndTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Toleransi Terlambat (menit)</Label>
              <Input 
                type="number"
                value={settings.lateThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, lateThreshold: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="card-vercel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" />
            Notifikasi
          </CardTitle>
          <CardDescription>Atur preferensi notifikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifikasi Push</Label>
              <p className="text-sm text-muted-foreground">Terima notifikasi untuk pengingat absensi</p>
            </div>
            <Switch 
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableNotifications: checked }))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Pengingat Email</Label>
              <p className="text-sm text-muted-foreground">Kirim email pengingat absensi harian</p>
            </div>
            <Switch 
              checked={settings.enableEmailReminder}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableEmailReminder: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="card-vercel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            Keamanan
          </CardTitle>
          <CardDescription>Pengaturan keamanan dan verifikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Wajib Lokasi</Label>
              <p className="text-sm text-muted-foreground">Verifikasi lokasi saat absensi</p>
            </div>
            <Switch 
              checked={settings.requireLocation}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireLocation: checked }))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Clock Out</Label>
              <p className="text-sm text-muted-foreground">Otomatis clock out di akhir jam kerja</p>
            </div>
            <Switch 
              checked={settings.autoClockOut}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoClockOut: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gradient-bg" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
}
