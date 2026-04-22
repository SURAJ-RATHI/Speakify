const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        otp: {
            type: String,
            required: true,
        },
        purpose: {
            type: String,
            required: true,
            enum: ["signup", "signin", "password-reset"],
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 },
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        attempts: {
            type: Number,
            default: 0,
        },
        maxAttempts: {
            type: Number,
            default: 5,
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Otp", otpSchema);
