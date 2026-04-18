const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { AppError } = require("../../../utils/errorHandler");

const parseDurationToMs = (value, fallbackMs) => {
    if (!value) {
        return fallbackMs;
    }

    if (/^\d+$/.test(String(value))) {
        return Number(value);
    }

    const match = String(value).trim().match(/^(\d+)(ms|s|m|h|d)$/i);
    if (!match) {
        return fallbackMs;
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = {
        ms: 1,
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
};

const serializeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    lastLoginAt: user.lastLoginAt,
});

const generateAccessToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new AppError(500, "JWT_SECRET is not configured");
    }

    return jwt.sign(
        {
            sub: String(user._id),
            email: user.email,
            type: "access",
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || "15m",
        }
    );
};

const generateRefreshToken = (user) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new AppError(500, "JWT_REFRESH_SECRET is not configured");
    }

    return jwt.sign(
        {
            sub: String(user._id),
            type: "refresh",
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
        }
    );
};

const verifyRefreshToken = (token) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new AppError(500, "JWT_REFRESH_SECRET is not configured");
    }

    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const buildAuthPayload = (user) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
        accessToken,
        refreshToken,
        user: serializeUser(user),
    };
};

const getRefreshTokenCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: parseDurationToMs(process.env.JWT_REFRESH_EXPIRE || "30d", 30 * 24 * 60 * 60 * 1000),
    path: "/",
});

module.exports = {
    buildAuthPayload,
    getRefreshTokenCookieOptions,
    hashToken,
    serializeUser,
    verifyRefreshToken,
};
