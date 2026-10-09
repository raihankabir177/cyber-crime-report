import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, CircularProgress, Alert, Grid, Chip, Button, Divider, List, ListItem, ListItemIcon, ListItemText, IconButton, Avatar, Stack
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import OfficerSidebar from "../../components/OfficerSidebar";
import { evidenceFileUrl, apiFetch } from "../../utils/api";

export default function CaseEvidence() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState([]);
  const [caseInfo, setCaseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef();
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    setLoading(true);
    // Fetch case info
    apiFetch(`/officer/case/${id}`, {
      method: "GET",
      credentials: "include"
    })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch case info");
        return res.json();
      })
      .then(data => {
        setCaseInfo(data.case);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // Fetch evidence
    apiFetch(`/officer/case/${id}/evidence`, {
      method: "GET",
      credentials: "include"
    })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch evidence");
        return res.json();
      })
      .then(data => {
        setEvidence(data.evidence || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(files);
    // Automatically upload files when selected
    if (files.length > 0) {
      handleUploadFiles(files);
    }
  };

  const handleUploadFiles = async (files) => {
    setUploadError(""); 
    setSuccess("");
    if (files.length === 0) {
      setUploadError("Please select at least one file.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    try {
      const res = await apiFetch(`/officer/case/${id}/evidence`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setEvidence(data.evidence || []);
        setSuccess("Evidence uploaded successfully!");
        setNewFiles([]);
        // Refresh the evidence list
        fetchEvidence();
      } else {
        setUploadError(data.error || "Failed to upload evidence");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Network error");
    }
    setUploading(false);
  };

  const fetchEvidence = async () => {
    try {
      const res = await apiFetch(`/officer/case/${id}/evidence`, {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setEvidence(data.evidence || []);
      }
    } catch (error) {
      console.error("Fetch evidence error:", error);
    }
  };

  const getFileIcon = (contentType) => {
    if (contentType.startsWith('image/')) return <ImageIcon />;
    return <DescriptionIcon />;
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

  if (loading) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <OfficerSidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <CircularProgress />
      </Box>
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <OfficerSidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <OfficerSidebar />
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ 
          background: 'white', 
          borderBottom: '1px solid #e2e8f0', 
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Welcome, Officer Smith
            </Typography>
            <Typography color="text.secondary">Officer Dashboard</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
              <Typography>Officer Smith</Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => {
              // Navigate back and trigger a page refresh to update evidence
              navigate(`/case/${id}`);
              // Force a page refresh to show updated evidence
              setTimeout(() => window.location.reload(), 100);
            }}>
              Back to Case
            </Button>
            <Button 
              variant="contained" 
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={uploading}
              sx={{ background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)' }}
            >
              {uploading ? 'Uploading...' : '+ Upload Evidence'}
            </Button>
          </Box>

          <Typography variant="h4" fontWeight={700} mb={1}>
            Case Evidence
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Case ID: #{String(id).padStart(3, '0')} - {caseInfo?.crime_type || 'Unknown'}
          </Typography>

          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Evidence Files</Typography>
                {evidence.length === 0 ? (
                  <Typography color="text.secondary">No evidence uploaded yet.</Typography>
                ) : (
                  <List>
                    {evidence.map((ev, idx) => (
                      <ListItem key={idx} sx={{ 
                        border: '1px solid #e2e8f0', 
                        borderRadius: 2, 
                        mb: 2,
                        background: 'white'
                      }}>
                        <ListItemIcon>
                          {getFileIcon(ev.content_type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography fontWeight={600} color="#2563eb">
                              {ev.original_name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {ev.description || "No description provided"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Uploaded by {ev.uploaded_by || "Unknown"} on {formatDate(ev.upload_date)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            href={evidenceFileUrl(ev)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton 
                            href={evidenceFileUrl(ev)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            size="small"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                {/* Case Summary */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>Case Summary</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Case ID:</Typography>
                      <Typography fontWeight={600}>#{String(id).padStart(3, '0')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Crime Type:</Typography>
                      <Typography fontWeight={600}>{caseInfo?.crime_type || 'Unknown'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Victim:</Typography>
                      <Typography fontWeight={600}>{caseInfo?.victim_name || 'Unknown'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Evidence Count:</Typography>
                      <Typography fontWeight={600}>{evidence.length} files</Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Evidence Guidelines */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>Evidence Guidelines</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      • Maintain chain of custody documentation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Use descriptive filenames and descriptions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Verify file integrity with checksums
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Store original evidence separately
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Follow departmental evidence protocols
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Document all evidence handling
                    </Typography>
                  </Box>
                </Paper>

                {/* Accepted File Types */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>Accepted File Types</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Images:</strong> JPG, PNG, GIF
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Documents:</strong> PDF, DOC, DOCX, TXT
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Archives:</strong> ZIP, RAR
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Max Size:</strong> 50MB per file
                    </Typography>
                  </Box>
                </Paper>
              </Stack>
            </Grid>
          </Grid>

          {/* Hidden file input */}
          <input
            type="file"
            name="files"
            hidden
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip,application/x-rar-compressed"
          />

          {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </Box>
      </Box>
    </Box>
  );
} 