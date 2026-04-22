const { createEmailTransporter } = require("../../../config/email");
const { OTP_PURPOSES } = require("../utils/auth.constants");
const { AppError } = require("../../../utils/errorHandler");

const getOtpEmailTemplate = (otp, purpose) => {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    
    const templates = {
        [OTP_PURPOSES.SIGNUP]: {
            subject: "Verify your email - Signup verification code",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
                        .otp-box { background-color: #fff; border: 2px solid #007bff; padding: 20px; text-align: center; margin: 20px 0; }
                        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to Our Platform!</h1>
                        </div>
                        <div class="content">
                            <p>Thank you for signing up! Please verify your email address using the code below:</p>
                            <div class="otp-box">
                                <p>Your verification code:</p>
                                <div class="otp-code">${otp}</div>
                            </div>
                            <p>This code will expire in 10 minutes.</p>
                            <p>If you didn't sign up for this account, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 Our Platform. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        },
        [OTP_PURPOSES.SIGNIN]: {
            subject: "Your login verification code",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
                        .otp-box { background-color: #fff; border: 2px solid #28a745; padding: 20px; text-align: center; margin: 20px 0; }
                        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #28a745; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Sign In to Your Account</h1>
                        </div>
                        <div class="content">
                            <p>We received a request to sign in to your account. Use the code below to complete your login:</p>
                            <div class="otp-box">
                                <p>Your login code:</p>
                                <div class="otp-code">${otp}</div>
                            </div>
                            <p>This code will expire in 10 minutes.</p>
                            <p>If you didn't request this code, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 Our Platform. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        },
        [OTP_PURPOSES.PASSWORD_RESET]: {
            subject: "Reset your password",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #ffc107; color: #333; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
                        .otp-box { background-color: #fff; border: 2px solid #ffc107; padding: 20px; text-align: center; margin: 20px 0; }
                        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ffc107; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <p>We received a request to reset your password. Use the code below to proceed:</p>
                            <div class="otp-box">
                                <p>Your reset code:</p>
                                <div class="otp-code">${otp}</div>
                            </div>
                            <p>This code will expire in 10 minutes.</p>
                            <p>If you didn't request a password reset, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 Our Platform. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        }
    };

    return templates[purpose] || templates[OTP_PURPOSES.SIGNUP];
};

const sendOtpEmail = async ({ to, otp, purpose }) => {
    try {
        const transporter = createEmailTransporter();
        const template = getOtpEmailTemplate(otp, purpose);

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject: template.subject,
            html: template.html,
        };

        const result = await transporter.sendMail(mailOptions);

        return {
            success: true,
            messageId: result.messageId,
        };
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw new AppError(500, "Failed to send OTP email. Please try again later.");
    }
};

module.exports = {
    sendOtpEmail,
};
