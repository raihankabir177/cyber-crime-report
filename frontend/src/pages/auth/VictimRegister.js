import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, Paper, InputAdornment, IconButton } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

export default function VictimRegister() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", nid: "", password: "", confirmPassword: "" });
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
          role: "victim",
          phone: form.phone,
          nid: form.nid
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
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #142B4A 0%, #1b4260 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, maxWidth: 400, width: '100%' }}>
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Box display="flex" flexDirection="row" alignItems="center" width="100%" justifyContent="center" mb={1}>
              <Typography
                variant="body2"
                sx={{ color: '#3a6351', cursor: 'pointer', fontWeight: 400, fontSize: 17, mr: 2 }}
                onClick={() => navigate('/register')}
              >
                ← Back to role selection
              </Typography>
              <Box sx={{ background: '#c6f6d5', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PersonIcon sx={{ color: '#174a5b', fontSize: 32 }} />
              </Box>
            </Box>
            <Typography variant="h5" fontWeight={700} mb={0.5}>Victim Account</Typography>
            <Typography color="text.secondary" fontSize={15} mb={1}>Report cyber crimes and track your cases</Typography>
          </Box>
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
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#174a5b' }} /></InputAdornment> }}
          />
          <TextField
            label="Email Address"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#174a5b' }} /></InputAdornment> }}
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#174a5b' }} /></InputAdornment> }}
          />
          <TextField
            label="NID Number"
            name="nid"
            value={form.nid}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            placeholder="Enter your NID number"
            InputProps={{ startAdornment: <InputAdornment position="start"><CreditCardIcon sx={{ color: '#174a5b' }} /></InputAdornment> }}
          />
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
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#256D85' }} /></InputAdornment>,
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
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#256D85' }} /></InputAdornment>,
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
            sx={{ mt: 2, mb: 1, background: 'linear-gradient(90deg, #256D85 0%, #3b8ea5 100%)', color: '#222', fontWeight: 700, fontSize: 17, boxShadow: 'none' }}
          >
            Create Victim Account
          </Button>
        </form>
        <Typography align="center" mt={1} color="text.secondary" fontSize={15}>
          Already have an account?{' '}
          <span style={{ color: '#256D85', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/auth/login')}>Sign in here</span>
        </Typography>
      </Paper>
    </Box>
  );
} 