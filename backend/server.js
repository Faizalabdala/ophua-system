const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database: "SQLite",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Credenciais inválidas" });

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
    res.status(500).json({ error: "Erro interno" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Token necessário" });

    jwt.verify(token, process.env.JWT_SECRET);

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

// ATUALIZAR STATUS (Admin/Producer)
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Token necessário" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar permissão
    if (decoded.role !== "ADMIN" && decoded.role !== "PRODUCER") {
      return res.status(403).json({
        error: "Acesso negado. Apenas ADMIN ou PRODUCER pode mudar status",
      });
    }

    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === "READY" && { completedDate: new Date() }),
        ...(decoded.role === "PRODUCER" && { producerId: decoded.userId }),
      },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ATUALIZAR PAGAMENTO (Apenas Admin)
app.patch("/api/orders/:id/payment", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Token necessário" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Apenas Admin pode mudar pagamento
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({
        error: "Acesso negado. Apenas ADMIN pode atualizar pagamento",
      });
    }

    const { paymentStatus } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { paymentStatus },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ========== ROTAS QUE FALTAM ==========

// CRIAR PEDIDO (Revendedor ou Admin)
app.post("/api/orders", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Token necessário" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Apenas RESELLER ou ADMIN pode criar pedidos
    if (decoded.role !== "RESELLER" && decoded.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Apenas revendedores podem criar pedidos" });
    }

    const { customerName, theme, target, color, notes } = req.body;

    // Validação básica
    if (!customerName || !theme || !target || !color) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios" });
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        theme,
        target,
        color,
        notes: notes || null,
        status: "PENDING",
        resellerId: decoded.userId,
      },
      include: {
        reseller: { select: { name: true } },
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ error: "Erro interno ao criar pedido" });
  }
});

// ATUALIZAR STATUS (Admin ou Producer)
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Token necessário" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Apenas ADMIN ou PRODUCER pode mudar status
    if (decoded.role !== "ADMIN" && decoded.role !== "PRODUCER") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { status } = req.body;

    // Validar status
    const validStatuses = [
      "PENDING",
      "IN_PROGRESS",
      "READY",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === "READY" && { completedDate: new Date() }),
        ...(decoded.role === "PRODUCER" && { producerId: decoded.userId }),
      },
      include: {
        reseller: { select: { name: true } },
        producer: { select: { name: true } },
      },
    });

    res.json(order);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    res.status(500).json({ error: "Erro interno ao atualizar status" });
  }
});

// ATUALIZAR PAGAMENTO (Apenas Admin) - SE PRECISARES
app.patch("/api/orders/:id/payment", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Token necessário" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Apenas ADMIN pode mudar pagamento
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { paymentStatus } = req.body;

    const validStatuses = ["PENDING", "HALF_PAID", "FULLY_PAID", "NOT_PAID"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: "Status de pagamento inválido" });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { paymentStatus },
    });

    res.json(order);
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// ========== FIM DAS NOVAS ROTAS ==========
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Servidor Ophua rodando na porta " + PORT);
});
