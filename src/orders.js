const express = require("express");
const { z } = require("zod");
const { query } = require("./db");

const router = express.Router();

const CREATE_SCHEMA = z.object({
    item: z.string().min(1).max(100),
    amount: z.number().int().positive(),
});

// Create order (authenticated)
router.post("/", async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const parsed = CREATE_SCHEMA.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Bad request" });

    const r = await query(
        "INSERT INTO orders (user_id, item, amount) VALUES ($1,$2,$3) RETURNING id, user_id, item, amount, created_at",
        [user.id, parsed.data.item, parsed.data.amount]
    );

    res.status(201).json({ order: r.rows[0] });
});

// List orders
router.get("/", async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    if (user.role === "admin") {
        const r = await query("SELECT * FROM orders ORDER BY id");
        return res.json({ orders: r.rows });
    }

    const r = await query("SELECT * FROM orders WHERE user_id=$1 ORDER BY id", [
        user.id,
    ]);
    res.json({ orders: r.rows });
});

// Get order by id (SECURE)
router.get("/:id", async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Bad request" });
    }

    const r = await query("SELECT * FROM orders WHERE id=$1", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });

    const order = r.rows[0];

    if (user.role !== "admin" && order.user_id !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ order });
});

module.exports = { ordersRouter: router };
