const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// ========== MIDDLEWARES ==========
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // Adicione 5173,
    credentials: true,
  })
);
app.use(express.json());

// ========== VERIFICAÇÃO DE CONEXÃO COM BANCO ==========
prisma.$connect()
  .then(() => {
    console.log("✅ Conectado ao PostgreSQL com Prisma");
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar ao PostgreSQL:", error);
  });

// ========== MIDDLEWARE DE AUTENTICAÇÃO ==========
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "Token de autenticação necessário" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erro de autenticação:", error);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};


// ========== MIDDLEWARE PARA ADMIN ==========
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
};

// ========== FUNÇÃO HELPER PARA NOTIFICAÇÕES ==========
const createNotification = async (
  userId,
  type,
  title,
  message,
  metadata = {}
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: JSON.stringify(metadata),
      },
    });

    console.log(`📢 Notificação criada: ${title} para usuário ${userId}`);
    return notification;
  } catch (error) {
    console.error("❌ Erro ao criar notificação:", error);
    return null;
  }
};

// ========== ROTAS PÚBLICAS ==========
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database: "PostgreSQL",
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

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

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

// ========== ROTAS DE NOTIFICAÇÕES ==========

// 1. Listar notificações do usuário
app.get("/api/notifications", authenticate, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.notification.count({
        where: { userId: req.user.userId },
      }),
      prisma.notification.count({
        where: {
          userId: req.user.userId,
          isRead: false,
        },
      }),
    ]);

    res.json({
      notifications: notifications.map((n) => ({
        ...n,
        metadata: n.metadata ? JSON.parse(n.metadata) : null,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    res.status(500).json({ error: "Erro ao buscar notificações" });
  }
});

// 2. Contador de não lidas
app.get("/api/notifications/unread-count", authenticate, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.userId,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Erro ao contar notificações" });
  }
});

// 3. Marcar como lida
app.patch("/api/notifications/:id/read", authenticate, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
      data: { isRead: true },
    });

    res.json({
      ...notification,
      metadata: notification.metadata
        ? JSON.parse(notification.metadata)
        : null,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Notificação não encontrada" });
    }
    res.status(500).json({ error: "Erro ao atualizar notificação" });
  }
});

// 4. Marcar TODAS como lidas
app.patch("/api/notifications/read-all", authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: "Todas notificações marcadas como lidas" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar notificações" });
  }
});

// 5. Excluir notificação
app.delete("/api/notifications/:id", authenticate, async (req, res) => {
  try {
    await prisma.notification.delete({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    res.json({ message: "Notificação excluída" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Notificação não encontrada" });
    }
    res.status(500).json({ error: "Erro ao excluir notificação" });
  }
});

// 6. Excluir TODAS as notificações
app.delete("/api/notifications", authenticate, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.userId },
    });

    res.json({ message: "Todas notificações excluídas" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir notificações" });
  }
});

// ========== ROTAS DE USUÁRIOS (ADMIN ONLY) ==========
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
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Erro ao listar utilizadores" });
  }
});

app.post("/api/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    if (!email || !password || !name || !role) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios" });
    }

    const validRoles = ["ADMIN", "RESELLER", "PRODUCER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Perfil inválido" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já registado" });
    }

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
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar utilizador" });
  }
});

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
    console.error("Erro ao atualizar usuário:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Utilizador não encontrado" });
    }
    res.status(500).json({ error: "Erro ao atualizar utilizador" });
  }
});

// ========== ROTAS DE PERFIL ==========
app.get("/api/profile", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
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

    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao obter perfil:", error);
    res.status(500).json({ error: "Erro ao obter perfil" });
  }
});

app.patch("/api/profile", authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
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
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
});

// ========== ALTERAR PASSWORD ==========
app.patch("/api/users/:id/password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const isSelf = req.user.userId === req.params.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Não tem permissão para alterar esta password" });
    }

    if (isSelf && !isAdmin) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

      if (!user) {
        return res.status(404).json({ error: "Utilizador não encontrado" });
      }

      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!validPassword) {
        return res.status(401).json({ error: "Password atual incorreta" });
      }
    }

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "A nova password deve ter pelo menos 6 caracteres" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password alterada com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar password:", error);
    res.status(500).json({ error: "Erro ao alterar password" });
  }
});

// ========== ROTAS DE PEDIDOS ==========
app.get("/api/orders", authenticate, async (req, res) => {
  try {
    let orders;

    if (req.user.role === "RESELLER") {
      orders = await prisma.order.findMany({
        where: { resellerId: req.user.userId },
        include: {
          reseller: { select: { name: true } },
          producer: { select: { name: true } },
        },
        orderBy: { requestedDate: "desc" },
      });
    } else {
      orders = await prisma.order.findMany({
        include: {
          reseller: { select: { name: true } },
          producer: { select: { name: true } },
        },
        orderBy: { requestedDate: "desc" },
      });
    }

    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

app.post("/api/orders", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "RESELLER" && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Apenas revendedores podem criar pedidos" });
    }

    const { customerName, theme, target, color, notes } = req.body;

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
        paymentStatus: "PENDING",
        resellerId: req.user.userId,
        requestedDate: new Date(),
      },
      include: {
        reseller: { select: { name: true } },
      },
    });

    // 📢 NOTIFICAÇÃO para ADMINISTRADORES
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isActive: true },
      select: { id: true, name: true },
    });

    for (const admin of admins) {
      await createNotification(
        admin.id,
        "ORDER_CREATED",
        "📦 Novo Pedido Criado",
        `Pedido #${order.id} - ${customerName} criado por ${
          req.user.name || "Usuário"
        }`,
        {
          orderId: order.id,
          customerName,
          createdBy: req.user.name,
          timestamp: new Date().toISOString(),
        }
      );
    }

    // 📢 NOTIFICAÇÃO para o próprio usuário
    await createNotification(
      req.user.userId,
      "ORDER_CREATED",
      "✅ Pedido Registrado",
      `Seu pedido #${order.id} foi criado com sucesso!`,
      { orderId: order.id, customerName }
    );

    res.status(201).json(order);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ error: "Erro interno ao criar pedido" });
  }
});

// Status - APENAS UMA VEZ!
app.patch("/api/orders/:id/status", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "PRODUCER") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { status } = req.body;

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

    // Buscar pedido atual para notificar
    const currentOrder = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        reseller: { select: { id: true, name: true, email: true } },
      },
    });

    if (!currentOrder) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    const updateData = {
      status,
      ...(status === "READY" && { completedDate: new Date() }),
    };

    if (req.user.role === "PRODUCER") {
      updateData.producerId = req.user.userId;
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        reseller: { select: { name: true } },
        producer: { select: { name: true } },
      },
    });

    // 📢 NOTIFICAÇÃO para o REVENDEDOR
    await createNotification(
      currentOrder.resellerId,
      "STATUS_CHANGED",
      "🔄 Status Atualizado",
      `Pedido #${order.id} - ${order.customerName} agora está "${order.status}"`,
      {
        orderId: order.id,
        status: order.status,
        changedBy: req.user.name || "Sistema",
        customerName: order.customerName,
      }
    );

    // 📢 NOTIFICAÇÃO para PRODUTORES (se status for "IN_PROGRESS")
    if (order.status === "IN_PROGRESS") {
      const producers = await prisma.user.findMany({
        where: { role: "PRODUCER", isActive: true },
        select: { id: true },
      });

      for (const producer of producers) {
        if (producer.id !== req.user.userId) {
          // Não notificar a si mesmo
          await createNotification(
            producer.id,
            "ORDER_ASSIGNED",
            "🔧 Pedido em Produção",
            `Pedido #${order.id} - ${order.customerName} está em produção`,
            { orderId: order.id, customerName: order.customerName }
          );
        }
      }
    }

    // 📢 NOTIFICAÇÃO para ADMINISTRADORES
    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", isActive: true },
        select: { id: true },
      });

      for (const admin of admins) {
        await createNotification(
          admin.id,
          "ORDER_UPDATED",
          `📦 Pedido ${
            order.status === "DELIVERED" ? "Entregue" : "Cancelado"
          }`,
          `Pedido #${order.id} - ${order.customerName} foi ${
            order.status === "DELIVERED" ? "entregue" : "cancelado"
          }`,
          {
            orderId: order.id,
            status: order.status,
            customerName: order.customerName,
          }
        );
      }
    }

    res.json(order);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    res.status(500).json({ error: "Erro interno ao atualizar status" });
  }
});

app.patch("/api/orders/:id/payment", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const { paymentStatus } = req.body;

    const validStatuses = ["PENDING", "HALF_PAID", "FULLY_PAID", "NOT_PAID"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: "Status de pagamento inválido" });
    }

    // Buscar pedido para notificar
    const currentOrder = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        reseller: { select: { id: true, name: true } },
      },
    });

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { paymentStatus },
    });

    // 📢 NOTIFICAÇÃO para o REVENDEDOR
    if (currentOrder) {
      await createNotification(
        currentOrder.resellerId,
        "PAYMENT_UPDATED",
        "💰 Pagamento Atualizado",
        `Pagamento do pedido #${order.id} - ${order.customerName} atualizado para "${paymentStatus}"`,
        {
          orderId: order.id,
          paymentStatus,
          customerName: order.customerName,
          updatedBy: req.user.name,
        }
      );
    }

    res.json(order);
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

app.get("/api/orders/stats", authenticate, async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role === "RESELLER") {
      whereClause = { resellerId: req.user.userId };
    }

    const stats = {
      pending: await prisma.order.count({
        where: { ...whereClause, status: "PENDING" },
      }),
      inProgress: await prisma.order.count({
        where: { ...whereClause, status: "IN_PROGRESS" },
      }),
      ready: await prisma.order.count({
        where: { ...whereClause, status: "READY" },
      }),
      delivered: await prisma.order.count({
        where: { ...whereClause, status: "DELIVERED" },
      }),
    };
    res.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ROTA PARA TESTAR NOTIFICAÇÕES ==========
app.post("/api/notifications/test", authenticate, async (req, res) => {
  try {
    const { title, message, type = "SYSTEM" } = req.body;

    const notification = await createNotification(
      req.user.userId,
      type,
      title || "Teste de Notificação",
      message || "Esta é uma notificação de teste do sistema.",
      { test: true, timestamp: new Date().toISOString() }
    );

    res.json({
      success: true,
      message: "Notificação de teste criada",
      notification,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar notificação de teste" });
  }
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("🚀 Servidor Ophua rodando na porta " + PORT);
  console.log("📊 Banco de dados: PostgreSQL");  
  console.log("🔗 Health check: http://localhost:" + PORT + "/health");
  console.log("🔔 Sistema de notificações ativo");
  console.log("📱 Rotas de notificações disponíveis");
});
