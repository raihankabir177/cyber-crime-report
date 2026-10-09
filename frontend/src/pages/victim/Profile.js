import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert, Button, TextField, GridLegacy as Grid, IconButton, Chip } from "@mui/material";
import Sidebar from "../../components/Sidebar";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("victim");

  useEffect(() => {
    setLoading(true);
    apiFetch("/profile", {
      method: "GET",
      credentials: "include"
    })
      .then(async res => {
        if (res.status === 401) {
          navigate("/auth/login");
          return;
        }
        if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch profile");
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setProfile(data.profile);
        setUserRole(data.profile.role); // Set the role from backend response
        setForm({ name: data.profile.name, email: data.profile.email, phone: data.profile.phone || "" });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setError(""); setSuccess("");
    try {
      const res = await apiFetch("/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setForm({ name: data.profile.name, email: data.profile.email, phone: data.profile.phone || "" });
        setEditMode(false);
        setSuccess("Profile updated successfully!");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("Network error");
    }
  };

  const handleChangePassword = () => {
    alert("Password change functionality will be implemented with database integration.");
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "#8b5cf6";
      case "officer": return "#3b82f6";
      case "victim": return "#10b981";
      default: return "#64748b";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin": return <AdminPanelSettingsIcon sx={{ color: '#f97316' }} />;
      case "officer": return <SecurityIcon sx={{ color: '#3b82f6' }} />;
      case "victim": return <PersonIcon sx={{ color: '#8b5cf6' }} />;
      default: return <PersonIcon />;
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "admin": return "Administrator";
      case "officer": return "Officer";
      case "victim": return "Victim";
      default: return "User";
    }
  };

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;
  if (!profile) return null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', pt: 'var(--topbar-h, 0px)', boxSizing: 'border-box' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0, p: 0 }}>
        <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 } }}>
          <Typography variant="h4" fontWeight={700} mb={1}>Profile Settings</Typography>
          <Typography color="text.secondary" mb={4}>Manage your account information and security settings</Typography>
      
      {/* Role Badge */}
      <Box sx={{ mb: 3 }}>
        <Chip
          icon={getRoleIcon(userRole)}
          label={getRoleDisplayName(userRole)}
          sx={{
            backgroundColor: getRoleColor(userRole) + '20',
            color: getRoleColor(userRole),
            fontWeight: 600,
            fontSize: '1rem',
            padding: '8px 16px'
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>Profile Information</Typography>
              {!editMode && (
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditMode(true)} sx={{ background: '#319795' }}>
                  Edit Profile
                </Button>
              )}
            </Box>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {editMode ? (
              <>
                <TextField
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: '#319795' }} /> }}
                />
                <TextField
                  label="Email Address"
                  name="email"
                  value={form.email}
                  fullWidth
                  margin="normal"
                  InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: '#319795' }} /> }}
                  disabled
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: '#319795' }} /> }}
                />
                <Box mt={2}>
                  <Button variant="contained" onClick={handleSave} sx={{ mr: 2, background: '#319795' }}>Save</Button>
                  <Button onClick={() => setEditMode(false)}>Cancel</Button>
                </Box>
              </>
            ) : (
              <>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon sx={{ mr: 1, color: '#319795' }} />
                  <Box>
                    <Typography fontWeight={600} fontSize={14} color="text.secondary">Full Name</Typography>
                    <Typography fontWeight={500}>{profile.name}</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmailIcon sx={{ mr: 1, color: '#319795' }} />
                  <Box>
                    <Typography fontWeight={600} fontSize={14} color="text.secondary">Email Address</Typography>
                    <Typography fontWeight={500}>{profile.email}</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <PhoneIcon sx={{ mr: 1, color: '#319795' }} />
                  <Box>
                    <Typography fontWeight={600} fontSize={14} color="text.secondary">Phone Number</Typography>
                    <Typography fontWeight={500}>{form.phone}</Typography>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>Security Settings</Typography>
              <Button variant="contained" sx={{ background: '#2563eb' }} onClick={handleChangePassword}>Change Password</Button>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <LockIcon sx={{ mr: 1, color: '#2563eb' }} />
              <Typography fontWeight={600} fontSize={14} color="text.secondary">Password</Typography>
              <Box ml={2} sx={{ letterSpacing: 4, fontWeight: 700, fontSize: 18 }}>••••••••</Box>
            </Box>
            <Paper sx={{ background: '#e6f0fa', p: 2, borderRadius: 2 }} elevation={0}>
              <Typography fontWeight={600} color="#2563eb" mb={1}>Security Tips:</Typography>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#2563eb', fontSize: 15 }}>
                <li>Use a strong password with at least 8 characters</li>
                <li>Include uppercase, lowercase, numbers, and symbols</li>
                <li>Don't share your password with anyone</li>
                <li>Change your password regularly</li>
              </ul>
            </Paper>
          </Paper>
        </Grid>
      </Grid>
        </Box>
      </Box>
    </Box>
  );
} 