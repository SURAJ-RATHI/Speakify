const express = require("express");
const router = express.Router();

const { submitFeedback } = require("../controllers/feedback.controller");
const {
    feedbackValidation,
    handleValidationErrors,
} = require("../validators/feedback.validation");

/**
 * POST /api/v1/feedback/submit
 * Submit feedback form with email notification
 */
router.post("/submit", feedbackValidation, handleValidationErrors, submitFeedback);

module.exports = router;
