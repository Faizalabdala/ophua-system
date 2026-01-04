// frontend/src/components/layout/Header.tsx
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
  Badge,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  // Notificações fictícias para demonstração
  const notifications = [
    { id: 1, text: "Novo pedido de Francisco", time: "2 min ago" },
    { id: 2, text: "Pedido #00123 está pronto", time: "1 hora ago" },
    { id: 3, text: "Deyse criou 3 novos pedidos", time: "2 horas ago" },
  ];

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
          {/* Logotipo */}
          <Box
            component="img"
            src="/logo.png"
            alt="Ophua Logo"
            sx={{
              height: 40,
              width: "auto",
              mr: 2,
              filter: "brightness(0) invert(1)",
            }}
            onError={(e) => {
              // Fallback se o logotipo não carregar
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />

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

        {/* Notificações (apenas para Admin/Producer) */}
        {(user?.role === "ADMIN" || user?.role === "PRODUCER") && (
          <>
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleNotificationOpen}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleNotificationClose}
              PaperProps={{
                sx: {
                  width: 320,
                  maxHeight: 400,
                  mt: 1.5,
                },
              }}
            >
              <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Notificações
                </Typography>
              </Box>
              {notifications.map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={handleNotificationClose}
                >
                  <Box sx={{ width: "100%" }}>
                    <Typography variant="body2">{notification.text}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {notification.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

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
              {user?.role === "ADMIN"
                ? "Administrador"
                : user?.role === "RESELLER"
                ? "Revendedor"
                : user?.role === "PRODUCER"
                ? "Produtor"
                : "Utilizador"}
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

          <MenuItem onClick={() => handleNavigation("/profile")}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Configurações</ListItemText>
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
