import { Strategy, ExtractJwt } from 'passport-jwt'
import passport from 'passport'
import envConfig from '../config/env.config.js'
import queryExecutor from '../services/QueryExecutorFactory.js'

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: envConfig.JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        const authenticatedUser = await queryExecutor.findUser(
          jwt_payload.email
        )

        if (!authenticatedUser) {
          return done(null, false) // Return false for an invalid user
        }

        return done(null, jwt_payload) // Pass authenticated user object
      } catch (error) {
        console.error('Error during authentication:', error)
        return done(error, false) // Return error if query fails
      }
    }
  )
)
