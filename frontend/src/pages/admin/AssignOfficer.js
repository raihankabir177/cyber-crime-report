import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Button, MenuItem, Select, TextField, Alert, 
  Paper, GridLegacy as Grid, Card, CardContent, List, ListItem, ListItemIcon, 
  ListItemText, Chip, FormControl, InputLabel, IconButton
} from "@mui/material";
import AdminSidebar from "../../components/AdminSidebar";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CancelIcon from '@mui/icons-material/Cancel';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

export default function AssignOfficer() {
  const navigate = useNavigate();
  const adminName = sessionStorage.getItem("userName") || "Admin User";

  const [reports, setReports] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedReport, setSelectedReport] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch unassigned reports
    apiFetch("/admin/all_reports", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        const unassignedReports = data.reports.filter(r => !r.assigned_officer_name || r.assigned_officer_name === "Not Assigned");
        setReports(unassignedReports);
      })
      .catch(err => console.error("Failed to fetch reports:", err));

    // Fetch available officers
    apiFetch("/admin/available_officers", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setOfficers(data.officers || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch officers:", err);
        setLoading(false);
      });
  }, []);

  const handleAssign = async () => {
    setError(""); 
    setSuccess("");
    
    if (!selectedReport || !selectedOfficer) {
      setError("Please select both case and officer.");
      return;
    }
    
    try {
      const res = await apiFetch("/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          report_id: selectedReport,
          officer_id: selectedOfficer,
          note,
        }),
      });
      
      if (res.ok) {
        setSuccess("Officer assigned successfully!");
        // Refresh the reports list
        apiFetch("/admin/all_reports", {
          credentials: "include"
        })
          .then(res => res.json())
          .then(data => {
            const unassignedReports = data.reports.filter(r => !r.assigned_officer_name || r.assigned_officer_name === "Not Assigned");
            setReports(unassignedReports);
          });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to assign officer");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleCancel = () => {
    navigate("/admin_dashboard");
  };

  const unassignedCount = reports.length;

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
          <Grid container spacing={4}>
            {/* Left Panel - Assignment Form */}
            <Grid item xs={12} lg={7}>
                             <Typography variant="h4" fontWeight={700} mb={1}>Assign Officer to Case</Typography>
              <Typography variant="subtitle1" color="text.secondary" mb={4}>
                Assign available officers to unassigned cases.
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

              <Paper sx={{ p: 4, borderRadius: 3 }}>
                {/* Select Case */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DescriptionIcon sx={{ mr: 1, color: '#64748b' }} />
                    <Typography variant="body2" fontWeight={600}>
                      Select Case *
                    </Typography>
                  </Box>
                  <Select
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1'
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      Choose an unassigned case...
                    </MenuItem>
                    {reports.map((report) => (
                      <MenuItem key={report.id} value={report.id}>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Case #{String(report.id).padStart(3, '0')} - {report.crime_type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {report.victim_name || 'Unknown'} • {report.date_submitted}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Select Officer */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SecurityIcon sx={{ mr: 1, color: '#64748b' }} />
                    <Typography variant="body2" fontWeight={600}>
                      Select Officer *
                    </Typography>
                  </Box>
                  <Select
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1'
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      Choose an officer...
                    </MenuItem>
                    {officers.map((officer) => (
                      <MenuItem key={officer.id} value={officer.id}>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {officer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {officer.specialization || 'General'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Assignment Notes */}
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Typography variant="body2" fontWeight={600} mb={1}>
                    Assignment Notes (Optional)
                  </Typography>
                  <TextField
                    multiline
                    rows={4}
                    placeholder="Add any special instructions or notes for the officer..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
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
                </FormControl>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<DescriptionIcon />}
                    onClick={handleAssign}
                    disabled={!selectedReport || !selectedOfficer}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)'
                      }
                    }}
                  >
                    Assign Officer
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        backgroundColor: '#f8fafc'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Right Panel - Information */}
            <Grid item xs={12} lg={5}>
              {/* Unassigned Cases Card */}
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h3" fontWeight={700} color="#e53e3e" mb={1}>
                    {unassignedCount}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Unassigned Cases
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cases waiting for assignment
                  </Typography>
                </CardContent>
              </Card>

              {/* Available Officers */}
              <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Available Officers
                </Typography>
                <List sx={{ p: 0 }}>
                  {officers.map((officer) => (
                    <ListItem
                      key={officer.id}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        '&:hover': {
                          backgroundColor: '#f1f5f9'
                        }
                      }}
                      onClick={() => setSelectedOfficer(officer.id)}
                    >
                      <ListItemIcon>
                        <SecurityIcon sx={{ color: '#64748b' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={officer.name}
                        secondary={officer.specialization || 'General'}
                        primaryTypographyProps={{ fontWeight: 600 }}
                        secondaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {/* Assignment Guidelines */}
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3, 
                backgroundColor: '#fefce8',
                border: '1px solid #fde68a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Assignment Guidelines
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Match officer specialization with crime type
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Consider current officer workload
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Prioritize cases by severity and date
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Include relevant assignment notes
                  </Typography>
                  <Typography component="li" variant="body2">
                    Notify officers of new assignments
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
} 