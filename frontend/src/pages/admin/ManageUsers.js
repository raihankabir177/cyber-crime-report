import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Paper, GridLegacy as Grid, Card, CardContent, 
  TextField, InputAdornment, Select, MenuItem, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, IconButton, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Alert, Snackbar
} from "@mui/material";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';
import { apiFetch } from "../../utils/api";

export default function ManageUsers() {
  const adminName = sessionStorage.getItem("userName") || "Admin User";
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    victims: 0,
    officers: 0,
    admins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  
  // Edit functionality
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    specialization: '',
    department: ''
  });
  
  // Delete functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  
  // Notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiFetch('/admin/users', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const usersWithIcons = data.users.map(user => ({
            ...user,
            icon: getRoleIcon(user.role)
          }));
          setUsers(usersWithIcons);
          
          // Calculate stats from users data
          const total = usersWithIcons.length;
          const victims = usersWithIcons.filter(user => user.role === 'Victim').length;
          const officers = usersWithIcons.filter(user => user.role === 'Officer').length;
          const admins = usersWithIcons.filter(user => user.role === 'Admin').length;
          
          setStats({
            total,
            victims,
            officers,
            admins
          });
        } else {
          setError('Failed to fetch users');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [reloadKey]);

  const getRoleColor = (role) => {
    switch (role) {
      case "Victim": return "#10b981";
      case "Officer": return "#256D85";
      case "Admin": return "#256D85";
      default: return "#546e7a";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Victim": return <PersonIcon sx={{ color: '#256D85' }} />;
      case "Officer": return <SecurityIcon sx={{ color: '#256D85' }} />;
      case "Admin": return <AdminPanelSettingsIcon sx={{ color: '#f97316' }} />;
      default: return <PersonIcon />;
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialization: user.specialization || '',
      department: user.department || ''
    });
    setEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      const response = await apiFetch(`/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
        setEditDialogOpen(false);
        // Refresh users list
        setReloadKey((k) => k + 1);
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || 'Failed to update user',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Network error',
        severity: 'error'
      });
    }
  };

  // Handle delete user
  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      const response = await apiFetch(`/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
        setDeleteDialogOpen(false);
        // Refresh users list
        setReloadKey((k) => k + 1);
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || 'Failed to delete user',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Network error',
        severity: 'error'
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toString().includes(searchTerm);
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
            <Typography variant="h5" fontWeight={700}>Welcome, {adminName}</Typography>
            <Typography variant="subtitle1" color="text.secondary">Admin Dashboard</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography variant="body2" fontWeight={500}>{adminName}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ p: { xs: 2, md: 4 }, mt: { xs: 0, md: 4 } }}>
          <Typography variant="h4" fontWeight={700} mb={1}>Manage Users</Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={4}>
            View and manage all system users.
          </Typography>

          {error && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          {loading && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#d6e6ed', border: '1px solid #d6e6ed', borderRadius: 2 }}>
              <Typography color="primary">Loading users...</Typography>
            </Box>
          )}

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#d6e6ed', color: '#174a5b', width: 56, height: 56 }}>
                      <GroupIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#174a5b" mb={1}>
                    {stats.total}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Total Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#dcfce7', color: '#166534', width: 56, height: 56 }}>
                      <PersonIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#166534" mb={1}>
                    {stats.victims}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Victims
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#e9d5ff', color: '#256D85', width: 56, height: 56 }}>
                      <SecurityIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#256D85" mb={1}>
                    {stats.officers}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Officers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#fed7aa', color: '#ea580c', width: 56, height: 56 }}>
                      <AdminPanelSettingsIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#ea580c" mb={1}>
                    {stats.admins}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Admins
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search and Filter */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} lg={8}>
                <TextField
                  fullWidth
                  placeholder="Search users by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#546e7a' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: '#e2e8f0'
                      },
                      '&:hover fieldset': {
                        borderColor: '#cbd5e1'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} lg={4}>
                <FormControl fullWidth>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon sx={{ color: '#546e7a' }} />
                      </InputAdornment>
                    }
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1'
                      }
                    }}
                  >
                    <MenuItem value="All Roles">All Roles</MenuItem>
                    <MenuItem value="Victim">Victim</MenuItem>
                    <MenuItem value="Officer">Officer</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Users Table */}
          <Paper sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#E8F1F5' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#263238' }}>USER</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#263238' }}>CONTACT</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#263238' }}>ROLE</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#263238' }}>JOIN DATE</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#263238' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#E8F1F5' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: '#f1f5f9' }}>
                            {user.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {user.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          sx={{
                            backgroundColor: getRoleColor(user.role) + '20',
                            color: getRoleColor(user.role),
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.joinDate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            sx={{ color: '#256D85' }}
                            onClick={() => handleEditUser(user)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            sx={{ color: '#ef4444' }}
                            onClick={() => handleDeleteUser(user)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editFormData.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                    label="Role"
                  >
                    <MenuItem value="Victim">Victim</MenuItem>
                    <MenuItem value="Officer">Officer</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {editFormData.role === 'Officer' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Specialization"
                      value={editFormData.specialization}
                      onChange={(e) => setEditFormData({...editFormData, specialization: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={editFormData.department}
                      onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {deletingUser?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 