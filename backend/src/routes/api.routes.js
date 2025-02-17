import { application, Router } from 'express'
import authRouter from './auth.routes.js'
import collectionRouter from './collection.routes.js'
const apiRouter = Router()

// use auth router
apiRouter.use('/auth', authRouter)

// use collection router
apiRouter.use('/collection', collectionRouter)

export default apiRouter
