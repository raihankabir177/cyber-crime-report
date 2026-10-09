import { useCallback, useLayoutEffect, useState } from "react";
import { useMediaQuery } from "@mui/material";

/** Below this width the sidebar becomes a slide-out menu opened from the top bar. */
export const MOBILE_QUERY = "(max-width:1023.95px)";
export const TOPBAR_HEIGHT = 56;

const STORAGE_KEY = "sidebarCollapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Shared sidebar state. Also publishes two CSS variables that page layouts use,
 * so pages don't need to know whether the sidebar is shown:
 *   --sidebar-w  width the sidebar occupies beside the content
 *   --topbar-h   height of the top bar (shown when the sidebar is hidden)
 */
export function useSidebar(width) {
  const isMobile = useMediaQuery(MOBILE_QUERY, { noSsr: true });
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [open, setOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      } catch {
        // storage unavailable: keep in-memory state only
      }
      return !c;
    });
  }, []);

  const hidden = isMobile || collapsed;

  useLayoutEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--sidebar-w", hidden ? "0px" : `${width}px`);
    root.setProperty("--topbar-h", hidden ? `${TOPBAR_HEIGHT}px` : "0px");
  }, [hidden, width]);

  return { isMobile, collapsed, hidden, open, setOpen, toggleCollapsed };
}
