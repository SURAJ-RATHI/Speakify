const authService = require("../services/auth.service");
const {
    getClearRefreshTokenCookieOptions,
    getRefreshTokenCookieOptions,
} = require("../services/token.service");
const { REFRESH_COOKIE_NAME } = require("../utils/auth.constants");
const authMessages = require("../utils/auth.messages");

const writeAuthResponse = (res, statusCode, payload, message) => {
    res.cookie(REFRESH_COOKIE_NAME, payload.refreshToken, getRefreshTokenCookieOptions());

    return res.status(statusCode).json({
        success: true,
        message,
        data: {
            accessToken: payload.accessToken,
            user: payload.user,
        },
    });
};

const refreshToken = async (req, res, next) => {
    try {
        const refreshTokenValue = req.cookies[REFRESH_COOKIE_NAME];
        const payload = await authService.refreshSession(refreshTokenValue);
        return writeAuthResponse(res, 200, payload, authMessages.TOKEN_REFRESHED);
    } catch (error) {
        return next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        await authService.logout(req.cookies[REFRESH_COOKIE_NAME]);
        res.clearCookie(REFRESH_COOKIE_NAME, getClearRefreshTokenCookieOptions());

        return res.status(200).json({
            success: true,
            message: authMessages.LOGOUT_SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
};

const googleCallback = async (req, res, next) => {
    try {
        const payload = await authService.issueAuthSessionForUser(req.user);
        res.cookie(REFRESH_COOKIE_NAME, payload.refreshToken, getRefreshTokenCookieOptions());

        const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "http://localhost:5173";
        const redirectUrl = new URL("/auth/google/success", frontendUrl);

        return res.redirect(redirectUrl.toString());
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    googleCallback,
    logout,
    refreshToken,
};
