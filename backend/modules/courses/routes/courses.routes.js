const express = require("express");

const { verifyAuth } = require("../../auth/middlewares/verify-auth");
const { requireAdmin } = require("../../auth/middlewares/require-admin");
const {
    listCourses,
    syncCourseCatalog,
    getCourseBySlug,
    createCourse,
    updateCourse,
    deleteCourse,
    getPurchasedCoursesByUser,
} = require("../controllers/courses.controller");

const router = express.Router();

router.get("/", listCourses);
router.get("/slug/:slug", getCourseBySlug);
router.post("/sync-catalog", verifyAuth, requireAdmin, syncCourseCatalog);
router.post("/", verifyAuth, requireAdmin, createCourse);
router.patch("/:id", verifyAuth, requireAdmin, updateCourse);
router.delete("/:id", verifyAuth, requireAdmin, deleteCourse);

// Get all purchased courses for a specific user
router.get("/purchased", verifyAuth, getPurchasedCoursesByUser);
router.get("/purchased/:userId", verifyAuth, getPurchasedCoursesByUser);

module.exports = router;
