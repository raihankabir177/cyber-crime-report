import React, { useEffect, useState, useRef } from "react";
import { Badge, IconButton, Menu, MenuItem, ListItemText, Typography, Box, Tooltip, CircularProgress } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { apiFetch } from "../utils/api";

export default function Notifications() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const intervalRef = useRef();

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      // ignore errors for polling
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    fetchNotifications();
  };
  const handleClose = () => setAnchorEl(null);

  const handleMarkRead = async (ids) => {
    setMarking(true);
    try {
      await apiFetch("/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_ids: ids })
      });
      await fetchNotifications();
    } catch {}
    setMarking(false);
  };

  return (
    <Box>
      <Tooltip title="Notifications">
        <span>
          <IconButton color="inherit" onClick={handleOpen} disabled={loading}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </span>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <Box px={2} py={1}>
          <Typography variant="subtitle1">Notifications</Typography>
        </Box>
        {loading ? (
          <Box px={2} py={2}><CircularProgress size={24} /></Box>
        ) : notifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          notifications.map(n => (
            <MenuItem key={n.id} selected={!n.read} sx={{ whiteSpace: 'normal', alignItems: 'flex-start' }}>
              <ListItemText
                primary={n.message}
                secondary={n.timestamp}
                primaryTypographyProps={{ fontWeight: n.read ? 'normal' : 'bold' }}
              />
              {!n.read && (
                <Box ml={2}>
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleMarkRead([n.id])}
                  >Mark as read</Typography>
                </Box>
              )}
            </MenuItem>
          ))
        )}
        {unreadCount > 0 && (
          <MenuItem onClick={() => handleMarkRead(notifications.filter(n => !n.read).map(n => n.id))} disabled={marking}>
            <Typography color="primary">Mark all as read</Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
} 