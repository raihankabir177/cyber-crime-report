import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, CircularProgress, Alert, Paper, Chip
} from "@mui/material";
import Sidebar from "../../components/Sidebar";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

function statusColor(status) {
  if (status === "Open") return { color: "error", label: "Open" };
  if (status === "Under Investigation") return { color: "warning", label: "Under Investigation" };
  if (status === "Closed") return { color: "success", label: "Closed" };
  return { color: "default", label: status };
}

export default function VictimReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', pt: 'var(--topbar-h, 0px)', boxSizing: 'border-box' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0, p: 0 }}>
        <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 } }}>
          <Box maxWidth={1200} mx="auto">
        <Typography variant="h4" fontWeight={700} mb={0.5}>My Reports</Typography>
        <Typography color="text.secondary" mb={3}>Track and manage your submitted crime reports</Typography>
        <Paper sx={{ p: { xs: 1, md: 3 }, borderRadius: 3, boxShadow: 2 }}>
          {loading && <CircularProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {!loading && !error && (
            <Box sx={{ overflowX: 'auto' }}><Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>REPORT ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>CRIME TYPE</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>DATE REPORTED</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ASSIGNED OFFICER</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No reports found.</TableCell>
                  </TableRow>
                ) : (
                  reports.map(r => {
                    const status = statusColor(r.status);
                    return (
                      <TableRow key={r.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{`#${String(r.id).padStart(3, '0')}`}</TableCell>
                        <TableCell>{r.crime_type}</TableCell>
                        <TableCell>{r.date_submitted || r.date}</TableCell>
                        <TableCell>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: 15, px: 1.5, borderRadius: 2 }}
                          />
                        </TableCell>
                        <TableCell>{r.assigned_officer_name || "Not Assigned"}</TableCell>
                        <TableCell>
                          <Button
                            variant="text"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/report_details/${r.id}`)}
                            sx={{ color: '#2563eb', fontWeight: 600 }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table></Box>
          )}
        </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 