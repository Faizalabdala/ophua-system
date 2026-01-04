const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
};

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database: "SQLite",
    timestamp: new Date().toISOString(),
  });
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
app.get("/api/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar utilizadores" });
  }
});
app.post("/api/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    // Validação
    if (!email || !password || !name || !role) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios" });
    }

    const validRoles = ["ADMIN", "RESELLER", "PRODUCER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Perfil inválido" });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já registado" });
    }

    // Hash da password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        phone: phone || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar utilizador" });
  }
});

// ATUALIZAR UTILIZADOR (Admin only)
app.patch("/api/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, role, phone, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(phone !== undefined && { phone }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
      },
    });

    res.json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Utilizador não encontrado" });
    }
    res.status(500).json({ error: "Erro ao atualizar utilizador" });
  }
});

// ALTERAR PASSWORD (próprio utilizador ou admin)
app.patch("/api/users/:id/password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verificar permissões
    const isSelf = req.user.id === req.params.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Não tem permissão para alterar esta password" });
    }

    // Se não for admin e estiver a alterar própria password, verificar password atual
    if (isSelf && !isAdmin) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user)
        return res.status(404).json({ error: "Utilizador não encontrado" });

      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!validPassword) {
        return res.status(401).json({ error: "Password atual incorreta" });
      }
    }

    // Validar nova password
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "A nova password deve ter pelo menos 6 caracteres" });
    }

    // Hash da nova password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password alterada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao alterar password" });
  }
});

// PERFIL DO UTILIZADOR ATUAL
app.get("/api/profile", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter perfil" });
  }
});

// ATUALIZAR PERFIL (próprio utilizador)
app.patch("/api/profile", authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
});

// LISTAR PEDIDOS
app.get("/api/orders", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Token necessário" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const orders = await prisma.order.findMany({
      include: {
        reseller: { select: { name: true } },
        producer: { select: { name: true } },
      },
      orderBy: { requestedDate: "asc" },
    });

    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// ESTATÍSTICAS
app.get("/api/orders/stats", async (req, res) => {
  try {
    const stats = {
      pending: await prisma.order.count({ where: { status: "PENDING" } }),
      inProgress: await prisma.order.count({
        where: { status: "IN_PROGRESS" },
      }),
      ready: await prisma.order.count({ where: { status: "READY" } }),
      delivered: await prisma.order.count({ where: { status: "DELIVERED" } }),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("🚀 Servidor Ophua rodando na porta " + PORT);
  console.log("📊 Banco de dados: SQLite (ophua.db)");
  console.log("🔗 Health check: http://localhost:" + PORT + "/health");
  console.log("🔐 Login: admin@ophua.com / admin123");
});
