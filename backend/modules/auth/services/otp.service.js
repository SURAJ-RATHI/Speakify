const Otp = require("../../../models/Otp");
const { AppError } = require("../../../utils/errorHandler");
const { OTP_EXPIRY_MINUTES } = require("../utils/auth.constants");

const generateOtpCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const createOtpRecord = async ({ email, purpose, metadata = {} }) => {
    const otp = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const otpRecord = await Otp.create({
        email,
        otp,
        purpose,
        expiresAt,
        metadata,
        attempts: 0,
    });

    return {
        otp,
        expiresAt,
        recordId: otpRecord._id,
    };
};

const verifyOtp = async ({ email, otp, purpose }) => {
    const otpRecord = await Otp.findOne({
        email,
        purpose,
        isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
        throw new AppError(404, "OTP not found or has already been used");
    }

    if (new Date() > otpRecord.expiresAt) {
        throw new AppError(410, "OTP has expired");
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
        throw new AppError(429, "Too many failed attempts. Please request a new OTP");
    }

    if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new AppError(400, "Invalid OTP");
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    return {
        email: otpRecord.email,
        purpose: otpRecord.purpose,
        metadata: otpRecord.metadata,
    };
};

module.exports = {
    createOtpRecord,
    verifyOtp,
};
