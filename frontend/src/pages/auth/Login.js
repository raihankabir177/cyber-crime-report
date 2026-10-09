import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  Link,
  Container,
  Grid,
  Fade,
  Zoom
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon,
  Shield as ShieldIcon,
  VerifiedUser as VerifiedUserIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    console.log("Login attempt with:", form);
    
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include"
      });
      const data = await res.json();
      console.log("Login response:", data);
      
      if (res.ok && data.role) {
        sessionStorage.setItem("userName", data.name || "");
        // Redirect based on role
        if (data.role === "victim") navigate("/victim_dashboard");
        else if (data.role === "officer") navigate("/officer_dashboard");
        else if (data.role === "admin") navigate("/admin_dashboard");
        else navigate("/");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(79, 209, 197, 0.1) 0%, rgba(56, 178, 172, 0.1) 100%)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' }
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          animation: 'float 8s ease-in-out infinite reverse',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' }
          }
        }}
      />

      <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Branding */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)',
                      mr: 2,
                      boxShadow: '0 8px 32px rgba(79, 209, 197, 0.3)'
                    }}
                  >
                    <ShieldIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                    CyberCrime Reports
                  </Typography>
                </Box>
                
                <Typography variant="h2" fontWeight={700} sx={{ mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.2 }}>
                  Secure Digital
                  <Box component="span" sx={{ 
                    background: 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {' '}Crime Reporting
                  </Box>
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 400, lineHeight: 1.6 }}>
                  Enterprise-grade cybersecurity platform for comprehensive cybercrime incident management with advanced security protocols and real-time threat monitoring.
                </Typography>

                {/* Feature Highlights */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VerifiedUserIcon sx={{ mr: 2, color: '#4fd1c5' }} />
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Enterprise-grade security & encryption
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SecurityIcon sx={{ mr: 2, color: '#4fd1c5' }} />
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Real-time incident tracking & monitoring
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShieldIcon sx={{ mr: 2, color: '#4fd1c5' }} />
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Multi-role access control & management
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Zoom in timeout={800}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 4, md: 6 },
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.25)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #4fd1c5 0%, #38b2ac 50%, #319795 100%)',
                    borderRadius: '4px 4px 0 0'
                  }
                }}
              >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    sx={{
                      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                    Enter your credentials to access the platform
                  </Typography>
                </Box>

                {/* Error Alert */}
                {error && (
                  <Fade in timeout={300}>
                    <Alert
                      severity="error"
                      sx={{
                        mb: 4,
                        borderRadius: 2,
                        border: '1px solid #fed7d7',
                        '& .MuiAlert-icon': { alignItems: 'center' }
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: '#4fd1c5' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: 'rgba(255, 255, 255, 0.8)',
                            '& fieldset': {
                              borderColor: '#e2e8f0',
                              borderWidth: 2
                            },
                            '&:hover fieldset': {
                              borderColor: '#4fd1c5'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#4fd1c5',
                              borderWidth: 2
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#4fd1c5',
                            fontWeight: 600
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: '#4fd1c5' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                                sx={{ color: '#4fd1c5' }}
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: 'rgba(255, 255, 255, 0.8)',
                            '& fieldset': {
                              borderColor: '#e2e8f0',
                              borderWidth: 2
                            },
                            '&:hover fieldset': {
                              borderColor: '#4fd1c5'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#4fd1c5',
                              borderWidth: 2
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#4fd1c5',
                            fontWeight: 600
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        endIcon={loading ? null : <ArrowForwardIcon />}
                        sx={{
                          py: 2,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          textTransform: 'none',
                          boxShadow: '0 10px 25px -5px rgba(79, 209, 197, 0.4)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                            boxShadow: '0 20px 40px -10px rgba(79, 209, 197, 0.6)',
                            transform: 'translateY(-2px)'
                          },
                          '&:disabled': {
                            background: '#e2e8f0',
                            color: '#a0aec0',
                            transform: 'none'
                          }
                        }}
                      >
                        {loading ? 'Authenticating...' : 'Access Secure Dashboard'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>

                {/* Divider */}
                <Divider sx={{ my: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    New to CyberCrime Reports?
                  </Typography>
                </Divider>

                {/* Sign Up Link */}
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    onClick={() => navigate("/register")}
                    variant="outlined"
                    fullWidth
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      borderColor: '#4fd1c5',
                      color: '#4fd1c5',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: '#38b2ac',
                        backgroundColor: 'rgba(79, 209, 197, 0.1)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 10px 25px -5px rgba(79, 209, 197, 0.2)'
                      }
                    }}
                  >
                    Create Enterprise Account
                  </Button>
                </Box>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    By signing in, you agree to our{' '}
                    <Link href="#" sx={{ color: '#4fd1c5', textDecoration: 'none', fontWeight: 600 }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="#" sx={{ color: '#4fd1c5', textDecoration: 'none', fontWeight: 600 }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                </Box>
              </Paper>
            </Zoom>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 