const express = require("express");
const paymentController = require("../controllers/payment.controller");
const { verifyAuth } = require("../../auth/middlewares/verify-auth");

const router = express.Router();

// Create payment order for course enrollment
router.post("/create-order", verifyAuth, paymentController.createPaymentOrder);

// Verify payment after Razorpay callback
router.post("/verify", verifyAuth, paymentController.verifyPayment);

// Get user's payment history
router.get("/history", verifyAuth, paymentController.getPaymentHistory);

module.exports = router;
