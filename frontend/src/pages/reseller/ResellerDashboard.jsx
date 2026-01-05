// src/pages/reseller/ResellerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Divider,
  Grid,
  Chip,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// Cores da paleta
const COLORS = {
  primary: '#000000',
  secondary: '#FF6B35',
  accent: '#4A4A4A',
  light: '#F5F5F5',
  white: '#FFFFFF',
  darkGray: '#1A1A1A',
  mediumGray: '#666666',
  success: '#4CAF50',
};

const ResellerDashboard = () => {
  const { user, logout, isRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    ready: 0,
    delivered: 0,
  });

  const [openNewOrder, setOpenNewOrder] = useState(false);
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

  useEffect(() => {
    if (isRole('RESELLER')) {
      loadData();
    } else {
      // Redirecionar se não for revendedor
      window.location.href = '/login';
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return COLORS.mediumGray;
      case "IN_PROGRESS":
        return COLORS.secondary;
      case "READY":
        return COLORS.success;
      case "DELIVERED":
        return COLORS.accent;
      default:
        return COLORS.mediumGray;
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

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.light }}>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 6 }}>
        {/* Header */}
        <Paper
          elevation={8}
          sx={{
            mb: 4,
            borderRadius: 3,
            background: COLORS.white,
            border: `2px solid ${COLORS.primary}`,
          }}
        >
          <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary }}>
                REVENDEDOR - {user?.name}
              </Typography>
              <Typography variant="body2" color={COLORS.mediumGray}>
                Sistema de Registro de Pedidos
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={logout}
              startIcon={<LogoutIcon />}
              sx={{
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                '&:hover': { backgroundColor: COLORS.darkGray },
              }}
            >
              Sair
            </Button>
          </Box>
        </Paper>

        {/* Cards de estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: "Pendentes", value: stats.pending, icon: <AccessTimeIcon />, color: COLORS.mediumGray },
            { label: "Em Produção", value: stats.inProgress, icon: <PersonIcon />, color: COLORS.secondary },
            { label: "Prontos", value: stats.ready, icon: <ShoppingCartIcon />, color: COLORS.success },
            { label: "Entregues", value: stats.delivered, icon: <PersonIcon />, color: COLORS.accent },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ borderRadius: 3, border: `2px solid ${COLORS.primary}`, backgroundColor: COLORS.white }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: stat.color }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h2" sx={{ color: stat.color, fontWeight: 800, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color={COLORS.mediumGray}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Seção de pedidos */}
        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            background: COLORS.white,
            border: `2px solid ${COLORS.primary}`,
            mb: 3,
          }}
        >
          <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary }}>
              Meus Pedidos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewOrder(true)}
              sx={{
                backgroundColor: COLORS.secondary,
                color: COLORS.white,
                '&:hover': { backgroundColor: `${COLORS.secondary}CC` },
              }}
            >
              Novo Pedido
            </Button>
          </Box>
        </Paper>

        {/* Lista de pedidos */}
        {orders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color={COLORS.mediumGray}>
              Nenhum pedido registrado
            </Typography>
            <Typography variant="body2" color={COLORS.mediumGray} sx={{ mt: 1 }}>
              Clique em "Novo Pedido" para começar
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => (
              <Card key={order.id} sx={{ borderRadius: 2, border: `1px solid ${COLORS.light}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                        {order.customerName}
                      </Typography>
                      <Typography variant="body2" color={COLORS.mediumGray}>
                        <strong>Tema:</strong> {order.theme} • <strong>Meta:</strong> {order.target} • <strong>Cor:</strong> {order.color}
                      </Typography>
                      {order.notes && (
                        <Typography variant="body2" color={COLORS.mediumGray} sx={{ mt: 1, fontStyle: 'italic' }}>
                          <strong>Notas:</strong> {order.notes}
                        </Typography>
                      )}
                      <Typography variant="caption" color={COLORS.mediumGray} sx={{ display: 'block', mt: 1 }}>
                        <strong>Solicitado:</strong> {new Date(order.requestedDate).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Chip
                          label={getStatusText(order.status)}
                          sx={{
                            backgroundColor: getStatusColor(order.status),
                            color: COLORS.white,
                            fontWeight: 500,
                            mb: 1,
                          }}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={getProgressValue(order.status)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: COLORS.light,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor: getStatusColor(order.status),
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {/* Modal Novo Pedido */}
        <Dialog
          open={openNewOrder}
          onClose={() => setOpenNewOrder(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, border: `2px solid ${COLORS.primary}` } }}
        >
          <DialogTitle sx={{ backgroundColor: COLORS.primary, color: COLORS.white, fontWeight: 600 }}>
            Novo Pedido
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Nome do Cliente"
                fullWidth
                value={newOrder.customerName}
                onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
              />
              <TextField
                label="Tema"
                fullWidth
                value={newOrder.theme}
                onChange={(e) => setNewOrder({ ...newOrder, theme: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Meta</InputLabel>
                <Select
                  value={newOrder.target}
                  label="Meta"
                  onChange={(e) => setNewOrder({ ...newOrder, target: e.target.value })}
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
                  onChange={(e) => setNewOrder({ ...newOrder, color: e.target.value })}
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
                onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenNewOrder(false)}>Cancelar</Button>
            <Button
              onClick={handleCreateOrder}
              variant="contained"
              disabled={!newOrder.customerName || !newOrder.theme}
              sx={{ backgroundColor: COLORS.secondary, color: COLORS.white }}
            >
              Criar Pedido
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ResellerDashboard;