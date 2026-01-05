import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Container,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  Snackbar,
  Grid,
  IconButton,
  Tooltip,
  Avatar,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Build as BuildIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  LocalShipping as ShippingIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  ExitToApp as ExitIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";

// Paleta de cores minimalista e elegante
const COLORS = {
  // Cores principais
  black: '#000000',
  white: '#FFFFFF',
  
  // Tons de cinza
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
  
  // Laranja
  orange: '#FF5722',
  orangeLight: '#FF8A65',
  orangeDark: '#D84315',
  orange50: '#FFF3E0',
  orange100: '#FFE0B2',
  
  // Cores de status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 4,
    inProgress: 1,
    ready: 3,
    delivered: 12,
  });

  const [openNewOrder, setOpenNewOrder] = useState(false);
  const [openEditStatus, setOpenEditStatus] = useState(false);
  const [openEditPayment, setOpenEditPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [newOrder, setNewOrder] = useState({
    customerName: "",
    theme: "",
    target: "200k",
    color: "branco",
    notes: "",
  });

  const [editStatus, setEditStatus] = useState("PENDING");
  const [editPayment, setEditPayment] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        api.get("/orders"),
        api.get("/orders/stats"),
      ]);

      setOrders(ordersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showSnackbar("Erro ao carregar dados", "error");
    }
  };

  const handleCreateOrder = async () => {
    try {
      const response = await api.post("/orders", newOrder);
      setOrders([response.data, ...orders]);
      setOpenNewOrder(false);
      setNewOrder({
        customerName: "",
        theme: "",
        target: "200k",
        color: "branco",
        notes: "",
      });
      showSnackbar("Pedido criado com sucesso!", "success");
      loadData();
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || "Erro ao criar pedido",
        "error"
      );
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await api.patch(`/orders/${selectedOrder.id}/status`, {
        status: editStatus,
      });
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: editStatus }
            : order
        )
      );
      setOpenEditStatus(false);
      showSnackbar("Status atualizado com sucesso!", "success");
      loadData();
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || "Erro ao atualizar status",
        "error"
      );
    }
  };

  const handleUpdatePayment = async () => {
    if (!selectedOrder) return;
    try {
      await api.patch(`/orders/${selectedOrder.id}/payment`, {
        paymentStatus: editPayment,
      });
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, paymentStatus: editPayment }
            : order
        )
      );
      setOpenEditPayment(false);
      showSnackbar("Status de pagamento atualizado!", "success");
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || "Erro ao atualizar pagamento",
        "error"
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return COLORS.gray600;
      case "IN_PROGRESS":
        return COLORS.orange;
      case "READY":
        return COLORS.success;
      case "DELIVERED":
        return COLORS.gray800;
      default:
        return COLORS.gray600;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <AccessTimeIcon />;
      case "IN_PROGRESS":
        return <BuildIcon />;
      case "READY":
        return <CheckCircleIcon />;
      case "DELIVERED":
        return <ShippingIcon />;
      default:
        return <AccessTimeIcon />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Pendente";
      case "IN_PROGRESS":
        return "Em Produção";
      case "READY":
        return "Pronto";
      case "DELIVERED":
        return "Entregue";
      default:
        return status;
    }
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case "PENDING":
        return COLORS.error;
      case "HALF_PAID":
        return COLORS.warning;
      case "FULLY_PAID":
        return COLORS.success;
      default:
        return COLORS.gray600;
    }
  };

  const getPaymentText = (status) => {
    switch (status) {
      case "PENDING":
        return "Pendente";
      case "HALF_PAID":
        return "50% Pago";
      case "FULLY_PAID":
        return "100% Pago";
      default:
        return status;
    }
  };

  const getProgressValue = (status) => {
    switch (status) {
      case "PENDING":
        return 25;
      case "IN_PROGRESS":
        return 50;
      case "READY":
        return 75;
      case "DELIVERED":
        return 100;
      default:
        return 0;
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const canEditStatus = () => user?.role === "ADMIN" || user?.role === "PRODUCER";
  const canEditPayment = () => user?.role === "ADMIN";
  const canCreateOrder = () => user?.role === "RESELLER" || user?.role === "ADMIN";

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === "" || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.theme.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: COLORS.gray50,
      position: 'relative',
    }}>
      {/* Header Minimalista */}
      <Paper 
        elevation={0}
        sx={{
          background: COLORS.white,
          borderBottom: `1px solid ${COLORS.gray200}`,
          py: 2,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}>
            {/* Logo e Branding */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

            {/* Ações do Usuário */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Notificações">
                <IconButton sx={{ color: COLORS.gray700 }}>
                  <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: COLORS.orange } }}>
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: '8px',
                border: `1px solid ${COLORS.gray200}`,
                background: COLORS.gray50,
              }}>
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    background: COLORS.orange,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
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

              <Tooltip title="Sair">
                <IconButton
                  onClick={logout}
                  sx={{
                    color: COLORS.gray700,
                    border: `1px solid ${COLORS.gray300}`,
                    '&:hover': {
                      background: COLORS.orange50,
                      color: COLORS.orange,
                    },
                  }}
                >
                  <ExitIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Conteúdo Principal */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Título e Ações */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                color: COLORS.black,
                mb: 1,
              }}>
                Dashboard
              </Typography>
              <Typography variant="body1" sx={{ 
                color: COLORS.gray600,
                maxWidth: 600,
              }}>
                Bem-vindo, {user?.name}. Gerencie seus pedidos e acompanhe o progresso em tempo real.
              </Typography>
            </Box>
            
            {canCreateOrder() && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenNewOrder(true)}
                sx={{
                  background: COLORS.orange,
                  color: COLORS.white,
                  '&:hover': {
                    background: COLORS.orangeDark,
                  },
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  minWidth: { xs: '100%', sm: 'auto' },
                }}
              >
                Novo Pedido
              </Button>
            )}
          </Box>

          {/* Barra de Busca */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              mb: 3, 
              background: COLORS.white,
              border: `1px solid ${COLORS.gray200}`,
              borderRadius: '12px',
            }}
          >
            <Box sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flex: 1,
                minWidth: { xs: '100%', sm: 300 },
              }}>
                <SearchIcon sx={{ 
                  color: COLORS.gray500, 
                  mr: 1,
                  fontSize: '1.2rem',
                }} />
                <TextField
                  placeholder="Buscar pedidos por cliente ou tema..."
                  variant="standard"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiInput-underline:before': { borderBottomColor: COLORS.gray300 },
                    '& .MuiInput-underline:hover:before': { borderBottomColor: COLORS.orange },
                    '& .MuiInput-underline:after': { borderBottomColor: COLORS.orange },
                    '& input': {
                      padding: '8px 0',
                      fontSize: '0.95rem',
                    },
                  }}
                />
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                flexWrap: 'wrap',
                flex: 1,
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              }}>
                <Chip
                  icon={<FilterIcon />}
                  label="Filtrar"
                  sx={{ 
                    fontWeight: 500,
                    color: COLORS.gray700,
                    borderColor: COLORS.gray300,
                  }}
                  variant="outlined"
                />
                {["all", "PENDING", "IN_PROGRESS", "READY", "DELIVERED"].map((status) => (
                  <Chip
                    key={status}
                    label={status === "all" ? "Todos" : getStatusText(status)}
                    clickable
                    onClick={() => setFilterStatus(status)}
                    sx={{ 
                      fontWeight: 500,
                      color: filterStatus === status ? COLORS.white : getStatusColor(status),
                      backgroundColor: filterStatus === status ? getStatusColor(status) : 'transparent',
                      border: `1px solid ${filterStatus === status ? getStatusColor(status) : COLORS.gray300}`,
                      '&:hover': {
                        backgroundColor: filterStatus === status ? getStatusColor(status) : alpha(getStatusColor(status), 0.1),
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Cards de Estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: "Pendentes",
              value: stats.pending,
              icon: <AccessTimeIcon />,
              color: COLORS.gray600,
              trend: "+2%",
              description: "Aguardando aprovação",
            },
            {
              title: "Em Produção",
              value: stats.inProgress,
              icon: <BuildIcon />,
              color: COLORS.orange,
              trend: "Ativos",
              description: "Em processo de fabricação",
            },
            {
              title: "Prontos",
              value: stats.ready,
              icon: <CheckCircleIcon />,
              color: COLORS.success,
              trend: "Para retirada",
              description: "Aguardando entrega",
            },
            {
              title: "Entregues",
              value: stats.delivered,
              icon: <ShippingIcon />,
              color: COLORS.black,
              trend: "+15%",
              description: "Concluídos este mês",
            },
          ].map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={metric.title}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: '16px',
                  border: `1px solid ${COLORS.gray200}`,
                  background: COLORS.white,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: metric.color,
                    boxShadow: `0 8px 24px ${alpha(metric.color, 0.12)}`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}>
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: COLORS.gray600,
                          fontWeight: 600,
                          mb: 0.5,
                          fontSize: '0.875rem',
                        }}
                      >
                        {metric.title}
                      </Typography>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 800,
                          color: metric.color,
                          lineHeight: 1,
                          fontSize: '2.5rem',
                        }}
                      >
                        {metric.value}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: alpha(metric.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: metric.color,
                    }}>
                      {metric.icon}
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                    pt: 2,
                    borderTop: `1px solid ${COLORS.gray100}`,
                  }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: COLORS.gray600,
                        fontWeight: 500,
                      }}
                    >
                      {metric.description}
                    </Typography>
                    <Chip
                      label={metric.trend}
                      size="small"
                      sx={{
                        backgroundColor: alpha(metric.color, 0.1),
                        color: metric.color,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Lista de Pedidos */}
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: '16px',
            border: `1px solid ${COLORS.gray200}`,
            background: COLORS.white,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ 
            p: 3, 
            borderBottom: `1px solid ${COLORS.gray100}`,
            background: COLORS.white,
          }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: COLORS.black,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <InventoryIcon />
                Pedidos Recentes
                <Chip 
                  label={filteredOrders.length} 
                  size="small" 
                  sx={{ 
                    background: COLORS.gray100, 
                    color: COLORS.gray700,
                    fontWeight: 600,
                  }}
                />
              </Typography>
              
              <Typography variant="body2" sx={{ 
                color: COLORS.gray600,
                fontWeight: 500,
              }}>
                Mostrando {filteredOrders.length} de {orders.length} pedidos
              </Typography>
            </Box>
          </Box>
          
          {filteredOrders.length === 0 ? (
            <Box sx={{ 
              p: 8, 
              textAlign: 'center',
              background: COLORS.gray50,
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: COLORS.gray200,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}>
                <InventoryIcon sx={{ 
                  fontSize: 40, 
                  color: COLORS.gray400,
                }} />
              </Box>
              <Typography variant="h6" sx={{ 
                color: COLORS.gray700,
                mb: 1,
                fontWeight: 600,
              }}>
                Nenhum pedido encontrado
              </Typography>
              <Typography variant="body2" sx={{ 
                color: COLORS.gray600,
                mb: 3,
                maxWidth: 400,
                mx: 'auto',
              }}>
                {searchTerm || filterStatus !== "all" 
                  ? "Tente alterar os termos de busca ou filtros" 
                  : "Comece criando seu primeiro pedido"}
              </Typography>
              {canCreateOrder() && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenNewOrder(true)}
                  sx={{
                    borderColor: COLORS.orange,
                    color: COLORS.orange,
                    '&:hover': {
                      borderColor: COLORS.orangeDark,
                      background: alpha(COLORS.orange, 0.04),
                    },
                    fontWeight: 600,
                  }}
                >
                  Criar Novo Pedido
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              {filteredOrders.map((order, index) => (
                <Box
                  key={order.id}
                  sx={{
                    p: 3,
                    borderBottom: `1px solid ${COLORS.gray100}`,
                    background: COLORS.white,
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: COLORS.gray50,
                    },
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    {/* Informações do Pedido */}
                    <Grid item xs={12} md={7}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: alpha(getStatusColor(order.status), 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: getStatusColor(order.status),
                          flexShrink: 0,
                        }}>
                          {getStatusIcon(order.status)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            mb: 1,
                            flexWrap: 'wrap',
                          }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 700, 
                                color: COLORS.black,
                              }}
                            >
                              {order.customerName}
                            </Typography>
                            <Chip
                              label={`Meta: ${order.target}`}
                              size="small"
                              sx={{
                                background: COLORS.gray100,
                                color: COLORS.gray700,
                                fontWeight: 500,
                                fontSize: '0.75rem',
                              }}
                            />
                          </Box>
                          
                          <Stack spacing={1}>
                            <Typography variant="body2" sx={{ 
                              color: COLORS.gray700,
                              fontWeight: 500,
                            }}>
                              <Box component="span" sx={{ color: COLORS.gray600 }}>Tema:</Box> {order.theme}
                            </Typography>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 3,
                              flexWrap: 'wrap',
                            }}>
                              <Typography variant="body2" sx={{ 
                                color: COLORS.gray700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}>
                                <Box sx={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: '50%',
                                  background: order.color === 'branco' ? COLORS.white : 
                                             order.color === 'preto' ? COLORS.black : 
                                             order.color === 'vermelho' ? '#f44336' :
                                             order.color === 'azul' ? '#2196f3' : '#795548',
                                  border: order.color === 'branco' ? `1px solid ${COLORS.gray300}` : 'none',
                                }} />
                                {order.color}
                              </Typography>
                              
                              <Typography variant="body2" sx={{ color: COLORS.gray700 }}>
                                <Box component="span" sx={{ color: COLORS.gray600 }}>Revendedor:</Box> {order.reseller?.name}
                              </Typography>
                              
                              <Typography variant="body2" sx={{ 
                                color: COLORS.gray700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}>
                                <AccessTimeIcon sx={{ fontSize: '0.9rem', color: COLORS.gray500 }} />
                                {new Date(order.requestedDate).toLocaleDateString('pt-BR')}
                              </Typography>
                            </Box>
                            
                            {order.notes && (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: COLORS.gray700,
                                  mt: 1,
                                  pl: 2,
                                  borderLeft: `3px solid ${COLORS.orange}`,
                                  background: alpha(COLORS.orange, 0.05),
                                  p: 1,
                                  borderRadius: '4px',
                                }}
                              >
                                <Box component="span" sx={{ 
                                  color: COLORS.gray600,
                                  fontWeight: 500,
                                }}>
                                  Notas:
                                </Box> {order.notes}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Status e Ações */}
                    <Grid item xs={12} md={5}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        alignItems: { xs: 'flex-start', md: 'flex-end' },
                      }}>
                        {/* Status e Pagamento */}
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1.5, 
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          justifyContent: { xs: 'flex-start', md: 'flex-end' },
                        }}>
                          <Chip
                            label={getStatusText(order.status)}
                            sx={{
                              background: alpha(getStatusColor(order.status), 0.1),
                              color: getStatusColor(order.status),
                              fontWeight: 600,
                              fontSize: '0.8rem',
                            }}
                            icon={getStatusIcon(order.status)}
                          />
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1,
                          }}>
                            <Typography variant="caption" sx={{ 
                              color: COLORS.gray600,
                              fontWeight: 500,
                            }}>
                              Pagamento:
                            </Typography>
                            <Chip
                              label={getPaymentText(order.paymentStatus)}
                              size="small"
                              sx={{
                                background: alpha(getPaymentColor(order.paymentStatus), 0.1),
                                color: getPaymentColor(order.paymentStatus),
                                fontWeight: 600,
                                border: `1px solid ${getPaymentColor(order.paymentStatus)}`,
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Barra de Progresso */}
                        <Box sx={{ width: '100%', maxWidth: 300 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}>
                            <Typography variant="caption" sx={{ 
                              color: COLORS.gray600,
                              fontWeight: 500,
                            }}>
                              Progresso
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: getStatusColor(order.status),
                              fontWeight: 700,
                            }}>
                              {getProgressValue(order.status)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={getProgressValue(order.status)}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: COLORS.gray200,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: getStatusColor(order.status),
                              },
                            }}
                          />
                        </Box>

                        {/* Ações */}
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1,
                          mt: 1,
                        }}>
                          {canEditStatus() && (
                            <Tooltip title="Alterar Status">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setEditStatus(order.status);
                                  setOpenEditStatus(true);
                                }}
                                sx={{
                                  border: `1px solid ${COLORS.gray300}`,
                                  color: COLORS.gray700,
                                  '&:hover': {
                                    borderColor: getStatusColor(order.status),
                                    background: alpha(getStatusColor(order.status), 0.1),
                                    color: getStatusColor(order.status),
                                  },
                                }}
                              >
                                <BuildIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {canEditPayment() && (
                            <Tooltip title="Alterar Pagamento">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setEditPayment(order.paymentStatus);
                                  setOpenEditPayment(true);
                                }}
                                sx={{
                                  border: `1px solid ${COLORS.gray300}`,
                                  color: COLORS.gray700,
                                  '&:hover': {
                                    borderColor: getPaymentColor(order.paymentStatus),
                                    background: alpha(getPaymentColor(order.paymentStatus), 0.1),
                                    color: getPaymentColor(order.paymentStatus),
                                  },
                                }}
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Mais opções">
                            <IconButton
                              size="small"
                              sx={{
                                border: `1px solid ${COLORS.gray300}`,
                                color: COLORS.gray700,
                                '&:hover': {
                                  borderColor: COLORS.orange,
                                  color: COLORS.orange,
                                },
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
        </Card>
      </Container>

      {/* Modais (mantidos do código original com ajustes de estilo) */}
      <Dialog
        open={openNewOrder}
        onClose={() => setOpenNewOrder(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1px solid ${COLORS.gray200}`,
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          color: COLORS.black,
          borderBottom: `1px solid ${COLORS.gray200}`,
          pb: 2,
        }}>
          Criar Novo Pedido
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Nome do Cliente"
              fullWidth
              value={newOrder.customerName}
              onChange={(e) =>
                setNewOrder({ ...newOrder, customerName: e.target.value })
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            <TextField
              label="Tema"
              fullWidth
              value={newOrder.theme}
              onChange={(e) =>
                setNewOrder({ ...newOrder, theme: e.target.value })
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Meta</InputLabel>
              <Select
                value={newOrder.target}
                label="Meta"
                onChange={(e) =>
                  setNewOrder({ ...newOrder, target: e.target.value })
                }
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="100k">100k</MenuItem>
                <MenuItem value="200k">200k</MenuItem>
                <MenuItem value="300k">300k</MenuItem>
                <MenuItem value="500k">500k</MenuItem>
                <MenuItem value="1M">1M</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Cor</InputLabel>
              <Select
                value={newOrder.color}
                label="Cor"
                onChange={(e) =>
                  setNewOrder({ ...newOrder, color: e.target.value })
                }
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="branco">Branco</MenuItem>
                <MenuItem value="castanho">Castanho</MenuItem>
                <MenuItem value="preto">Preto</MenuItem>
                <MenuItem value="vermelho">Vermelho</MenuItem>
                <MenuItem value="azul">Azul</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Notas (opcional)"
              fullWidth
              multiline
              rows={3}
              value={newOrder.notes}
              onChange={(e) =>
                setNewOrder({ ...newOrder, notes: e.target.value })
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenNewOrder(false)}
            sx={{
              color: COLORS.gray700,
              border: `1px solid ${COLORS.gray300}`,
              borderRadius: '8px',
              px: 3,
              '&:hover': {
                borderColor: COLORS.gray400,
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            disabled={!newOrder.customerName || !newOrder.theme}
            sx={{
              background: COLORS.orange,
              color: COLORS.white,
              borderRadius: '8px',
              px: 3,
              '&:hover': {
                background: COLORS.orangeDark,
              },
              '&.Mui-disabled': {
                background: COLORS.gray300,
                color: COLORS.gray500,
              },
            }}
          >
            Criar Pedido
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modais de Edição (mantidos do original) */}
      <Dialog
        open={openEditStatus}
        onClose={() => setOpenEditStatus(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1px solid ${COLORS.gray200}`,
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          color: COLORS.black,
          borderBottom: `1px solid ${COLORS.gray200}`,
          pb: 2,
        }}>
          Atualizar Status
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box>
            <FormControl fullWidth>
              <InputLabel>Novo Status</InputLabel>
              <Select
                value={editStatus}
                label="Novo Status"
                onChange={(e) => setEditStatus(e.target.value)}
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="IN_PROGRESS">Em Produção</MenuItem>
                <MenuItem value="READY">Pronto</MenuItem>
                <MenuItem value="DELIVERED">Entregue</MenuItem>
                <MenuItem value="CANCELLED">Cancelado</MenuItem>
              </Select>
            </FormControl>
            {selectedOrder && (
              <Typography variant="body2" sx={{ 
                color: COLORS.gray600,
                mt: 2,
                p: 2,
                background: COLORS.gray50,
                borderRadius: '8px',
              }}>
                Pedido: <strong>{selectedOrder.customerName}</strong> -{" "}
                {selectedOrder.theme}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenEditStatus(false)}
            sx={{
              color: COLORS.gray700,
              border: `1px solid ${COLORS.gray300}`,
              borderRadius: '8px',
              px: 3,
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained"
            sx={{
              background: COLORS.orange,
              color: COLORS.white,
              borderRadius: '8px',
              px: 3,
              '&:hover': {
                background: COLORS.orangeDark,
              },
            }}
          >
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditPayment}
        onClose={() => setOpenEditPayment(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1px solid ${COLORS.gray200}`,
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          color: COLORS.black,
          borderBottom: `1px solid ${COLORS.gray200}`,
          pb: 2,
        }}>
          Atualizar Pagamento
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box>
            <FormControl fullWidth>
              <InputLabel>Status de Pagamento</InputLabel>
              <Select
                value={editPayment}
                label="Status de Pagamento"
                onChange={(e) => setEditPayment(e.target.value)}
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="HALF_PAID">50% Pago</MenuItem>
                <MenuItem value="FULLY_PAID">100% Pago</MenuItem>
                <MenuItem value="NOT_PAID">Não Pago</MenuItem>
              </Select>
            </FormControl>
            {selectedOrder && (
              <Typography variant="body2" sx={{ 
                color: COLORS.gray600,
                mt: 2,
                p: 2,
                background: COLORS.gray50,
                borderRadius: '8px',
              }}>
                Pedido: <strong>{selectedOrder.customerName}</strong>
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenEditPayment(false)}
            sx={{
              color: COLORS.gray700,
              border: `1px solid ${COLORS.gray300}`,
              borderRadius: '8px',
              px: 3,
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdatePayment} 
            variant="contained"
            sx={{
              background: COLORS.orange,
              color: COLORS.white,
              borderRadius: '8px',
              px: 3,
              '&:hover': {
                background: COLORS.orangeDark,
              },
            }}
          >
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: '8px',
            border: `1px solid ${
              snackbar.severity === 'success' ? COLORS.success :
              snackbar.severity === 'error' ? COLORS.error :
              snackbar.severity === 'warning' ? COLORS.warning : COLORS.info
            }20`,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Componente Badge customizado (simples)
const Badge = ({ badgeContent, color, children, sx }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
      {children}
      {badgeContent > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            minWidth: 20,
            height: 20,
            padding: '0 4px',
            borderRadius: '10px',
            backgroundColor: color || COLORS.orange,
            color: COLORS.white,
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${COLORS.white}`,
          }}
        >
          {badgeContent}
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;