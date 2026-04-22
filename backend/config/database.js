const mongoose = require("mongoose");

const connectDatabase = async () => {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is not configured");
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDatabase;

