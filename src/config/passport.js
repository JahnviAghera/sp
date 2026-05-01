const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function initPassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientID || !clientSecret) {
    console.warn('Google OAuth not configured (GOOGLE_CLIENT_ID/SECRET missing)');
    return;
  }

  passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name: profile.displayName || 'Google User', email, avatarUrl: profile.photos?.[0]?.value });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
