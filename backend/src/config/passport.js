/**
 * passport.js — Google OAuth Strategy (Placeholder)
 *
 * This file prepares the structure for Google OAuth authentication.
 * Actual implementation will be added in a future phase.
 *
 * PREREQUISITES (before implementing):
 * 1. npm install passport passport-google-oauth20
 * 2. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
 * 3. Configure OAuth consent screen in Google Cloud Console
 * 4. Add authorized redirect URI: http://localhost:5000/api/v1/auth/google/callback
 *
 * HOW IT WILL WORK:
 * 1. User clicks "Sign in with Google" → redirected to Google
 * 2. Google authenticates → redirects back with authorization code
 * 3. Passport exchanges code for user profile
 * 4. We find or create a user in our DB
 * 5. Issue JWT tokens (same as email/password login)
 *
 * ROUTES TO ADD (when implementing):
 *   GET  /api/v1/auth/google          → Redirect to Google
 *   GET  /api/v1/auth/google/callback  → Handle Google response
 */

// import passport from 'passport'
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
// import { env } from './env.js'
// import prisma from './db.js'

/*
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        if (!email) {
          return done(new Error('No email found in Google profile'), null)
        }

        // Find existing user or create a new one
        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName || 'Google User',
              email,
              password: '', // OAuth users don't have a password
              avatar: profile.photos?.[0]?.value || null,
              role: 'CUSTOMER',
              isVerified: true, // Google already verified the email
              isActive: true,
            },
          })
        }

        return done(null, user)
      } catch (err) {
        return done(err, null)
      }
    }
  )
)

// Serialize user ID into session (if using sessions)
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})
*/

// export default passport
export default null // Placeholder — replace with passport when implementing
