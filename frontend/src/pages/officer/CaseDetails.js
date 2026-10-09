import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Button, MenuItem, Select, Chip, GridLegacy as Grid, Divider, List, ListItem, ListItemText, Alert, Breadcrumbs, Link as MuiLink
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { evidenceFileUrl, apiFetch } from "../../utils/api";

export default function CaseDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showAllLogs, setShowAllLogs] = useState(false);
  const navigate = useNavigate();

  const fetchCaseData = () => {
    console.log('Fetching case details for ID:', id);
    // Fetch case details
    apiFetch(`/officer/case/${id}`, {
      credentials: "include"
    })
      .then(async res => {
        console.log('Case details response status:', res.status);
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Case details error:', errorData);
          throw new Error(errorData.error || "Failed to fetch case details");
        }
        return res.json();
      })
      .then(data => {
        console.log('Case details received:', data);
        if (data.case) {
          setReport(data.case);
          setStatus(data.case.status);
        } else if (data.error) {
          setError(data.error);
        }
      })
      .catch(err => {
        console.error('Error fetching case details:', err);
        setError(err.message || "Failed to fetch case details");
      });

    // Fetch evidence
    apiFetch(`/officer/case/${id}/evidence`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.evidence) {
          setEvidence(data.evidence);
        }
      })
      .catch(err => console.error("Failed to fetch evidence:", err));

    // Fetch logs
    apiFetch(`/officer/case/${id}/logs`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        console.log('Logs received:', data);
        setLogs(data.logs || []);
      })
      .catch(err => {
        console.error("Failed to fetch logs:", err);
        setLogs([]);
      });
  };

  useEffect(() => {
    fetchCaseData();
  }, [id]);

  const refreshEvidence = () => {
    apiFetch(`/officer/case/${id}/evidence`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.evidence) {
          setEvidence(data.evidence);
        }
      })
      .catch(err => console.error("Failed to fetch evidence:", err));
  };

  const refreshLogs = () => {
    console.log('Refreshing logs for case:', id);
    apiFetch(`/officer/case/${id}/logs`, {
      credentials: "include"
    })
      .then(res => {
        console.log('Logs response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Logs data received:', data);
        setLogs(data.logs || []);
      })
      .catch(err => {
        console.error("Failed to fetch logs:", err);
        setLogs([]);
      });
  };

  const handleStatusChange = async (e) => {
    setStatus(e.target.value);
    try {
      const res = await apiFetch(`/officer/case/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: e.target.value }),
        credentials: "include"
      });
      if (res.ok) setSuccess("Status updated!");
      else setError("Failed to update status");
    } catch {
      setError("Network error");
    }
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!report) return <Typography>Loading...</Typography>;

  // Status color
  const statusColor =
    status === "Open" ? "default" : 
    status === "Under Investigation" ? "warning" : 
    status === "Closed" ? "success" : 
    status === "Rejected" ? "error" : "default";

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/officer_cases")}
            sx={{ 
              borderColor: '#2563eb', 
              color: '#2563eb',
              '&:hover': {
                borderColor: '#1d4ed8',
                backgroundColor: '#eff6ff'
              }
            }}
          >
            Back to My Cases
          </Button>
          <Typography variant="h6">Welcome, {report.assigned_officer || "Officer"}</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Typography variant="body2" mr={2}>{report.assigned_officer || "Officer"}</Typography>
        </Box>
      </Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink underline="hover" color="inherit" onClick={() => navigate("/officer_dashboard")} sx={{ cursor: "pointer" }}>
          Officer Dashboard
        </MuiLink>
        <Typography color="text.primary">Case Details</Typography>
      </Breadcrumbs>
      {/* Main Content */}
      <Grid container spacing={2}>
        {/* Left/Main Column */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight={700} mb={1}>
            Case Details
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Case ID: #{String(report.id).padStart(3, "0")}
          </Typography>
          {/* Victim Info & Crime Details */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>Victim Information</Typography>
                <Typography><b>Victim Name:</b> {report.victim_name || "N/A"}</Typography>
                <Typography><b>Date Reported:</b> {report.date_submitted || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>Crime Details</Typography>
                <Typography><b>Crime Type:</b> {report.crime_type}</Typography>
                <Typography><b>Date of Occurrence:</b> {report.date_occurred || "N/A"}</Typography>
                <Typography><b>Location:</b> {report.location}</Typography>
                <Typography><b>Description:</b> {report.description}</Typography>
              </Grid>
            </Grid>
          </Paper>
          {/* Evidence */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight={600}>Evidence</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={refreshEvidence}>Refresh</Button>
                <Button variant="contained" onClick={() => navigate(`/officer/case/${id}/evidence`)}>Manage Evidence</Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 1 }} />
            {evidence && evidence.length > 0 ? (
              <List>
                {evidence.map((ev, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={<MuiLink href={evidenceFileUrl(ev)} target="_blank" rel="noopener">{ev.original_name}</MuiLink>}
                      secondary={`Type: ${ev.content_type}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No evidence uploaded.</Typography>
            )}
          </Paper>
          {/* Investigation Logs */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight={600}>Investigation Logs</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={refreshLogs}>Refresh</Button>
                <Button
                  variant="contained"
                  startIcon={<ChatBubbleOutlineIcon />}
                  sx={{ background: '#439889', textTransform: 'none', borderRadius: 2, fontWeight: 500 }}
                  onClick={() => navigate(`/case/${id}/logs`)}
                >
                  Add Log Entry
                </Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 1 }} />
            {logs.length > 0 ? (
              <Box>
                {/* Show only the latest log initially */}
                {!showAllLogs ? (
                  <Box>
                    <Box display="flex" alignItems="flex-start" mb={3}>
                      <Box sx={{ borderLeft: '4px solid #439889', minHeight: 48, mr: 2, mt: 0.5 }} />
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" mb={0.5}>
                          <ChatBubbleOutlineIcon sx={{ color: '#439889', fontSize: 20, mr: 1 }} />
                          <Typography fontWeight={700} sx={{ fontSize: 16 }}>
                            {logs[0].action}
                          </Typography>
                        </Box>
                        <Typography sx={{ mb: 0.5 }}>{logs[0].notes}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {logs[0].date} • Officer: {logs[0].officer_name || logs[0].officer_email || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    {logs.length > 1 && (
                      <Box display="flex" justifyContent="center" mt={2}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => setShowAllLogs(true)}
                          sx={{ color: '#439889', borderColor: '#439889' }}
                        >
                          View All {logs.length} Investigation Logs
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  /* Show all logs when expanded */
                  <Box>
                    <List sx={{ p: 0 }}>
                      {logs.map((log, idx) => (
                        <Box key={idx} display="flex" alignItems="flex-start" mb={3}>
                          <Box sx={{ borderLeft: '4px solid #439889', minHeight: 48, mr: 2, mt: 0.5 }} />
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" mb={0.5}>
                              <ChatBubbleOutlineIcon sx={{ color: '#439889', fontSize: 20, mr: 1 }} />
                              <Typography fontWeight={700} sx={{ fontSize: 16 }}>
                                {log.action}
                              </Typography>
                            </Box>
                            <Typography sx={{ mb: 0.5 }}>{log.notes}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {log.date} • Officer: {log.officer_name || log.officer_email || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </List>
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => setShowAllLogs(false)}
                        sx={{ color: '#439889', borderColor: '#439889' }}
                      >
                        Show Latest Only
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography color="text.secondary">No logs yet.</Typography>
            )}
          </Paper>
        </Grid>
        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Case Status</Typography>
            <Chip label={status} color={statusColor} sx={{ mb: 1, mt: 1 }} />
            <Typography variant="body2" mt={2}>Update Status</Typography>
            <Select
              value={status}
              onChange={handleStatusChange}
              fullWidth
              sx={{ mt: 1, mb: 2 }}
            >
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Under Investigation">Under Investigation</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Case Information</Typography>
            <Typography><b>Case ID:</b> #{String(report.id).padStart(3, "0")}</Typography>
            <Typography><b>Priority:</b> N/A</Typography>
            <Typography><b>Assigned Officer:</b> {report.assigned_officer || "N/A"}</Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Quick Actions</Typography>
            <Button variant="contained" fullWidth sx={{ mt: 1, mb: 1 }} onClick={() => navigate(`/case/${id}/logs`)}>Add Log Entry</Button>
            <Button variant="outlined" fullWidth onClick={() => navigate(`/officer/case/${id}/evidence`)}>Manage Evidence</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 