import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Paper, CircularProgress, Alert, GridLegacy as Grid, Chip, Button, 
  Card, CardContent, CardActions, IconButton, Avatar, Stack, Divider,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArchiveIcon from '@mui/icons-material/Archive';
import { evidenceFileUrl, apiFetch } from "../../utils/api";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';

export default function OfficerEvidence() {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedCaseId, setSelectedCaseId] = useState("all");

  useEffect(() => {
    setLoading(true);
    apiFetch("/officer/all_evidence", { method: "GET", credentials: "include" })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch evidence");
        return res.json();
      })
      .then(data => { 
        console.log("Evidence data received:", data.evidence);
        setEvidence(data.evidence || []); 
        setLoading(false); 
      })
      .catch(err => { 
        setError(err.message); 
        setLoading(false); 
      });
  }, []);

  const getFileIcon = (contentType) => {
    if (contentType.startsWith('image/')) return <ImageIcon />;
    if (contentType === 'application/pdf') return <PictureAsPdfIcon />;
    if (contentType.includes('zip') || contentType.includes('rar')) return <ArchiveIcon />;
    return <DescriptionIcon />;
  };

  const getFileTypeColor = (contentType) => {
    if (contentType.startsWith('image/')) return '#10b981';
    if (contentType === 'application/pdf') return '#ef4444';
    if (contentType.includes('zip') || contentType.includes('rar')) return '#f59e0b';
    return '#546e7a';
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

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get unique case IDs for the dropdown
  const uniqueCaseIds = [...new Set(evidence.map(ev => ev.case_id))].sort((a, b) => a - b);

  const filteredEvidence = evidence
    .filter(ev => {
      // Enhanced search logic
      const searchLower = searchTerm.toLowerCase();
      const fileNameMatch = ev.original_name.toLowerCase().includes(searchLower);
      const caseIdMatch = ev.case_id.toString().includes(searchTerm) || 
                          String(ev.case_id).padStart(3, '0').includes(searchTerm);
      
      const matchesSearch = fileNameMatch || caseIdMatch;
      const matchesFilter = filterType === "all" || ev.content_type.includes(filterType);
      const matchesCaseId = selectedCaseId === "all" || ev.case_id.toString() === selectedCaseId;
      return matchesSearch && matchesFilter && matchesCaseId;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.upload_date || 0) - new Date(a.upload_date || 0);
      if (sortBy === "name") return a.original_name.localeCompare(b.original_name);
      if (sortBy === "case") return a.case_id - b.case_id;
      return 0;
    });

  const stats = {
    total: evidence.length,
    images: evidence.filter(ev => ev.content_type.startsWith('image/')).length,
    documents: evidence.filter(ev => ev.content_type.includes('pdf') || ev.content_type.includes('doc')).length,
    archives: evidence.filter(ev => ev.content_type.includes('zip') || ev.content_type.includes('rar')).length
  };

  if (loading) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#E8F1F5', boxSizing: 'border-box' }}>
      <Box sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <CircularProgress />
      </Box>
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#E8F1F5', boxSizing: 'border-box' }}>
      <Box sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#E8F1F5', boxSizing: 'border-box' }}>
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
              Evidence Management
            </Typography>
            <Typography color="text.secondary">Manage and organize case evidence files</Typography>
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
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #256D85 0%, #142B4A 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Files</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #142B4A 0%, #256D85 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{stats.images}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Images</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #1d5a6f 0%, #4a9fb8 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{stats.documents}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Documents</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #256D85 0%, #3b8ea5 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{stats.archives}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Archives</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Filters and Search */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Search & Filter Evidence
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by file name or Case ID (e.g., 001, 002)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Search by file name or Case ID number"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>File Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="File Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="image">Images</MenuItem>
                    <MenuItem value="pdf">PDFs</MenuItem>
                    <MenuItem value="doc">Documents</MenuItem>
                    <MenuItem value="zip">Archives</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Case ID</InputLabel>
                  <Select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    label="Case ID"
                  >
                    <MenuItem value="all">All Cases</MenuItem>
                    {uniqueCaseIds.map(caseId => (
                      <MenuItem key={caseId} value={caseId.toString()}>
                        Case #{String(caseId).padStart(3, '0')}
                      </MenuItem>
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
                    <MenuItem value="date">Date Added</MenuItem>
                    <MenuItem value="name">File Name</MenuItem>
                    <MenuItem value="case">Case ID</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  fullWidth
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setSortBy("date");
                    setSelectedCaseId("all");
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Evidence Grid */}
          {filteredEvidence.length === 0 ? (
            <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon sx={{ fontSize: 64, color: '#9ca3af' }} />
                <Typography variant="h6" color="text.secondary">
                  {searchTerm || filterType !== "all" ? "No evidence found matching your criteria" : "No evidence files found"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || filterType !== "all" ? "Try adjusting your search or filters" : "Evidence files will appear here once uploaded"}
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredEvidence.map((ev, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
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
                          bgcolor: getFileTypeColor(ev.content_type),
                          mr: 2,
                          width: 40,
                          height: 40
                        }}>
                          {getFileIcon(ev.content_type)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight={600} noWrap>
                            {ev.original_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Case #{String(ev.case_id).padStart(3, '0')}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Type:</Typography>
                          <Chip 
                            label={ev.content_type.split('/')[1]?.toUpperCase() || 'UNKNOWN'} 
                            size="small" 
                            sx={{ 
                              bgcolor: getFileTypeColor(ev.content_type) + '20',
                              color: getFileTypeColor(ev.content_type),
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Added:</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDate(ev.upload_date)}
                          </Typography>
                        </Box>
                        {ev.uploaded_by && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">By:</Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {ev.uploaded_by}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                    
                    <Divider />
                    <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small"
                          href={evidenceFileUrl(ev)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ color: '#546e7a' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          href={evidenceFileUrl(ev)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ color: '#546e7a' }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Box>
                      <Chip 
                        label={`Case #${String(ev.case_id).padStart(3, '0')}`}
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
          {filteredEvidence.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 3, mt: 3, background: '#E8F1F5' }}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Showing {filteredEvidence.length} of {evidence.length} evidence files
              </Typography>
        </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
} 