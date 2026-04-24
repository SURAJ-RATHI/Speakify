const { AppError } = require("../../../utils/errorHandler");

const parseAdminEmails = () =>
    [
        process.env.COURSE_ADMIN_EMAILS,
        process.env.ADMIN_EMAILS,
        process.env.EMAIL_USER,
        process.env.FEEDBACK_EMAIL_RECIPIENT,
    ]
        .filter(Boolean)
        .flatMap((value) => String(value).split(","))
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

const requireAdmin = (req, res, next) => {
    try {
        const userEmail = String(req.user?.email || "").trim().toLowerCase();
        if (!userEmail) {
            throw new AppError(401, "User not authenticated");
        }

        const allowedEmails = new Set(parseAdminEmails());
        if (allowedEmails.size === 0) {
            throw new AppError(500, "Admin access is not configured");
        }

        if (!allowedEmails.has(userEmail)) {
            throw new AppError(403, "Admin access required");
        }

        return next();
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    requireAdmin,
};
