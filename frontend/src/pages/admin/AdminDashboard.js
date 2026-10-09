import React, { useEffect, useState } from "react";
import { 
  Box, Typography, GridLegacy as Grid, Paper, Card, CardContent, CardActions, Button, 
  IconButton, Chip, Stack, Divider, Table, TableHead, TableRow, TableCell, 
  TableBody, CircularProgress, Alert, Avatar, Badge
} from "@mui/material";
import AdminSidebar from "../../components/AdminSidebar";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from "react-router-dom";
import { useSessionStorage } from "../../utils/useSessionStorage";
import { apiFetch } from "../../utils/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminName] = useSessionStorage("userName", "Admin User");

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiFetch("/admin/all_reports", {
      method: "GET",
      credentials: "include"
    })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch reports");
        return res.json();
      })
      .then(data => {
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Calculate statistics
  const totalReports = reports.length;
  const unassignedReports = reports.filter(r => r.assigned_officer === "Not Assigned").length;
      const inProgressReports = reports.filter(r => r.status === "Under Investigation").length;
      const resolvedReports = reports.filter(r => r.status === "Closed").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "error";
      case "Under Investigation": return "warning";
      case "Closed": return "success";
      default: return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', pt: 'var(--topbar-h, 0px)', boxSizing: 'border-box' }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0, p: 0, marginLeft: 'var(--sidebar-w, 280px)' }}>
        {/* Header */}
        <Box sx={{ 
          background: '#fff', 
          borderBottom: '1px solid #e2e8f0', 
          p: { xs: 2, md: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Welcome, {adminName}</Typography>
            <Typography variant="subtitle1" color="text.secondary">Admin Dashboard</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>
            <IconButton>
              <HelpOutlineIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#4fd1c5' }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="body2" fontWeight={500}>{adminName}</Typography>
              <IconButton size="small">
                <KeyboardArrowDownIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 } }}>
          <Typography variant="h4" fontWeight={700} mb={1}>Admin Dashboard</Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={4}>Welcome back, {adminName}</Typography>

          {/* Summary Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" fontSize={14}>Total Reports</Typography>
                  <Typography variant="h4" fontWeight={700} color="#2563eb">{loading ? "..." : totalReports}</Typography>
                </Box>
                <DescriptionIcon sx={{ color: '#2563eb', fontSize: 40 }} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff5f5' }}>
                <Box>
                  <Typography color="#e53e3e" fontSize={14}>Unassigned</Typography>
                  <Typography variant="h4" fontWeight={700} color="#e53e3e">{loading ? "..." : unassignedReports}</Typography>
                </Box>
                <WarningIcon sx={{ color: '#e53e3e', fontSize: 40 }} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fffbea' }}>
                <Box>
                  <Typography color="#d69e2e" fontSize={14}>Under Investigation</Typography>
                  <Typography variant="h4" fontWeight={700} color="#d69e2e">{loading ? "..." : inProgressReports}</Typography>
                </Box>
                <AccessTimeIcon sx={{ color: '#d69e2e', fontSize: 40 }} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fff4' }}>
                <Box>
                  <Typography color="#38a169" fontSize={14}>Closed</Typography>
                  <Typography variant="h4" fontWeight={700} color="#38a169">{loading ? "..." : resolvedReports}</Typography>
                </Box>
                <CheckCircleIcon sx={{ color: '#38a169', fontSize: 40 }} />
              </Paper>
            </Grid>
          </Grid>

          {/* Action Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => navigate("/assign_officer")}
              >
                <CardContent sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <GroupIcon sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} mb={1}>Assign Officers</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Assign cases to officers</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => navigate("/manage_users")}
              >
                <CardContent sx={{ p: 3 }}>
                  <GroupIcon sx={{ fontSize: 40, color: '#2563eb', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} mb={1}>Manage Users</Typography>
                  <Typography variant="body2" color="text.secondary">View and manage all users</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => navigate("/all_reports")}
              >
                <CardContent sx={{ p: 3 }}>
                  <DescriptionIcon sx={{ fontSize: 40, color: '#319795', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} mb={1}>All Reports</Typography>
                  <Typography variant="body2" color="text.secondary">View all crime reports</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => navigate("/audit_log")}
              >
                <CardContent sx={{ p: 3 }}>
                  <AssessmentIcon sx={{ fontSize: 40, color: '#d69e2e', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} mb={1}>Audit Log</Typography>
                  <Typography variant="body2" color="text.secondary">View system activity</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Reports Table */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Recent Reports</Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Box sx={{ overflowX: 'auto' }}><Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>REPORT ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>VICTIM</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>CRIME TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>DATE REPORTED</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>ASSIGNED OFFICER</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No reports found.</TableCell>
                    </TableRow>
                  ) : (
                    reports.slice(0, 5).map((report) => (
                      <TableRow key={report.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{`#${String(report.id).padStart(3, '0')}`}</TableCell>
                        <TableCell>{report.victim_id || report.victim || 'Unknown'}</TableCell>
                        <TableCell>{report.crime_type}</TableCell>
                        <TableCell>{formatDate(report.date_submitted)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={report.status} 
                            color={getStatusColor(report.status)} 
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>{report.assigned_officer || 'Not Assigned'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table></Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
} 