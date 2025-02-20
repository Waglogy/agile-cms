import { Router } from 'express'
import {
  loginUser,
  registerSuperUser,
} from '../controllers/user.controllers.js'

const authRouter = Router()

authRouter.route('/signup').post(registerSuperUser)

authRouter.route('/login').post(loginUser)

export default authRouter
