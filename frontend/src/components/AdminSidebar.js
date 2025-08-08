import React from "react";
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AppSidebar from "./AppSidebar";

const navItems = [
  { text: "Dashboard", icon: <HomeIcon />, path: "/admin_dashboard" },
  { text: "Assign Officers", icon: <GroupIcon />, path: "/assign_officer" },
  { text: "Manage Users", icon: <ManageAccountsIcon />, path: "/manage_users" },
  { text: "All Reports", icon: <DescriptionIcon />, path: "/all_reports" },
  { text: "Audit Log", icon: <AssessmentIcon />, path: "/audit_log" },
  { text: "Profile", icon: <PersonIcon />, path: "/admin_profile" },
  { text: "Logout", icon: <LogoutIcon />, path: "/auth/login", logout: true },
];

export default function AdminSidebar() {
  return <AppSidebar items={navItems} subtitle="Admin Panel" width={280} />;
}
