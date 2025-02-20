import { Strategy, ExtractJwt } from 'passport-jwt'
import passport from 'passport'
import envConfig from '../config/env.config'
import queryExecutor from '../services/QueryExecutorFactory'

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: envConfig.JWT_SECRET,
    },
    async (jwt_payload, done) => {
      // TODO

      console.log(jwt_payload)

      //await foo = queryExecutor.findUser()
    }
  )
)
