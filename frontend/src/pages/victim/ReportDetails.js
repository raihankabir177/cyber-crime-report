import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, CircularProgress, Alert, Grid, Chip, Button, Divider, List, ListItem, ListItemIcon, ListItemText, TextField, IconButton, Collapse, Card, CardContent
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import PlaceIcon from '@mui/icons-material/Place';
import NotesIcon from '@mui/icons-material/Notes';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PersonIcon from '@mui/icons-material/Person';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { evidenceFileUrl, apiFetch } from "../../utils/api";
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';

function statusColor(status) {
  if (status === "Open") return { color: "error", label: "Open" };
  if (status === "Under Investigation") return { color: "warning", label: "Under Investigation" };
  if (status === "Closed") return { color: "success", label: "Closed" };
  return { color: "default", label: status };
}

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef();
  const [newFiles, setNewFiles] = useState([]);
  const [officerDetailsExpanded, setOfficerDetailsExpanded] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/victim/report/${id}`, {
      method: "GET",
      credentials: "include"
    })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch report");
        return res.json();
      })
      .then(data => {
        setReport(data.report);
        setLoading(false);
        // Fetch investigation logs after report is loaded
        fetchInvestigationLogs();
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const fetchInvestigationLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await apiFetch(`/victim/report/${id}/logs`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
      } else {
        console.error("Failed to fetch logs:", data.error);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setNewFiles(Array.from(e.target.files));
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    setUploadError(""); setSuccess("");
    if (newFiles.length === 0) {
      setUploadError("Please select at least one file.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    newFiles.forEach(file => formData.append("files", file));
    try {
      const res = await apiFetch(`/victim/report/${id}/evidence`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setReport(r => ({ ...r, evidence: data.evidence }));
        setSuccess("Evidence uploaded successfully!");
        setNewFiles([]);
      } else {
        setUploadError(data.error || "Failed to upload evidence");
      }
    } catch {
      setUploadError("Network error");
    }
    setUploading(false);
  };

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;
  if (!report) return null;

  const status = statusColor(report.status);

  return (
    <Box sx={{ background: '#f8fafc', minHeight: '100vh', py: 6 }}>
      <Box maxWidth={1400} mx="auto">
        <Button startIcon={<ArrowBackIcon />} sx={{ mb: 2 }} onClick={() => navigate('/victim_reports')}>Back to My Reports</Button>
        <Typography variant="h4" fontWeight={700} mb={0.5}>Report Details</Typography>
        <Typography color="text.secondary" mb={3}>Case ID: <b>#{String(report.id).padStart(3, '0')}</b></Typography>
        <Grid container spacing={3}>
          {/* Left: Main Info */}
          <Grid item xs={12} md={8}>
            {/* Report Information */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Report Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography fontWeight={600} mb={0.5}>Crime Type</Typography>
                  <Typography>{report.crime_type}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography fontWeight={600} mb={0.5}>Status</Typography>
                  <Chip label={status.label} color={status.color} sx={{ fontWeight: 700, fontSize: 15, px: 1.5, borderRadius: 2 }} />
                </Grid>
                                 <Grid item xs={12} md={6}>
                   <Typography fontWeight={600} mb={0.5}>Date of Occurrence</Typography>
                   <Typography>{report.date_occurred || '-'}</Typography>
                 </Grid>
                <Grid item xs={12} md={6}>
                  <Typography fontWeight={600} mb={0.5}>Date Reported</Typography>
                  <Typography>{report.date_submitted || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography fontWeight={600} mb={0.5}>Location</Typography>
                  <Typography>{report.location || '-'}</Typography>
                </Grid>
              </Grid>
              <Box mt={2}>
                <Typography fontWeight={600} mb={0.5}>Description</Typography>
                <Paper sx={{ p: 2, background: '#f1f5f9', borderRadius: 2 }} elevation={0}>
                  <Typography>{report.description}</Typography>
                </Paper>
              </Box>
            </Paper>
            {/* Evidence */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Evidence</Typography>
              {(!report.evidence || report.evidence.length === 0) ? (
                <Typography color="text.secondary">No evidence uploaded yet.</Typography>
              ) : (
                <List>
                  {report.evidence.map((ev, idx) => (
                    <ListItem key={idx} divider>
                      <ListItemIcon><UploadFileIcon /></ListItemIcon>
                      <ListItemText
                        primary={
                          <a href={evidenceFileUrl(ev)} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{ev.original_name}</a>
                        }
                        secondary={ev.content_type}
                      />
                      <IconButton href={evidenceFileUrl(ev)} target="_blank" rel="noopener noreferrer">
                        <DownloadIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
              <Divider sx={{ my: 2 }} />
              <form onSubmit={handleAddEvidence} encType="multipart/form-data">
                <Box display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    sx={{ minWidth: 180 }}
                  >
                    Add More Evidence
                    <input
                      type="file"
                      name="files"
                      hidden
                      multiple
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </Button>
                  <Typography color="text.secondary">Supported: Images, PDFs, Docs</Typography>
                </Box>
                {newFiles.length > 0 && (
                  <Box mt={1}>
                    <Typography fontSize={15} color="#2563eb">{newFiles.map(f => f.name).join(", ")}</Typography>
                  </Box>
                )}
                {uploadError && <Alert severity="error" sx={{ mt: 1 }}>{uploadError}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 2, background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)', color: '#fff', fontWeight: 700 }}
                  disabled={uploading}
                >
                  Upload Evidence
                </Button>
              </form>
            </Paper>
            {/* Investigation Progress */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>Investigation Progress</Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={fetchInvestigationLogs}
                  disabled={logsLoading}
                >
                  Refresh
                </Button>
              </Box>
                             {logsLoading ? (
                 <Box display="flex" justifyContent="center" py={2}>
                   <CircularProgress size={24} />
                 </Box>
               ) : logs.length > 0 ? (
                 <Box>
                   {/* Show only the latest log initially */}
                   {!showAllLogs ? (
                     <Box>
                       <Box sx={{ mb: 3, p: 2, border: '1px solid #e2e8f0', borderRadius: 2, background: '#f8fafc' }}>
                         <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                           <Typography fontWeight={600} color="#2563eb">
                             {logs[0].action}
                           </Typography>
                           <Typography variant="caption" color="text.secondary">
                             {logs[0].log_date}
                           </Typography>
                         </Box>
                         <Typography variant="body2" color="text.secondary" mb={1}>
                           {logs[0].notes}
                         </Typography>
                         <Typography variant="caption" color="text.secondary">
                           Officer: {logs[0].officer_name || 'Unknown'}
                         </Typography>
                       </Box>
                       {logs.length > 1 && (
                         <Box display="flex" justifyContent="center" mt={2}>
                           <Button 
                             variant="outlined" 
                             size="small"
                             onClick={() => setShowAllLogs(true)}
                             sx={{ color: '#2563eb', borderColor: '#2563eb' }}
                           >
                             View All {logs.length} Investigation Logs
                           </Button>
                         </Box>
                       )}
                     </Box>
                   ) : (
                     /* Show all logs when expanded */
                     <Box>
                       {logs.map((log, idx) => (
                         <Box key={idx} sx={{ mb: 3, p: 2, border: '1px solid #e2e8f0', borderRadius: 2, background: '#f8fafc' }}>
                           <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                             <Typography fontWeight={600} color="#2563eb">
                               {log.action}
                             </Typography>
                             <Typography variant="caption" color="text.secondary">
                               {log.log_date}
                             </Typography>
                           </Box>
                           <Typography variant="body2" color="text.secondary" mb={1}>
                             {log.notes}
                           </Typography>
                           <Typography variant="caption" color="text.secondary">
                             Officer: {log.officer_name || 'Unknown'}
                           </Typography>
                         </Box>
                       ))}
                       <Box display="flex" justifyContent="center" mt={2}>
                         <Button 
                           variant="outlined" 
                           size="small"
                           onClick={() => setShowAllLogs(false)}
                           sx={{ color: '#2563eb', borderColor: '#2563eb' }}
                         >
                           Show Latest Only
                         </Button>
                       </Box>
                     </Box>
                   )}
                 </Box>
               ) : (
                 <Typography color="text.secondary">
                   No investigation logs yet. The assigned officer will update this section as the investigation progresses.
                 </Typography>
               )}
            </Paper>
          </Grid>
          {/* Right: Status, Officer, Help */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography fontWeight={700} mb={1}>Case Status</Typography>
              <Typography color="text.secondary">Current Status</Typography>
              <Chip label={status.label} color={status.color} sx={{ fontWeight: 700, fontSize: 15, px: 1.5, borderRadius: 2, mt: 1 }} />
              <Typography color="text.secondary" mt={2}>Case ID</Typography>
              <Typography fontWeight={700} color="#2563eb">#{String(report.id).padStart(3, '0')}</Typography>
            </Paper>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography fontWeight={700} mb={1}>Assigned Officer</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={600}>{report.assigned_officer_name || "Not Assigned"}</Typography>
                  <Typography color="text.secondary" fontSize={14}>Investigating Officer</Typography>
                </Box>
                {report.assigned_officer_name && (
                  <IconButton 
                    size="small"
                    onClick={() => setOfficerDetailsExpanded(!officerDetailsExpanded)}
                    sx={{ color: '#2563eb' }}
                  >
                    {officerDetailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
              </Box>
              
              {report.assigned_officer_name && (
                <Collapse in={officerDetailsExpanded}>
                  <Card sx={{ mt: 2, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} mb={2} color="#2563eb">
                        Officer Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <EmailIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                            <Typography variant="body2" fontWeight={500}>Email:</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {report.assigned_officer_email || "Not available"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <BadgeIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                            <Typography variant="body2" fontWeight={500}>Badge Number:</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {report.badge_number || "Not available"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <WorkIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                            <Typography variant="body2" fontWeight={500}>Specialization:</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {report.specialization || "Not available"}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Collapse>
              )}
            </Paper>
            <Paper sx={{ p: 3, borderRadius: 3, background: '#e8f0fe' }}>
              <Typography fontWeight={700} mb={1}>Need Help?</Typography>
              <Typography color="text.secondary" fontSize={15} mb={1}>
                If you have additional information or questions about this case, please contact
              </Typography>
              <Typography fontWeight={600} color="#2563eb" fontSize={15}>Support Email:</Typography>
              <Typography color="#2563eb" fontSize={15} mb={1}>support@cybercrime.gov</Typography>
              <Typography fontWeight={600} color="#2563eb" fontSize={15}>Helpline:</Typography>
              <Typography color="#2563eb" fontSize={15}>1-800-CYBER-HELP</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
} 