import {Router} from 'express'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid';
import authRouter from './auth.routes.js'
import collectionRouter from './collection.routes.js'
import initializeDatabase from '../services/initializeDatabase.js'
import {userConnections} from '../utils/userConnections.util.js'
import {requireDatabaseSelection} from '../middlewares/databaseSelection.middleware.js'
import pg from 'pg'

const apiRouter = Router()

// use auth router
apiRouter.use('/auth', authRouter)

// use collection router
apiRouter.use('/collection', requireDatabaseSelection, collectionRouter)

// Store active user database connections
// const userConnections = new Map() // sessionId -> { dbName, pool }

/* apiRouter.post('/init', async (req, res) => {
  const { db_name } = req.body

  const client = await initializeDatabase(db_name)

  const response = await client.query('SELECT 1')

  console.log(response)

  userConnections.set(req.sessionID, {
    dbName: db_name,
    client,
    connectedAt: new Date(),
  })

  res.json({
    success: true,
    message: `Successfully connected to database: ${db_name}`,
    selectedDatabase: db_name,
    sessionId: req.sessionID,
  })

  // return res.sendStatus(501)
}) */

apiRouter.post('/init', async (req, res) => {
    const {db_name} = req.body

    try {
        const client = await initializeDatabase(db_name)

        const id = uuidv4()

        userConnections.set(id, {
            dbName: db_name,
            client,
            connectedAt: new Date(),
        })


        // init the jwt token.
        const token = jwt.sign({
            dbName: db_name,
            connectionId: id,
            connectedAt: new Date(),
        }, "TOP_SECRET_KEY", {
            expiresIn: '1d',
        });


        res.json({
            success: true,
            message: `Successfully connected to database: ${db_name}`,
            selectedDatabase: db_name,
            jwtToken: token,
            connectionId: id
        })

    } catch (error) {
        console.error('DB init error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to initialize database',
            error: error.message,
        })
    }
})

apiRouter.get('/list-databases', async (req, res) => {
    const defaultDbClient = new pg.Client({
      host: 'localhost',
      user: 'postgres',
      port: 5432,
      database: 'postgres',
      password: 'Qwert@123',
    })
    try {
        await defaultDbClient.connect()
        const query = `SELECT datname
                       FROM pg_database;`
        const {rows} = await defaultDbClient.query(query)
        res.status(200).json({
            success: true,
            message: 'Databases retried successfully',
            data: rows,
        })
    } catch (error) {
        console.log(error)
        await defaultDbClient.end()
    } finally {
        // await defaultDbClient.end()
    }
})

// Get current database selection status
apiRouter.get('/current-database', (req, res) => {
    const userConnection = userConnections.get(req.sessionID)

    if (!userConnection) {
        return res.json({
            success: true,
            selectedDatabase: null,
            message: 'No database selected',
        })
    }

    res.json({
        success: true,
        selectedDatabase: userConnection.dbName,
        connectedAt: userConnection.connectedAt,
        sessionId: req.sessionID,
    })
})

export default apiRouter
