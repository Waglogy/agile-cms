import { Router } from 'express'
import { registerSuperUser } from '../controllers/user.controllers.js'

const authRouter = Router()

authRouter.route('/signup').post(registerSuperUser)

export default authRouter
