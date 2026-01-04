import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Pagination,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  ShoppingCart as OrderIcon,
  Build as StatusIcon,
  Payment as PaymentIcon,
  Settings as SystemIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Notification as AppNotification, // ← MESMO ALIAS AQUI
  NotificationType,
  NotificationsResponse,
  parseNotificationMetadata,
} from "../types/Notification";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]); // ← USAR AppNotification
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<AppNotification | null>(null); // ← USAR AppNotification
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [pagination.page]);

  const fetchNotifications = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get<NotificationsResponse>(
        `/notifications?page=${pagination.page}&limit=${pagination.limit}`
      );
      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async (): Promise<void> => {
    try {
      const response = await api.get<{ count: number }>(
        "/notifications/unread-count"
      );
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Erro ao buscar contador:", error);
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ): void => {
    setPagination((prev) => ({ ...prev, page }));
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
    } catch (error) {
      console.error("Erro ao processar notificação:", error);
    }
  };

  const handleMarkAsRead = async (id: string): Promise<void> => {
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

  const handleMarkAllAsRead = async (): Promise<void> => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await api.delete(`/notifications/${id}`);
      const wasUnread =
        notifications.find((n) => n.id === id)?.isRead === false;
      setNotifications(notifications.filter((n) => n.id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => prev - 1);
      }
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
    }
  };

  const handleDeleteAll = async (): Promise<void> => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
      setUnreadCount(0);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
    } catch (error) {
      console.error("Erro ao excluir todas:", error);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    notification: AppNotification // ← USAR AppNotification
  ): void => {
    setSelectedNotification(notification);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setMenuAnchor(null);
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type: NotificationType): React.ReactNode => {
    switch (type) {
      case "ORDER_CREATED":
        return <OrderIcon color="primary" />;
      case "STATUS_CHANGED":
      case "ORDER_ASSIGNED":
        return <StatusIcon color="warning" />;
      case "PAYMENT_UPDATED":
        return <PaymentIcon color="success" />;
      case "ORDER_UPDATED":
        return <SystemIcon color="info" />;
      default:
        return <SystemIcon color="info" />;
    }
  };

  const getStatusIcon = (status?: string): React.ReactNode => {
    if (!status) return null;

    switch (status) {
      case "DELIVERED":
        return <CheckCircleIcon color="success" fontSize="small" />;
      case "CANCELLED":
        return <CancelIcon color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60)
      return `${diffMins} minuto${diffMins > 1 ? "s" : ""} atrás`;
    if (diffHours < 24)
      return `${diffHours} hora${diffHours > 1 ? "s" : ""} atrás`;
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? "s" : ""} atrás`;
    return date.toLocaleDateString("pt-PT");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              <NotificationsIcon sx={{ mr: 2, verticalAlign: "middle" }} />
              Notificações
            </Typography>
            <Typography color="textSecondary">
              {unreadCount > 0
                ? `${unreadCount} notificação${
                    unreadCount > 1 ? "es" : ""
                  } não lida${unreadCount > 1 ? "s" : ""}`
                : "Todas notificações lidas"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<CheckIcon />}
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como lidas
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteAll}
            >
              Limpar todas
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Nenhuma notificação encontrada.
          </Alert>
        ) : (
          <>
            <List sx={{ width: "100%" }}>
              {notifications.map((notification) => {
                const metadata = parseNotificationMetadata(
                  notification.metadata
                );

                return (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        py: 2,
                        cursor: "pointer",
                        bgcolor: notification.isRead
                          ? "transparent"
                          : "action.hover",
                        "&:hover": { bgcolor: "action.selected" },
                        borderLeft: notification.isRead ? "none" : "3px solid",
                        borderLeftColor: "primary.main",
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <ListItemIcon sx={{ minWidth: 50 }}>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={notification.isRead ? 400 : 600}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.isRead && (
                              <Chip
                                label="Nova"
                                size="small"
                                color="primary"
                                sx={{ height: 20 }}
                              />
                            )}
                            {metadata?.status && getStatusIcon(metadata.status)}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              paragraph
                            >
                              {notification.message}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <TimeIcon
                                fontSize="small"
                                sx={{ fontSize: 14 }}
                              />
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {formatTimeAgo(notification.createdAt)} •{" "}
                                {formatDate(notification.createdAt)}
                              </Typography>
                            </Box>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {!notification.isRead && (
                            <Tooltip title="Marcar como lida">
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Mais opções">
                            <IconButton
                              edge="end"
                              onClick={(e) => handleMenuOpen(e, notification)}
                            >
                              <MoreIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </List>

            {pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Menu de contexto */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.isRead && (
          <MenuItem
            onClick={() => {
              handleMarkAsRead(selectedNotification.id);
              handleMenuClose();
            }}
          >
            <CheckIcon fontSize="small" sx={{ mr: 1 }} />
            Marcar como lida
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (selectedNotification) handleDelete(selectedNotification.id);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default NotificationsPage;
