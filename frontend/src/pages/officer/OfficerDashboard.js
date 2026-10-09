import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, Chip, Button, Stack, Avatar, IconButton, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert } from "@mui/material";
import OfficerSidebar from "../../components/OfficerSidebar";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldIcon from '@mui/icons-material/Shield';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const officerName = sessionStorage.getItem("userName") || "Officer Smith";

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllCases, setShowAllCases] = useState(false);

  useEffect(() => {
    setLoading(true);
    console.log('Fetching officer cases from dashboard...');
    apiFetch("/officer/assigned_cases", {
      method: "GET",
      credentials: "include"
    })
      .then(async res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.error || "Failed to fetch cases");
        }
        return res.json();
      })
      .then(data => {
        console.log('Cases data received:', data);
        setCases(data.cases || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching cases:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filter out resolved cases and calculate priorities
  const activeCases = cases.filter(c => c.status !== "Closed");
  
  const calculatePriority = (caseData) => {
    let priority = 0;
    
    // Base priority by crime type
    const crimeTypePriority = {
      'Ransomware': 100,
      'Identity Theft': 90,
      'Credit Card Fraud': 85,
      'Hacking': 70,
      'Phishing': 60,
      'Online Fraud': 55,
      'Cyberbullying': 40,
      'Social Media Harassment': 35
    };
    
    priority += crimeTypePriority[caseData.crime_type] || 50;
    
    // Add urgency based on days since reported
    const reportDate = new Date(caseData.date_submitted);
    const daysSinceReport = Math.floor((new Date() - reportDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceReport > 3) {
      priority += 50; // High urgency for cases older than 3 days
    } else if (daysSinceReport > 1) {
      priority += 25; // Medium urgency for cases older than 1 day
    }
    
    // Add priority for open cases
    if (caseData.status === "Open") {
      priority += 20;
    }
    
    return priority;
  };
  
  // Sort cases by priority (highest first)
  const priorityCases = activeCases
    .map(c => ({ ...c, priority: calculatePriority(c) }))
    .sort((a, b) => b.priority - a.priority);
  
  // Get top 3 priority cases
  const topPriorityCases = showAllCases ? priorityCases : priorityCases.slice(0, 3);
  
  const openCount = activeCases.filter(c => c.status === "Open").length;
      const inProgressCount = activeCases.filter(c => c.status === "Under Investigation").length;
      const resolvedCount = cases.filter(c => c.status === "Closed").length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <OfficerSidebar />
      <Box sx={{ flexGrow: 1, p: 0 }}>
        {/* Top Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 4, py: 2, background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
          <IconButton>
            <NotificationsNoneIcon />
          </IconButton>
          <Avatar sx={{ ml: 2, bgcolor: '#4fd1c5', color: '#fff' }}>{officerName[0]}</Avatar>
          <Typography sx={{ ml: 1, fontWeight: 500 }}>{officerName}</Typography>
        </Box>
        {/* Main Content */}
        <Box sx={{ px: 6, py: 4 }}>
          <Typography variant="h5" fontWeight={700}>Welcome, {officerName}</Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={3}>Officer Dashboard</Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 2, 
                  background: '#fff5f5', 
                  borderRadius: 3, 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    background: '#fed7d7'
                  }
                }}
                onClick={() => navigate("/officer_cases?status=Open")}
              >
                <WarningAmberIcon sx={{ color: '#e53e3e', fontSize: 32 }} />
                <Box ml={2}>
                  <Typography fontWeight={600} color="#e53e3e">Pending Cases</Typography>
                  <Typography variant="h5" fontWeight={700} color="#e53e3e">{loading ? "..." : openCount}</Typography>
                  <Typography color="#e53e3e" fontSize={14}>Requires immediate attention</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 2, 
                  background: '#fffbea', 
                  borderRadius: 3, 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    background: '#fef5e7'
                  }
                }}
                onClick={() => navigate("/officer_cases?status=Under Investigation")}
              >
                <AccessTimeIcon sx={{ color: '#d69e2e', fontSize: 32 }} />
                <Box ml={2}>
                  <Typography fontWeight={600} color="#d69e2e">Under Investigation</Typography>
                  <Typography variant="h5" fontWeight={700} color="#d69e2e">{loading ? "..." : inProgressCount}</Typography>
                  <Typography color="#d69e2e" fontSize={14}>Currently investigating</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 2, 
                  background: '#f0fff4', 
                  borderRadius: 3, 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    background: '#c6f6d5'
                  }
                }}
                onClick={() => navigate("/officer_cases?status=Closed")}
              >
                <CheckCircleOutlineIcon sx={{ color: '#38a169', fontSize: 32 }} />
                <Box ml={2}>
                  <Typography fontWeight={600} color="#38a169">Closed</Typography>
                  <Typography variant="h5" fontWeight={700} color="#38a169">{loading ? "..." : resolvedCount}</Typography>
                  <Typography color="#38a169" fontSize={14}>Successfully closed</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(90deg, #4158d0 0%, #c850c0 46%, #ffcc70 100%)', 
                  color: '#fff', 
                  minHeight: 120,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    background: 'linear-gradient(90deg, #4c63d2 0%, #d05ac8 46%, #ffd280 100%)'
                  }
                }}
                onClick={() => navigate("/officer_cases")}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <ShieldIcon sx={{ fontSize: 40, color: '#fff' }} />
                  <Box>
                    <Typography fontWeight={700} fontSize={20}>Active Cases</Typography>
                    <Typography fontSize={15}>Manage your assigned investigations</Typography>
                    <Typography variant="h4" fontWeight={700} mt={1}>{loading ? "..." : activeCases.length}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  minHeight: 120,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    background: '#f8fafc'
                  }
                }}
                onClick={() => navigate("/investigation_tools")}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <DescriptionIcon sx={{ fontSize: 32, color: '#4158d0' }} />
                  <Box>
                    <Typography fontWeight={700}>Investigation Tools</Typography>
                    <Typography fontSize={15} color="text.secondary">Access forensic resources</Typography>
                    <Typography fontSize={13} color="text.secondary">Digital forensics, logs, analysis</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  minHeight: 120,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    background: '#f8fafc'
                  }
                }}
                onClick={() => navigate("/officer_evidence")}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <FolderIcon sx={{ fontSize: 32, color: '#319795' }} />
                  <Box>
                    <Typography fontWeight={700}>Evidence Management</Typography>
                    <Typography fontSize={15} color="text.secondary">Secure evidence handling</Typography>
                    <Typography fontSize={13} color="text.secondary">Upload, organize, analyze</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
          {/* Assigned Cases Table */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                {showAllCases ? "All Active Cases" : "Top Priority Cases"}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography color="text.secondary">
                  {loading ? "..." : `${topPriorityCases.length} of ${activeCases.length} active cases`}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowAllCases(!showAllCases)}
                >
                  {showAllCases ? "Show Top 3" : "View All Cases"}
                </Button>
              </Box>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>PRIORITY</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>REPORT ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>VICTIM</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>CRIME TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>DAYS SINCE REPORTED</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topPriorityCases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No active cases assigned.</TableCell>
                    </TableRow>
                  ) : (
                    topPriorityCases.map((c) => {
                      const reportDate = new Date(c.date_submitted);
                      const daysSinceReport = Math.floor((new Date() - reportDate) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <TableRow key={c.id}>
                          <TableCell>
                            <Chip 
                              label={`Priority ${c.priority}`}
                              color={c.priority > 120 ? "error" : c.priority > 80 ? "warning" : "info"}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{`#${String(c.id).padStart(3, '0')}`}</TableCell>
                          <TableCell>{c.victim_name || 'Unknown'}</TableCell>
                          <TableCell>{c.crime_type}</TableCell>
                          <TableCell>
                            <Typography 
                              color={daysSinceReport > 3 ? "error" : daysSinceReport > 1 ? "warning" : "text.secondary"}
                              fontWeight={daysSinceReport > 3 ? 600 : 400}
                            >
                              {daysSinceReport} day{daysSinceReport !== 1 ? 's' : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={c.status} 
                              color={c.status === "Under Investigation" ? "warning" : c.status === "Open" ? "error" : c.status === "Closed" ? "success" : "error"} 
                              sx={{ fontWeight: 700, fontSize: 15, px: 1.5, borderRadius: 2 }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="text" size="small" sx={{ color: '#2563eb', fontWeight: 600, mr: 1 }} onClick={() => navigate(`/case/${c.id}`)}>View Case</Button>
                            <Button variant="text" size="small" sx={{ color: '#319795', fontWeight: 600, mr: 1 }} onClick={() => navigate(`/officer/case/${c.id}/evidence`)}>Evidence</Button>
                            <Button variant="text" size="small" sx={{ color: '#38a169', fontWeight: 600 }} onClick={() => navigate(`/case/${c.id}/logs`)}>+ Add Log</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </Paper>
          {/* Case Priority Overview */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Case Priority Overview</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, background: '#fff5f5', borderRadius: 2 }}>
                  <Typography fontWeight={700} color="#e53e3e">High Priority</Typography>
                  <Typography color="#e53e3e" fontSize={15}>Ransomware, Identity Theft, Credit Card Fraud</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, background: '#fffbea', borderRadius: 2 }}>
                  <Typography fontWeight={700} color="#d69e2e">Medium Priority</Typography>
                  <Typography color="#d69e2e" fontSize={15}>Phishing, Online Fraud, Hacking</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, background: '#e8f0fe', borderRadius: 2 }}>
                  <Typography fontWeight={700} color="#2563eb">Standard Priority</Typography>
                  <Typography color="#2563eb" fontSize={15}>Cyberbullying, Social Media Harassment</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
} 