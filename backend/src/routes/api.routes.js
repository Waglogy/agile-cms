import { Router } from 'express'
import authRouter from './auth.routes.js'
import collectionRouter from './collection.routes.js'
// import authenticateUser from '../middlewares/auth.middleware.js'
// import queryExecutor from '../services/QueryExecutorFactory.js'
import initializeDatabase, { client } from '../services/initializeDatabase.js'
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

apiRouter.get('/laro', async (req, res) => {
  async function getTableMetadata(tableName) {
    // This will return one row per column, with its raw comment (e.g. "is_multiple=true")
    const sql = `
      SELECT
        a.attname AS column_name,
        col_description(a.attrelid, a.attnum) AS meta
      FROM pg_attribute a
      WHERE
        a.attrelid = $1::regclass
        AND a.attnum > 0
        AND NOT a.attisdropped
    `

    const { rows } = await client.query(sql, [tableName])

    // Build a JS object: { column_name: meta, … }
    return rows.reduce((acc, { column_name, meta }) => {
      acc[column_name] = meta
      return acc
    }, {})
  }

  const allMeta = await getTableMetadata('putty')

  res.status(200).json({
    message: 'Laro chus muzi',
    data: allMeta,
  })
})

export default apiRouter
