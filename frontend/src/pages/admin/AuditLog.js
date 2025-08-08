import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Paper, GridLegacy as Grid, Card, CardContent, 
  TextField, InputAdornment, Select, MenuItem, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, IconButton, Avatar, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert
} from "@mui/material";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { apiFetch } from "../../utils/api";

export default function AuditLog() {
  const adminName = sessionStorage.getItem("userName") || "Admin User";
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [userFilter, setUserFilter] = useState("All Users");
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    logins: 0,
    reports: 0,
    assignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch audit logs function
  const fetchAuditLogs = async () => {
    try {
      const response = await apiFetch('/admin/audit_logs', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
      } else {
        setError('Failed to fetch audit logs');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit logs from backend
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Reset audit logs function
  const handleResetAuditLogs = async () => {
    setResetLoading(true);
    try {
      const response = await apiFetch('/admin/audit_logs/reset', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setAuditLogs([]);
        setSuccessMessage('Audit logs have been reset successfully');
        setResetDialogOpen(false);
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
        // Refresh the audit logs to show the reset event
        setTimeout(() => {
          fetchAuditLogs();
        }, 1000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to reset audit logs');
      }
    } catch (err) {
      setError('Network error while resetting audit logs');
    } finally {
      setResetLoading(false);
    }
  };

  // Calculate statistics
  useEffect(() => {
    const total = auditLogs?.length || 0;
    const logins = auditLogs?.filter(log => log.action === "Login" || log.action === "User Login").length || 0;
    const reports = auditLogs?.filter(log => log.action === "Report Submitted").length || 0;
    const assignments = auditLogs?.filter(log => log.action === "Officer Assigned").length || 0;

    setStats({
      total,
      logins,
      reports,
      assignments
    });
  }, [auditLogs]);

  const getActionColor = (action) => {
    switch (action) {
      case "Login":
      case "User Login": return "#256D85";
      case "Report Submitted": return "#ef4444";
      case "Officer Assigned": return "#10b981";
      case "User Created": return "#256D85";
      case "Profile Updated": return "#f59e0b";
      case "Password Changed": return "#dc2626";
      case "User Updated": return "#059669";
      case "User Deleted": return "#dc2626";
      case "Audit Log Reset": return "#256D85";
      default: return "#546e7a";
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "Login":
      case "User Login": return <SecurityIcon />;
      case "Report Submitted": return <ReportIcon />;
      case "Officer Assigned": return <AssignmentIcon />;
      case "User Created": return <PersonIcon />;
      case "Profile Updated": return <CheckCircleIcon />;
      case "Password Changed": return <SecurityIcon />;
      case "User Updated": return <CheckCircleIcon />;
      case "User Deleted": return <DeleteSweepIcon />;
      case "Audit Log Reset": return <DeleteSweepIcon />;
      default: return <HistoryIcon />;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = (log.user?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (log.action?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (log.details?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Handle action filter with proper mapping
    let matchesAction = actionFilter === "All Actions";
    if (actionFilter !== "All Actions") {
      if (actionFilter === "Login") {
        matchesAction = log.action === "Login" || log.action === "User Login";
      } else {
        matchesAction = log.action === actionFilter;
      }
    }
    
    // Handle user filter - compare against role (case-insensitive and trim whitespace)
    let matchesUser = userFilter === "All Users";
    if (userFilter !== "All Users") {
      const logRole = (log.role?.toLowerCase() || '').trim();
      const filterRole = userFilter.toLowerCase().trim();
      matchesUser = logRole === filterRole;
    }
    
    return matchesSearch && matchesAction && matchesUser;
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#E8F1F5', boxSizing: 'border-box' }}>
      <Box sx={{ flexGrow: 1, minWidth: 0, p: 0 }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} mb={1}>Audit Log</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                View system activity and user actions.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={() => setResetDialogOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#ef4444',
                color: '#ef4444',
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              Reset Audit Log
            </Button>
          </Box>

                     {error && (
             <Box sx={{ mb: 3, p: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}>
               <Typography color="error">{error}</Typography>
             </Box>
           )}

           {successMessage && (
             <Box sx={{ mb: 3, p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2 }}>
               <Typography color="success.main">{successMessage}</Typography>
             </Box>
           )}

          {loading && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#d6e6ed', border: '1px solid #d6e6ed', borderRadius: 2 }}>
              <Typography color="primary">Loading audit logs...</Typography>
            </Box>
          )}

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#d6e6ed', color: '#174a5b', width: 56, height: 56 }}>
                      <HistoryIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#174a5b" mb={1}>
                    {stats.total}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Total Activities
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#d6e6ed', color: '#256D85', width: 56, height: 56 }}>
                      <SecurityIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#256D85" mb={1}>
                    {stats.logins}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    User Logins
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#fee2e2', color: '#ef4444', width: 56, height: 56 }}>
                      <ReportIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#ef4444" mb={1}>
                    {stats.reports}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Reports Submitted
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#dcfce7', color: '#10b981', width: 56, height: 56 }}>
                      <AssignmentIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#10b981" mb={1}>
                    {stats.assignments}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Officer Assignments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search and Filter */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} lg={4}>
                <TextField
                  fullWidth
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#546e7a' }} />
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
              <Grid item xs={12} lg={4}>
                <FormControl fullWidth>
                  <Select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon sx={{ color: '#546e7a' }} />
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
                    <MenuItem value="All Actions">All Actions</MenuItem>
                    <MenuItem value="Login">Login</MenuItem>
                    <MenuItem value="User Login">User Login</MenuItem>
                    <MenuItem value="Report Submitted">Report Submitted</MenuItem>
                    <MenuItem value="Officer Assigned">Officer Assigned</MenuItem>
                    <MenuItem value="User Created">User Created</MenuItem>
                    <MenuItem value="Profile Updated">Profile Updated</MenuItem>
                    <MenuItem value="Password Changed">Password Changed</MenuItem>
                    <MenuItem value="User Updated">User Updated</MenuItem>
                    <MenuItem value="User Deleted">User Deleted</MenuItem>
                    <MenuItem value="Audit Log Reset">Audit Log Reset</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} lg={4}>
                <FormControl fullWidth>
                  <Select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon sx={{ color: '#546e7a' }} />
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
                    <MenuItem value="All Users">All Users</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Officer">Officer</MenuItem>
                    <MenuItem value="Victim">Victim</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Audit Log Table */}
          <Paper sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#E8F1F5' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#263238' }}>TIMESTAMP</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#263238' }}>USER</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#263238' }}>ACTION</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#263238' }}>DETAILS</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#263238' }}>IP ADDRESS</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#263238' }}>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => (
                      <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#E8F1F5' } }}>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {log.timestamp || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#f1f5f9' }}>
                              {getActionIcon(log.action)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {log.user || 'Unknown User'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {log.role || 'Unknown Role'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.action || 'Unknown Action'}
                            icon={getActionIcon(log.action)}
                            sx={{
                              backgroundColor: getActionColor(log.action) + '20',
                              color: getActionColor(log.action),
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {log.details || 'No details available'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {log.ip_address || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.status || 'Unknown'}
                            size="small"
                            sx={{
                              backgroundColor: (log.status === 'Success') ? '#dcfce7' : '#fee2e2',
                              color: (log.status === 'Success') ? '#166534' : '#dc2626',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No audit logs found. System activities will appear here.
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

       {/* Reset Confirmation Dialog */}
       <Dialog
         open={resetDialogOpen}
         onClose={() => setResetDialogOpen(false)}
         maxWidth="sm"
         fullWidth
       >
         <DialogTitle sx={{ 
           display: 'flex', 
           alignItems: 'center', 
           gap: 1,
           color: '#ef4444',
           fontWeight: 600
         }}>
           <DeleteSweepIcon color="error" />
           Reset Audit Log
         </DialogTitle>
         <DialogContent>
           <Alert severity="warning" sx={{ mb: 2 }}>
             <Typography variant="body1" fontWeight={600} mb={1}>
               Warning: This action cannot be undone!
             </Typography>
             <Typography variant="body2">
               This will permanently delete all audit log entries from the system. 
               The reset action itself will be logged as the first entry in the new audit log.
             </Typography>
           </Alert>
           <Typography variant="body2" color="text.secondary">
             Are you sure you want to reset the audit log? This action will clear all historical activity records.
           </Typography>
         </DialogContent>
         <DialogActions sx={{ p: 3, gap: 2 }}>
           <Button
             onClick={() => setResetDialogOpen(false)}
             variant="outlined"
             disabled={resetLoading}
             sx={{ borderRadius: 2, textTransform: 'none' }}
           >
             Cancel
           </Button>
           <Button
             onClick={handleResetAuditLogs}
             variant="contained"
             color="error"
             disabled={resetLoading}
             startIcon={resetLoading ? null : <DeleteSweepIcon />}
             sx={{ 
               borderRadius: 2, 
               textTransform: 'none',
               fontWeight: 600,
               backgroundColor: '#ef4444',
               '&:hover': {
                 backgroundColor: '#dc2626'
               }
             }}
           >
             {resetLoading ? 'Resetting...' : 'Reset Audit Log'}
           </Button>
         </DialogActions>
       </Dialog>
     </Box>
   );
 }  