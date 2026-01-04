import React, { useState, useEffect, useRef } from "react";
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Typography,
  Button,
  Box,
  Divider,
  CircularProgress,
  MenuItem,
  Menu,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  ShoppingCart as OrderIcon,
  Build as StatusIcon,
  Payment as PaymentIcon,
  Settings as SystemIcon,
  MoreVert as MoreIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Notification as AppNotification, // ALIAS CRIADO AQUI
  NotificationType,
  NotificationsResponse,
  parseNotificationMetadata,
} from "../types/Notification";

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]); // ← USAR AppNotification
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<AppNotification | null>(null); // ← USAR AppNotification
  const navigate = useNavigate();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchNotifications();

    // Polling a cada 15 segundos
    pollIntervalRef.current = setInterval(fetchNotifications, 15000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const fetchNotifications = async (): Promise<void> => {
    try {
      const response = await api.get<NotificationsResponse>(
        "/notifications?limit=10"
      );
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);

      // Atualizar título da aba
      document.title =
        unreadCount > 0 ? `(${unreadCount}) Ophua System` : "Ophua System";
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  const getNotificationIcon = (type: NotificationType): React.ReactNode => {
    switch (type) {
      case "ORDER_CREATED":
        return <OrderIcon color="primary" fontSize="small" />;
      case "STATUS_CHANGED":
      case "ORDER_ASSIGNED":
        return <StatusIcon color="warning" fontSize="small" />;
      case "PAYMENT_UPDATED":
        return <PaymentIcon color="success" fontSize="small" />;
      case "ORDER_UPDATED":
        return <SystemIcon color="info" fontSize="small" />;
      default:
        return <SystemIcon color="info" fontSize="small" />;
    }
  };

  const getNotificationColor = (
    type: NotificationType
  ): "primary" | "warning" | "success" | "info" => {
    switch (type) {
      case "ORDER_CREATED":
        return "primary";
      case "STATUS_CHANGED":
        return "warning";
      case "PAYMENT_UPDATED":
        return "success";
      default:
        return "info";
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("pt-PT");
  };

  const handleNotificationClick = async (
    notification: AppNotification // ← USAR AppNotification
  ): Promise<void> => {
    try {
      if (!notification.isRead) {
        await api.patch(`/notifications/${notification.id}/read`);
        setNotifications(
          notifications.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => prev - 1);
      }

      const metadata = parseNotificationMetadata(notification.metadata);
      if (metadata?.orderId) {
        navigate(`/orders/${metadata.orderId}`);
      }

      handleClose();
    } catch (error) {
      console.error("Erro ao processar notificação:", error);
    }
  };

  const handleMarkAsRead = async (
    id: string,
    e: React.MouseEvent
  ): Promise<void> => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const handleDeleteNotification = async (
    id: string,
    e: React.MouseEvent
  ): Promise<void> => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
      if (!notifications.find((n) => n.id === id)?.isRead) {
        setUnreadCount((prev) => prev - 1);
      }
      setMenuAnchor(null);
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
    }
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const handleDeleteAll = async (): Promise<void> => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
      setUnreadCount(0);
      setMenuAnchor(null);
    } catch (error) {
      console.error("Erro ao excluir todas:", error);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    notification: AppNotification // ← USAR AppNotification
  ): void => {
    event.stopPropagation();
    setSelectedNotification(notification);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setMenuAnchor(null);
    setSelectedNotification(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Atualiza ao abrir
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const menuOpen = Boolean(menuAnchor);

  return (
    <>
      <Tooltip title="Notificações">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label="notificações"
          sx={{ position: "relative" }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.7rem",
                height: "20px",
                minWidth: "20px",
              },
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 0 }}>
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Notificações
            </Typography>
            <Box>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={handleMarkAllAsRead}
                  sx={{ mr: 1 }}
                >
                  Marcar todas
                </Button>
              )}
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteAll}
              >
                Limpar
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <NotificationsIcon
                sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
              />
              <Typography color="textSecondary">Nenhuma notificação</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      px: 2,
                      py: 1.5,
                      cursor: "pointer",
                      bgcolor: notification.isRead
                        ? "transparent"
                        : "action.hover",
                      "&:hover": {
                        bgcolor: "action.selected",
                      },
                      borderLeft: notification.isRead ? "none" : `3px solid`,
                      borderLeftColor: `${getNotificationColor(
                        notification.type
                      )}.main`,
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight={notification.isRead ? 400 : 600}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            icon={<TimeIcon sx={{ fontSize: 14 }} />}
                            label={formatTime(notification.createdAt)}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mt: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => handleMenuOpen(e, notification)}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}

          {notifications.length > 0 && (
            <Box
              sx={{
                p: 2,
                textAlign: "center",
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate("/notifications")}
              >
                Ver todas notificações
              </Button>
            </Box>
          )}
        </Box>
      </Popover>

      {/* Menu de ações para notificação individual */}
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.isRead && (
          <MenuItem
            onClick={(e) => handleMarkAsRead(selectedNotification.id, e)}
          >
            <CheckIcon fontSize="small" sx={{ mr: 1 }} />
            Marcar como lida
          </MenuItem>
        )}
        <MenuItem
          onClick={(e) =>
            handleDeleteNotification(selectedNotification?.id || "", e)
          }
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationBell;
