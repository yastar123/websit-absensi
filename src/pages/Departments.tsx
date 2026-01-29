import { useState, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  Users,
  MoreHorizontal,
  Trash2,
  Edit,
  Clock,
  UserPlus,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getDepartments, 
  getShifts,
  getEmployees,
  saveDepartment,
  deleteDepartment,
  saveEmployee,
  saveShift,
  deleteShift,
  Department,
  WorkShift,
  Employee
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Departments() {
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedDeptForMembers, setSelectedDeptForMembers] = useState<Department | null>(null);
  
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [editShift, setEditShift] = useState<WorkShift | null>(null);
  const [deptForm, setDeptForm] = useState({ name: "", description: "" });
  const [shiftForm, setShiftForm] = useState({ name: "", startTime: "", endTime: "" });
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const supervisors = employees.filter(e => e.role === 'supervisor');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [depts, shiftsData, emps] = await Promise.all([
      getDepartments(),
      getShifts(),
      getEmployees()
    ]);
    setDepartments(depts);
    setShifts(shiftsData);
    setEmployees(emps);
  };

  const getEmployeeCount = (deptName: string) => {
    return employees.filter(e => e.department === deptName).length;
  };

  const getManagerName = (deptName: string) => {
    const supervisor = supervisors.find(e => e.department === deptName);
    return supervisor ? supervisor.name : "Belum ditentukan";
  };

  const handleDeptSubmit = async () => {
    if (!deptForm.name) {
      toast({ title: "Error", description: "Nama departemen wajib diisi", variant: "destructive" });
      return;
    }

    try {
      await saveDepartment({
        id: editDept?.id || "",
        name: deptForm.name,
        description: deptForm.description,
      });

      toast({
        title: editDept ? "Berhasil Diperbarui" : "Berhasil Ditambahkan",
        description: `Departemen ${deptForm.name} telah ${editDept ? 'diperbarui' : 'ditambahkan'}`,
      });

      resetDeptForm();
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan departemen",
        variant: "destructive"
      });
    }
  };

  const handleDeptDelete = async (dept: Department) => {
    await deleteDepartment(dept.id);
    toast({ title: "Berhasil Dihapus", description: `Departemen ${dept.name} telah dihapus` });
    loadData();
  };

  const handleDeptEdit = (dept: Department) => {
    setEditDept(dept);
    setDeptForm({ name: dept.name, description: dept.description });
    setShowDeptModal(true);
  };

  const resetDeptForm = () => {
    setDeptForm({ name: "", description: "" });
    setEditDept(null);
    setShowDeptModal(false);
  };

  const handleShiftSubmit = async () => {
    if (!shiftForm.name || !shiftForm.startTime || !shiftForm.endTime) {
      toast({ title: "Error", description: "Semua field wajib diisi", variant: "destructive" });
      return;
    }

    await saveShift({
      id: editShift?.id || `shift-${Date.now()}`,
      name: shiftForm.name,
      startTime: shiftForm.startTime,
      endTime: shiftForm.endTime,
    });

    toast({
      title: editShift ? "Berhasil Diperbarui" : "Berhasil Ditambahkan",
      description: `Shift ${shiftForm.name} telah ${editShift ? 'diperbarui' : 'ditambahkan'}`,
    });

    resetShiftForm();
    loadData();
  };

  const handleShiftDelete = async (shift: WorkShift) => {
    await deleteShift(shift.id);
    toast({ title: "Berhasil Dihapus", description: `Shift ${shift.name} telah dihapus` });
    loadData();
  };

  const handleShiftEdit = (shift: WorkShift) => {
    setEditShift(shift);
    setShiftForm({ name: shift.name, startTime: shift.startTime, endTime: shift.endTime });
    setShowShiftModal(true);
  };

  const resetShiftForm = () => {
    setShiftForm({ name: "", startTime: "", endTime: "" });
    setEditShift(null);
    setShowShiftModal(false);
  };

  const handleManageMembers = (dept: Department) => {
    setSelectedDeptForMembers(dept);
    setShowMembersModal(true);
  };

  const handleUpdateMemberRole = async (empId: string, role: 'supervisor' | 'staff') => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    try {
      // If setting a new supervisor, demote existing supervisor in this dept
      if (role === 'supervisor') {
        const existingSup = employees.find(e => e.department === selectedDeptForMembers?.name && e.role === 'supervisor');
        if (existingSup && existingSup.id !== empId) {
          await saveEmployee({ ...existingSup, role: 'staff' });
        }
      }

      await saveEmployee({ ...emp, role, department: selectedDeptForMembers?.name || emp.department });
      toast({ title: "Berhasil", description: `Role ${emp.name} diperbarui menjadi ${role}` });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Gagal memperbarui role", variant: "destructive" });
    }
  };

  const handleAddMemberToDept = async (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp || !selectedDeptForMembers) return;

    try {
      await saveEmployee({ ...emp, department: selectedDeptForMembers.name });
      toast({ title: "Berhasil", description: `${emp.name} ditambahkan ke ${selectedDeptForMembers.name}` });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Gagal menambahkan anggota", variant: "destructive" });
    }
  };

  const handleRemoveMemberFromDept = async (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    try {
      await saveEmployee({ ...emp, department: "Unassigned", role: 'staff' });
      toast({ title: "Berhasil", description: `${emp.name} dikeluarkan dari departemen` });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengeluarkan anggota", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Departemen & Shift</h1>
        <p className="text-muted-foreground">Kelola departemen dan jadwal kerja</p>
      </div>

      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="departments" className="data-[state=active]:bg-background">
            <Building2 className="mr-2 h-4 w-4" />
            Departemen
          </TabsTrigger>
          <TabsTrigger value="shifts" className="data-[state=active]:bg-background">
            <Clock className="mr-2 h-4 w-4" />
            Jadwal Shift
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gradient-bg" onClick={() => setShowDeptModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Departemen
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <Card key={dept.id} className="card-vercel group cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleManageMembers(dept)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{dept.name}</h3>
                        <p className="text-xs text-muted-foreground">Supervisor: {getManagerName(dept.name)}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeptEdit(dept); }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleDeptDelete(dept); }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{getEmployeeCount(dept.name)} karyawan</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gradient-bg" onClick={() => setShowShiftModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Shift
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => (
              <Card key={shift.id} className="card-vercel group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                        <Clock className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{shift.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {shift.startTime} - {shift.endTime}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={() => handleShiftEdit(shift)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleShiftDelete(shift)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4">
                    <Badge variant="outline">
                      {calculateShiftDuration(shift.startTime, shift.endTime)} jam
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dept Edit Modal */}
      <Dialog open={showDeptModal} onOpenChange={resetDeptForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editDept ? 'Edit Departemen' : 'Tambah Departemen'}</DialogTitle>
            <DialogDescription>
              {editDept ? 'Perbarui informasi departemen' : 'Buat departemen baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Departemen *</Label>
              <Input 
                placeholder="Engineering"
                value={deptForm.name}
                onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea 
                placeholder="Deskripsi singkat departemen..."
                value={deptForm.description}
                onChange={(e) => setDeptForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDeptForm}>Batal</Button>
            <Button className="gradient-bg" onClick={handleDeptSubmit}>
              {editDept ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members Management Modal */}
      <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Anggota Departemen {selectedDeptForMembers?.name}</DialogTitle>
            <DialogDescription>
              Kelola supervisor dan staff dalam departemen ini
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Current Members */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Daftar Anggota
              </h4>
              <div className="divide-y border rounded-lg overflow-hidden bg-muted/20">
                {employees.filter(e => e.department === selectedDeptForMembers?.name).length > 0 ? (
                  employees.filter(e => e.department === selectedDeptForMembers?.name).map(emp => (
                    <div key={emp.id} className="p-3 flex items-center justify-between bg-background">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                          {emp.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={emp.role} 
                          onValueChange={(val: any) => handleUpdateMemberRole(emp.id, val)}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveMemberFromDept(emp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Belum ada anggota di departemen ini
                  </div>
                )}
              </div>
            </div>

            {/* Add New Members */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Tambah Anggota
              </h4>
              <div className="flex gap-2">
                <Select onValueChange={handleAddMemberToDept}>
                  <SelectTrigger className="flex-1 bg-background">
                    <SelectValue placeholder="Pilih karyawan untuk ditambahkan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => e.department !== selectedDeptForMembers?.name).map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMembersModal(false)}>Selesai</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showShiftModal} onOpenChange={resetShiftForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editShift ? 'Edit Shift' : 'Tambah Shift'}</DialogTitle>
            <DialogDescription>
              {editShift ? 'Perbarui jadwal shift' : 'Buat jadwal shift baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Shift *</Label>
              <Input 
                placeholder="Morning Shift"
                value={shiftForm.name}
                onChange={(e) => setShiftForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jam Mulai *</Label>
                <Input 
                  type="time"
                  value={shiftForm.startTime}
                  onChange={(e) => setShiftForm(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Jam Selesai *</Label>
                <Input 
                  type="time"
                  value={shiftForm.endTime}
                  onChange={(e) => setShiftForm(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetShiftForm}>Batal</Button>
            <Button className="gradient-bg" onClick={handleShiftSubmit}>
              {editShift ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function calculateShiftDuration(start: string, end: string): number {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  
  return Math.round(totalMinutes / 60);
}
