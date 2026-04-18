class AppError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.statusCode || 500;
    const response = {
        success: false,
        message: error.message || "Internal server error",
    };

    if (error.details) {
        response.details = error.details;
    }

    if (process.env.NODE_ENV !== "production" && error.stack) {
        response.stack = error.stack;
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    AppError,
    errorHandler,
};
