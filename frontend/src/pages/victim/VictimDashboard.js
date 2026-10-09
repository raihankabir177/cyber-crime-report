import React, { useEffect, useState } from "react";
import { Box, Typography, GridLegacy as Grid, Paper, Button, Stack, Avatar, IconButton } from "@mui/material";
import Sidebar from "../../components/Sidebar";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

const statusCards = [
  { label: "Open Reports", value: 0, color: "#fff5f5", icon: <WarningAmberIcon sx={{ color: '#e53e3e' }} />, textColor: '#e53e3e' },
      { label: "Under Investigation", value: 0, color: "#fffbea", icon: <AccessTimeIcon sx={{ color: '#d69e2e' }} />, textColor: '#d69e2e' },
      { label: "Closed", value: 0, color: "#f0fff4", icon: <CheckCircleOutlineIcon sx={{ color: '#38a169' }} />, textColor: '#38a169' },
];

const actionCards = [
  { label: "Report a Crime", desc: "File a new cybercrime report", icon: <DescriptionIcon fontSize="large" />, color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", path: "/report_crime" },
  { label: "View My Reports", desc: "Track your submitted reports", icon: <VisibilityIcon fontSize="large" />, color: "#f7fafc", path: "/victim_reports" },
  { label: "Help & FAQ", desc: "Get help and support", icon: <HelpOutlineIcon fontSize="large" />, color: "#f7fafc", path: "/help" },
];

const recentReports = [];

export default function VictimDashboard() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("userName") || "John Doe";

  // State for reports and status counts
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiFetch("/victim/reports", {
      method: "GET",
      credentials: "include"
    })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch reports");
        return res.json();
      })
      .then(data => {
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Count statuses
  const openCount = reports.filter(r => r.status === "Open").length;
      const inProgressCount = reports.filter(r => r.status === "Under Investigation").length;
      const resolvedCount = reports.filter(r => r.status === "Closed").length;

  // Prepare status cards with real values
  const statusCards = [
    { label: "Open Reports", value: openCount, color: "#fff5f5", icon: <WarningAmberIcon sx={{ color: '#e53e3e' }} />, textColor: '#e53e3e' },
    { label: "Under Investigation", value: inProgressCount, color: "#fffbea", icon: <AccessTimeIcon sx={{ color: '#d69e2e' }} />, textColor: '#d69e2e' },
    { label: "Closed", value: resolvedCount, color: "#f0fff4", icon: <CheckCircleOutlineIcon sx={{ color: '#38a169' }} />, textColor: '#38a169' },
  ];

  // Show up to 3 most recent reports
  const recentReports = [...reports].sort((a, b) => (b.date_submitted || b.date || "").localeCompare(a.date_submitted || a.date || "")).slice(0, 3);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', pt: 'var(--topbar-h, 0px)', boxSizing: 'border-box' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0, p: 0 }}>
        {/* Top Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: { xs: 2, md: 4 }, py: 2, background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
          <IconButton>
            <NotificationsNoneIcon />
          </IconButton>
          <Avatar sx={{ ml: 2, bgcolor: '#4fd1c5', color: '#fff' }}>{userName[0]}</Avatar>
          <Typography sx={{ ml: 1, fontWeight: 500 }}>{userName}</Typography>
        </Box>
        {/* Main Content */}
        <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 } }}>
          <Typography variant="h5" fontWeight={700}>Welcome, {userName}</Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={3}>Victim Dashboard</Typography>
          {error && <Paper sx={{ p: 2, mb: 2, background: '#fff5f5', color: '#e53e3e' }}>{error}</Paper>}
          <Grid container spacing={2} mb={3}>
            {statusCards.map((card, idx) => (
              <Grid item xs={12} md={4} key={card.label}>
                <Paper sx={{ p: 2, background: card.color, display: 'flex', alignItems: 'center', borderRadius: 3 }}>
                  {card.icon}
                  <Box ml={2}>
                    <Typography fontWeight={600} color={card.textColor}>{card.label}</Typography>
                    <Typography variant="h5" fontWeight={700} color={card.textColor}>{loading ? "..." : card.value}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2} mb={4}>
            {actionCards.map((card) => (
              <Grid item xs={12} md={4} key={card.label}>
                <Paper sx={{ p: 3, background: card.color, borderRadius: 3, cursor: 'pointer', height: { xs: 'auto', md: '100%' } }} onClick={() => navigate(card.path)}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    {card.icon}
                    <Box>
                      <Typography fontWeight={700}>{card.label}</Typography>
                      <Typography color="text.secondary">{card.desc}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Box mt={8} position="relative" zIndex={1}>
            <Typography variant="h6" mb={2}>Recent Reports</Typography>
            {loading ? (
              <Paper sx={{ p: 2 }}>Loading...</Paper>
            ) : recentReports.length === 0 ? (
              <Paper sx={{ p: 2 }}>No recent reports.</Paper>
            ) : (
              recentReports.map((r) => (
                <Paper key={r.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography fontWeight={700}>{r.crime_type}</Typography>
                    <Typography variant="body2" color="text.secondary">Report #{String(r.id).padStart(3, '0')}</Typography>
                    <Typography variant="body2" color="text.secondary">Reported on {r.date_submitted || r.date}</Typography>
                  </Box>
                  <Box sx={{ px: 2, py: 1, background: '#fffbea', borderRadius: 2, color: '#d69e2e', fontWeight: 600 }}>{r.status}</Box>
                </Paper>
              ))
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 