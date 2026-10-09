import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Paper, GridLegacy as Grid, Card, CardContent, 
  TextField, InputAdornment, Select, MenuItem, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, IconButton, Avatar
} from "@mui/material";
import AdminSidebar from "../../components/AdminSidebar";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { apiFetch } from "../../utils/api";

export default function AllReports() {
  const adminName = sessionStorage.getItem("userName") || "Admin User";
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [crimeTypeFilter, setCrimeTypeFilter] = useState("All Crime Types");
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await apiFetch('/admin/all_reports', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setReports(data.reports || []);
        } else {
          setError('Failed to fetch reports');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Calculate statistics
  useEffect(() => {
    const total = reports.length;
    const open = reports.filter(r => r.status === "Open").length;
    const inProgress = reports.filter(r => r.status === "Under Investigation").length;
    const resolved = reports.filter(r => r.status === "Closed").length;

    setStats({
      total,
      open,
      inProgress,
      resolved
    });
  }, [reports]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "#ef4444";
      case "Under Investigation": return "#f59e0b";
      case "Closed": return "#10b981";
      default: return "#64748b";
    }
  };

  const getCrimeTypeDescription = (crimeType) => {
    const descriptions = {
      "Phishing": "Online - Email",
      "Identity Theft": "Online - Social Media",
      "Cyberbullying": "Social Media Platform",
      "Fraud": "Online - Financial",
      "Hacking": "System - Unauthorized Access"
    };
    return descriptions[crimeType] || "General";
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = (report.victim_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.crime_type || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All Statuses" || report.status === statusFilter;
    const matchesCrimeType = crimeTypeFilter === "All Crime Types" || report.crime_type === crimeTypeFilter;
    return matchesSearch && matchesStatus && matchesCrimeType;
  });

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography variant="body2" fontWeight={500}>{adminName}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ p: { xs: 2, md: 4 }, mt: { xs: 0, md: 4 } }}>
          <Typography variant="h4" fontWeight={700} mb={1}>All Crime Reports</Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={4}>
            View and manage all crime reports in the system.
          </Typography>

          {error && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          {loading && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 2 }}>
              <Typography color="primary">Loading reports...</Typography>
            </Box>
          )}

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#dbeafe', color: '#1e40af', width: 56, height: 56 }}>
                      <DescriptionIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#1e40af" mb={1}>
                    {stats.total}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Total Reports
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#fee2e2', color: '#dc2626', width: 56, height: 56 }}>
                      <ReportIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#dc2626" mb={1}>
                    {stats.open}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Open Cases
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#fef3c7', color: '#d97706', width: 56, height: 56 }}>
                      <AssignmentIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#d97706" mb={1}>
                    {stats.inProgress}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Under Investigation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#dcfce7', color: '#166534', width: 56, height: 56 }}>
                      <CheckCircleIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#166534" mb={1}>
                    {stats.resolved}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Closed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search and Filter */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} lg={6}>
                <TextField
                  fullWidth
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#e2e8f0'
                      },
                      '&:hover fieldset': {
                        borderColor: '#cbd5e1'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} lg={3}>
                <FormControl fullWidth>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    }
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1'
                      }
                    }}
                  >
                    <MenuItem value="All Statuses">All Statuses</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Under Investigation">Under Investigation</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} lg={3}>
                <FormControl fullWidth>
                  <Select
                    value={crimeTypeFilter}
                    onChange={(e) => setCrimeTypeFilter(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    }
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1'
                      }
                    }}
                  >
                    <MenuItem value="All Crime Types">All Crime Types</MenuItem>
                    <MenuItem value="Phishing">Phishing</MenuItem>
                    <MenuItem value="Identity Theft">Identity Theft</MenuItem>
                    <MenuItem value="Cyberbullying">Cyberbullying</MenuItem>
                    <MenuItem value="Fraud">Fraud</MenuItem>
                    <MenuItem value="Hacking">Hacking</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Reports Table */}
          <Paper sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>REPORT ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>VICTIM</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>CRIME TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>DATE REPORTED</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>ASSIGNED OFFICER</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <TableRow key={report.id} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                        <TableCell>
                          <Typography variant="body1" fontWeight={600}>
                            #{String(report.id).padStart(3, '0')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {report.victim_name || 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {report.crime_type}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {getCrimeTypeDescription(report.crime_type)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {report.date_submitted}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={report.status}
                            sx={{
                              backgroundColor: getStatusColor(report.status) + '20',
                              color: getStatusColor(report.status),
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {report.assigned_officer_name || 'Not Assigned'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" sx={{ color: '#3b82f6' }}>
                              <VisibilityIcon />
                            </IconButton>
                            {(report.assigned_officer_name === "Not Assigned" || !report.assigned_officer_name) && (
                              <IconButton size="small" sx={{ color: '#10b981' }}>
                                <PersonAddIcon />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No reports found. Reports will appear here when victims submit crime reports.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
} 