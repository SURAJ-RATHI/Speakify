const jwt = require("jsonwebtoken");
const User = require("../../../models/User");
const { AppError } = require("../../../utils/errorHandler");

const verifyAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new AppError(401, "Access token is missing");
        }

        if (!process.env.JWT_SECRET) {
            throw new AppError(500, "JWT_SECRET is not configured");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.sub);

        if (!user) {
            throw new AppError(401, "User not found");
        }

        req.user = user;
        return next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }

        if (error.name === "TokenExpiredError") {
            return next(new AppError(401, "Access token has expired"));
        }

        if (error.name === "JsonWebTokenError") {
            return next(new AppError(401, "Invalid access token"));
        }

        return next(error);
    }
};

module.exports = {
    verifyAuth,
};
