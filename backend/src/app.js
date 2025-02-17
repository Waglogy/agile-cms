import express from 'express'
import apiRouter from './routes/api.routes.js'

const app = express()

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// use app router
app.use('/api', apiRouter)

export default app
