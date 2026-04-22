require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const passport = require("passport");

const connectDatabase = require("./config/database");
const configurePassport = require("./config/passport");
const authRoutes = require("./modules/auth/routes/auth.routes");
const paymentRoutes = require("./modules/payment/routes/payment.routes");
const { errorHandler } = require("./utils/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

configurePassport();
app.use(passport.initialize());

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/payments", paymentRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot find ${req.originalUrl}`,
    });
});

app.use(errorHandler);

process.on("uncaughtException", (error) => {
    console.error("UNCAUGHT EXCEPTION:", error);
    process.exit(1);
});

process.on("unhandledRejection", (error) => {
    console.error("UNHANDLED REJECTION:", error);
    process.exit(1);
});

const startServer = async () => {
    try {
        await connectDatabase();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        process.on("SIGTERM", () => {
            console.log("SIGTERM received. Shutting down...");
            server.close(() => {
                console.log("Process terminated");
            });
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
