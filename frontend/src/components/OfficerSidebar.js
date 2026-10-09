import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, Typography } from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { logout } from "../utils/api";
import DescriptionIcon from '@mui/icons-material/Description';
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/officer_dashboard" },
  { text: "My Cases", icon: <AssignmentIcon />, path: "/officer_cases" },
  { text: "Evidence", icon: <FolderIcon />, path: "/officer_evidence" },
  { text: "Investigation Tools", icon: <DescriptionIcon />, path: "/investigation_tools" },
  { text: "Profile", icon: <PersonIcon />, path: "/officer_profile" },
  { text: "Logout", icon: <LogoutIcon />, path: "/auth/login", logout: true },
];

export default function OfficerSidebar() {
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
        <Typography variant="body2" sx={{ color: '#b5f5ec', fontWeight: 400, fontSize: 14 }}>
          Officer Panel
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