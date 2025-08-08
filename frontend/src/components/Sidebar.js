import React from "react";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReportIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import HelpIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AppSidebar from "./AppSidebar";

const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/victim_dashboard" },
  { text: "Report Crime", icon: <ReportIcon />, path: "/report_crime" },
  { text: "My Reports", icon: <ListAltIcon />, path: "/victim_reports" },
  { text: "Profile", icon: <PersonIcon />, path: "/profile" },
  { text: "Help & FAQ", icon: <HelpIcon />, path: "/help" },
  { text: "Logout", icon: <LogoutIcon />, path: "/auth/login", logout: true },
];

export default function Sidebar() {
  return <AppSidebar items={navItems} subtitle="Victim Panel" />;
}
