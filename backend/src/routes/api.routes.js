import { application, Router } from 'express'
import authRouter from './auth.routes.js'
import collectionRouter from './collection.routes.js'
import passport from 'passport'
import authenticateUser from '../middlewares/auth.middleware.js'
const apiRouter = Router()

// use auth router
apiRouter.use('/auth', authRouter)

// use collection router
apiRouter.use('/collection', collectionRouter)

apiRouter.get('/', authenticateUser, (req, res) => {
  res.status(200).send(req.user)
})

export default apiRouter
