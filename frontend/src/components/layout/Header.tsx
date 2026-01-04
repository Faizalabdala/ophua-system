import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../NotificationBell"; // ← IMPORTE O NOVO COMPONENTE

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/login");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  // Obter label do perfil
  const getRoleLabel = (role?: string): string => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "RESELLER":
        return "Revendedor";
      case "PRODUCER":
        return "Produtor";
      default:
        return "Utilizador";
    }
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* Logo + Nome da Empresa */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            cursor: "pointer",
          }}
          onClick={() => navigate("/dashboard")}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: "1.4rem",
                letterSpacing: "-0.5px",
                color: "#ffffff",
              }}
            >
              OPHUA
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "0.7rem",
                fontWeight: 500,
                letterSpacing: "0.5px",
              }}
            >
              SISTEMA DE GESTÃO
            </Typography>
          </Box>
        </Box>

        {/* COMPONENTE DE NOTIFICAÇÕES */}
        <NotificationBell />

        {/* Perfil do Utilizador */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
            p: 1,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
          onClick={handleMenuOpen}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#ffffff",
              color: "#000000",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Avatar>

          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#ffffff",
                lineHeight: 1.2,
              }}
            >
              {user?.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.7rem",
                fontWeight: 500,
              }}
            >
              {getRoleLabel(user?.role)}
            </Typography>
          </Box>

          <MenuIcon sx={{ color: "#ffffff", fontSize: "1.2rem" }} />
        </Box>

        {/* Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              width: 240,
              mt: 1.5,
              border: "1px solid #e0e0e0",
            },
          }}
        >
          {/* Informações do utilizador */}
          <Box sx={{ p: 2, borderBottom: "1px solid #f0f0f0" }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user?.email}
            </Typography>
          </Box>

          {/* Menu Items */}
          <MenuItem onClick={() => handleNavigation("/dashboard")}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dashboard</ListItemText>
          </MenuItem>

          {user?.role === "ADMIN" && (
            <MenuItem onClick={() => handleNavigation("/admin/users")}>
              <ListItemIcon>
                <PeopleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Gestão de Utilizadores</ListItemText>
            </MenuItem>
          )}

          <MenuItem onClick={() => handleNavigation("/notifications")}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Notificações</ListItemText>
          </MenuItem>

          <Divider sx={{ my: 1 }} />

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: "#d32f2f" }}>
              Terminar Sessão
            </ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
