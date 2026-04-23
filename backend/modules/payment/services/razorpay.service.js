const Razorpay = require("razorpay");
const crypto = require("crypto");
const { AppError } = require("../../../utils/errorHandler");

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} - Razorpay order response
 */
const createRazorpayOrder = async (orderData) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("Missing Razorpay credentials:", {
                hasKeyId: !!process.env.RAZORPAY_KEY_ID,
                hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
            });
            throw new AppError(500, "Razorpay credentials not configured");
        }

        const { amount, currency = "INR", receipt, notes = {} } = orderData;

        if (!amount || amount < 1) {
            throw new AppError(400, "Invalid amount");
        }

        console.log("Creating Razorpay order with data:", {
            amount: Math.round(amount * 100),
            currency,
            receipt,
            notesKeys: Object.keys(notes),
        });

        const order = await razorpayInstance.orders.create({
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt,
            notes,
        });

        console.log("Razorpay order created successfully:", order.id);
        return order;
    } catch (error) {
        const errorMessage = error?.message || error?.description || JSON.stringify(error) || "Unknown error";
        const errorCode = error?.statusCode || error?.code || "UNKNOWN";
        
        console.error("Razorpay Order Creation Error:", {
            message: errorMessage,
            code: errorCode,
            fullError: error,
        });
        
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, `Failed to create Razorpay order: ${errorMessage}`);
    }
};

/**
 * Verify Razorpay payment signature
 * @param {Object} paymentData - Payment verification data
 * @returns {boolean} - Signature verification status
 */
const verifyPaymentSignature = (paymentData) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            throw new AppError(400, "Missing required payment verification fields");
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            throw new AppError(500, "Razorpay secret not configured");
        }

        // Generate expected signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        // Compare signatures
        const isSignatureValid = expectedSignature === razorpay_signature;

        if (!isSignatureValid) {
            throw new AppError(400, "Invalid payment signature - possible fraud attempt");
        }

        return true;
    } catch (error) {
        console.error("Signature Verification Error:", error.message);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "Payment signature verification failed");
    }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} - Payment details
 */
const fetchPaymentDetails = async (paymentId) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new AppError(500, "Razorpay credentials not configured");
        }

        const payment = await razorpayInstance.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error("Fetch Payment Error:", error.message);
        throw new AppError(500, "Failed to fetch payment details from Razorpay");
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPaymentSignature,
    fetchPaymentDetails,
};
