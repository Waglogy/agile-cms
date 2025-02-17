import { Router } from 'express'
import authRouter from './auth.routes.js'

const apiRouter = Router()

// use auth router

apiRouter.use('/auth', authRouter)

export default apiRouter
