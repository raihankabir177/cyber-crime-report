import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VictimDashboard from "./pages/victim/VictimDashboard";
import ReportCrime from "./pages/victim/ReportCrime";
import VictimReports from "./pages/victim/VictimReports";
import ReportDetails from "./pages/victim/ReportDetails";
import Profile from "./pages/victim/Profile";
import Help from "./pages/victim/Help";
import RoleSelection from "./pages/auth/RoleSelection";
import VictimRegister from "./pages/auth/VictimRegister";
import OfficerRegister from "./pages/auth/OfficerRegister";
import AdminRegister from "./pages/auth/AdminRegister";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import OfficerCases from "./pages/officer/OfficerCases";
import OfficerEvidence from "./pages/officer/OfficerEvidence";
import InvestigationTools from "./pages/officer/InvestigationTools";
import CaseDetails from "./pages/officer/CaseDetails";
import CaseEvidence from "./pages/officer/CaseEvidence";
import AddLogEntry from "./pages/officer/AddLogEntry";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AssignOfficer from "./pages/admin/AssignOfficer";
import ManageUsers from "./pages/admin/ManageUsers";
import AllReports from "./pages/admin/AllReports";
import AuditLog from "./pages/admin/AuditLog";
import AdminProfile from "./pages/admin/AdminProfile";
import OfficerProfile from "./pages/officer/OfficerProfile";
import DashboardLayout from "./components/DashboardLayout";
import VictimSidebar from "./components/Sidebar";
import OfficerSidebar from "./components/OfficerSidebar";
import AdminSidebar from "./components/AdminSidebar";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/register" element={<RoleSelection />} />
        <Route path="/register/victim" element={<VictimRegister />} />
        <Route path="/register/officer" element={<OfficerRegister />} />
        <Route path="/register/admin" element={<AdminRegister />} />
        <Route element={<DashboardLayout Sidebar={VictimSidebar} />}>
          <Route path="/victim_dashboard" element={<VictimDashboard />} />
          <Route path="/report_crime" element={<ReportCrime />} />
          <Route path="/victim_reports" element={<VictimReports />} />
          <Route path="/report_details/:id" element={<ReportDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<Help />} />
        </Route>
        <Route element={<DashboardLayout Sidebar={OfficerSidebar} />}>
          <Route path="/officer_dashboard" element={<OfficerDashboard />} />
          <Route path="/officer_cases" element={<OfficerCases />} />
          <Route path="/case/:id" element={<CaseDetails />} />
          <Route path="/case/:id/logs" element={<AddLogEntry />} />
          <Route path="/officer/case/:id/evidence" element={<CaseEvidence />} />
          <Route path="/officer_evidence" element={<OfficerEvidence />} />
          <Route path="/investigation_tools" element={<InvestigationTools />} />
          <Route path="/officer_profile" element={<OfficerProfile />} />
        </Route>
        <Route element={<DashboardLayout Sidebar={AdminSidebar} />}>
          <Route path="/admin_dashboard" element={<AdminDashboard />} />
          <Route path="/assign_officer" element={<AssignOfficer />} />
          <Route path="/manage_users" element={<ManageUsers />} />
          <Route path="/all_reports" element={<AllReports />} />
          <Route path="/audit_log" element={<AuditLog />} />
          <Route path="/admin_profile" element={<AdminProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth/login" />} />
      </Routes>
    </Router>
  );
}

export default App; 