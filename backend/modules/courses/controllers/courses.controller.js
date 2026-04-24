const mongoose = require("mongoose");

const Course = require("../../../models/courses");
const Payment = require("../../../models/Payment");
const User = require("../../../models/User");
const { seedCourseCatalog } = require("../course-catalog");
const { AppError } = require("../../../utils/errorHandler");

const slugifyCourse = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const normalizeCoursePayload = (course) => {
    if (!course) return null;

    return {
        _id: course._id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        price: course.price,
        discountPrice: course.discountPrice,
        category: course.category,
        level: course.level,
        rating: course.rating,
        numReviews: course.numReviews,
        isPublished: course.isPublished,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
    };
};

const listCourses = async (req, res, next) => {
    try {
        await seedCourseCatalog();
        const courses = await Course.find({}).sort({ createdAt: -1 }).lean();

        return res.status(200).json({
            success: true,
            message: "Courses retrieved successfully",
            data: courses.map(normalizeCoursePayload),
        });
    } catch (error) {
        return next(error);
    }
};

const syncCourseCatalog = async (req, res, next) => {
    try {
        const courses = await seedCourseCatalog({ force: true });

        return res.status(200).json({
            success: true,
            message: "Course catalog synced successfully",
            data: courses.map(normalizeCoursePayload),
        });
    } catch (error) {
        return next(error);
    }
};

const getCourseBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            throw new AppError(400, "Course slug is required");
        }

        await seedCourseCatalog();
        const course = await Course.findOne({ slug: slug.toLowerCase() }).lean();
        if (!course) {
            throw new AppError(404, "Course not found");
        }

        return res.status(200).json({
            success: true,
            message: "Course retrieved successfully",
            data: normalizeCoursePayload(course),
        });
    } catch (error) {
        return next(error);
    }
};

const createCourse = async (req, res, next) => {
    try {
        const {
            slug,
            title,
            description,
            instructor,
            price,
            discountPrice = 0,
            category,
            level = "Beginner",
            rating = 0,
            numReviews = 0,
            isPublished = false,
        } = req.body;

        const normalizedSlug = slugifyCourse(slug || title);

        if (!normalizedSlug) {
            throw new AppError(400, "Course slug or title is required");
        }

        if (!title || !description || !instructor || price === undefined || !category) {
            throw new AppError(400, "Title, description, instructor, price, and category are required");
        }

        const existingCourse = await Course.findOne({ slug: normalizedSlug }).lean();
        if (existingCourse) {
            throw new AppError(409, "Course slug already exists");
        }

        const course = await Course.create({
            slug: normalizedSlug,
            title,
            description,
            instructor,
            price,
            discountPrice,
            category,
            level,
            rating,
            numReviews,
            isPublished,
        });

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: normalizeCoursePayload(course.toObject()),
        });
    } catch (error) {
        return next(error);
    }
};

const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new AppError(400, "Course id is required");
        }

        const existingCourse = await Course.findById(id);
        if (!existingCourse) {
            throw new AppError(404, "Course not found");
        }

        const nextSlug = req.body.slug || (req.body.title ? slugifyCourse(req.body.title) : existingCourse.slug);
        const slugConflict = await Course.findOne({ slug: nextSlug, _id: { $ne: id } }).lean();
        if (slugConflict) {
            throw new AppError(409, "Course slug already exists");
        }

        const updates = {
            ...req.body,
            slug: nextSlug,
        };

        const course = await Course.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).lean();

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: normalizeCoursePayload(course),
        });
    } catch (error) {
        return next(error);
    }
};

const deleteCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new AppError(400, "Course id is required");
        }

        const course = await Course.findByIdAndDelete(id).lean();
        if (!course) {
            throw new AppError(404, "Course not found");
        }

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
            data: normalizeCoursePayload(course),
        });
    } catch (error) {
        return next(error);
    }
};

const getPurchasedCoursesByUser = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const requestedUserId = req.params.userId;

        if (!userId) {
            throw new AppError(400, "User ID is required");
        }

        if (requestedUserId && requestedUserId !== userId.toString()) {
            throw new AppError(403, "You can only view your own purchased courses");
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError(400, "Invalid user ID");
        }

        await seedCourseCatalog();
        const user = await User.findById(userId).select("purchasedCourses").lean();

        if (!user) {
            throw new AppError(404, "User not found");
        }

        const ownedRefs = Array.isArray(user.purchasedCourses)
            ? user.purchasedCourses.map((value) => String(value).trim()).filter(Boolean)
            : [];

        const buildPurchasedCoursesFromPayments = async () => {
            const payments = await Payment.find({
                userId,
                paymentStatus: "completed",
            })
                .select("courseId courseName amount currency purchasedAt razorpayOrderId razorpayPaymentId")
                .sort({ purchasedAt: -1, createdAt: -1 })
                .lean();

            const uniquePurchases = new Map();

            for (const payment of payments) {
                const courseKey = payment.courseId?.toString().toLowerCase();

                if (courseKey && !uniquePurchases.has(courseKey)) {
                    uniquePurchases.set(courseKey, payment);
                }
            }

            if (uniquePurchases.size === 0) {
                return [];
            }

            const courseKeys = [...uniquePurchases.keys()];
            const courses = await Course.find({ slug: { $in: courseKeys } }).lean();
            const courseMap = new Map(courses.map((course) => [course.slug, course]));

            return courseKeys.map((courseKey) => {
                const payment = uniquePurchases.get(courseKey);
                const course = courseMap.get(courseKey) || null;

                if (!course) {
                    return {
                        _id: courseKey,
                        title: payment.courseName,
                        slug: courseKey,
                        purchase: {
                            amount: payment.amount,
                            currency: payment.currency,
                            purchasedAt: payment.purchasedAt,
                            razorpayOrderId: payment.razorpayOrderId,
                            razorpayPaymentId: payment.razorpayPaymentId,
                        },
                    };
                }

                return {
                    ...normalizeCoursePayload(course),
                    purchase: {
                        amount: payment.amount,
                        currency: payment.currency,
                        purchasedAt: payment.purchasedAt,
                        razorpayOrderId: payment.razorpayOrderId,
                        razorpayPaymentId: payment.razorpayPaymentId,
                    },
                };
            });
        };

        if (ownedRefs.length === 0) {
            const purchasedCoursesFromPayments = await buildPurchasedCoursesFromPayments();

            if (purchasedCoursesFromPayments.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No purchased courses found for this user",
                    data: [],
                });
            }

            return res.status(200).json({
                success: true,
                message: "Purchased courses retrieved successfully",
                data: purchasedCoursesFromPayments,
            });
        }

        const ownedIds = ownedRefs.filter((value) => mongoose.Types.ObjectId.isValid(value));
        const ownedSlugs = ownedRefs
            .filter((value) => !mongoose.Types.ObjectId.isValid(value))
            .map((value) => value.toLowerCase());

        const [idCourses, slugCourses, payments] = await Promise.all([
            ownedIds.length ? Course.find({ _id: { $in: ownedIds } }).lean() : Promise.resolve([]),
            ownedSlugs.length ? Course.find({ slug: { $in: ownedSlugs } }).lean() : Promise.resolve([]),
            Payment.find({
                userId,
                paymentStatus: "completed",
            })
                .select("courseId courseName amount currency purchasedAt razorpayOrderId razorpayPaymentId")
                .sort({ purchasedAt: -1, createdAt: -1 })
                .lean(),
        ]);

        const courseMap = new Map();
        for (const course of idCourses) {
            courseMap.set(course._id.toString(), course);
            courseMap.set(course.slug.toLowerCase(), course);
        }
        for (const course of slugCourses) {
            courseMap.set(course.slug.toLowerCase(), course);
        }

        const paymentMap = new Map();
        for (const payment of payments) {
            const courseKey = payment.courseId?.toString().toLowerCase();

            if (courseKey && !paymentMap.has(courseKey)) {
                paymentMap.set(courseKey, payment);
            }
        }

        const purchasedCourses = ownedRefs.map((ownedRef) => {
            const ownedKey = ownedRef.toLowerCase();
            const course = courseMap.get(ownedKey) || courseMap.get(ownedRef) || null;
            const payment = paymentMap.get(ownedKey) || paymentMap.get(course?.slug?.toLowerCase()) || null;

            if (!course) {
                return {
                    _id: ownedRef,
                    title: payment?.courseName || ownedRef,
                    slug: payment?.courseId || ownedRef,
                    purchase: payment
                        ? {
                            amount: payment.amount,
                            currency: payment.currency,
                            purchasedAt: payment.purchasedAt,
                            razorpayOrderId: payment.razorpayOrderId,
                            razorpayPaymentId: payment.razorpayPaymentId,
                        }
                        : undefined,
                };
            }

            return {
                ...normalizeCoursePayload(course),
                purchase: payment
                    ? {
                        amount: payment.amount,
                        currency: payment.currency,
                        purchasedAt: payment.purchasedAt,
                        razorpayOrderId: payment.razorpayOrderId,
                        razorpayPaymentId: payment.razorpayPaymentId,
                    }
                    : {
                        amount: course.price,
                        currency: "INR",
                        purchasedAt: null,
                    },
            };
        });

        if (purchasedCourses.length === 0) {
            const purchasedCoursesFromPayments = await buildPurchasedCoursesFromPayments();

            if (purchasedCoursesFromPayments.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No purchased courses found for this user",
                    data: [],
                });
            }

            return res.status(200).json({
                success: true,
                message: "Purchased courses retrieved successfully",
                data: purchasedCoursesFromPayments,
            });
        }

        const filteredPurchasedCourses = purchasedCourses.filter((course) => course?.slug || course?._id);

        if (filteredPurchasedCourses.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No purchased courses found for this user",
                data: [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Purchased courses retrieved successfully",
            data: filteredPurchasedCourses,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    listCourses,
    syncCourseCatalog,
    getCourseBySlug,
    createCourse,
    updateCourse,
    deleteCourse,
    getPurchasedCoursesByUser,
};
