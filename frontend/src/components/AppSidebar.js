import React from "react";
import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import SecurityIcon from "@mui/icons-material/Security";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../utils/api";
import MobileTopBar from "./MobileTopBar";
import { useSidebar, COLLAPSED_WIDTH } from "./useSidebar";

export const SIDEBAR_BG = "#142B4A";
const ACTIVE_BG = "#256D85";

/**
 * Shared sidebar for all roles. Desktop: always visible and fixed, the toggle shrinks it
 * to an icon rail. Mobile: slide-out drawer opened from the top bar.
 * Page content is offset by the --sidebar-w CSS variable (see DashboardLayout).
 */
export default function AppSidebar({ items, subtitle, width = 240 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, collapsed, open, setOpen, toggleCollapsed } = useSidebar(width);
  const rail = !isMobile && collapsed;
  const paperWidth = rail ? COLLAPSED_WIDTH : width;

  const handleNav = async (item) => {
    setOpen(false);
    if (item.logout) await logout();
    navigate(item.path);
  };

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", color: "#fff" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: rail ? 0 : 2,
          py: 1.5,
          minHeight: 64,
          justifyContent: rail ? "center" : "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {!rail && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: ACTIVE_BG }}>
              <SecurityIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap lineHeight={1.2}>CyberCrime Reports</Typography>
              {subtitle && <Typography variant="caption" noWrap sx={{ opacity: 0.75 }}>{subtitle}</Typography>}
            </Box>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapsed}
            sx={{ color: "#fff", cursor: "pointer" }}
          >
            {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        )}
      </Box>
      <List sx={{ flexGrow: 1, overflowY: "auto", py: 1.5, px: rail ? 1 : 1.5 }}>
        {items.map((item) => {
          const selected = location.pathname === item.path;
          const button = (
            <ListItemButton
              key={item.text}
              selected={selected}
              onClick={() => handleNav(item)}
              sx={{
                cursor: "pointer",
                borderRadius: 2,
                mb: 0.5,
                minHeight: 46,
                justifyContent: rail ? "center" : "flex-start",
                px: rail ? 1 : 2,
                color: "#fff",
                "&.Mui-selected, &.Mui-selected:hover": { background: ACTIVE_BG },
                "&:hover": { background: selected ? ACTIVE_BG : "rgba(255,255,255,0.1)" },
              }}
            >
              <ListItemIcon sx={{ color: "#fff", minWidth: rail ? 0 : 40, justifyContent: "center" }}>{item.icon}</ListItemIcon>
              {!rail && <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: selected ? 600 : 400, noWrap: true }} />}
            </ListItemButton>
          );
          return rail ? (
            <Tooltip key={item.text} title={item.text} placement="right">{button}</Tooltip>
          ) : (
            button
          );
        })}
      </List>
    </Box>
  );

  const paperSx = { width: paperWidth, boxSizing: "border-box", background: SIDEBAR_BG, border: 0, overflowX: "hidden", transition: "width 0.2s" };

  if (isMobile) {
    return (
      <>
        <MobileTopBar background={SIDEBAR_BG} mobile onMenu={() => setOpen(true)} />
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { ...paperSx, maxWidth: "85vw" } }}
        >
          {content}
        </Drawer>
      </>
    );
  }

  return (
    <Drawer variant="permanent" sx={{ width: 0, "& .MuiDrawer-paper": paperSx }}>
      {content}
    </Drawer>
  );
}
