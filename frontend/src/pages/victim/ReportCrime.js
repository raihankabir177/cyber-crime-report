import React, { useState, useRef } from "react";
import {
  Box, Typography, TextField, Button, MenuItem, Alert, GridLegacy as Grid, Paper, InputAdornment, IconButton
} from "@mui/material";
import Sidebar from "../../components/Sidebar";
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import PlaceIcon from '@mui/icons-material/Place';
import NotesIcon from '@mui/icons-material/Notes';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

const crimeTypes = [
  "Hacking", "Scam", "Cyberbullying", "Phishing", "Other"
];

export default function ReportCrime() {
  const [form, setForm] = useState({
    crime_type: "",
    date: "",
    location: "",
    description: "",
    files: [],
  });
  const [filePreviews, setFilePreviews] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "files") {
      const fileArr = Array.from(files);
      setForm({ ...form, files: fileArr });
      const previews = fileArr.map(file => ({
        name: file.name,
        type: file.type,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null
      }));
      setFilePreviews(previews);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = form.files.filter((_, i) => i !== index);
    setForm({ ...form, files: newFiles });
    setFilePreviews(filePreviews.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const fileArr = Array.from(e.dataTransfer.files);
    setForm({ ...form, files: fileArr });
    const previews = fileArr.map(file => ({
      name: file.name,
      type: file.type,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    }));
    setFilePreviews(previews);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.crime_type || !form.date || !form.location || !form.description) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("crime_type", form.crime_type);
    formData.append("date", form.date);
    formData.append("location", form.location);
    formData.append("description", form.description);
    form.files.forEach(file => formData.append("files", file));
    try {
      const res = await apiFetch("/victim/report", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Report submitted! Your report ID is " + data.report_id);
        setForm({ crime_type: "", date: "", location: "", description: "", files: [] });
        setFilePreviews([]);
      } else {
        setError(data.error || "Failed to submit");
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', pt: 'var(--topbar-h, 0px)', boxSizing: 'border-box' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0, p: 0 }}>
        <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 } }}>
          <Box maxWidth={700} mx="auto">
        <Typography variant="h4" fontWeight={700} mb={1}>Report a Crime</Typography>
        <Typography color="text.secondary" mb={3}>Provide detailed information about the cybercrime incident</Typography>
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 3 }}>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Crime Type */}
            <Typography fontWeight={600} mb={0.5} display="flex" alignItems="center">
              <DescriptionIcon sx={{ mr: 1 }} /> Crime Type *
            </Typography>
            <TextField
              select
              name="crime_type"
              value={form.crime_type}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              placeholder="Select crime type"
            >
              <MenuItem value="" disabled>Select crime type</MenuItem>
              {crimeTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>
            {/* Date of Occurrence */}
            <Typography fontWeight={600} mb={0.5} display="flex" alignItems="center">
              <EventIcon sx={{ mr: 1 }} /> Date of Occurrence *
            </Typography>
            <TextField
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
              placeholder="mm/dd/yyyy"
            />
            {/* Location */}
            <Typography fontWeight={600} mb={0.5} display="flex" alignItems="center">
              <PlaceIcon sx={{ mr: 1 }} /> Location *
            </Typography>
            <TextField
              name="location"
              value={form.location}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              placeholder="e.g., Online - Email, Social Media Platform, Website URL"
            />
            {/* Description */}
            <Typography fontWeight={600} mb={0.5} display="flex" alignItems="center">
              <NotesIcon sx={{ mr: 1 }} /> Description *
            </Typography>
            <TextField
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              multiline
              minRows={4}
              placeholder="Provide a detailed description of what happened, including timeline, any suspicious activities, and any other relevant information..."
            />
            {/* Upload Evidence */}
            <Typography fontWeight={600} mb={0.5} mt={2} display="flex" alignItems="center">
              <UploadFileIcon sx={{ mr: 1 }} /> Upload Evidence (Optional)
            </Typography>
            <Box
              sx={{
                border: '2px dashed #cbd5e1',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                color: '#64748b',
                mb: 2,
                cursor: 'pointer',
                background: '#f8fafc',
                transition: 'border 0.2s',
                '&:hover': { borderColor: '#2563eb' }
              }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                name="files"
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                hidden
                multiple
                ref={fileInputRef}
                onChange={handleChange}
              />
              <Box display="flex" flexDirection="column" alignItems="center">
                <UploadFileIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography>Click to upload evidence</Typography>
                <Typography fontSize={13} color="#94a3b8" mt={0.5}>
                  Supported: Images, PDFs, Documents (Max 10MB)
                </Typography>
              </Box>
              {filePreviews.length > 0 && (
                <Grid container spacing={1} mt={2} justifyContent="center">
                  {filePreviews.map((file, idx) => (
                    <Grid item key={idx}>
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        {file.url ? (
                          <img src={file.url} alt={file.name} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }} />
                        ) : (
                          <UploadFileIcon sx={{ fontSize: 40, color: '#64748b' }} />
                        )}
                        <Typography variant="caption" display="block">{file.name}</Typography>
                        <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0 }} onClick={e => { e.stopPropagation(); handleRemoveFile(idx); }}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
            {/* Important Notes */}
            <Paper sx={{ background: '#e8f0fe', p: 2, borderRadius: 2, mb: 2 }} elevation={0}>
              <Typography fontWeight={700} color="#2563eb" mb={1}>
                Important Notes:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#2563eb', fontSize: 15 }}>
                <li>Provide as much detail as possible for better investigation</li>
                <li>Do not share personal passwords or sensitive information</li>
                <li>Keep original evidence safe and secure</li>
                <li>You will receive a report ID for tracking your case</li>
              </ul>
            </Paper>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/victim_dashboard")}
                sx={{ minWidth: 120 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  minWidth: 180,
                  background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 17,
                  boxShadow: 'none'
                }}
                disabled={submitting}
              >
                Submit Report
              </Button>
            </Box>
          </form>
        </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 