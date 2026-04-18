const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        courseName: {
            type: String,
            required: true,
            trim: true,
        },
        courseId: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "INR",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        razorpayOrderId: {
            type: String,
            unique: true,
            sparse: true,
        },
        razorpayPaymentId: {
            type: String,
            unique: true,
            sparse: true,
        },
        purchasedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
