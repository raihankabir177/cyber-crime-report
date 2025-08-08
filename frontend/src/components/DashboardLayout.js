import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

/**
 * Persistent shell for every dashboard page: the sidebar is mounted once per role and
 * stays put while the routed page swaps inside <Outlet />, so menu clicks never reload it.
 * The sidebar is fixed; content is offset by the --sidebar-w / --topbar-h CSS variables.
 */
export default function DashboardLayout({ Sidebar }) {
  return (
    <Box sx={{ minHeight: "100vh", background: "#E8F1F5" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          ml: "var(--sidebar-w, 0px)",
          pt: "var(--topbar-h, 0px)",
          minWidth: 0,
          transition: "margin-left 0.2s",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
