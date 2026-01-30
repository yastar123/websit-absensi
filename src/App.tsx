import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import Leave from "@/pages/Leave";
import Overtime from "@/pages/Overtime";
import Reports from "@/pages/Reports";
import Employees from "@/pages/Employees";
import Departments from "@/pages/Departments";
import ActivityLogs from "@/pages/ActivityLogs";
import Settings from "@/pages/Settings";
import Team from "@/pages/Team";
import Barcode from "@/pages/Barcode";
import NotFound from "@/pages/NotFound";
import LeaveManagement from "@/pages/LeaveManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/manage-leave" element={<LeaveManagement />} />
            <Route path="/overtime" element={<Overtime />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/team" element={<Team />} />
            <Route path="/barcode" element={<Barcode />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
