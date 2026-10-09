import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, Paper, InputAdornment, IconButton, MenuItem } from "@mui/material";
import ShieldIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

const specializations = [
  "Cyber Forensics",
  "Network Security",
  "Digital Evidence",
  "Malware Analysis",
  "Other"
];

export default function OfficerRegister() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", badge: "", department: "", specialization: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await apiFetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          role: "officer",
          phone: form.phone,
          badge: form.badge,
          department: form.department,
          specialization: form.specialization
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Signup successful! You can now log in.");
        setTimeout(() => navigate("/auth/login"), 1500);
      } else {
        setError(data.error || "Signup failed");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, maxWidth: 400, width: '100%' }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Box sx={{ background: '#e6f0fa', borderRadius: '50%', p: 2, mb: 1 }}>
            <ShieldIcon sx={{ color: '#2563eb', fontSize: 40 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Officer Account</Typography>
          <Typography color="text.secondary" fontSize={15} mb={1}>Investigate cases and manage evidence</Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#2563eb' }} /></InputAdornment> }}
          />
          <TextField
            label="Email Address"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#2563eb' }} /></InputAdornment> }}
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#2563eb' }} /></InputAdornment> }}
          />
          <TextField
            label="Badge Number"
            name="badge"
            value={form.badge}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#2563eb' }} /></InputAdornment> }}
          />
          <TextField
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{ startAdornment: <InputAdornment position="start"><WorkIcon sx={{ color: '#2563eb' }} /></InputAdornment> }}
            placeholder="e.g., Cyber Crime Division"
          />
          <TextField
            select
            label="Specialization"
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            {specializations.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#2563eb' }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((show) => !show)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#2563eb' }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm((show) => !show)} edge="end">
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, mb: 1, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#222', fontWeight: 700, fontSize: 17, boxShadow: 'none' }}
          >
            Create Officer Account
          </Button>
        </form>
        <Typography align="center" mt={1} color="text.secondary" fontSize={15}>
          Already have an account?{' '}
          <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/auth/login')}>Sign in here</span>
        </Typography>
      </Paper>
    </Box>
  );
} 