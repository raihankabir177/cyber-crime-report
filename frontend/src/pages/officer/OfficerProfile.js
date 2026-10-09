import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Chip
} from "@mui/material";
import OfficerSidebar from "../../components/OfficerSidebar";
import { useSessionStorage } from "../../utils/useSessionStorage";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { apiFetch } from "../../utils/api";

export default function OfficerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [, setUserName] = useSessionStorage("userName", "Officer User");
  const [, setUserEmail] = useSessionStorage("userEmail", "officer@cybercrime.gov");
  const [, setUserPhone] = useSessionStorage("userPhone", "+880 1234-567890");
  
  const [profile, setProfile] = useState({
    name: sessionStorage.getItem("userName") || "",
    email: sessionStorage.getItem("userEmail") || "",
    phone: sessionStorage.getItem("userPhone") || "",
    role: "",
    department: "",
    badge: "",
    specialization: "",
    join_date: "",
    activeCases: 0,
    solvedCases: 0
  });

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch("/profile", {
          method: "GET",
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          const profileData = data.profile;
          
          // Update session storage with new values
          setUserName(profileData.name);
          setUserEmail(profileData.email);
          setUserPhone(profileData.phone || "");

          // Update profile state
          setProfile({
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone || "",
            role: profileData.role || "Investigation Officer",
            department: profileData.department || "Cyber Crime Division",
            badge: profileData.badge || "",
            specialization: profileData.specialization || "",
            join_date: profileData.join_date || "",
            activeCases: 0,
            solvedCases: 0
          });

          // Fetch case statistics
          try {
            const statsResponse = await apiFetch("/profile/stats", {
              credentials: "include"
            });

            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              setProfile(prev => ({
                ...prev,
                activeCases: statsData.stats.active_cases || 0,
                solvedCases: statsData.stats.completed_cases || 0
              }));
            } else {
              console.warn("Failed to fetch case statistics");
            }
          } catch (statsErr) {
            console.warn("Error fetching case statistics:", statsErr);
          }
        }
      } catch (err) {
        setError("Failed to load profile data. Please try again later.");
      }
    };

    fetchProfile();
  }, []);

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

    // Basic validation
    if (!formData.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

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
                  // Merge the updated profile with existing profile data to preserve specialization and other fields
          const mergedProfile = {
            ...profile,
            ...updatedProfile,
            specialization: profile.specialization // Preserve specialization from original profile
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
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <OfficerSidebar />
      <Box sx={{ flexGrow: 1, p: 0, marginLeft: '240px' }}>
        {/* Header */}
        <Box sx={{ 
          background: '#fff', 
          borderBottom: '1px solid #e2e8f0', 
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Officer Profile</Typography>
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
        <Box sx={{ px: 6, py: 4 }}>
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
            <Grid item xs={12} md={8}>
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
                      label="Badge Number"
                      value={profile.badge || ""}
                      disabled
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={profile.department || ""}
                      disabled
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Specialization"
                      value={profile.specialization || ""}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      disabled={!isEditing}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Join Date"
                      value={profile.join_date || ""}
                      disabled
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Profile Summary */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: '#4fd1c5',
                    color: '#282c34',
                    fontSize: '3rem',
                    margin: '0 auto 2rem'
                  }}
                >
                  <BadgeIcon sx={{ fontSize: 60 }} />
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
                    <Typography variant="body2">{profile.badge || "Not assigned"}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Case Statistics */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Case Statistics
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e6fffa', borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="#319795">
                        {profile.activeCases}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Cases
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f0fff4', borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="#38a169">
                        {profile.solvedCases}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Solved Cases
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Specializations */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Specialization
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Chip
                      label={profile.specialization || "General Investigation"}
                      color="primary"
                      variant="outlined"
                      icon={<AssignmentIcon />}
                      sx={{ 
                        width: '100%',
                        height: '40px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
