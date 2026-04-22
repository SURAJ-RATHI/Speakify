const rateLimit = require("express-rate-limit");

const buildLimiter = ({ windowMs, max, message }) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message,
        },
        keyGenerator: (req) => {
            const email = req.body && req.body.email ? String(req.body.email).toLowerCase() : "anonymous";
            return `${req.ip}:${email}`;
        },
    });

const googleAuthLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many Google authentication requests. Please try again later.",
});

const requestOtpLimiter = buildLimiter({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: "Too many OTP requests. Please try again after 5 minutes.",
});

const verifyOtpLimiter = buildLimiter({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: "Too many OTP verification attempts. Please try again after 5 minutes.",
});

module.exports = {
    googleAuthLimiter,
    requestOtpLimiter,
    verifyOtpLimiter,
};
