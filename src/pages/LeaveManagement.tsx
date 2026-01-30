import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const API_URL = "/api";

export default function LeaveManagement() {
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", defaultQuota: 12 });
  const { toast } = useToast();

  const fetchData = async () => {
    const [typesRes, empsRes] = await Promise.all([
      fetch(`${API_URL}/leave-types`),
      fetch(`${API_URL}/employees`)
    ]);
    setLeaveTypes(await typesRes.json());
    setEmployees(await empsRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingType ? "PUT" : "POST";
    const url = editingType ? `${API_URL}/leave-types/${editingType.id}` : `${API_URL}/leave-types`;
    
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    toast({ title: "Success", description: "Leave type saved successfully" });
    setIsDialogOpen(false);
    setEditingType(null);
    setFormData({ name: "", defaultQuota: 12 });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/leave-types/${id}`, { method: "DELETE" });
    toast({ title: "Success", description: "Leave type deleted" });
    fetchData();
  };

  const handleUpdateQuota = async (empId: string, quota: number) => {
    await fetch(`${API_URL}/employees/${empId}/quota`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaveQuota: quota }),
    });
    toast({ title: "Success", description: "Quota updated" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kelola Cuti</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingType(null); setFormData({ name: "", defaultQuota: 12 }); }}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Jenis Cuti
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingType ? "Edit" : "Tambah"} Jenis Cuti</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Cuti</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Kuota Default (Hari)</Label>
                <Input type="number" value={formData.defaultQuota} onChange={e => setFormData({ ...formData, defaultQuota: parseInt(e.target.value) })} required />
              </div>
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Jenis Pengajuan Cuti</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kuota Default</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes.map(type => (
                  <TableRow key={type.id}>
                    <TableCell>{type.name}</TableCell>
                    <TableCell>{type.defaultQuota} hari</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingType(type); setFormData({ name: type.name, defaultQuota: type.defaultQuota }); setIsDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(type.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Atur Kuota Karyawan</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Kuota Saat Ini</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        defaultValue={emp.leaveQuota} 
                        className="w-20"
                        onBlur={(e) => handleUpdateQuota(emp.id, parseInt(e.target.value))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}