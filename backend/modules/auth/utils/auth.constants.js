const REFRESH_COOKIE_NAME = "speakify_refresh_token";

const OTP_PURPOSES = {
    SIGNUP: "signup",
    SIGNIN: "signin",
    PASSWORD_RESET: "password-reset",
};

const OTP_EXPIRY_MINUTES = 10;

module.exports = {
    REFRESH_COOKIE_NAME,
    OTP_PURPOSES,
    OTP_EXPIRY_MINUTES,
};
