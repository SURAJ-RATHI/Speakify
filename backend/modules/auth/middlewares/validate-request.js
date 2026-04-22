const { validationResult } = require("express-validator");

const { AppError } = require("../../../utils/errorHandler");

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    return next(
        new AppError(
            400,
            "Validation failed",
            errors.array().map((error) => ({
                field: error.path,
                message: error.msg,
            }))
        )
    );
};

module.exports = {
    validateRequest,
};
