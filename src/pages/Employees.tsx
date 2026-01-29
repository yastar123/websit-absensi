import { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Trash2,
  Edit,
  UserCog
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  getEmployees, 
  getDepartments,
  saveEmployee,
  deleteEmployee,
  saveDepartment,
  Employee,
  Department
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    role: "staff" as 'admin' | 'supervisor' | 'staff',
    supervisorId: "",
  });
  const { toast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [emps, depts] = await Promise.all([
        getEmployees(),
        getDepartments()
      ]);
      setEmployees(emps);
      setDepartments(depts);
    };
    loadData();
  }, []);

  const supervisors = employees.filter(e => e.role === 'supervisor');

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    const matchesRole = selectedRole === 'all' || emp.role === selectedRole;
    return matchesSearch && matchesDept && matchesRole;
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.department) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    const newEmployee: Employee = {
      id: editEmployee?.id || `emp-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.position,
      role: formData.role,
      supervisorId: formData.role === 'staff' ? formData.supervisorId : undefined,
      joinDate: editEmployee?.joinDate || new Date().toISOString().split('T')[0],
      leaveQuota: 12,
      usedLeave: editEmployee?.usedLeave || 0,
    };

    await saveEmployee(newEmployee);
    
    // Update department if role is supervisor
    if (formData.role === 'supervisor') {
      const allDepts = await getDepartments();
      const dept = allDepts.find(d => d.name === formData.department);
      if (dept) {
        await saveDepartment({
          ...dept,
          manager: formData.name
        } as any);
      }
    }

    toast({
      title: editEmployee ? "Berhasil Diperbarui" : "Berhasil Ditambahkan",
      description: `Data karyawan ${formData.name} telah ${editEmployee ? 'diperbarui' : 'ditambahkan'}`,
    });
    
    resetForm();
    window.location.reload();
  };

  const handleDelete = async (emp: Employee) => {
    await deleteEmployee(emp.id);
    toast({
      title: "Berhasil Dihapus",
      description: `Karyawan ${emp.name} telah dihapus dari sistem`,
    });
    window.location.reload();
  };

  const handleEdit = (emp: Employee) => {
    setEditEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      role: emp.role,
      supervisorId: emp.supervisorId || "",
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      role: "staff",
      supervisorId: "",
    });
    setEditEmployee(null);
    setShowAddModal(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary/10 text-primary">Admin</Badge>;
      case 'supervisor':
        return <Badge className="bg-blue-500/10 text-blue-500">Supervisor</Badge>;
      case 'staff':
        return <Badge className="bg-muted text-muted-foreground">Staff</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getSupervisorName = (supervisorId?: string) => {
    if (!supervisorId) return null;
    const supervisor = employees.find(e => e.id === supervisorId);
    return supervisor?.name;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Karyawan</h1>
          <p className="text-muted-foreground">Kelola data karyawan perusahaan</p>
        </div>
        <Button className="gradient-bg" onClick={() => setShowAddModal(true)} data-testid="btn-add-employee">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Karyawan
        </Button>
      </div>

      <Card className="card-vercel">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Cari nama atau email..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-employee"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48 bg-background">
                <Building2 className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Semua Departemen</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-40 bg-background">
                <UserCog className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <Card key={emp.id} className="card-vercel group" data-testid={`employee-card-${emp.id}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(emp.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{emp.name}</h3>
                    <p className="text-sm text-muted-foreground">{emp.position}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => handleEdit(emp)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(emp)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{emp.phone}</span>
                </div>
                {emp.supervisorId && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserCog className="h-4 w-4" />
                    <span>Supervisor: {getSupervisorName(emp.supervisorId)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge variant="outline">{emp.department}</Badge>
                {getRoleBadge(emp.role)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card className="card-vercel">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-foreground">Tidak Ada Data</h3>
            <p className="text-sm text-muted-foreground">
              Tidak ditemukan karyawan yang sesuai filter
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddModal} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editEmployee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</DialogTitle>
            <DialogDescription>
              {editEmployee ? 'Perbarui informasi karyawan' : 'Lengkapi form berikut untuk menambahkan karyawan baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Lengkap *</Label>
                <Input 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-employee-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  data-testid="input-employee-email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>No. Telepon</Label>
                <Input 
                  placeholder="081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  data-testid="input-employee-phone"
                />
              </div>
              <div className="space-y-2">
                <Label>Departemen *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, department: val }))}
                >
                  <SelectTrigger className="bg-background" data-testid="select-employee-dept">
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Posisi/Jabatan</Label>
                <Input 
                  placeholder="Software Engineer"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  data-testid="input-employee-position"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val: 'admin' | 'supervisor' | 'staff') => setFormData(prev => ({ ...prev, role: val }))}
                >
                  <SelectTrigger className="bg-background" data-testid="select-employee-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.role === 'staff' && (
              <div className="space-y-2">
                <Label>Supervisor</Label>
                <Select 
                  value={formData.supervisorId} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, supervisorId: val }))}
                >
                  <SelectTrigger className="bg-background" data-testid="select-employee-supervisor">
                    <SelectValue placeholder="Pilih supervisor (opsional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="">Tidak ada supervisor</SelectItem>
                    {supervisors.map(sup => (
                      <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Pilih supervisor untuk staff ini</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Batal
            </Button>
            <Button className="gradient-bg" onClick={handleSubmit} data-testid="btn-submit-employee">
              {editEmployee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
