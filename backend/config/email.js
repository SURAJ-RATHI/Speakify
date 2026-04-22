const nodemailer = require("nodemailer");

let cachedTransporter;

const createEmailTransporter = () => {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    cachedTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
        },
    });

    return cachedTransporter;
};

module.exports = {
    createEmailTransporter,
};
