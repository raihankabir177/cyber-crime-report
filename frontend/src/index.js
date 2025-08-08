import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App";

const theme = createTheme({
  palette: {
    primary: { main: "#256D85", dark: "#174a5b", contrastText: "#fff" },
    secondary: { main: "#142B4A" },
    text: { primary: "#263238", secondary: "#546e7a" },
    background: { default: "#E8F1F5", paper: "#FFFFFF" },
  },
  typography: { button: { fontWeight: 600 } },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
