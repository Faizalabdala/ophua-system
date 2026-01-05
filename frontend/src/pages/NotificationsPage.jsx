// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  ExitToApp as ExitToAppIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Cores consistentes com o Dashboard
const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  orange: '#FF5722',
  orangeLight: '#FF8A65',
  orangeDark: '#D84315',
  orange50: '#FFF3E0',
  orange100: '#FFE0B2',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (user) {
      fetchNotificationsCount();
    }
  }, [user]);

  const fetchNotificationsCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setNotificationsCount(response.data.count);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const getActiveColor = (path) => {
    return location.pathname === path ? COLORS.orange : COLORS.gray700;
  };

  const getActiveBackground = (path) => {
    return location.pathname === path ? alpha(COLORS.orange, 0.1) : 'transparent';
  };

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon sx={{ color: getActiveColor('/dashboard') }} />, 
      path: '/dashboard' 
    },
    { 
      text: 'Pedidos', 
      icon: <InventoryIcon sx={{ color: getActiveColor('/orders') }} />, 
      path: '/orders' 
    },
    { 
      text: 'Notificações', 
      icon: (
        <Badge badgeContent={notificationsCount} color="error" sx={{ 
          '& .MuiBadge-badge': { 
            backgroundColor: COLORS.orange,
            color: COLORS.white,
            fontSize: '0.7rem',
            height: 18,
            minWidth: 18,
          }
        }}>
          <NotificationsIcon sx={{ color: getActiveColor('/notifications') }} />
        </Badge>
      ), 
      path: '/notifications' 
    },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push(
      { 
        text: 'Utilizadores', 
        icon: <PeopleIcon sx={{ color: getActiveColor('/admin/users') }} />, 
        path: '/admin/users' 
      },
      { 
        text: 'Configurações', 
        icon: <SettingsIcon sx={{ color: getActiveColor('/admin/settings') }} />, 
        path: '/admin/settings' 
      }
    );
  }

  const drawer = (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header do Drawer */}
      <Box sx={{ 
        p: 3, 
        borderBottom: `1px solid ${COLORS.gray200}`,
        background: COLORS.white,
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 2,
        }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: COLORS.black,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.white,
            fontWeight: 700,
            fontSize: '1.2rem',
          }}>
            O
          </Box>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: COLORS.black,
              letterSpacing: '-0.5px',
            }}>
              OPHUA
            </Typography>
            <Typography variant="caption" sx={{ 
              color: COLORS.gray600,
              fontWeight: 500,
            }}>
              Sistema de Gestão
            </Typography>
          </Box>
        </Box>
        
        {/* Perfil do Usuário */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          p: 1.5,
          borderRadius: '8px',
          border: `1px solid ${COLORS.gray200}`,
          background: COLORS.gray50,
        }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: COLORS.orange,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.white,
            fontWeight: 600,
            fontSize: '1rem',
          }}>
            {user?.name?.charAt(0) || 'U'}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ 
              color: COLORS.black, 
              fontWeight: 600,
              lineHeight: 1.2,
            }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: COLORS.gray600,
              fontWeight: 500,
            }}>
              {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, p: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mb: 0.5,
              borderRadius: '8px',
              background: getActiveBackground(item.path),
              '&:hover': {
                background: alpha(COLORS.orange, 0.05),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                sx: { 
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  color: getActiveColor(item.path),
                  fontSize: '0.9rem',
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Footer do Drawer */}
      <Box sx={{ 
        p: 2, 
        borderTop: `1px solid ${COLORS.gray200}`,
        background: COLORS.white,
      }}>
        <ListItem 
          button 
          onClick={logout}
          sx={{
            borderRadius: '8px',
            '&:hover': {
              background: alpha(COLORS.error, 0.05),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: COLORS.error }}>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Sair"
            primaryTypographyProps={{
              sx: { 
                fontWeight: 500,
                color: COLORS.error,
                fontSize: '0.9rem',
              }
            }}
          />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: COLORS.gray50 }}>
      {/* Drawer para desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            border: 'none',
            background: COLORS.white,
            borderRight: `1px solid ${COLORS.gray200}`,
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Drawer temporário para mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            border: 'none',
            background: COLORS.white,
            borderRight: `1px solid ${COLORS.gray200}`,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', md: 'calc(100% - 280px)' },
        }}
      >
        {/* Header para Mobile */}
        <Box sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${COLORS.gray200}`,
          background: COLORS.white,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              color: COLORS.gray700,
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="subtitle1" sx={{ 
              color: COLORS.black, 
              fontWeight: 600,
            }}>
              {user?.name}
            </Typography>
            <Box sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: COLORS.orange,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.white,
              fontWeight: 600,
              fontSize: '0.9rem',
            }}>
              {user?.name?.charAt(0) || 'U'}
            </Box>
          </Box>
        </Box>

        {/* Conteúdo da Página */}
        <Box sx={{ 
          flex: 1,
          p: { xs: 2, md: 3 },
          background: COLORS.gray50,
        }}>
          <Outlet />
        </Box>

        {/* Footer Minimalista */}
        <Box sx={{
          p: 2,
          borderTop: `1px solid ${COLORS.gray200}`,
          background: COLORS.white,
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'center',
        }}>
          <Typography variant="caption" sx={{ 
            color: COLORS.gray600,
            textAlign: 'center',
          }}>
            © {new Date().getFullYear()} Ophua System • v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;