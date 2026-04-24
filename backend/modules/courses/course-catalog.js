const courseCatalog = [
    {
        slug: "public-speaking",
        title: "Public Speaking",
        shortTitle: "Public Speaking",
        category: "Public Speaking",
        description:
            "Build stage presence, persuasive storytelling, body language, and audience control with coaching that turns nerves into authority.",
        instructor: "Amit Lamba",
        price: 12000,
        level: "Beginner",
        isPublished: true,
    },
    {
        slug: "english-speaking",
        title: "English Speaking",
        shortTitle: "English Speaking",
        category: "English Speaking",
        description:
            "Move from hesitation to smooth conversation with practical fluency routines, vocabulary patterns, and real-life speaking scenarios.",
        instructor: "Amit Lamba",
        price: 14500,
        level: "Beginner",
        isPublished: true,
    },
    {
        slug: "stammering-cure",
        title: "Stammering Cure",
        shortTitle: "Stammering Cure",
        category: "Stammering Cure",
        description:
            "Follow a supportive speech-confidence framework with guided exercises, breathing work, and practical speaking exposure designed for steady progress.",
        instructor: "Amit Lamba",
        price: 16000,
        level: "Beginner",
        isPublished: true,
    },
];

const findCourseBySlug = (slug) => courseCatalog.find((course) => course.slug === slug) || null;

const seedCourseCatalog = async ({ force = false } = {}) => {
    const Course = require("../../models/courses");

    const existingCount = await Course.countDocuments({});
    if (existingCount > 0 && !force) {
        return [];
    }

    const seededCourses = [];

    for (const courseItem of courseCatalog) {
        const normalizedSlug = String(courseItem.slug || courseItem.title || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const payload = {
            slug: normalizedSlug,
            title: courseItem.title,
            description: courseItem.description,
            instructor: courseItem.instructor,
            price: courseItem.price,
            discountPrice: courseItem.discountPrice ?? 0,
            category: courseItem.category,
            level: courseItem.level ?? "Beginner",
            rating: courseItem.rating ?? 0,
            numReviews: courseItem.numReviews ?? 0,
            isPublished: courseItem.isPublished ?? true,
        };

        const course = await Course.findOneAndUpdate(
            { slug: normalizedSlug },
            { $set: payload },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        ).lean();

        seededCourses.push(course);
    }

    return seededCourses;
};

module.exports = {
    courseCatalog,
    findCourseBySlug,
    seedCourseCatalog,
};
