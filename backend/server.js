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
const coursesRoutes = require("./modules/courses/routes/courses.routes");
const feedbackRoutes = require("./modules/feedback/routes/feedback.routes");
const { seedCourseCatalog } = require("./modules/courses/course-catalog");
const { syncPaymentIndexes } = require("./models/Payment");
const { errorHandler } = require("./utils/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const configuredOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    "http://127.0.0.1:3000",
];
const allowedOrigins = [...new Set([...configuredOrigins, ...defaultOrigins])];

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
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
app.use("/api/v1/courses", coursesRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/feedback", feedbackRoutes);

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
        await syncPaymentIndexes();
        await seedCourseCatalog();

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
