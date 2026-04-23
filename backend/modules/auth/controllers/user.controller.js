const User = require("../../../models/User");
const { AppError } = require("../../../utils/errorHandler");

const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            throw new AppError(401, "User not authenticated");
        }

        const user = await User.findById(userId).select(
            "name email profileImage purchasedCourses"
        );

        if (!user) {
            throw new AppError(404, "User not found");
        }

        return res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: {
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                purchasedCourses: user.purchasedCourses || [],
            },
        });
    } catch (error) {
        return next(error);
    }
};

const checkCourseOwnership = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { courseId } = req.body;

        if (!userId) {
            throw new AppError(401, "User not authenticated");
        }

        if (!courseId) {
            throw new AppError(400, "Course ID is required");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        const isOwner = user.purchasedCourses.some(
            (course) => course.courseId === courseId
        );

        return res.status(200).json({
            success: true,
            data: {
                owned: isOwner,
                courseId,
            },
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getUserProfile,
    checkCourseOwnership,
};
