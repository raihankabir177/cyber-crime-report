import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MenuIcon from "@mui/icons-material/Menu";
import SecurityIcon from "@mui/icons-material/Security";
import { TOPBAR_HEIGHT } from "./useSidebar";

/** Top bar shown while the sidebar is hidden: menu button, logo and app name. */
export default function MobileTopBar({ background, onMenu, mobile }) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: TOPBAR_HEIGHT,
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1,
        background,
        color: "#fff",
        boxShadow: 2,
      }}
    >
      <IconButton
        aria-label={mobile ? "Open menu" : "Expand sidebar"}
        onClick={onMenu}
        sx={{ color: "#fff" }}
      >
        {mobile ? <MoreVertIcon /> : <MenuIcon />}
      </IconButton>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)",
        }}
      >
        <SecurityIcon sx={{ fontSize: 20, color: "#fff" }} />
      </Box>
      <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ color: "#fff" }}>
        CyberCrime Reports
      </Typography>
    </Box>
  );
}
