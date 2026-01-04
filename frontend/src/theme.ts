// frontend/src/theme.ts
import { createTheme } from "@mui/material/styles";

export const ophuaTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000", // Preto
      light: "#333333",
      dark: "#000000",
    },
    secondary: {
      main: "#ffffff", // Branco
      light: "#f5f5f5",
      dark: "#e0e0e0",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: "#000000",
      fontSize: "1.75rem",
    },
    h5: {
      fontWeight: 600,
      color: "#000000",
    },
    h6: {
      fontWeight: 600,
      color: "#333333",
    },
    body1: {
      fontSize: "0.95rem",
    },
    body2: {
      fontSize: "0.85rem",
      color: "#666666",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
        contained: {
          backgroundColor: "#000000",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#333333",
          },
        },
        outlined: {
          borderColor: "#000000",
          color: "#000000",
          "&:hover": {
            borderColor: "#333333",
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #e0e0e0",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          borderBottom: "2px solid #ffffff",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: "#f0f0f0",
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
  },
});
