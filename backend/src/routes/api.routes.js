import { Router } from 'express'
import authRouter from './auth.routes.js'
import collectionRouter from './collection.routes.js'
// import authenticateUser from '../middlewares/auth.middleware.js'
// import queryExecutor from '../services/QueryExecutorFactory.js'
import initializeDatabase from '../services/initializeDatabase.js'
import pg from 'pg'
import envConfig from '../config/env.config.js'

const apiRouter = Router()

// use auth router
apiRouter.use('/auth', authRouter)

// use collection router
apiRouter.use('/collection', collectionRouter)

const { Client } = pg

const adminClient = new Client({
  host: envConfig.PG_HOST,
  user: envConfig.PG_USER,
  password: envConfig.PG_PASSWORD,
  port: envConfig.PG_PORT,
  database: 'postgres', // Connect to the default database first
})

apiRouter.post('/init', (req, res) => {
  const { db_name } = req.body

  initializeDatabase(db_name)
    .then(() => {
      console.log('INIT.............')
      return res.sendStatus(201)
    })
    .catch((err) => console.error(err))

  // return res.sendStatus(501)
})

apiRouter.get('/list-databases', async (req, res) => {
  try {
    await adminClient.connect()
    const query = `SELECT datname FROM pg_database;`
    const { rows } = await adminClient.query(query)
    res.status(200).json({
      success: true,
      message: 'Databases retrived successfully',
      data: rows,
    })
    await adminClient.end()
  } catch (error) {
    console.log(error)
    await adminClient.end()
  }
})

export default apiRouter
