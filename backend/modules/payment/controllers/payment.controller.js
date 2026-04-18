const Payment = require("../../../models/Payment");
const User = require("../../../models/User");
const { AppError } = require("../../../utils/errorHandler");

const createPaymentOrder = async (req, res, next) => {
    try {
        const { courseId, courseName, amount } = req.body;
        const userId = req.user?._id; // Assuming middleware verifies the user

        if (!userId) {
            throw new AppError(401, "User not authenticated");
        }

        if (!courseId || !courseName || !amount) {
            throw new AppError(400, "Course ID, name, and amount are required");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        const payment = await Payment.create({
            userId,
            email: user.email,
            courseId,
            courseName,
            amount,
            currency: "INR",
            paymentStatus: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Payment order created",
            data: {
                paymentId: payment._id,
                amount: payment.amount,
                courseName: payment.courseName,
                email: payment.email,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const { paymentId, razorpayOrderId, razorpayPaymentId } = req.body;

        if (!paymentId || !razorpayOrderId || !razorpayPaymentId) {
            throw new AppError(400, "Missing required payment fields");
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new AppError(404, "Payment record not found");
        }

        // Update payment with Razorpay details
        payment.razorpayOrderId = razorpayOrderId;
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.paymentStatus = "completed";
        payment.purchasedAt = new Date();

        await payment.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified and completed",
            data: {
                paymentId: payment._id,
                status: payment.paymentStatus,
                courseName: payment.courseName,
                email: payment.email,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const getPaymentHistory = async (req, res, next) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            throw new AppError(401, "User not authenticated");
        }

        const payments = await Payment.find({ userId })
            .select("courseName courseId amount paymentStatus purchasedAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Payment history retrieved",
            data: payments,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getPaymentHistory,
};
