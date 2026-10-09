import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Paper, GridLegacy as Grid, Card, CardContent, CardActions, Button, 
  IconButton, Chip, Stack, Divider, TextField, InputAdornment, 
  CircularProgress, Alert, Avatar, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import OfficerSidebar from "../../components/OfficerSidebar";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import SecurityIcon from '@mui/icons-material/Security';
import CancelIcon from '@mui/icons-material/Cancel';
import { apiUrl } from "../../utils/api";

export default function OfficerCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [crimeTypeFilter, setCrimeTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle URL parameters for status filter
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (crimeTypeFilter !== 'all') params.append('crimeType', crimeTypeFilter);
    
    // Map frontend sort values to backend sort values
    let sortByParam = 'Date Reported'; // default
    if (sortBy === 'victim') sortByParam = 'Victim Name';
    else if (sortBy === 'id') sortByParam = 'Case ID';
    else if (sortBy === 'date') sortByParam = 'Date Reported';
    else if (sortBy === 'crimeType') sortByParam = 'Crime Type';
    else if (sortBy === 'status') sortByParam = 'Status';
    
    params.append('sortBy', sortByParam);
    
    const url = apiUrl(`/officer/assigned_cases?${params.toString()}`);
    
    console.log('Fetching cases with params:', {
      search,
      statusFilter,
      crimeTypeFilter,
      sortBy,
      sortByParam,
      url
    });
    
    fetch(url, { method: "GET", credentials: "include" })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch cases");
        return res.json();
      })
      .then(data => { 
        console.log("Cases data received:", data.cases);
        console.log("Sample case structure:", data.cases?.[0]);
        setCases(data.cases || []); 
        setLoading(false); 
      })
      .catch(err => { 
        console.error("Error fetching cases:", err);
        setError(err.message); 
        setLoading(false); 
      });
  }, [search, statusFilter, crimeTypeFilter, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "error";
      case "Under Investigation": return "warning";
      case "Closed": return "success";
      case "Rejected": return "error";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Open": return <WarningIcon />;
      case "Under Investigation": return <AccessTimeIcon />;
      case "Closed": return <CheckCircleIcon />;
      case "Rejected": return <CancelIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const getCrimeTypeIcon = (crimeType) => {
    switch (crimeType.toLowerCase()) {
      case "phishing": return <DescriptionIcon />;
      case "hacking": return <SecurityIcon />;
      case "cyberbullying": return <WarningIcon />;
      default: return <DescriptionIcon />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const filteredCases = cases; // No client-side filtering needed anymore

  const stats = {
    total: cases.length,
    open: cases.filter(c => c.status === "Open").length,
    inProgress: cases.filter(c => c.status === "Under Investigation").length,
    resolved: cases.filter(c => c.status === "Closed").length
  };

  const uniqueCrimeTypes = [...new Set(cases.map(c => c.crime_type))];

  if (loading) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', pt: 'var(--topbar-h, 0px)', boxSizing: 'border-box' }}>
      <OfficerSidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <CircularProgress />
      </Box>
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', pt: 'var(--topbar-h, 0px)', boxSizing: 'border-box' }}>
      <OfficerSidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', pt: 'var(--topbar-h, 0px)', boxSizing: 'border-box' }}>
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
              My Cases
            </Typography>
            <Typography color="text.secondary">Manage and track your assigned cybercrime cases</Typography>
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
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Cases</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{stats.open}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Open Cases</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{stats.inProgress}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Under Investigation</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{stats.resolved}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Closed</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Search and Filters */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Search & Filter Cases
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by victim name, case ID, or crime type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Under Investigation">Under Investigation</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Crime Type</InputLabel>
                  <Select
                    value={crimeTypeFilter}
                    onChange={(e) => setCrimeTypeFilter(e.target.value)}
                    label="Crime Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    {uniqueCrimeTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="date">Date Reported</MenuItem>
                    <MenuItem value="id">Case ID</MenuItem>
                    <MenuItem value="victim">Victim Name</MenuItem>
                    <MenuItem value="crimeType">Crime Type</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  fullWidth
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setCrimeTypeFilter("all");
                    setSortBy("date");
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Cases Grid */}
          {filteredCases.length === 0 ? (
            <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon sx={{ fontSize: 64, color: '#9ca3af' }} />
                <Typography variant="h6" color="text.secondary">
                  {search || statusFilter !== "all" || crimeTypeFilter !== "all" ? "No cases found matching your criteria" : "No cases assigned yet"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {search || statusFilter !== "all" || crimeTypeFilter !== "all" ? "Try adjusting your search or filters" : "Cases will appear here once assigned"}
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredCases.map((c) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={c.id}>
                  <Card sx={{ 
                    height: { xs: 'auto', md: '100%' }, 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                    }
                  }}>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: getStatusColor(c.status) === 'success' ? '#10b981' : 
                                   getStatusColor(c.status) === 'warning' ? '#f59e0b' : '#ef4444',
                          mr: 2,
                          width: 40,
                          height: 40
                        }}>
                          {getCrimeTypeIcon(c.crime_type)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight={600} noWrap>
                            Case #{String(c.id).padStart(3, '0')}
                          </Typography>
                          <Chip 
                            label={c.status} 
                            color={getStatusColor(c.status)}
                            size="small"
                            icon={getStatusIcon(c.status)}
                          />
                        </Box>
                      </Box>
                      
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Victim:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {c.victim_name || 'Unknown'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Crime Type:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {c.crime_type}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Reported:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDate(c.date_submitted)}
                          </Typography>
                        </Box>
          </Stack>
                    </CardContent>
                    
                    <Divider />
                    <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/case/${c.id}`)}
                          sx={{ color: '#6b7280' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/officer/case/${c.id}/evidence`)}
                          sx={{ color: '#6b7280' }}
                        >
                          <UploadFileIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/case/${c.id}/logs`)}
                          sx={{ color: '#6b7280' }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                      <Chip 
                        label={`#${String(c.id).padStart(3, '0')}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Results Summary */}
          <Paper sx={{ p: 3, borderRadius: 3, mt: 3, background: '#f8fafc' }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {search || statusFilter !== "all" || crimeTypeFilter !== "all" ? (
                `Showing ${filteredCases.length} of ${cases.length} cases (filtered)`
              ) : (
                `Showing ${filteredCases.length} of ${cases.length} cases`
              )}
              {search && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Search term: "{search}"
                  </Typography>
                </Box>
              )}
            </Typography>
        </Paper>
        </Box>
      </Box>
    </Box>
  );
} 