import React from "react";
import { 
  Box, Typography, List, ListItem, ListItemIcon, ListItemText, 
  Divider, Avatar, IconButton 
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionStorage } from "../utils/useSessionStorage";
import { logout } from "../utils/api";
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SecurityIcon from '@mui/icons-material/Security';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName] = useSessionStorage("userName", "Admin User");

  const menuItems = [
    { text: "Dashboard", icon: <HomeIcon />, path: "/admin_dashboard" },
    { text: "Assign Officers", icon: <GroupIcon />, path: "/assign_officer" },
    { text: "Manage Users", icon: <GroupIcon />, path: "/manage_users" },
    { text: "All Reports", icon: <DescriptionIcon />, path: "/all_reports" },
    { text: "Audit Log", icon: <AssessmentIcon />, path: "/audit_log" },
    { text: "Profile", icon: <PersonIcon />, path: "/admin_profile" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <Box sx={{ 
      width: 280, 
      background: '#282c34', 
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000
    }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #3e4451' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon sx={{ fontSize: 32, color: '#4fd1c5' }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>CyberCrime Reports</Typography>
            <Typography variant="body2" color="#abb2bf">Admin Panel</Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, py: 2, overflow: 'hidden' }}>
        <List sx={{ overflow: 'hidden' }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 2,
                mb: 1,
                borderRadius: 2,
                backgroundColor: location.pathname === item.path ? '#4fd1c5' : 'transparent',
                color: location.pathname === item.path ? '#282c34' : 'white',
                overflow: 'hidden',
                '&:hover': {
                  backgroundColor: location.pathname === item.path ? '#4fd1c5' : '#3e4451',
                  color: location.pathname === item.path ? '#282c34' : 'white'
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? '#282c34' : '#abb2bf',
                minWidth: 40 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontWeight: location.pathname === item.path ? 600 : 400 
                  } 
                }} 
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid #3e4451' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#4fd1c5', color: '#282c34' }}>
            {adminName[0].toLowerCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{adminName.toLowerCase()}</Typography>
            <Typography variant="caption" color="#abb2bf">Administrator</Typography>
          </Box>
        </Box>
                 <ListItem
           onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: '#abb2bf',
            '&:hover': {
              backgroundColor: '#3e4451',
              color: 'white'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
    </Box>
  );
} 