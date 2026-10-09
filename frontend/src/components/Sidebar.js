import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, Typography } from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReportIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import HelpIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { logout } from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/victim_dashboard" },
  { text: "Report Crime", icon: <ReportIcon />, path: "/report_crime" },
  { text: "My Reports", icon: <ListAltIcon />, path: "/victim_reports" },
  { text: "Profile", icon: <PersonIcon />, path: "/profile" },
  { text: "Help & FAQ", icon: <HelpIcon />, path: "/help" },
  { text: "Logout", icon: <LogoutIcon />, path: "/auth/login", logout: true },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = async (item) => {
    if (item.logout) {
      await logout();
      navigate(item.path);
    } else {
      navigate(item.path);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#182237', color: '#fff' },
      }}
    >
      <Toolbar />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#4fd1c5' }}>
          CyberCrime Reports
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => handleNav(item)}
            sx={{
              background: location.pathname === item.path ? '#2d3748' : 'inherit',
              '&:hover': { background: '#2d3748' },
            }}
          >
            <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
} 