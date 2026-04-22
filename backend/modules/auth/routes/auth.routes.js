const express = require("express");
const passport = require("passport");

const configurePassport = require("../../../config/passport");
const authController = require("../controllers/auth.controller");
const { googleAuthLimiter } = require("../middlewares/auth.rate-limit");

const router = express.Router();
const isGoogleAuthConfigured = configurePassport.isGoogleAuthConfigured;

const ensureGoogleOAuthEnabled = (req, res, next) => {
    if (!isGoogleAuthConfigured()) {
        return res.status(503).json({
            success: false,
            message: "Google authentication is not configured",
        });
    }

    return next();
};

// Google OAuth routes
router.get("/google", googleAuthLimiter, ensureGoogleOAuthEnabled, passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
    "/google/callback",
    googleAuthLimiter,
    ensureGoogleOAuthEnabled,
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "http://localhost:5173"}/auth?error=google_auth_failed`,
    }),
    authController.googleCallback
);

// Session management
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;

