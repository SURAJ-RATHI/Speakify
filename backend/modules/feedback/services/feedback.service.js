const { createEmailTransporter } = require("../../../config/email");

const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const buildFeedbackMailOptions = (senderAddress, adminRecipient, feedbackData) => {
    const safeName = escapeHtml(feedbackData.name);
    const safeEmail = escapeHtml(feedbackData.email);
    const safeMessage = escapeHtml(feedbackData.message).replace(/\n/g, "<br/>");

    return {
        adminMailOptions: {
            from: senderAddress,
            to: adminRecipient,
            replyTo: feedbackData.email,
            subject: `New Feedback from ${feedbackData.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Feedback Received</h2>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p><strong>Name:</strong> ${safeName}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
                        <p><strong>Message:</strong></p>
                        <p style="white-space: pre-wrap; color: #555;">${safeMessage}</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">This email was sent from the SpeakWithAmit feedback form.</p>
                </div>
            `,
        },
        userMailOptions: {
            from: senderAddress,
            to: feedbackData.email,
            subject: "We received your feedback - SpeakWithAmit",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Thank You for Your Feedback!</h2>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p>Hi ${safeName},</p>
                    
                    <p>We've received your feedback and really appreciate you taking the time to share your thoughts with us.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
                        <p><strong>Your Message:</strong></p>
                        <p style="white-space: pre-wrap; color: #555;">${safeMessage}</p>
                    </div>
                    
                    <p style="margin-top: 20px;">Our team will review your feedback and get back to you soon if needed.</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">Best regards,<br>The SpeakWithAmit Team</p>
                </div>
            `,
        },
    };
};

const deliverFeedbackEmails = async (feedbackData) => {
    const transporter = createEmailTransporter();
    const senderAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const adminRecipient = process.env.FEEDBACK_EMAIL_RECIPIENT || process.env.EMAIL_USER;

    if (!senderAddress || !adminRecipient) {
        const configError = new Error("Feedback email service is not configured. Please set EMAIL_FROM/EMAIL_USER and FEEDBACK_EMAIL_RECIPIENT.");
        configError.statusCode = 500;
        throw configError;
    }

    const { adminMailOptions, userMailOptions } = buildFeedbackMailOptions(senderAddress, adminRecipient, feedbackData);

    const [adminResult, userResult] = await Promise.allSettled([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(userMailOptions),
    ]);

    return {
        adminResult,
        userResult,
    };
};

/**
 * Send feedback email to admin
 * @param {Object} feedbackData - { name, email, message }
 * @returns {Promise<Object>} - Email send result
 */
const sendFeedbackEmail = async (feedbackData) => {
    try {
        const startTime = Date.now();
        const { adminResult, userResult } = await deliverFeedbackEmails(feedbackData);
        const durationMs = Date.now() - startTime;
        const userEmailWarning = userResult.status === "rejected"
            ? userResult.reason?.message || "Confirmation email could not be sent."
            : null;

        return {
            success: true,
            message: userEmailWarning
                ? "Feedback submitted successfully. Admin notification sent, but the confirmation email could not be delivered."
                : "Feedback submitted successfully. Confirmation email sent.",
            data: {
                adminEmailId: adminResult.status === "fulfilled" ? adminResult.value.messageId : null,
                userEmailId: userResult.status === "fulfilled" ? userResult.value.messageId : null,
                warning: userEmailWarning,
                durationMs,
            },
        };
    } catch (error) {
        console.error("Error sending feedback email:", error);
        const wrappedError = new Error(error.message || "Failed to send feedback email");
        wrappedError.statusCode = 500;
        wrappedError.details = error.response || null;
        throw wrappedError;
    }
};

module.exports = {
    sendFeedbackEmail,
};
