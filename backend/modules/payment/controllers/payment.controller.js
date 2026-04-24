const crypto = require("crypto");
const Razorpay = require("razorpay");

const Course = require("../../../models/courses");
const Payment = require("../../../models/Payment");
const User = require("../../../models/User");
const { seedCourseCatalog } = require("../../courses/course-catalog");
const { AppError } = require("../../../utils/errorHandler");

const resolveCourseBySlug = async (slug) => {
    if (!slug) return null;

    const dbCourse = await Course.findOne({ slug: String(slug).toLowerCase() }).lean();
    if (dbCourse) return dbCourse;

    await seedCourseCatalog();
    const seededCourse = await Course.findOne({ slug: String(slug).toLowerCase() }).lean();
    if (seededCourse) return seededCourse;

    return null;
};

const grantCourseAccess = async ({ userId, courseSlug }) => {
    if (!userId || !courseSlug) return;

    await Promise.all([
        User.updateOne({ _id: userId }, { $addToSet: { purchasedCourses: courseSlug } }),
        Course.updateOne({ slug: String(courseSlug).toLowerCase() }, { $addToSet: { enrolledStudents: userId } }),
    ]);
};

const createPaymentOrder = async (req, res, next) => {
    try {
        const { courseId } = req.body;
        const userId = req.user?._id;
        const course = await resolveCourseBySlug(courseId);

        if (!userId) {
            throw new AppError(401, "User not authenticated");
        }

        if (!courseId) {
            throw new AppError(400, "Course ID is required");
        }

        if (!course) {
            throw new AppError(404, "Course not found");
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new AppError(500, "Razorpay is not configured");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }
        const payableAmount = course.price ?? course.priceInr;

        const payment = await Payment.create({
            userId,
            email: user.email,
            courseId: course.slug,
            courseName: course.title || course.shortTitle,
            amount: payableAmount,
            currency: "INR",
            paymentStatus: "pending",
        });

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        let order;
        try {
            order = await razorpay.orders.create({
                amount: Math.round(payableAmount * 100),
                currency: "INR",
                receipt: `spk_${payment._id}`,
                notes: {
                    paymentId: payment._id.toString(),
                    userId: userId.toString(),
                    courseId: course.slug,
                },
            });
        } catch (orderError) {
            await Payment.deleteOne({ _id: payment._id });
            throw orderError;
        }

        payment.razorpayOrderId = order.id;
        await payment.save();

        return res.status(201).json({
            success: true,
            message: "Payment order created",
            data: {
                paymentId: payment._id,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                courseId: payment.courseId,
                courseName: payment.courseName,
                email: payment.email,
                keyId: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const userId = req.user?._id;

        if (!paymentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            throw new AppError(400, "Missing required payment fields");
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new AppError(404, "Payment record not found");
        }

        if (userId && payment.userId.toString() !== userId.toString()) {
            throw new AppError(403, "You are not allowed to verify this payment");
        }

        if (payment.paymentStatus === "completed") {
            if (
                payment.razorpayOrderId === razorpayOrderId &&
                payment.razorpayPaymentId === razorpayPaymentId
            ) {
                await grantCourseAccess({
                    userId: payment.userId,
                    courseSlug: payment.courseId,
                });

                return res.status(200).json({
                    success: true,
                    message: "Payment already verified",
                    data: {
                        paymentId: payment._id,
                        status: payment.paymentStatus,
                        courseId: payment.courseId,
                        courseName: payment.courseName,
                        email: payment.email,
                    },
                });
            }

            throw new AppError(400, "Payment has already been completed with different details");
        }

        if (payment.razorpayOrderId && payment.razorpayOrderId !== razorpayOrderId) {
            throw new AppError(400, "Razorpay order does not match this payment");
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            throw new AppError(500, "Razorpay is not configured");
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        const providedSignature = String(razorpaySignature);
        const signatureMatches =
            expectedSignature.length === providedSignature.length &&
            crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature));

        if (!signatureMatches) {
            throw new AppError(400, "Invalid Razorpay signature");
        }

        // Update payment with Razorpay details
        payment.razorpayOrderId = razorpayOrderId;
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.razorpaySignature = razorpaySignature;
        payment.paymentStatus = "completed";
        payment.purchasedAt = new Date();

        await payment.save();
        await grantCourseAccess({
            userId: payment.userId,
            courseSlug: payment.courseId,
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified and completed",
            data: {
                paymentId: payment._id,
                status: payment.paymentStatus,
                courseId: payment.courseId,
                courseName: payment.courseName,
                amount: payment.amount,
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
            .select("courseName courseId amount currency paymentStatus purchasedAt")
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
