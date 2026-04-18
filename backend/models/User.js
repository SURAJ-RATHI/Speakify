const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        googleId: {
            type: String,
            required: true,
            unique: true,
            sparse: true,
        },
        refreshTokenHash: {
            type: String,
            default: null,
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
