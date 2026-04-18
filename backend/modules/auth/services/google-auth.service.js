const User = require("../../../models/User");
const { AppError } = require("../../../utils/errorHandler");

const handleGoogleUser = async (profile) => {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase() : null;
    const name = profile.displayName || "Google User";

    if (!email) {
        throw new AppError(400, "Google account email is not available");
    }

    let user = await User.findOne({
        $or: [
            { email },
            { googleId: profile.id },
        ],
    });

    if (!user) {
        user = await User.create({
            name,
            email,
            googleId: profile.id,
            lastLoginAt: new Date(),
        });

        return user;
    }

    // Update existing user
    user.name = user.name || name;
    user.googleId = profile.id;
    user.lastLoginAt = new Date();

    await user.save();
    return user;
};

module.exports = {
    handleGoogleUser,
};
