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
        },
        razorpayPaymentId: {
            type: String,
        },
        razorpaySignature: {
            type: String,
            default: null,
        },
        purchasedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

paymentSchema.index(
    { razorpayOrderId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            razorpayOrderId: { $type: "string" },
        },
    }
);

paymentSchema.index(
    { razorpayPaymentId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            razorpayPaymentId: { $type: "string" },
        },
    }
);

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

const syncPaymentIndexes = async () => {
    await Payment.updateMany({ razorpayOrderId: null }, { $unset: { razorpayOrderId: 1 } });
    await Payment.updateMany({ razorpayPaymentId: null }, { $unset: { razorpayPaymentId: 1 } });
    await Payment.syncIndexes();
};

module.exports = Payment;
module.exports.syncPaymentIndexes = syncPaymentIndexes;
