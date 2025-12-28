require("dotenv").config();
const express = require("express");
const pinoHttp = require("pino-http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { adminRouter } = require("./admin");
const { requireRole } = require("./rbac");

const { logger } = require("./logger");
const { pool } = require("./db");
const { router } = require("./routes");
const { login, logout, me, requireAuth } = require("./auth");
const { ordersRouter } = require("./orders");

const app = express();

// Correlation-ID: proxy’den geleni al; yoksa üret
app.use((req, res, next) => {
    const incoming = req.header("X-Correlation-ID");
    req.correlationId =
        incoming || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    res.setHeader("X-Correlation-ID", req.correlationId);
    next();
});

// Security headers
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

// JSON request logs
app.use(
    pinoHttp({
        logger,
        customProps: (req) => ({
            correlationId: req.correlationId,
            user: req.session?.user?.username || null,
            role: req.session?.user?.role || null,
        }),
    })
);

app.use(express.json());

// Session store (Postgres)
app.set("trust proxy", 1);
app.use(
    session({
        name: "sid",
        secret: process.env.SESSION_SECRET || "dev-secret-change-me",
        resave: false,
        saveUninitialized: false,
        store: new PgSession({
            pool,
            tableName: "session",
            createTableIfMissing: false,
        }),
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: "auto",
            maxAge: 1000 * 60 * 60 * 8,
        },
        proxy: true,
    })
);

// Rate limit only for login
const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth routes
app.use("/admin", requireRole(["admin"]), adminRouter);
app.post("/auth/login", loginLimiter, (req, res, next) => {
    Promise.resolve(login(req, res)).catch(next);
});
app.post("/auth/logout", (req, res) => logout(req, res));
app.get("/me", requireAuth, (req, res) => me(req, res));

app.use("/orders", ordersRouter);

// Existing routes
app.use(router);

// Error handler (no stack leak)
app.use((err, req, res, _next) => {
    logger.error({ err, correlationId: req.correlationId }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
    logger.info({ port }, "app-a started");
});
