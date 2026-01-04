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
  IconButton,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/Payment";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface Order {
  id: string;
  customerName: string;
  theme: string;
  target: string;
  color: string;
  notes?: string;
  status: string;
  paymentStatus: string;
  requestedDate: string;
  reseller: { name: string; id: string };
  producer?: { name: string };
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    ready: 0,
    delivered: 0,
  });

  // Estados para modais e ações
  const [openNewOrder, setOpenNewOrder] = useState(false);
  const [openEditStatus, setOpenEditStatus] = useState(false);
  const [openEditPayment, setOpenEditPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Formulário novo pedido
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    theme: "",
    target: "200k",
    color: "branco",
    notes: "",
  });

  // Formulário editar status
  const [editStatus, setEditStatus] = useState("PENDING");
  const [editPayment, setEditPayment] = useState("PENDING");

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

  // ========== FUNÇÕES DE FORMULÁRIO ==========
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
      loadData(); // Recarrega estatísticas
    } catch (error: any) {
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
      loadData(); // Recarrega estatísticas
    } catch (error: any) {
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
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.error || "Erro ao atualizar pagamento",
        "error"
      );
    }
  };

  // ========== FUNÇÕES AUXILIARES ==========
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "default"; // Cinza
      case "IN_PROGRESS":
        return "primary"; // Preto
      case "READY":
        return "success"; // Verde (mantém para visibilidade)
      case "DELIVERED":
        return "default"; // Cinza
      default:
        return "default";
    }
  };

  const getPaymentText = (status: string) => {
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

  const getProgressValue = (status: string) => {
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

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const canEditStatus = () => {
    return user?.role === "ADMIN" || user?.role === "PRODUCER";
  };

  const canEditPayment = () => {
    return user?.role === "ADMIN";
  };

  const canCreateOrder = () => {
    return user?.role === "RESELLER" || user?.role === "ADMIN";
  };

  // ========== RENDER ==========
  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      {/* Cabeçalho */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            Dashboard Ophua
          </Typography>
          <Typography color="textSecondary">
            Bem-vindo, {user?.name} ({user?.role})
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {canCreateOrder() && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewOrder(true)}
            >
              Novo Pedido
            </Button>
          )}
          <Button variant="outlined" onClick={logout}>
            Sair
          </Button>
        </Box>
      </Box>

      {/* Estatísticas */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
          "& > *": { flex: "1 1 200px" },
        }}
      >
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Pendentes
            </Typography>
            <Typography
              variant="h4"
              sx={{ color: "#666666", fontWeight: "bold" }}
            >
              {stats.pending}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Em Produção
            </Typography>
            <Typography
              variant="h4"
              sx={{ color: "#000000", fontWeight: "bold" }}
            >
              {stats.inProgress}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Prontos
            </Typography>
            <Typography
              variant="h4"
              sx={{ color: "#4caf50", fontWeight: "bold" }}
            >
              {stats.ready}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Entregues
            </Typography>
            <Typography
              variant="h4"
              sx={{ color: "#9e9e9e", fontWeight: "bold" }}
            >
              {stats.delivered}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Pedidos */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
          Pedidos Recentes
        </Typography>

        {orders.length === 0 ? (
          <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
            Nenhum pedido encontrado
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {orders.map((order) => (
              <Card key={order.id} variant="outlined">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {order.customerName}
                      </Typography>
                      <Typography
                        color="textSecondary"
                        variant="body2"
                        gutterBottom
                      >
                        <strong>Tema:</strong> {order.theme} |{" "}
                        <strong>Meta:</strong> {order.target} |{" "}
                        <strong>Cor:</strong> {order.color}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Revendedor:</strong> {order.reseller.name} |{" "}
                        <strong>Data:</strong>{" "}
                        {new Date(order.requestedDate).toLocaleDateString(
                          "pt-BR"
                        )}
                        {order.notes && (
                          <>
                            <br />
                            <strong>Notas:</strong> {order.notes}
                          </>
                        )}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status) as any}
                          size="medium"
                        />
                        <Chip
                          label={getPaymentText(order.paymentStatus)}
                          variant="outlined"
                          size="small"
                          color={
                            order.paymentStatus === "FULLY_PAID"
                              ? "success"
                              : "default"
                          }
                        />
                      </Box>

                      {/* Botões de ação */}
                      <Stack direction="row" spacing={1}>
                        {canEditStatus() && (
                          <Button
                            size="small"
                            startIcon={<BuildIcon />}
                            variant="outlined"
                            onClick={() => {
                              setSelectedOrder(order);
                              setEditStatus(order.status);
                              setOpenEditStatus(true);
                            }}
                          >
                            Status
                          </Button>
                        )}

                        {canEditPayment() && (
                          <Button
                            size="small"
                            startIcon={<PaymentIcon />}
                            variant="outlined"
                            onClick={() => {
                              setSelectedOrder(order);
                              setEditPayment(order.paymentStatus);
                              setOpenEditPayment(true);
                            }}
                          >
                            Pagamento
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Box>

                  {/* Barra de progresso */}
                  <LinearProgress
                    variant="determinate"
                    value={getProgressValue(order.status)}
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* ========== MODAIS ========== */}

      {/* Modal: Novo Pedido */}
      <Dialog
        open={openNewOrder}
        onClose={() => setOpenNewOrder(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Criar Novo Pedido</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Nome do Cliente"
              fullWidth
              value={newOrder.customerName}
              onChange={(e) =>
                setNewOrder({ ...newOrder, customerName: e.target.value })
              }
            />
            <TextField
              label="Tema"
              fullWidth
              value={newOrder.theme}
              onChange={(e) =>
                setNewOrder({ ...newOrder, theme: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Meta</InputLabel>
              <Select
                value={newOrder.target}
                label="Meta"
                onChange={(e) =>
                  setNewOrder({ ...newOrder, target: e.target.value })
                }
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
              rows={2}
              value={newOrder.notes}
              onChange={(e) =>
                setNewOrder({ ...newOrder, notes: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewOrder(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            disabled={!newOrder.customerName || !newOrder.theme}
          >
            Criar Pedido
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Editar Status */}
      <Dialog
        open={openEditStatus}
        onClose={() => setOpenEditStatus(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Atualizar Status do Pedido</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Novo Status</InputLabel>
              <Select
                value={editStatus}
                label="Novo Status"
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="IN_PROGRESS">Em Produção</MenuItem>
                <MenuItem value="READY">Pronto</MenuItem>
                <MenuItem value="DELIVERED">Entregue</MenuItem>
                <MenuItem value="CANCELLED">Cancelado</MenuItem>
              </Select>
            </FormControl>
            {selectedOrder && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Pedido: <strong>{selectedOrder.customerName}</strong> -{" "}
                {selectedOrder.theme}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditStatus(false)}>Cancelar</Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Editar Pagamento */}
      <Dialog
        open={openEditPayment}
        onClose={() => setOpenEditPayment(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Atualizar Status de Pagamento</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status de Pagamento</InputLabel>
              <Select
                value={editPayment}
                label="Status de Pagamento"
                onChange={(e) => setEditPayment(e.target.value)}
              >
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="HALF_PAID">50% Pago</MenuItem>
                <MenuItem value="FULLY_PAID">100% Pago</MenuItem>
                <MenuItem value="NOT_PAID">Não Pago</MenuItem>
              </Select>
            </FormControl>
            {selectedOrder && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Pedido: <strong>{selectedOrder.customerName}</strong>
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditPayment(false)}>Cancelar</Button>
          <Button onClick={handleUpdatePayment} variant="contained">
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
