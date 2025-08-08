import React from "react";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AppSidebar from "./AppSidebar";

const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/officer_dashboard" },
  { text: "My Cases", icon: <AssignmentIcon />, path: "/officer_cases" },
  { text: "Evidence", icon: <FolderIcon />, path: "/officer_evidence" },
  { text: "Investigation Tools", icon: <DescriptionIcon />, path: "/investigation_tools" },
  { text: "Profile", icon: <PersonIcon />, path: "/officer_profile" },
  { text: "Logout", icon: <LogoutIcon />, path: "/auth/login", logout: true },
];

export default function OfficerSidebar() {
  return <AppSidebar items={navItems} subtitle="Officer Panel" />;
}
