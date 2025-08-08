import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  GridLegacy as Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Chip
} from "@mui/material";
import { useSessionStorage } from "../../utils/useSessionStorage";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { apiFetch } from "../../utils/api";

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [, setUserName] = useSessionStorage("userName", "Admin User");
  const [, setUserEmail] = useSessionStorage("userEmail", "admin@cybercrime.gov");
  const [, setUserPhone] = useSessionStorage("userPhone", "+880 1234-567890");
  
  const [profile, setProfile] = useState({
    name: sessionStorage.getItem("userName") || "Admin User",
    email: sessionStorage.getItem("userEmail") || "admin@cybercrime.gov",
    phone: sessionStorage.getItem("userPhone") || "+880 1234-567890",
    role: "Administrator",
    department: "Cyber Crime Division",
    employeeId: "ADM-001",
    joinDate: "2024-01-15",
    permissions: ["User Management", "Report Assignment", "System Administration", "Audit Access"]
  });

  const [formData, setFormData] = useState({ ...profile });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({ ...profile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...profile });
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch("/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        // Merge the updated profile with existing profile data to preserve permissions and other fields
        const mergedProfile = {
          ...profile,
          ...updatedProfile,
          permissions: profile.permissions // Preserve permissions from original profile
        };
        setProfile(mergedProfile);
        setUserName(mergedProfile.name);
        setUserEmail(mergedProfile.email);
        setUserPhone(mergedProfile.phone);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
            <Typography variant="h5" fontWeight={700}>Admin Profile</Typography>
            <Typography variant="subtitle1" color="text.secondary">Manage your account settings</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ borderRadius: 2 }}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? <CircularProgress size={20} /> : "Save Changes"}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Profile Information */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Personal Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={isEditing ? formData.name : profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={isEditing ? formData.email : profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={isEditing ? formData.phone : profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      value={profile.employeeId}
                      disabled
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={profile.department}
                      disabled
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Join Date"
                      value={profile.joinDate}
                      disabled
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Profile Summary */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: '#256D85',
                    color: '#142B4A',
                    fontSize: '3rem',
                    margin: '0 auto 2rem'
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 60 }} />
                </Avatar>
                
                <Typography variant="h5" fontWeight={700} mb={1}>
                  {profile.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  {profile.role}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Typography variant="body2">{profile.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Typography variant="body2">{profile.phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Typography variant="body2">{profile.employeeId}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Permissions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>
                  System Permissions
                </Typography>
                
                <Grid container spacing={2}>
                  {(profile.permissions || []).map((permission, index) => (
                    <Grid item xs={12} sm={6} lg={4} key={index}>
                      <Chip
                        label={permission}
                        color="primary"
                        variant="outlined"
                        sx={{ 
                          width: '100%',
                          height: '40px',
                          fontSize: '0.9rem'
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
