const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

const { handleGoogleUser } = require("../modules/auth/services/google-auth.service");

let isConfigured = false;

const normalizeEnvValue = (value) => (typeof value === "string" ? value.trim() : value);

const isGoogleAuthConfigured = () =>
    Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL);

const configurePassport = () => {
    if (isConfigured) {
        return passport;
    }

    const clientID = normalizeEnvValue(process.env.GOOGLE_CLIENT_ID);
    const clientSecret = normalizeEnvValue(process.env.GOOGLE_CLIENT_SECRET);
    const callbackURL = normalizeEnvValue(process.env.GOOGLE_CALLBACK_URL);

    if (!isGoogleAuthConfigured()) {
        console.warn("Google OAuth environment variables are missing. Google login is disabled.");
        return passport;
    }

    if (!clientID || !clientSecret || !callbackURL) {
        console.warn("Google OAuth environment variables are invalid after normalization. Google login is disabled.");
        return passport;
    }

    console.info(`Google OAuth callback URL: ${callbackURL}`);

    passport.use(
        new GoogleStrategy(
            {
                clientID,
                clientSecret,
                callbackURL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const user = await handleGoogleUser(profile);
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    isConfigured = true;
    return passport;
};

module.exports = configurePassport;
module.exports.isGoogleAuthConfigured = isGoogleAuthConfigured;

