import React, { useState } from "react";
import { 
  Box, Typography, Paper, GridLegacy as Grid, Card, CardContent, CardActions, Button, 
  IconButton, Chip, Stack, Divider, TextField, InputAdornment, 
  List, ListItem, ListItemIcon, ListItemText, Avatar, Alert
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TimelineIcon from '@mui/icons-material/Timeline';
import SecurityIcon from '@mui/icons-material/Security';
import BugReportIcon from '@mui/icons-material/BugReport';
import CodeIcon from '@mui/icons-material/Code';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

export default function InvestigationTools() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTool, setSelectedTool] = useState(null);

  const investigationTools = [
    {
      id: 'digital-forensics',
      title: 'Digital Forensics',
      description: 'Advanced tools for digital evidence analysis and recovery',
      icon: <SecurityIcon />,
      color: '#ef4444',
      features: ['File Recovery', 'Memory Analysis', 'Network Forensics', 'Mobile Forensics'],
      status: 'active'
    },
    {
      id: 'log-analysis',
      title: 'Log Analysis',
      description: 'Comprehensive log parsing and pattern recognition',
      icon: <TimelineIcon />,
      color: '#256D85',
      features: ['Real-time Monitoring', 'Pattern Detection', 'Anomaly Alerting', 'Historical Analysis'],
      status: 'active'
    },
    {
      id: 'malware-analysis',
      title: 'Malware Analysis',
      description: 'Static and dynamic analysis of suspicious files',
      icon: <BugReportIcon />,
      color: '#f59e0b',
      features: ['Static Analysis', 'Dynamic Analysis', 'Behavioral Analysis', 'Threat Intelligence'],
      status: 'maintenance'
    },
    {
      id: 'network-analysis',
      title: 'Network Analysis',
      description: 'Network traffic analysis and packet inspection',
      icon: <CodeIcon />,
      color: '#10b981',
      features: ['Packet Capture', 'Traffic Analysis', 'Protocol Analysis', 'Network Mapping'],
      status: 'active'
    }
  ];

  const recentActivities = [
    // Will be populated from database
  ];

  const analyticsData = {
    totalCases: 0,
    activeInvestigations: 0,
    completedThisWeek: 0,
    averageResolutionTime: '0 days',
    threatLevel: 'Low',
    topThreatTypes: []
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'maintenance': return <WarningIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'in-progress': return <ScheduleIcon />;
      default: return <CheckCircleIcon />;
    }
  };

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
              Investigation Tools
            </Typography>
            <Typography color="text.secondary">Advanced tools and utilities for cybercrime investigation</Typography>
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
          {/* Search Bar */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search investigation tools, cases, or evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          {/* Analytics Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #256D85 0%, #142B4A 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{analyticsData.totalCases}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Cases</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #142B4A 0%, #256D85 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{analyticsData.activeInvestigations}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Investigations</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #1d5a6f 0%, #4a9fb8 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{analyticsData.completedThisWeek}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Completed This Week</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #256D85 0%, #3b8ea5 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight={700}>{analyticsData.averageResolutionTime}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Avg Resolution Time</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Investigation Tools */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" fontWeight={700} mb={3}>Investigation Tools</Typography>
              <Grid container spacing={3}>
                {investigationTools.map((tool) => (
                  <Grid item xs={12} sm={6} key={tool.id}>
                    <Card sx={{ 
                      height: { xs: 'auto', md: '100%' },
                      borderRadius: 3,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: tool.color,
                            mr: 2,
                            width: 48,
                            height: 48
                          }}>
                            {tool.icon}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight={600}>
                              {tool.title}
                            </Typography>
                            <Chip 
                              label={tool.status} 
                              color={getStatusColor(tool.status)}
                              size="small"
                              icon={getStatusIcon(tool.status)}
                            />
                          </Box>
                        </Box>
                        
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          {tool.description}
                        </Typography>
                        
                        <Stack spacing={1}>
                          {tool.features.map((feature, index) => (
                            <Typography key={index} variant="body2" color="text.secondary">
                              • {feature}
                            </Typography>
                          ))}
                        </Stack>
                      </CardContent>
                      
                      <CardActions sx={{ p: 3, pt: 0 }}>
                        <Button 
                          variant="contained" 
                          fullWidth
                          sx={{ 
                            background: tool.color,
                            '&:hover': { background: tool.color, opacity: 0.9 }
                          }}
                        >
                          Launch Tool
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                {/* Threat Level */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>Threat Level</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip 
                      label={analyticsData.threatLevel} 
                      color="warning"
                      icon={<WarningIcon />}
                      sx={{ fontWeight: 600 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Current system threat level
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Monitor for any unusual activity patterns
                  </Typography>
                </Paper>

                {/* Recent Activities */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>Recent Activities</Typography>
                  <List sx={{ p: 0 }}>
                    {recentActivities.map((activity) => (
                      <ListItem key={activity.id} sx={{ px: 0, py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: getStatusColor(activity.status) === 'success' ? '#10b981' : '#256D85'
                          }}>
                            {getStatusIcon(activity.status)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600}>
                              {activity.case} - {activity.description}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {activity.timestamp}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                {/* Top Threat Types */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>Top Threat Types</Typography>
                  <Stack spacing={1}>
                    {analyticsData.topThreatTypes.map((threat, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">{threat}</Typography>
                        <Chip 
                          label={`${Math.floor(Math.random() * 30) + 10}%`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>

                {/* Quick Actions */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>Quick Actions</Typography>
                  <Stack spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<FileDownloadIcon />}
                      fullWidth
                    >
                      Export Report
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AssessmentIcon />}
                      fullWidth
                    >
                      Generate Analytics
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<TrendingUpIcon />}
                      fullWidth
                    >
                      View Trends
                    </Button>
                  </Stack>
        </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
} 