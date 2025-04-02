import { Router } from 'express'
import authRouter from './auth.routes.js'
import collectionRouter from './collection.routes.js'
import authenticateUser from '../middlewares/auth.middleware.js'
import queryExecutor from '../services/QueryExecutorFactory.js'

const apiRouter = Router()

// use auth router
apiRouter.use('/auth', authRouter)

// use collection router
apiRouter.use('/collection', collectionRouter)

apiRouter.get('/list-databases', async (req, res) => {
  const result = await queryExecutor.getAllDatabases()
  res.status(200).json({
    success: true,
    message: 'Databases retrived successfully',
    data: result,
  })
})

export default apiRouter
