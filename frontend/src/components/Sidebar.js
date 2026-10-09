import React from "react";
import { IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, Typography } from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReportIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import HelpIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { logout } from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MobileTopBar from "./MobileTopBar";
import { useSidebar } from "./useSidebar";

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
  const { isMobile, collapsed, hidden, open, setOpen, toggleCollapsed } = useSidebar(drawerWidth);

  const handleNav = async (item) => {
    setOpen(false);
    if (item.logout) {
      await logout();
      navigate(item.path);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
    {hidden && (
      <MobileTopBar
        background="#182237"
        mobile={isMobile}
        onMenu={() => (isMobile ? setOpen(true) : toggleCollapsed())}
      />
    )}
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? open : true}
      onClose={() => setOpen(false)}
      ModalProps={{ keepMounted: true }}
      sx={{
        ...(isMobile ? {} : { width: collapsed ? 0 : drawerWidth, flexShrink: 0 }),
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#182237', color: '#fff', ...(!isMobile && collapsed ? { display: 'none' } : {}) },
      }}
    >
      <Toolbar />
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#4fd1c5' }}>
          CyberCrime Reports
        </Typography>
      </Box>
      {!isMobile && (
          <IconButton aria-label="Collapse sidebar" size="small" onClick={toggleCollapsed} sx={{ color: '#b5f5ec' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
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
    </>
  );
} 