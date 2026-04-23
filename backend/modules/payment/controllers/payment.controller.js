const Payment = require("../../../models/Payment");
const User = require("../../../models/User");
const { AppError } = require("../../../utils/errorHandler");
const {
    createRazorpayOrder,
    verifyPaymentSignature,
    fetchPaymentDetails,
} = require("../services/razorpay.service");

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

        if (amount < 1) {
            throw new AppError(400, "Invalid amount. Amount must be at least ₹1");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        // Check if user has already purchased this course
        const alreadyPurchased = user.purchasedCourses?.some(
            (course) => course.courseId === courseId
        );

        if (alreadyPurchased) {
            throw new AppError(400, "You have already purchased this course");
        }

        // Create Razorpay order
        const shortReceipt = `${userId.toString().slice(-8)}_${Date.now().toString().slice(-8)}`;
        const razorpayOrder = await createRazorpayOrder({
            amount,
            currency: "INR",
            receipt: shortReceipt, // Max 40 chars for Razorpay
            notes: {
                userId,
                email: user.email,
                courseId,
                courseName,
            },
        });

        if (!razorpayOrder || !razorpayOrder.id) {
            throw new AppError(500, "Failed to create Razorpay order");
        }

        // Save payment record in database
        const payment = await Payment.create({
            userId,
            email: user.email,
            courseId,
            courseName,
            amount,
            currency: "INR",
            paymentStatus: "pending",
            razorpayOrderId: razorpayOrder.id,
        });

        return res.status(201).json({
            success: true,
            message: "Payment order created successfully",
            data: {
                paymentId: payment._id,
                razorpayOrderId: razorpayOrder.id,
                amount: payment.amount,
                courseName: payment.courseName,
                email: payment.email,
                currency: payment.currency,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        if (!paymentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            throw new AppError(400, "Missing required payment verification fields");
        }

        // Verify Razorpay signature
        verifyPaymentSignature({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
        });

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new AppError(404, "Payment record not found");
        }

        // Verify order ID matches
        if (payment.razorpayOrderId !== razorpayOrderId) {
            throw new AppError(400, "Payment order ID mismatch");
        }

        // Fetch payment details from Razorpay to confirm status
        const paymentDetails = await fetchPaymentDetails(razorpayPaymentId);

        if (paymentDetails.status !== "captured") {
            throw new AppError(400, `Payment not captured. Status: ${paymentDetails.status}`);
        }

        // Verify amount matches
        if (Math.round(payment.amount * 100) !== paymentDetails.amount) {
            throw new AppError(400, "Payment amount mismatch");
        }

        // Update payment with Razorpay details
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.paymentStatus = "completed";
        payment.purchasedAt = new Date();

        await payment.save();

        // Add course to user's purchasedCourses if not already present
        const user = await User.findById(payment.userId);
        if (user) {
            const courseExists = user.purchasedCourses.some(
                (course) => course.courseId === payment.courseId
            );

            if (!courseExists) {
                user.purchasedCourses.push({
                    courseId: payment.courseId,
                    courseName: payment.courseName,
                    paymentId: payment._id,
                    purchasedAt: new Date(),
                });
                await user.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and completed successfully",
            data: {
                paymentId: payment._id,
                razorpayPaymentId: payment.razorpayPaymentId,
                status: payment.paymentStatus,
                courseName: payment.courseName,
                email: payment.email,
                amount: payment.amount,
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

const handlePaymentFailure = async (req, res, next) => {
    try {
        const { paymentId, razorpayPaymentId, error } = req.body;

        if (!paymentId) {
            throw new AppError(400, "Payment ID is required");
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new AppError(404, "Payment record not found");
        }

        // Update payment status to failed
        payment.paymentStatus = "failed";
        payment.failureReason = error?.description || "Payment failed";
        await payment.save();

        return res.status(200).json({
            success: true,
            message: "Payment failure recorded",
            data: {
                paymentId: payment._id,
                status: payment.paymentStatus,
                message: "Your payment was not processed. Please try again.",
            },
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getPaymentHistory,
    handlePaymentFailure,
};
