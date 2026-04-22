const { sendFeedbackEmail } = require("../services/feedback.service");

/**
 * Submit feedback form
 * POST /api/v1/feedback/submit
 */
const submitFeedback = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const senderAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
        const adminRecipient = process.env.FEEDBACK_EMAIL_RECIPIENT || process.env.EMAIL_USER;

        if (!senderAddress || !adminRecipient) {
            return res.status(500).json({
                success: false,
                message: "Feedback email service is not configured. Please set EMAIL_FROM/EMAIL_USER and FEEDBACK_EMAIL_RECIPIENT.",
            });
        }

        // Send feedback email in the background so the request returns quickly.
        void sendFeedbackEmail({
            name,
            email,
            message,
        }).catch((error) => {
            console.error("Background feedback email error:", error);
        });

        return res.status(202).json({
            success: true,
            message: "Feedback received successfully. We'll process it shortly.",
            data: {
                queued: true,
            },
        });
    } catch (error) {
        console.error("Error in submitFeedback:", error);
        
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to submit feedback",
            details: error.details || undefined,
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};

module.exports = {
    submitFeedback,
};
