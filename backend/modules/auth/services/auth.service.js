const User = require("../../../models/User");
const { AppError } = require("../../../utils/errorHandler");
const { buildAuthPayload, hashToken, verifyRefreshToken } = require("./token.service");

const storeRefreshToken = async (user, refreshToken) => {
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();
};

const issueAuthSessionForUser = async (user) => {
    const payload = buildAuthPayload(user);
    await storeRefreshToken(user, payload.refreshToken);
    return payload;
};

const refreshSession = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError(401, "Refresh token is missing");
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.sub);

    if (!user || !user.refreshTokenHash) {
        throw new AppError(401, "Session is invalid");
    }

    if (user.refreshTokenHash !== hashToken(refreshToken)) {
        throw new AppError(401, "Refresh token does not match");
    }

    user.lastLoginAt = new Date();
    await user.save();

    return issueAuthSessionForUser(user);
};

const logout = async (refreshToken) => {
    if (!refreshToken) {
        return;
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.sub);

        if (user) {
            user.refreshTokenHash = null;
            await user.save();
        }
    } catch (error) {
        return;
    }
};

module.exports = {
    issueAuthSessionForUser,
    logout,
    refreshSession,
};

