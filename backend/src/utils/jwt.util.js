import jwt from 'jsonwebtoken'
import envConfig from '../config/env.config.js'

export const signJwtPayload = (data) => {
  return jwt.sign(data, envConfig.JWT_SECRET, {
    expiresIn: '5h',
    issuer: 'Agile CMS',
  })
}
