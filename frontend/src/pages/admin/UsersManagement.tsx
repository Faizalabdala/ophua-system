// frontend/src/pages/admin/UsersManagement.tsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Chip,
  Alert,
  Box,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  LockReset as LockResetIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import api from "../../services/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "RESELLER",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    if (form.password.length < 6) {
      setError("A password deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      if (selectedUser) {
        // Atualizar
        await api.patch(`/users/${selectedUser.id}`, {
          name: form.name,
          role: form.role,
          phone: form.phone,
        });
        setSuccess("Utilizador atualizado com sucesso");
      } else {
        // Criar novo
        await api.post("/users", form);
        setSuccess("Utilizador criado com sucesso");
      }

      loadUsers();
      handleCloseDialog();
    } catch (error: any) {
      setError(error.response?.data?.error || "Erro ao salvar utilizador");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("As passwords não coincidem");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("A password deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/users/${selectedUser?.id}/password`, {
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Password alterada com sucesso");
      setOpenPasswordDialog(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      setError(error.response?.data?.error || "Erro ao alterar password");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "", // Não preencher password existente
      role: user.role,
      phone: user.phone || "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setForm({ name: "", email: "", password: "", role: "RESELLER", phone: "" });
    setError("");
    setSuccess("");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "primary";
      case "RESELLER":
        return "secondary";
      case "PRODUCER":
        return "info";
      default:
        return "default";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "RESELLER":
        return "Revendedor";
      case "PRODUCER":
        return "Produtor";
      default:
        return role;
    }
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
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#1a237e" }}
          >
            <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Gestão de Utilizadores
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ bgcolor: "#ff6f00", "&:hover": { bgcolor: "#e65100" } }}
          >
            Novo Utilizador
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Último Login</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? "Ativo" : "Inativo"}
                      color={user.isActive ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString("pt-PT")
                      : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Alterar Password">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenPasswordDialog(true);
                        }}
                      >
                        <LockResetIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog Criar/Editar Utilizador */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? "Editar Utilizador" : "Novo Utilizador"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Nome Completo"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={!!selectedUser} // Não permitir alterar email
            />
            {!selectedUser && (
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                helperText="Mínimo 6 caracteres"
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Perfil</InputLabel>
              <Select
                value={form.role}
                label="Perfil"
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <MenuItem value="RESELLER">Revendedor</MenuItem>
                <MenuItem value="PRODUCER">Produtor</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Telefone (opcional)"
              fullWidth
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? "A guardar..." : selectedUser ? "Atualizar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Alterar Password */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Alterar Password de {selectedUser?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Nova Password"
              type="password"
              fullWidth
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              required
            />
            <TextField
              label="Confirmar Nova Password"
              type="password"
              fullWidth
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={loading}
          >
            {loading ? "A alterar..." : "Alterar Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersManagement;
