import { Router } from 'express'
import {
  getAllUsers,
  registerSuperUser,
  loginUser,
} from '../controllers/user.controllers.js'

const authRouter = Router()

authRouter.route('/signup').post(registerSuperUser)

authRouter.route('/login').post(loginUser)

authRouter.route('/get-all-users').get(getAllUsers)

export default authRouter
