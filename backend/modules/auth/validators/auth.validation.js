const { body, validationResult } = require("express-validator");

const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        throw new Error("Invalid email format");
    }
    return true;
};

const validateOtp = (value) => {
    if (!value || !/^\d{6}$/.test(value)) {
        throw new Error("OTP must be a 6-digit number");
    }
    return true;
};

const requestSignupOtpValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 80 })
        .withMessage("Name must be between 2 and 80 characters"),
    body("email")
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage("Email is required")
        .custom(validateEmail),
];

const verifySignupOtpValidation = [
    body("email")
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage("Email is required")
        .custom(validateEmail),
    body("otp")
        .notEmpty()
        .withMessage("OTP is required")
        .custom(validateOtp),
];

const requestSigninOtpValidation = [
    body("email")
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage("Email is required")
        .custom(validateEmail),
];

const verifySigninOtpValidation = [
    body("email")
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage("Email is required")
        .custom(validateEmail),
    body("otp")
        .notEmpty()
        .withMessage("OTP is required")
        .custom(validateOtp),
];

module.exports = {
    requestSignupOtpValidation,
    verifySignupOtpValidation,
    requestSigninOtpValidation,
    verifySigninOtpValidation,
};
