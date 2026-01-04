const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Criar pedido (revendedor)
router.post(
  "/",
  authenticate,
  authorize(["RESELLER", "ADMIN"]),
  async (req, res) => {
    try {
      const { customerName, theme, target, color, notes, dueDate } = req.body;

      const order = await prisma.order.create({
        data: {
          customerName,
          theme,
          target,
          color,
          notes,
          dueDate: dueDate ? new Date(dueDate) : null,
          resellerId: req.user.id,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Listar pedidos (com filtros por role)
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, resellerId } = req.query;
    let where = {};

    if (req.user.role === "RESELLER") {
      where.resellerId = req.user.id;
    } else if (req.user.role === "PRODUCER") {
      where.producerId = req.user.id;
    }

    if (status) where.status = status;
    if (resellerId) where.resellerId = resellerId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        reseller: {
          select: { name: true, email: true },
        },
        producer: {
          select: { name: true, email: true },
        },
      },
      orderBy: {
        requestedDate: "asc", // Ordem de chegada
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar status (admin/producer)
router.patch(
  "/:id/status",
  authenticate,
  authorize(["ADMIN", "PRODUCER"]),
  async (req, res) => {
    try {
      const { status } = req.body;

      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          status,
          ...(status === "READY" && { completedDate: new Date() }),
          ...(req.user.role === "PRODUCER" && { producerId: req.user.id }),
        },
      });

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Atualizar status de pagamento (admin)
router.patch(
  "/:id/payment",
  authenticate,
  authorize(["ADMIN"]),
  async (req, res) => {
    try {
      const { paymentStatus } = req.body;

      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: { paymentStatus },
      });

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
